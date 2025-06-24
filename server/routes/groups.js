const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'group-avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, memberIds, isPrivate } = req.body;

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: 'Name and member IDs are required' });
    }

    // Check if all member IDs are valid users
    const members = await User.find({ _id: { $in: memberIds } });
    if (members.length !== memberIds.length) {
      return res.status(400).json({ message: 'Some users not found' });
    }

    // Create group members array
    const groupMembers = memberIds.map(userId => ({
      user: userId,
      role: userId === req.user.id ? 'admin' : 'member'
    }));

    // Add creator as admin if not already included
    if (!memberIds.includes(req.user.id)) {
      groupMembers.unshift({
        user: req.user.id,
        role: 'admin'
      });
    }

    const group = new Group({
      name,
      description: description || '',
      admin: req.user.id,
      members: groupMembers,
      settings: {
        isPrivate: isPrivate || false
      }
    });

    await group.save();

    // Populate members with user details
    await group.populate('members.user', 'username email avatar about');
    await group.populate('admin', 'username email avatar');

    res.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/groups
// @desc    Get all groups for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user.id,
      'members.isActive': true
    })
    .populate('members.user', 'username email avatar about lastSeen')
    .populate('admin', 'username email avatar')
    .populate('pinnedMessages.message')
    .sort({ lastActivity: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      'members.user': req.user.id,
      'members.isActive': true
    })
    .populate('members.user', 'username email avatar about lastSeen')
    .populate('admin', 'username email avatar')
    .populate('pinnedMessages.message from')
    .populate('pinnedMessages.pinnedBy', 'username');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/groups/:id
// @desc    Update group details
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, isPrivate, allowMemberInvite, allowMemberEdit } = req.body;

    const group = await Group.findOne({
      _id: req.params.id,
      $or: [
        { admin: req.user.id },
        { 'members.user': req.user.id, 'members.role': { $in: ['admin', 'moderator'] } }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or insufficient permissions' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (isPrivate !== undefined) group.settings.isPrivate = isPrivate;
    if (allowMemberInvite !== undefined) group.settings.allowMemberInvite = allowMemberInvite;
    if (allowMemberEdit !== undefined) group.settings.allowMemberEdit = allowMemberEdit;

    await group.save();

    await group.populate('members.user', 'username email avatar about lastSeen');
    await group.populate('admin', 'username email avatar');

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/avatar
// @desc    Upload group avatar
// @access  Private (Admin only)
router.post('/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      $or: [
        { admin: req.user.id },
        { 'members.user': req.user.id, 'members.role': { $in: ['admin', 'moderator'] } }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or insufficient permissions' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    group.avatar = `/uploads/${req.file.filename}`;
    await group.save();

    res.json({ avatar: group.avatar });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/members
// @desc    Add members to group
// @access  Private (Admin/Moderator only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: 'Member IDs array is required' });
    }

    const group = await Group.findOne({
      _id: req.params.id,
      $or: [
        { admin: req.user.id },
        { 'members.user': req.user.id, 'members.role': { $in: ['admin', 'moderator'] } }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or insufficient permissions' });
    }

    // Check if group is full
    if (group.members.length + memberIds.length > group.settings.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    // Check if users exist and are not already members
    const existingMemberIds = group.members.map(m => m.user.toString());
    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

    if (newMemberIds.length === 0) {
      return res.status(400).json({ message: 'All users are already members' });
    }

    const users = await User.find({ _id: { $in: newMemberIds } });
    if (users.length !== newMemberIds.length) {
      return res.status(400).json({ message: 'Some users not found' });
    }

    // Add new members
    const newMembers = newMemberIds.map(userId => ({
      user: userId,
      role: 'member'
    }));

    group.members.push(...newMembers);
    group.lastActivity = new Date();
    await group.save();

    await group.populate('members.user', 'username email avatar about lastSeen');
    await group.populate('admin', 'username email avatar');

    res.json(group);
  } catch (error) {
    console.error('Error adding members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/groups/:id/members/:userId
// @desc    Remove member from group
// @access  Private (Admin/Moderator only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      $or: [
        { admin: req.user.id },
        { 'members.user': req.user.id, 'members.role': { $in: ['admin', 'moderator'] } }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or insufficient permissions' });
    }

    // Check if trying to remove admin
    if (group.admin.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove group admin' });
    }

    // Check if trying to remove yourself (unless you're admin)
    if (req.params.userId === req.user.id && group.admin.toString() !== req.user.id) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    // Remove member
    group.members = group.members.filter(member => 
      member.user.toString() !== req.params.userId
    );

    group.lastActivity = new Date();
    await group.save();

    await group.populate('members.user', 'username email avatar about lastSeen');
    await group.populate('admin', 'username email avatar');

    res.json(group);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/leave
// @desc    Leave group
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      'members.user': req.user.id
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if trying to leave as admin
    if (group.admin.toString() === req.user.id) {
      return res.status(400).json({ message: 'Admin cannot leave group. Transfer admin role first.' });
    }

    // Remove from members
    group.members = group.members.filter(member => 
      member.user.toString() !== req.user.id
    );

    group.lastActivity = new Date();
    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/groups/:id/messages/:messageId/pin
// @desc    Pin a message in group
// @access  Private (Admin/Moderator only)
router.post('/:id/messages/:messageId/pin', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      $or: [
        { admin: req.user.id },
        { 'members.user': req.user.id, 'members.role': { $in: ['admin', 'moderator'] } }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or insufficient permissions' });
    }

    const message = await Message.findOne({
      _id: req.params.messageId,
      group: req.params.id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if already pinned
    const alreadyPinned = group.pinnedMessages.find(pm => 
      pm.message.toString() === req.params.messageId
    );

    if (alreadyPinned) {
      return res.status(400).json({ message: 'Message already pinned' });
    }

    group.pinnedMessages.push({
      message: req.params.messageId,
      pinnedBy: req.user.id
    });

    await group.save();
    await group.populate('pinnedMessages.message from');
    await group.populate('pinnedMessages.pinnedBy', 'username');

    res.json(group.pinnedMessages);
  } catch (error) {
    console.error('Error pinning message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/groups/:id/messages/:messageId/pin
// @desc    Unpin a message in group
// @access  Private (Admin/Moderator only)
router.delete('/:id/messages/:messageId/pin', auth, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      $or: [
        { admin: req.user.id },
        { 'members.user': req.user.id, 'members.role': { $in: ['admin', 'moderator'] } }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found or insufficient permissions' });
    }

    group.pinnedMessages = group.pinnedMessages.filter(pm => 
      pm.message.toString() !== req.params.messageId
    );

    await group.save();
    await group.populate('pinnedMessages.message from');
    await group.populate('pinnedMessages.pinnedBy', 'username');

    res.json(group.pinnedMessages);
  } catch (error) {
    console.error('Error unpinning message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 