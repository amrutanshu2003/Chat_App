const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Please make sure MongoDB is running locally or set MONGO_URI environment variable');
    console.log('To install MongoDB: https://docs.mongodb.com/manual/installation/');
    console.log('Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    // Don't exit the process, let it continue but registration will fail
  });

// Track online users in memory
const onlineUsers = new Set();

io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
  socket.on('sendMessage', ({ sender, receiver, content }) => {
    io.to(receiver).emit('receiveMessage', { sender, content, createdAt: new Date().toISOString() });
  });
  // Typing indicator events
  socket.on('typing', ({ sender, receiver }) => {
    io.to(receiver).emit('typing', { sender });
  });
  socket.on('stopTyping', ({ sender, receiver }) => {
    io.to(receiver).emit('stopTyping', { sender });
  });
  // Read receipt event
  socket.on('readMessages', ({ sender, receiver }) => {
    io.to(receiver).emit('readMessages', { sender });
  });
  // Group chat events
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });
  socket.on('sendGroupMessage', ({ sender, groupId, content }) => {
    io.to(groupId).emit('receiveGroupMessage', { sender, groupId, content });
  });
  socket.on('groupTyping', ({ sender, groupId }) => {
    io.to(groupId).emit('groupTyping', { sender, groupId });
  });
  socket.on('groupStopTyping', ({ sender, groupId }) => {
    io.to(groupId).emit('groupStopTyping', { sender, groupId });
  });
  socket.on('groupReadMessages', ({ sender, groupId }) => {
    io.to(groupId).emit('groupReadMessages', { sender, groupId });
  });
  // WebRTC signaling events for video/audio calls
  socket.on('callUser', ({ to, from, signal }) => {
    io.to(to).emit('callUser', { from, signal });
  });
  socket.on('answerCall', ({ to, signal }) => {
    io.to(to).emit('callAccepted', { signal });
  });
  socket.on('iceCandidate', ({ to, candidate }) => {
    io.to(to).emit('iceCandidate', { candidate });
  });
  socket.on('endCall', ({ to }) => {
    io.to(to).emit('endCall');
  });
  // Real-time chat deletion for everyone
  socket.on('deleteChatForEveryone', ({ to }) => {
    io.to(to).emit('chatDeletedForEveryone', { from: socket.userId });
  });
  // Listen for user online event
  socket.on('userOnline', (userId) => {
    onlineUsers.add(userId);
    io.emit('userStatusChange', { userId, status: 'online', lastSeen: null });
    socket.userId = userId;
  });
  // Listen for user disconnect
  socket.on('disconnect', async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      let lastSeen = new Date();
      io.emit('userStatusChange', { userId: socket.userId, status: 'offline', lastSeen });
      // Update lastSeen in DB
      try {
        await User.findByIdAndUpdate(socket.userId, { lastSeen });
      } catch (err) {
        console.error('Failed to update lastSeen:', err);
      }
    }
  });
});

app.get('/', (req, res) => res.send('API is running'));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const messageRoutes = require('./routes/messages');
app.use('/api/messages', messageRoutes);

// REST endpoint to get online users
app.get('/api/online-users', (req, res) => {
  res.json({ onlineUsers: Array.from(onlineUsers) });
});

// REST endpoint to get a user's lastSeen
app.get('/api/last-seen/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ lastSeen: user.lastSeen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));