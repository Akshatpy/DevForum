const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const Community = require('../models/Community');
const Question = require('../models/Question');
const User = require('../models/User');

// @route   GET api/communities
// @desc    Get all communities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = '-memberCount' } = req.query;
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    query.isPublic = true;

    const communities = await Community.find(query)
      .populate('createdBy', 'username avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Community.countDocuments(query);

    res.json({
      communities,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/communities/popular
// @desc    Get popular communities
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const communities = await Community.find({ isPublic: true })
      .sort('-memberCount')
      .limit(20)
      .select('name displayName description memberCount postCount')
      .exec();
    
    res.json(communities);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET api/communities/:name
// @desc    Get community by name
// @access  Public
router.get('/:name', async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name.toLowerCase() })
      .populate('createdBy', 'username avatar')
      .populate('moderators', 'username avatar')
      .exec();

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Get recent questions in this community
    const questions = await Question.find({ tags: community.name })
      .populate('author', 'username avatar')
      .sort('-createdAt')
      .limit(10)
      .exec();

    res.json({
      community,
      recentQuestions: questions
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/communities
// @desc    Create a new community
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Community name is required').not().isEmpty(),
      check('name', 'Community name must be 2-30 characters').isLength({ min: 2, max: 30 }),
      check('name', 'Community name can only contain letters and numbers').matches(/^[a-z0-9]+$/),
      check('displayName', 'Display name is required').not().isEmpty(),
      check('displayName', 'Display name must be less than 50 characters').isLength({ max: 50 }),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, displayName, description, rules } = req.body;
      const lowerName = name.toLowerCase().trim();

      // Check if community already exists
      let community = await Community.findOne({ name: lowerName });
      if (community) {
        return res.status(400).json({ message: 'Community already exists' });
      }

      // Create new community
      community = new Community({
        name: lowerName,
        displayName: displayName.trim(),
        description: description || '',
        createdBy: req.user.id,
        moderators: [req.user.id], // Creator is automatically a moderator
        rules: rules || [],
        isPublic: true,
      });

      await community.save();

      // Populate creator info
      await community.populate('createdBy', 'username avatar');

      res.status(201).json(community);
    } catch (err) {
      console.error(err.message);
      if (err.code === 11000) {
        return res.status(400).json({ message: 'Community name already exists' });
      }
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// @route   PUT api/communities/:name
// @desc    Update community (moderators only)
// @access  Private
router.put('/:name', auth, async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name.toLowerCase() });
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is moderator or creator
    const isModerator = community.moderators.some(mod => mod.toString() === req.user.id) ||
                       community.createdBy.toString() === req.user.id;
    
    if (!isModerator) {
      return res.status(403).json({ message: 'Not authorized to update this community' });
    }

    const { displayName, description, rules, isPublic } = req.body;
    
    if (displayName) community.displayName = displayName.trim();
    if (description !== undefined) community.description = description;
    if (rules) community.rules = rules;
    if (isPublic !== undefined) community.isPublic = isPublic;

    await community.save();

    res.json(community);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/communities/:name/join
// @desc    Join a community
// @access  Private
router.post('/:name/join', auth, async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name.toLowerCase() });
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // For now, just increment member count
    // In a full implementation, you'd track which users are members
    community.memberCount += 1;
    await community.save();

    res.json({ message: 'Joined community', memberCount: community.memberCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST api/communities/:name/leave
// @desc    Leave a community
// @access  Private
router.post('/:name/leave', auth, async (req, res) => {
  try {
    const community = await Community.findOne({ name: req.params.name.toLowerCase() });
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();

    res.json({ message: 'Left community', memberCount: community.memberCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

