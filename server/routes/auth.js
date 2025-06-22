const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Twilio SMS service
const twilio = require('twilio');

// Initialize Twilio client (you'll need to set these environment variables)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const router = express.Router();

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Rate limiting for OTP requests
const otpRateLimit = new Map();

// In-memory email OTP storage (in production, use Redis or database)
const emailOtpStore = new Map();

// Rate limiting for email OTP requests
const emailOtpRateLimit = new Map();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send SMS using Twilio
async function sendSMS(phoneNumber, message) {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    throw error;
  }
}

// Send Email using Nodemailer
async function sendEmail(to, subject, message) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: message
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
}

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }
    
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }
    
    // Rate limiting: Check if user has requested OTP recently
    const now = Date.now();
    const rateLimitData = otpRateLimit.get(phoneNumber);
    const minInterval = 10 * 1000; // 10 seconds minimum between requests
    
    if (rateLimitData && (now - rateLimitData.lastRequest) < minInterval) {
      const remainingTime = Math.ceil((minInterval - (now - rateLimitData.lastRequest)) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${remainingTime} seconds before requesting another OTP` 
      });
    }
    
    // Check if phone number is already registered
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(phoneNumber, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    // Update rate limiting
    otpRateLimit.set(phoneNumber, {
      lastRequest: now,
      requestCount: (rateLimitData?.requestCount || 0) + 1
    });
    
    // Clean up old rate limit entries (older than 1 hour)
    for (const [key, value] of otpRateLimit.entries()) {
      if (now - value.lastRequest > 60 * 60 * 1000) {
        otpRateLimit.delete(key);
      }
    }
    
    // Send SMS with OTP
    const message = `Your Social X verification code is: ${otp}. Valid for 5 minutes.`;
    
    try {
      await sendSMS(phoneNumber, message);
      res.json({ 
        message: 'OTP sent successfully to your phone number',
        // In development, also return OTP for testing
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (smsError) {
      // If SMS fails, remove OTP from store
      otpStore.delete(phoneNumber);
      
      // Check if it's a Twilio configuration error
      if (smsError.message.includes('Twilio credentials not configured')) {
        console.log(`OTP for ${phoneNumber}: ${otp} (SMS not configured)`);
        res.json({ 
          message: 'OTP sent successfully (development mode)',
          otp: otp // Return OTP for testing when SMS is not configured
        });
      } else {
        console.error('SMS sending error:', smsError);
        res.status(500).json({ 
          message: 'Failed to send OTP. Please try again later.' 
        });
      }
    }
    
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }
    
    const storedData = otpStore.get(phoneNumber);
    
    if (!storedData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }
    
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid, remove it from store
    otpStore.delete(phoneNumber);
    
    res.json({ message: 'OTP verified successfully' });
    
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Send Email OTP
router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    // Rate limiting: Check if user has requested email OTP recently
    const now = Date.now();
    const rateLimitData = emailOtpRateLimit.get(email);
    const minInterval = 10 * 1000; // 10 seconds minimum between requests
    
    if (rateLimitData && (now - rateLimitData.lastRequest) < minInterval) {
      const remainingTime = Math.ceil((minInterval - (now - rateLimitData.lastRequest)) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${remainingTime} seconds before requesting another email OTP` 
      });
    }
    
    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    emailOtpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    // Update rate limiting
    emailOtpRateLimit.set(email, {
      lastRequest: now,
      requestCount: (rateLimitData?.requestCount || 0) + 1
    });
    
    // Clean up old rate limit entries (older than 1 hour)
    for (const [key, value] of emailOtpRateLimit.entries()) {
      if (now - value.lastRequest > 60 * 60 * 1000) {
        emailOtpRateLimit.delete(key);
      }
    }
    
    // Send email with OTP
    const subject = 'Social X - Email Verification Code';
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #25d366; text-align: center;">Social X</h2>
        <h3 style="color: #333;">Email Verification Code</h3>
        <p>Hello!</p>
        <p>Your verification code for Social X is:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #25d366; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p>This code is valid for 5 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated message from Social X. Please do not reply to this email.
        </p>
      </div>
    `;
    
    try {
      await sendEmail(email, subject, htmlMessage);
      res.json({ 
        message: 'Email OTP sent successfully to your email address',
        // In development, also return OTP for testing
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (emailError) {
      // If email fails, remove OTP from store
      emailOtpStore.delete(email);
      
      // Check if it's an email configuration error
      if (emailError.message.includes('Email sending failed')) {
        console.log(`Email OTP for ${email}: ${otp} (Email not configured)`);
        res.json({ 
          message: 'Email OTP sent successfully (development mode)',
          otp: otp // Return OTP for testing when email is not configured
        });
      } else {
        console.error('Email sending error:', emailError);
        res.status(500).json({ 
          message: 'Failed to send email OTP. Please try again later.' 
        });
      }
    }
    
  } catch (err) {
    console.error('Send Email OTP error:', err);
    res.status(500).json({ message: 'Failed to send email OTP' });
  }
});

// Verify Email OTP
router.post('/verify-email-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    const storedData = emailOtpStore.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'Email OTP not found or expired' });
    }
    
    if (Date.now() > storedData.expiresAt) {
      emailOtpStore.delete(email);
      return res.status(400).json({ message: 'Email OTP has expired' });
    }
    
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid email OTP' });
    }
    
    // OTP is valid, remove it from store
    emailOtpStore.delete(email);
    
    res.json({ message: 'Email OTP verified successfully' });
    
  } catch (err) {
    console.error('Verify Email OTP error:', err);
    res.status(500).json({ message: 'Failed to verify email OTP' });
  }
});

// Register
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, password, phoneNumber } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : '';
    
    // Validation
    if (!username || !email || !password || !phoneNumber) {
      return res.status(400).json({ 
        message: 'Username, email, password, and phone number are required' 
      });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ 
        message: 'Username must be at least 3 characters long' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }
    
    // Phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        message: 'Please enter a valid phone number' 
      });
    }
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not available. Please try again later.' 
      });
    }
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }, { phoneNumber }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      } else if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      } else if (existingUser.phoneNumber === phoneNumber) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      phoneNumber,
      avatar 
    });
    
    await user.save();
    
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '1d' }
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        phoneNumber: user.phoneNumber,
        avatar: user.avatar 
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed: ' + Object.values(err.errors).map(e => e.message).join(', ') 
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Username, email, or phone number already exists' 
      });
    }
    res.status(500).json({ 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { id, username, email, about, avatar } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Username change logic
    if (username !== user.username) {
      const now = new Date();
      const lastChange = user.lastUsernameChange || user.createdAt || user.updatedAt || now;
      const daysSince = (now - new Date(lastChange)) / (1000 * 60 * 60 * 24);
      if (daysSince < 14) {
        return res.status(400).json({ message: 'You can only change your username once every 14 days.' });
      }
      user.username = username;
      user.lastUsernameChange = now;
    }
    user.email = email;
    user.about = about;
    user.avatar = avatar;
    await user.save();
    res.json({ id: user._id, username: user.username, email: user.email, about: user.about, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload profile image
router.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router; 