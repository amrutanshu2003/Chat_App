const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

const router = express.Router();

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

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
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
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not available. Please try again later.' 
      });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      } else {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, avatar });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed: ' + Object.values(err.errors).map(e => e.message).join(', ') 
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
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