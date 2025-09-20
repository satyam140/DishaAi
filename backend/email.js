// backend/email.js

import nodemailer from 'nodemailer';

// Configure the email transporter using your Gmail account
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_GMAIL_ADDRESS@gmail.com', // Replace with your email
    pass: 'YOUR_16_CHARACTER_APP_PASSWORD'  // Replace with the App Password you generated
  }
});

export async function sendWelcomeEmail(userEmail, userName) {
  const mailOptions = {
    from: '"PathFinder AI" <YOUR_GMAIL_ADDRESS@gmail.com>', // Replace with your email
    to: userEmail,
    subject: 'Welcome to PathFinder AI! 🚀',
    html: `
      <h2>Hi ${userName},</h2>
      <p>Thank you for joining PathFinder AI, your personal career compass.</p>
      <p>We're excited to help you discover the perfect career path based on your unique talents and interests.</p>
      <p>Best regards,<br>The PathFinder AI Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Could not send welcome email: ${error}`);
  }
}