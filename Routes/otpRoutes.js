const nodemailer = require('nodemailer');
const dotenv=require("dotenv")
dotenv.config()

// Nodemailer transporter equivalent to your Spring Boot config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',     // spring.mail.host
  port: 587,                  // spring.mail.port
  secure: false,              // false for STARTTLS (TLS)
  auth: {
    user: process.env.email,   // spring.mail.username
    pass: process.env.pass,         // spring.mail.password (App Password)
  },
  tls: {
    rejectUnauthorized: false          // allows self-signed certs, optional
  }
});

// Example function to send email
async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"Smart Expense Tracker" <allatrivikram@gmail.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
function getOtp(){
    return Math.floor(10000+Math.random()*90000)
}
const otp=getOtp()
// Example usage
sendMail(
  '226m1a4202@gmail.com',
  'Test Email from Node',
  'Hello! This is a plain text message.',
  `${otp}`
);
