const dotenv = require("dotenv");
const express = require("express");
const app = express();
const User = require("../Models/Account");
const Otp = require("../Models/Otp");
const nodemailer = require("nodemailer");

dotenv.config();
app.use(express.json()); // parse JSON request bodies

// --- Nodemailer transporter using standard SMTP (e.g. Gmail) ---
// Set EMAIL_USER and EMAIL_PASS in your .env (for Gmail use App Password or OAuth2)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Send email function ---
async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log("Email sent:", info.response || info);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// --- OTP generation ---
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}
// Example/test call removed/commented to avoid sending on import
// sendMail("226m1a4202@gmail.com","Otp","Hiii", `${generateOtp()}`)

// --- OTP send route ---
app.post("/sendotp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email id" });
    }

    const otp = generateOtp();

    await sendMail(
      email,
      "Forget Password OTP",
      `Enter this OTP to verify your email: ${otp}`,
      `<h1>Your OTP: ${otp}</h1>`
    );

    const otpMod = new Otp({ otp: otp, userId: user._id, createdAt: new Date() });
    await otpMod.save();

    res.status(201).json({ message: "OTP sent to your email address", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// --- OTP validation route ---
app.post("/validateotp", async (req, res) => {
  try {
    const { otp, userId } = req.body;

    // Check if OTP exists for that user and is not expired (optional: 5 min expiry)
    const validateOtp = await Otp.findOne({ otp: otp, userId: userId });
    if (!validateOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Optional: delete OTP after validation
    await Otp.deleteOne({ _id: validateOtp._id });

    res.status(200).json({ message: "OTP validated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = app;
