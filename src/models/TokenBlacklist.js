const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['logout', 'rotate'],
      default: 'logout'
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Auto-delete expired tokens
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
