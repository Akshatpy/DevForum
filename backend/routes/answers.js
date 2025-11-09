const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');

// @route   POST api/answers/:questionId
// @desc    Add an answer to a question
// @access  Private
router.post(
  '/:questionId',
  [auth, [check('body', 'Answer body is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const question = await Question.findById(req.params.questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }

      const answer = new Answer({
        body: req.body.body,
        question: question._id,
        author: req.user.id
      });

      await answer.save();

      // Add answer to question's answers array
      question.answers.push(answer._id);
      await question.save();

      // Populate author info
      await answer.populate('author', 'username avatar');

      res.status(201).json(answer);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/answers/accept/:id
// @desc    Mark an answer as accepted
// @access  Private
router.put('/accept/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('question', 'author');

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the question author
    if (answer.question.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If answer is already accepted, unaccept it
    answer.isAccepted = !answer.isAccepted;
    
    // If accepting, unaccept any previously accepted answers
    if (answer.isAccepted) {
      await Answer.updateMany(
        { 
          question: answer.question._id, 
          _id: { $ne: answer._id },
          isAccepted: true 
        },
        { $set: { isAccepted: false } }
      );
      
      // Award reputation to answer author
      const answerAuthor = await User.findById(answer.author);
      answerAuthor.reputation = (answerAuthor.reputation || 0) + 15;
      await answerAuthor.save();
    }

    await answer.save();
    
    res.json(answer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/answers/vote/:id
// @desc    Vote on an answer
// @access  Private
router.put('/vote/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const { value } = req.body;
    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: 'Vote value must be 1 or -1' });
    }

    // Check if user already voted
    const voteIndex = answer.votes.findIndex(
      vote => vote.user.toString() === req.user.id
    );

    if (voteIndex >= 0) {
      // User already voted
      if (answer.votes[voteIndex].value === value) {
        // Remove vote if same value
        answer.votes.splice(voteIndex, 1);
      } else {
        // Update vote if different value
        answer.votes[voteIndex].value = value;
      }
    } else {
      // Add new vote
      answer.votes.push({ user: req.user.id, value });
    }

    await answer.save();
    
    // Update answer author's reputation
    if (answer.author.toString() !== req.user.id) {
      const author = await User.findById(answer.author);
      const repChange = value > 0 ? 10 : -2;
      author.reputation = Math.max(0, (author.reputation || 0) + repChange);
      await author.save();
    }

    res.json(answer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/answers/:id
// @desc    Delete an answer
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check user is the author or admin
    if (answer.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove answer from question's answers array
    await Question.updateOne(
      { _id: answer.question },
      { $pull: { answers: answer._id } }
    );

    await answer.remove();
    res.json({ message: 'Answer removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Answer not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
