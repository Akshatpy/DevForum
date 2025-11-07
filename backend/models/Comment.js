const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    value: {
      type: Number,
      enum: [1, -1]
    }
  }]
}, { timestamps: true });

// Virtual for vote count
commentSchema.virtual('voteCount').get(function() {
  return this.votes.reduce((total, vote) => total + vote.value, 0);
});

module.exports = mongoose.model('Comment', commentSchema);
