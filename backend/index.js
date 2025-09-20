// backend/index.js

import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { setupDatabase } from './database.js';
import { sendWelcomeEmail } from './email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-super-secret-key-for-the-hackathon'; // Change this to a random string

// --- Middleware ---
app.use(cors());
app.use(express.json());
// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));


// --- Database Setup ---
let db;
setupDatabase().then(database => {
  db = database;
}).catch(console.error);

// --- AI Configuration ---
// IMPORTANT: Replace with your NEW Google AI API key
const API_KEY = "AIzaSyDa-scXo-wlDTCk28XJ2CYe1JJVONg3Ts4";
// Using the model that we confirmed works
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;


// --- AUTHENTICATION ROUTES ---

// 1. SIGNUP Endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields.' });
  }

  try {
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    
    sendWelcomeEmail(email, name);

    res.status(201).json({ message: 'User created successfully!' });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// 2. LOGIN Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful!', token });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});


// --- USER DATA & AI ROUTES ---

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.userId = user.id;
    next();
  });
}

// 3. SAVE ACADEMIC DETAILS Endpoint (Protected)
app.post('/save-details', verifyToken, async (req, res) => {
  const academicDetails = req.body;
  const detailsJson = JSON.stringify(academicDetails);

  try {
    await db.run('UPDATE users SET academic_details = ? WHERE id = ?', [detailsJson, req.userId]);
    res.json({ message: 'Details saved successfully!' });
  } catch (error) {
    console.error('Save Details Error:', error);
    res.status(500).json({ error: 'Failed to save details.' });
  }
});

// 4. RECOMMEND Endpoint (Protected & with Full AI Logic)
app.post('/recommend', verifyToken, async (req, res) => {
  const { skills, interests, personality } = req.body;

  try {
    // Fetch the user's academic details from the database
    const user = await db.get('SELECT academic_details FROM users WHERE id = ?', req.userId);
    const academicDetails = user.academic_details ? JSON.parse(user.academic_details) : {};
    
    // Create the enhanced prompt for the AI
    const prompt = `
      You are an expert career counselor AI named PathFinder.
      A user has provided their profile. Your task is to act as a helpful guide and suggest 3 distinct and well-suited career paths.

      User Profile:
      - Skills: "${skills}"
      - Interests: "${interests}"
      - Personality Traits: "${personality}"
      - Academic Background: 
        - 10th Grade Score: ${academicDetails.grade10 || 'N/A'}
        - 12th Grade Stream/Score: ${academicDetails.grade12 || 'N/A'}
        - Graduation Degree/Score: ${academicDetails.graduation || 'N/A'}

      For each of the 3 recommendations, you must provide:
      1.  **title**: The job title.
      2.  **description**: A detailed, 2-3 sentence paragraph explaining why this career is a great fit for the user's profile, directly mentioning their skills, interests, and academic background.
      3.  **skills_to_learn**: A list of 3-4 specific, crucial skills the user should focus on learning to enter this field.

      Please provide the output ONLY in a valid JSON array format, like this:
      [
        {
          "title": "...",
          "description": "...",
          "skills_to_learn": ["Skill A", "Skill B", "Skill C"]
        }
      ]
    `;

    // Prepare the request payload for the Google AI API
    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    // Call the Google AI API
    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error("API Error:", errorText);
        throw new Error(`API request failed with status ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    // Extract, clean, and parse the AI's response
    const aiResponseText = data.candidates[0].content.parts[0].text;
    const cleanedJsonText = aiResponseText.replaceAll('```json', '').replaceAll('```', '').trim();
    const recommendations = JSON.parse(cleanedJsonText);
    
    res.json({ recommendations });

  } catch (error) {
    console.error('Error in /recommend endpoint:', error);
    res.status(500).json({ error: 'Failed to get recommendations from AI.' });
  }
});

// --- ADD THIS NEW ENDPOINT to backend/index.js ---

// 5. LIVE SEARCH Endpoint (Protected)
app.post('/live-search', verifyToken, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  try {
    // Create a new, specific prompt for a single question
    const prompt = `
      You are a helpful and concise career encyclopedia AI.
      A user has a specific question about a career or skill.
      Provide a direct, helpful, and single-paragraph answer to the user's query.

      User Query: "${query}"

      Your Answer:
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const apiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      throw new Error('API request failed');
    }

    const data = await apiResponse.json();
    const answer = data.candidates[0].content.parts[0].text;
    
    res.json({ answer });

  } catch (error) {
    console.error('Error in /live-search endpoint:', error);
    res.status(500).json({ error: 'Failed to get live search result from AI.' });
  }
});


// --- Start the Server ---
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`🚀 Server is running on ${url}`);
  console.log('Opening the app in your browser...');
  open(url); // This will open the browser
});