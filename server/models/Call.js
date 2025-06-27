const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For 1:1 calls
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // For group calls
  type: { type: String, enum: ['audio', 'video'], required: true },
  status: { type: String, enum: ['missed', 'outgoing', 'incoming', 'ended'], required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number }, // in seconds
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // for group calls
});

module.exports = mongoose.model('Call', callSchema); 