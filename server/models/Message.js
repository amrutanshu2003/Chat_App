const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For individual messages
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // For group messages
  content: { type: String, required: true },
  messageType: { 
    type: String, 
    enum: ['text', 'image', 'file', 'audio', 'video'], 
    default: 'text' 
  },
  fileUrl: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  reactions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Ensure either 'to' or 'group' is present, but not both
messageSchema.pre('save', function(next) {
  if (!this.to && !this.group) {
    return next(new Error('Message must be sent to a user or group'));
  }
  if (this.to && this.group) {
    return next(new Error('Message cannot be sent to both user and group'));
  }
  next();
});

// Index for better query performance
messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ replyTo: 1 });

module.exports = mongoose.model('Message', messageSchema); 