const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return this.votes.reduce((total, vote) => total + vote.value, 0);
});

// Update score before saving
answerSchema.pre('save', function(next) {
  this.score = this.voteCount - (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
  next();
});

// Update question's isAnswered when an answer is accepted
answerSchema.pre('save', async function(next) {
  if (this.isModified('isAccepted') && this.isAccepted) {
    const Question = mongoose.model('Question');
    await Question.findByIdAndUpdate(this.question, { 
      isAnswered: true,
      selectedAnswer: this._id 
    });
  }
  next();
});

module.exports = mongoose.model('Answer', answerSchema);
