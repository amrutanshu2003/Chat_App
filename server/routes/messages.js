const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const multer = require('multer');
const path = require('path');

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

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { to, content } = req.body;
    if (!to || !content) {
      console.error('Missing to or content:', { to, content });
      return res.status(400).json({ message: 'Missing recipient or content.' });
    }
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(to);
    if (!sender || !receiver) {
      console.error('Sender or receiver not found:', { sender, receiver });
      return res.status(404).json({ message: 'Sender or receiver not found.' });
    }
    if (receiver.blockedUsers.includes(req.user.id)) {
      return res.status(403).json({ message: 'You cannot send messages to this user.' });
    }
    const message = new Message({ sender: req.user.id, receiver: to, content });
    await message.save();
    res.json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages.map(m => ({
      _id: m._id,
      sender: m.sender,
      receiver: m.receiver,
      content: m.content,
      read: m.read,
      createdAt: m.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (for chat list)
router.get('/users/all', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
    // Only return id, username, email, avatar
    const userList = users.map(u => ({
      _id: u._id,
      username: u.username,
      email: u.email,
      avatar: u.avatar
    }));
    res.json(userList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark messages as read
router.post('/read/:userId', auth, async (req, res) => {
  try {
    await Message.updateMany({ sender: req.params.userId, receiver: req.user.id, read: false }, { $set: { read: true } });
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a group
router.post('/groups', auth, async (req, res) => {
  try {
    const { name, members, avatar } = req.body;
    const group = new Group({ name, members: [...members, req.user.id], avatar });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all groups for user
router.get('/groups', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a group message
router.post('/group/:groupId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = new Message({ sender: req.user.id, group: req.params.groupId, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get group messages
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single user by ID
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // If the requesting user is blocked by the target user, hide avatar, about, and username
    let avatar = user.avatar;
    let about = user.about;
    let username = user.username;
    if (user.blockedUsers.includes(req.user.id)) {
      avatar = '';
      about = '';
      username = 'Social X user';
    }
    res.json({
      _id: user._id,
      username,
      email: user.email,
      avatar,
      about
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all messages between the logged-in user and the specified user
router.delete('/:userId', auth, async (req, res) => {
  try {
    await Message.deleteMany({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    });
    res.json({ message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all messages for me (current user is the receiver or sender) from the specified user
router.delete('/me/:userId', auth, async (req, res) => {
  try {
    await Message.deleteMany({
      $or: [
        { sender: req.params.userId, receiver: req.user.id },
        { sender: req.user.id, receiver: req.params.userId }
      ]
    });
    res.json({ message: 'Chat deleted for me' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Block a user
router.post('/block/:userId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { blockedUsers: req.params.userId } });
    res.json({ message: 'User blocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unblock a user
router.post('/unblock/:userId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { blockedUsers: req.params.userId } });
    res.json({ message: 'User unblocked' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if a user is blocked
router.get('/is-blocked/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const isBlocked = user.blockedUsers.includes(req.params.userId);
    res.json({ isBlocked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload chat attachment
router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  // Determine file type
  let type = 'file';
  if (req.file.mimetype.startsWith('image/')) type = 'image';
  else if (req.file.mimetype.startsWith('video/')) type = 'video';
  else if (req.file.mimetype.startsWith('audio/')) type = 'audio';
  res.json({ url, type, name: req.file.originalname });
});

module.exports = router; 