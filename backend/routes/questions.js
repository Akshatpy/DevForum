const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Question = require('../models/Question');
const User = require('../models/User');

// @route   GET api/questions
// @desc    Get all questions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', search, tag } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tag) {
      query.tags = tag;
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username avatar reputation'
        },
        options: { sort: { isAccepted: -1, score: -1 } }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/questions
// @desc    Create a question
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('body', 'Body is required').not().isEmpty(),
      check('tags', 'At least one tag is required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, body, tags } = req.body;

      const question = new Question({
        title,
        body,
        tags: tags.map(tag => tag.toLowerCase().trim()),
        author: req.user.id
      });

      await question.save();
      
      // Populate author info
      await question.populate('author', 'username avatar').execPopulate();

      res.status(201).json(question);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/questions/vote/:id
// @desc    Vote on a question
// @access  Private
router.put('/vote/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { value } = req.body;
    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: 'Vote value must be 1 or -1' });
    }

    // Check if user already voted
    const voteIndex = question.votes.findIndex(
      vote => vote.user.toString() === req.user.id
    );

    if (voteIndex >= 0) {
      // User already voted
      if (question.votes[voteIndex].value === value) {
        // Remove vote if same value
        question.votes.splice(voteIndex, 1);
      } else {
        // Update vote if different value
        question.votes[voteIndex].value = value;
      }
    } else {
      // Add new vote
      question.votes.push({ user: req.user.id, value });
    }

    await question.save();
    
    // Update author's reputation
    if (question.author.toString() !== req.user.id) {
      const author = await User.findById(question.author);
      const repChange = value > 0 ? 10 : -2;
      author.reputation = Math.max(0, (author.reputation || 0) + repChange);
      await author.save();
    }

    res.json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check user is the author or admin
    if (question.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await question.remove();
    res.json({ message: 'Question removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
