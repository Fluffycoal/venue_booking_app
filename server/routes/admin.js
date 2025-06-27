const { verifyAdmin } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

const User = require('../models/user'); // Ensure this path is correct
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// === 1. Get all users ===
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// === 2. Update a user's role or status ===
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { role, status } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// === 3. Delete a user ===
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// === 4. Approve or reject a venue ===
router.put('/venues/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const venue = await Venue.findByPk(req.params.id);

    if (!venue) return res.status(404).json({ message: 'Venue not found' });

    venue.status = status;
    await venue.save();

    res.json({ message: `Venue ${status}`, venue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// === 5. View all bookings ===
router.get('/bookings',verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.findAll({ include: ['Venue', 'User'] });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// === 6. View all reviews ===
router.get('/reviews',verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.findAll({ include: ['User', 'Venue'] });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
