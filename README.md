🧭 DishaAI - Your Personal Career Compass
Disha AI is an intelligent, full-stack web application designed to provide hyper-personalized career guidance. Built for the Hack2Skill Hackathon, this project leverages the power of Large Language Models (LLMs) to help students and professionals navigate the complexities of career choices by analyzing their unique skills, interests, and academic background.

✨ Key Features
Secure User Authentication: Full signup and login functionality with secure password hashing (bcrypt) and session management using JSON Web Tokens (JWT).

Automated Welcome Emails: New users receive a welcoming email upon registration, powered by Nodemailer.

Deep User Profiling: Gathers comprehensive user data, including academic history from 10th grade through graduation.

Personalized AI Recommendations: Utilizes the Google Gemini API to generate tailored career recommendations based on a holistic user profile.

Live AI-Powered Search Engine: Users can ask any career-related question and receive instant, AI-generated answers in real-time.

Dynamic Filtering: An intuitive search bar allows users to instantly filter their personalized career recommendations.

Sleek, Modern UI: A fully responsive, single-page application (SPA) with a glassmorphism-inspired dark theme for an excellent user experience.

🚀 Tech Stack
This project is built with a modern, efficient, and scalable JavaScript-based stack.

Frontend: HTML5, CSS3, Vanilla JavaScript

Backend: Node.js, Express.js

Database: SQLite3

AI Model: Google Gemini API (gemini-1.5-flash)

Authentication: bcrypt (Password Hashing), jsonwebtoken (JWT)

Emailing: Nodemailer

🔧 Setup and Installation
To get this project running locally, follow these simple steps.

Prerequisites
Node.js (v18 or newer recommended)

A Google AI API Key from Google AI Studio.

A Gmail account with a generated App Password.

Installation Steps
Clone the repository:

git clone [https://github.com/YOUR_USERNAME/career-guidance-ai.git](https://github.com/YOUR_USERNAME/career-guidance-ai.git)
cd career-guidance-ai

Install backend dependencies:
Navigate to the backend directory and install the required npm packages.

cd backend
npm install

Set up your environment variables:
In the backend directory, create a copy of the .env.example file (if you have one) or create a new file named .env and add the following variables. Do not commit this file to GitHub.

# Your secret key for signing JWTs
JWT_SECRET="your-super-secret-key-for-the-hackathon"

# Google Gemini API Key
API_KEY="YOUR_NEW_API_KEY_GOES_HERE"

# Gmail credentials for sending emails
GMAIL_ADDRESS="YOUR_GMAIL_ADDRESS@gmail.com"
GMAIL_APP_PASSWORD="YOUR_16_CHARACTER_APP_PASSWORD"

Note: You would need to modify the backend/index.js and backend/email.js files to read from this .env file using a package like dotenv for this to work automatically.

Run the application:
From the backend directory, run the start command. This will launch the server and automatically open the application in your default web browser.

npm start

The application will be available at http://localhost:3001.

📸 Screenshots
Login & Signup Page

Main Application Interface with Live Search

Personalized AI Recommendations with Filtering

📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

🙏 Acknowledgements
A big thank you to the organizers of the Hack2Skill Hackathon for this incredible opportunity.

The Google Gemini team for providing powerful and accessible AI models.
