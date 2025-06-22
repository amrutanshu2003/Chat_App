const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const QRCode = require('qrcode');
const crypto = require('crypto');

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// In-memory store for reset tokens (for demo; use DB/Redis in production)
const resetTokens = {};

// Register new user
router.post('/register', upload.single('avatar'), async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Handle both JSON and FormData
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // FormData - data is already in req.body
    } else {
      // JSON - data is in req.body
    }

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide username, email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      username,
      email,
      password: hashedPassword
    };

    // Add avatar if uploaded
    if (req.file) {
      userData.avatar = `/uploads/${req.file.filename}`;
    }

    // Create new user
    const user = new User(userData);

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if account is scheduled for deletion
    if (user.deletionScheduled) {
      return res.status(200).json({
        success: false,
        deletionScheduled: true,
        deletionDate: user.deletionDate?.toLocaleString() || '',
        message: `Account is scheduled for deletion on ${user.deletionDate?.toLocaleString() || ''}. If this is a mistake, contact support.`
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Verify 2FA code for login
router.post('/verify-2fa-login', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) {
      return res.status(400).json({ success: false, message: 'User ID and 2FA code are required.' });
    }
    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: '2FA not enabled for this user.' });
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });
    if (!verified) {
      return res.status(400).json({ success: false, message: 'Invalid 2FA code.' });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('2FA login error:', error);
    res.status(500).json({ success: false, message: 'Server error during 2FA login.' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Update user profile
router.put('/profile', upload.single('avatar'), async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update user data
    const { username, email } = req.body;
    
    if (username) {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username is already taken' 
        });
      }
      user.username = username;
    }

    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already taken' 
        });
      }
      user.email = email;
    }

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar file if it exists
      if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
        const fs = require('fs');
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      
      // Set new avatar path
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    // Return updated user data (without password)
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during profile update' 
    });
  }
});

// Upload avatar endpoint (separate from profile update)
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Delete old avatar file if it exists
    if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
      const fs = require('fs');
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    
    // Update user's avatar
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      url: user.avatar
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during avatar upload' 
    });
  }
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both old and new passwords are required.' });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }
    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the old password.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password change.' });
  }
});

// Enable 2FA: generate secret and QR code
router.post('/enable-2fa', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.twoFactorEnabled) return res.status(400).json({ success: false, message: '2FA already enabled.' });
    // Generate secret
    const secret = speakeasy.generateSecret({ name: `ChatApp (${user.email})` });
    // Save secret temp (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save();
    // Generate QR code
    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
      res.json({ success: true, qr: data_url, secret: secret.base32 });
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error during 2FA setup.' });
  }
});

// Verify 2FA code and enable 2FA
router.post('/verify-2fa', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { code } = req.body;
    if (!user.twoFactorSecret) return res.status(400).json({ success: false, message: '2FA not initialized.' });
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid 2FA code.' });
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ success: true, message: '2FA enabled successfully.' });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error during 2FA verification.' });
  }
});

// Disable 2FA
router.post('/disable-2fa', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    await user.save();
    res.json({ success: true, message: '2FA disabled.' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ success: false, message: 'Server error during 2FA disable.' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'No user with that email.' });
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens[token] = { userId: user._id, expires: Date.now() + 1000 * 60 * 15 }; // 15 min expiry
    // In production, send email with link: `${FRONTEND_URL}/reset-password?token=${token}`
    res.json({ success: true, message: 'Password reset link sent to your email (demo: use token below).', token });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error during forgot password.' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    const data = resetTokens[token];
    if (!data || data.expires < Date.now()) return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    const user = await User.findById(data.userId);
    if (!user) return res.status(400).json({ success: false, message: 'User not found.' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    delete resetTokens[token];
    res.json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset.' });
  }
});

// Delete account endpoint (schedule deletion)
router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided.' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Schedule deletion for 7 days from now
    user.deletionScheduled = true;
    user.deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();
    res.json({ success: true, message: `Account scheduled for deletion on ${user.deletionDate.toLocaleString()}.` });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error during account deletion.' });
  }
});

// Cancel scheduled account deletion
router.post('/cancel-deletion', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (!user.deletionScheduled) return res.status(400).json({ success: false, message: 'Account is not scheduled for deletion.' });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ success: false, message: 'Invalid password.' });
    user.deletionScheduled = false;
    user.deletionDate = null;
    await user.save();
    res.json({ success: true, message: 'Account deletion cancelled. You can now log in.' });
  } catch (error) {
    console.error('Cancel deletion error:', error);
    res.status(500).json({ success: false, message: 'Server error during cancellation.' });
  }
});

module.exports = router; 