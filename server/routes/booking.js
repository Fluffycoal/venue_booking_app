const sendEmail = require('../utils/sendEmail'); 
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const { clientId, venueId, eventDate } = req.body;

    if (!clientId || !venueId || !eventDate) {
      return res.status(400).json({ message: 'Missing required fields' });
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

    // Send confirmation email
    await sendEmail(
      user.email,
      'Your Booking is Submitted',
      `
        <h2>Hi ${user.username},</h2>
        <p>You have successfully submitted a booking for <strong>${venue.name}</strong> on <strong>${eventDate}</strong>.</p>
        <p>We will notify you once the booking is approved by the venue owner.</p>
        <br/>
        <p>Thank you for using Venue Booking Platform.</p>
      `
    );

    res.status(201).json({ message: 'Booking submitted and email sent', booking });

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

const Venue = require('../models/Venue');
const User = require('../models/user'); // Import User model

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

    res.json({ message: `Booking ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const { format } = require('date-fns');

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
