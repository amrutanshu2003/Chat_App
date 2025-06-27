const express = require('express');
const router = express.Router();
const Call = require('../models/Call');
const auth = require('../middleware/auth');

// Log a call (POST /api/calls)
router.post('/', auth, async (req, res) => {
  try {
    const call = new Call({ ...req.body, from: req.user.userId });
    await call.save();
    res.json(call);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get call history for current user (GET /api/calls)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const calls = await Call.find({
      $or: [
        { from: userId },
        { to: userId },
        { participants: userId }
      ]
    })
      .populate('from', 'username avatar')
      .populate('to', 'username avatar')
      .populate('group', 'name avatar')
      .sort({ startedAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 