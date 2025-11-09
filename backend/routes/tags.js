const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Community = require('../models/Community');

// @route   GET api/tags/popular
// @desc    Get popular tags/communities (legacy endpoint, use /api/communities/popular instead)
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json(tags.map(tag => ({ name: tag._id, count: tag.count })));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

