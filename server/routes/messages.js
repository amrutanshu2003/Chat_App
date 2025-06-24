const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');

const router = express.Router();

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

// Send a message (individual or group)
router.post('/', auth, async (req, res) => {
  try {
    const { to, group, content, messageType = 'text', fileUrl, fileName, fileSize, replyTo } = req.body;
    
    // Validate that either 'to' or 'group' is provided, but not both
    if (!to && !group) {
      return res.status(400).json({ message: 'Either "to" (user ID) or "group" (group ID) is required' });
    }
    if (to && group) {
      return res.status(400).json({ message: 'Cannot send to both user and group simultaneously' });
    }

    const sender = await User.findById(req.user.id);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    // For individual messages
    if (to) {
      const receiver = await User.findById(to);
      if (!receiver) {
        return res.status(404).json({ message: 'Receiver not found' });
      }
      
      // Check if users are blocked
      if (sender.blockedUsers.includes(to) || receiver.blockedUsers.includes(req.user.id)) {
        return res.status(403).json({ message: 'You cannot send messages to this user.' });
      }
    }

    // For group messages
    if (group) {
      const groupDoc = await Group.findOne({
        _id: group,
        'members.user': req.user.id,
        'members.isActive': true
      });
      
      if (!groupDoc) {
        return res.status(404).json({ message: 'Group not found or you are not a member' });
      }
    }

    const messageData = {
      from: req.user.id,
      content,
      messageType,
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      fileSize: fileSize || 0,
      replyTo: replyTo || null
    };

    if (to) {
      messageData.to = to;
    } else {
      messageData.group = group;
    }

    const message = new Message(messageData);
    await message.save();

    // Populate sender details
    await message.populate('from', 'username email avatar');
    if (to) {
      await message.populate('to', 'username email avatar');
    }
    if (replyTo) {
      await message.populate('replyTo from');
    }

    res.json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get messages (individual or group)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'user' } = req.query; // 'user' or 'group'
    
    let messages;
    
    if (type === 'group') {
      // Verify user is member of the group
      const group = await Group.findOne({
        _id: id,
        'members.user': req.user.id,
        'members.isActive': true
      });
      
      if (!group) {
        return res.status(404).json({ message: 'Group not found or you are not a member' });
      }
      
      messages = await Message.find({ group: id })
        .populate('from', 'username email avatar')
        .populate('replyTo from')
        .sort({ createdAt: 1 });
    } else {
      // Individual chat
      const otherUser = await User.findById(id);
      if (!otherUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      messages = await Message.find({
        $or: [
          { from: req.user.id, to: id },
          { from: id, to: req.user.id }
        ]
      })
        .populate('from', 'username email avatar')
        .populate('to', 'username email avatar')
        .populate('replyTo from')
        .sort({ createdAt: 1 });
    }

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
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
      avatar: u.avatar,
      about: u.about,
      lastSeen: u.lastSeen
    }));
    res.json(userList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark messages as read
router.post('/read/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'user' } = req.query; // 'user' or 'group'
    
    if (type === 'group') {
      // Mark group messages as read
      await Message.updateMany(
        { 
          group: id, 
          from: { $ne: req.user.id },
          'readBy.user': { $ne: req.user.id }
        }, 
        { 
          $push: { 
            readBy: { 
              user: req.user.id, 
              readAt: new Date() 
            } 
          } 
        }
      );
    } else {
      // Mark individual messages as read
      await Message.updateMany(
        { 
          from: id, 
          to: req.user.id,
          'readBy.user': { $ne: req.user.id }
        }, 
        { 
          $push: { 
            readBy: { 
              user: req.user.id, 
              readAt: new Date() 
            } 
          } 
        }
      );
    }
    
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single user by ID
router.get('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      about: user.about,
      lastSeen: user.lastSeen
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all messages between the logged-in user and the specified user
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'user' } = req.query; // 'user' or 'group'
    
    if (type === 'group') {
      // Delete group messages (only for the current user)
      await Message.deleteMany({
        group: id,
        from: req.user.id
      });
    } else {
      // Delete individual chat messages
      await Message.deleteMany({
        $or: [
          { from: req.user.id, to: id },
          { from: id, to: req.user.id }
        ]
      });
    }
    
    res.json({ message: 'Chat cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all messages for me (current user is the receiver or sender) from the specified user
router.delete('/me/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'user' } = req.query; // 'user' or 'group'
    
    if (type === 'group') {
      // Delete group messages for current user
      await Message.deleteMany({
        group: id,
        from: req.user.id
      });
    } else {
      // Delete individual chat messages
      await Message.deleteMany({
        $or: [
          { from: req.params.id, to: req.user.id },
          { from: req.user.id, to: req.params.id }
        ]
      });
    }
    
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

// Edit a message
router.put('/:messageId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender
    if (message.from.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }
    
    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();
    
    await message.populate('from', 'username email avatar');
    if (message.to) {
      await message.populate('to', 'username email avatar');
    }
    if (message.replyTo) {
      await message.populate('replyTo from');
    }
    
    res.json(message);
  } catch (err) {
    console.error('Error editing message:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a message
router.delete('/message/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is the sender or admin of the group
    if (message.from.toString() !== req.user.id) {
      if (message.group) {
        const group = await Group.findOne({
          _id: message.group,
          $or: [
            { admin: req.user.id },
            { 'members.user': req.user.id, 'members.role': { $in: ['admin', 'moderator'] } }
          ]
        });
        
        if (!group) {
          return res.status(403).json({ message: 'You can only delete your own messages' });
        }
      } else {
        return res.status(403).json({ message: 'You can only delete your own messages' });
      }
    }
    
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add reaction to message
router.post('/:messageId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user.id && r.emoji === emoji
    );
    
    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === req.user.id && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        user: req.user.id,
        emoji
      });
    }
    
    await message.save();
    await message.populate('reactions.user', 'username');
    
    res.json(message.reactions);
  } catch (err) {
    console.error('Error adding reaction:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 