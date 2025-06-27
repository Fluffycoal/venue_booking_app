const express = require('express');
const router = express.Router();
const { format } = require('date-fns');

const Booking = require('../models/Booking');
const User = require('../models/user');
const Venue = require('../models/Venue');
const sendEmail = require('../utils/sendEmail');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const { clientId, venueId, eventDate } = req.body;

    if (!clientId || !venueId || !eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for booking conflict (same venue & date)
    const conflict = await Booking.findOne({
      where: {
        venueId,
        eventDate
      }
    });

    if (conflict) {
      return res.status(409).json({
        message: 'This venue is already booked on the selected date. Please choose another date.'
      });
    }

    // Fetch client and venue
    const user = await User.findByPk(clientId);
    const venue = await Venue.findByPk(venueId);

    if (!user || !venue) {
      return res.status(404).json({ message: 'Client or venue not found' });
    }

    // Create the booking
    const booking = await Booking.create({
      clientId,
      venueId,
      eventDate
    });

    // Send email to client
    await sendEmail(
      user.email,
      'Your Booking is Submitted',
      `
        <h2>Hi ${user.username},</h2>
        <p>You have successfully submitted a booking for <strong>${venue.name}</strong> on <strong>${eventDate}</strong>.</p>
        <p>We will notify you once the booking is approved by the venue owner.</p>
      `
    );

    // Notify venue owner
    const owner = await User.findByPk(venue.ownerId);
    if (owner) {
      await sendEmail(
        owner.email,
        'New Booking Request Received',
        `
          <h2>Hello ${owner.username},</h2>
          <p>You have received a new booking request for your venue: <strong>${venue.name}</strong>.</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p>Please log in to approve or reject this booking.</p>
        `
      );
    }

    res.status(201).json({ message: 'Booking submitted and emails sent', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/bookings/client/:clientId
router.get('/client/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const bookings = await Booking.findAll({
      where: { clientId },
      include: [
        {
          model: Venue,
          attributes: ['name', 'location', 'price']
        }
      ],
      order: [['eventDate', 'ASC']]
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/bookings/owner/:ownerId
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    const venues = await Venue.findAll({ where: { ownerId } });
    const venueIds = venues.map(v => v.id);

    const bookings = await Booking.findAll({
      where: { venueId: venueIds },
      include: [
        { model: Venue, attributes: ['name', 'location'] },
        { model: User, attributes: ['username'] }
      ],
      order: [['eventDate', 'ASC']]
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/bookings/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['approved', 'rejected', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    // Send status update email to client
    const client = await User.findByPk(booking.clientId);
    const venue = await Venue.findByPk(booking.venueId);

    if (client && venue) {
      await sendEmail(
        client.email,
        `Booking ${status.toUpperCase()} - ${venue.name}`,
        `
          <h2>Hello ${client.username},</h2>
          <p>Your booking for <strong>${venue.name}</strong> on <strong>${booking.eventDate}</strong> has been <strong>${status}</strong>.</p>
          <p>Thank you for using Venue Booking Platform.</p>
        `
      );
    }

    res.json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/bookings/:id/invoice
router.get('/:id/invoice', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Venue, attributes: ['name', 'price', 'location'] },
        { model: User, attributes: ['username', 'email'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ message: 'Invoice is only available for approved bookings' });
    }

    const invoice = {
      invoiceNumber: `INV-${booking.id.toString().padStart(4, '0')}`,
      bookingId: booking.id,
      clientName: booking.User.username,
      venueName: booking.Venue.name,
      location: booking.Venue.location,
      eventDate: booking.eventDate,
      totalAmount: `KES ${booking.Venue.price.toLocaleString()}`,
      status: booking.status,
      issuedOn: format(new Date(), 'yyyy-MM-dd')
    };

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
