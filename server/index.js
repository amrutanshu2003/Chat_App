const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
const fs = require('fs');
require('dotenv').config();

// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';
process.env.PORT = process.env.PORT || 5001;

const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');
const callsRoute = require('./routes/calls');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/calls', callsRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Chat App Server is running',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running and connected to MongoDB.',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Protected route example
app.get('/api/protected', (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// --- SOCKET.IO REAL-TIME MESSAGING ---
io.on('connection', (socket) => {
  // User joins their own room for private messages
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Listen for sendMessage from sender and relay to receiver
  socket.on('sendMessage', (msg) => {
    // msg.to can be an object or a string
    let toId = msg.to;
    if (msg.to && typeof msg.to === 'object' && msg.to._id) {
      toId = msg.to._id;
    }
    if (toId) {
      io.to(toId).emit('receiveMessage', msg);
      console.log(`Relayed message from ${msg.from && msg.from._id ? msg.from._id : msg.sender} to ${toId}`);
    }
  });

  // (Optional) Group message relay
  socket.on('sendGroupMessage', (msg) => {
    if (msg.groupId) {
      io.to(msg.groupId).emit('receiveGroupMessage', msg);
      console.log(`Relayed group message to group ${msg.groupId}`);
    }
  });

  // (Optional) User online status, typing, etc. can be added here

  // Relay typing indicator
  socket.on('typing', ({ sender, receiver }) => {
    if (receiver) {
      io.to(receiver).emit('typing', { sender });
    }
  });
  socket.on('stopTyping', ({ sender, receiver }) => {
    if (receiver) {
      io.to(receiver).emit('stopTyping', { sender });
    }
  });
});

// Scheduled job to delete users whose deletionDate has passed
setInterval(async () => {
  try {
    const now = new Date();
    const usersToDelete = await User.find({ deletionScheduled: true, deletionDate: { $lte: now } });
    for (const user of usersToDelete) {
      // Delete avatar file if it exists and is not default
      if (user.avatar && user.avatar !== '/uploads/default-avatar.png') {
        const avatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(avatarPath)) {
          fs.unlinkSync(avatarPath);
        }
      }
      await User.deleteOne({ _id: user._id });
      console.log(`Deleted user: ${user.username} (${user.email})`);
    }
  } catch (err) {
    console.error('Scheduled user deletion error:', err);
  }
}, 60 * 60 * 1000); // Every hour

console.log('Messages routes loaded');

server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));