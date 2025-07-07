const express = require('express');
const router = express.Router();
const { authenticateUser, verifyOwner } = require('../middleware/authMiddleware');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/user'); // Required for associations

// === 1. Get owner’s venues ===
router.get('/venues', authenticateUser, verifyOwner, async (req, res) => {
  try {
    const venues = await Venue.findAll({ where: { ownerId: req.user.id } });
    res.json(venues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching venues', error: err.message });
  }
});

// === 2. Create a new venue ===
router.post('/venues', authenticateUser, verifyOwner, async (req, res) => {
  try {
    const newVenue = await Venue.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(newVenue);
  } catch (err) {
    res.status(400).json({ message: 'Error creating venue', error: err.message });
  }
});

// === 3. Get bookings for owner’s venues (Include Venue + User) ===
router.get('/bookings', authenticateUser, verifyOwner, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Venue, as: 'Venue' },
        { model: User, as: 'User' }  // Include the user who made the booking
      ],
      where: { '$Venue.ownerId$': req.user.id }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
});

// === 4. Get reviews for owner’s venues ===
router.get('/reviews', authenticateUser, verifyOwner, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: Venue, as: 'Venue' },
        { model: User, as: 'User' } // Optional: include client who wrote the review
      ],
      where: { '$Venue.ownerId$': req.user.id }
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

// === 5. Update booking status (Approve/Reject) ===
router.put('/bookings/:id/status', authenticateUser, verifyOwner, async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Venue, as: 'Venue' }]
    });

    if (!booking || booking.Venue.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized or booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking ${status}`, booking });
  } catch (err) {
    res.status(500).json({ message: 'Error updating booking', error: err.message });
  }
});

// === 6. Get summary stats ===
router.get('/summary', authenticateUser, verifyOwner, async (req, res) => {
  try {
    const [venues, bookings, reviews] = await Promise.all([
      Venue.count({ where: { ownerId: req.user.id } }),
      Booking.count({
        include: [{ model: Venue, as: 'Venue', where: { ownerId: req.user.id } }]
      }),
      Review.count({
        include: [{ model: Venue, as: 'Venue', where: { ownerId: req.user.id } }]
      })
    ]);

    res.json({
      totalVenues: venues,
      totalBookings: bookings,
      totalReviews: reviews
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching summary', error: err.message });
  }
});

module.exports = router;
