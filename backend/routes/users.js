const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// @route   GET api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's questions
    const questions = await Question.find({ author: user._id })
      .select('title views answers votes createdAt')
      .sort('-createdAt')
      .limit(5)
      .lean();

    // Get user's answers
    const answers = await Answer.find({ author: user._id })
      .populate('question', 'title')
      .select('body question votes isAccepted createdAt')
      .sort('-createdAt')
      .limit(5)
      .lean();

    res.json({
      ...user,
      questions,
      answers
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('bio', 'Bio must be less than 500 characters').isLength({ max: 500 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bio, avatar } = req.body;
    const profileFields = {};
    
    if (bio !== undefined) profileFields.bio = bio;
    if (avatar) profileFields.avatar = avatar;

    try {
      let user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/users/:username/questions
// @desc    Get all questions by a user
// @access  Public
router.get('/:username/questions', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    
    const questions = await Question.find({ author: user._id })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username avatar')
      .lean();

    const count = await Question.countDocuments({ author: user._id });

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

// @route   GET api/users/:username/answers
// @desc    Get all answers by a user
// @access  Public
router.get('/:username/answers', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { page = 1, limit = 10 } = req.query;
    
    const answers = await Answer.find({ author: user._id })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('question', 'title')
      .populate('author', 'username avatar')
      .lean();

    const count = await Answer.countDocuments({ author: user._id });

    res.json({
      answers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
