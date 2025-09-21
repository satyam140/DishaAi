import nodemailer from 'nodemailer';

// Configure the email transporter using Environment Variables for security
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // These values will be securely provided by Vercel, not stored in the code
    user: process.env.GMAIL_ADDRESS, 
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export async function sendWelcomeEmail(userEmail, userName) {
  // Check if the email credentials are configured before trying to send
  if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_APP_PASSWORD) {
    console.log('Email credentials not configured. Skipping welcome email.');
    return; // Stop the function if credentials aren't set
  }

  const mailOptions = {
    from: `"PathFinder AI" <${process.env.GMAIL_ADDRESS}>`, // Dynamically use the sender email
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
