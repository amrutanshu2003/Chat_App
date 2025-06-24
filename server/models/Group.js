const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50
  },
  description: { 
    type: String, 
    default: '',
    maxlength: 200
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    role: { 
      type: String, 
      enum: ['admin', 'moderator', 'member'], 
      default: 'member' 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  }],
  settings: {
    isPrivate: { 
      type: Boolean, 
      default: false 
    },
    allowMemberInvite: { 
      type: Boolean, 
      default: true 
    },
    allowMemberEdit: { 
      type: Boolean, 
      default: false 
    },
    maxMembers: { 
      type: Number, 
      default: 100 
    }
  },
  pinnedMessages: [{
    message: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Message' 
    },
    pinnedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    pinnedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  lastActivity: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Index for better query performance
GroupSchema.index({ 'members.user': 1 });
GroupSchema.index({ admin: 1 });
GroupSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('Group', GroupSchema); 