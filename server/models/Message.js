const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema); 