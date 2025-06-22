const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  about: { type: String, default: '' },
  avatar: { type: String, default: '' },
  lastUsernameChange: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 