const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema); 