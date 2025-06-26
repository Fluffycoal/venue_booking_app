const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/user');

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const { clientId, venueId, rating, comment } = req.body;

    if (!clientId || !venueId || !rating) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const review = await Review.create({ clientId, venueId, rating, comment });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/reviews/:venueId
router.get('/:venueId', async (req, res) => {
  try {
    const venueId = req.params.venueId;

    const reviews = await Review.findAll({
      where: { venueId },
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
