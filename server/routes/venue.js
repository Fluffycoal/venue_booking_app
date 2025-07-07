const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Venue = require('../models/Venue');

// POST: Add a venue (used earlier)
router.post('/', async (req, res) => {
  try {
    const { name, location, capacity, price, description, ownerId } = req.body;

    if (!name || !location || !capacity || !price || !ownerId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const venue = await Venue.create({
      name,
      location,
      capacity,
      price,
      description,
      ownerId,
      status: 'approved'
    });

    res.status(201).json({ message: 'Venue created', venue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET: Search and filter venues
router.get('/', async (req, res) => {
  try {
    const { location, name, minPrice, maxPrice, minCapacity, ownerId } = req.query;

    const filters = {
      status: 'approved'
    };

    if (location) filters.location = location;
    if (name) filters.name = { [Op.like]: `%${name}%` };
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) filters.price[Op.lte] = parseFloat(maxPrice);
    }
    if (minCapacity) filters.capacity = { [Op.gte]: parseInt(minCapacity) };
    if (ownerId) filters.ownerId = parseInt(ownerId); // 👈 Add this

    const venues = await Venue.findAll({ where: filters });

    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET: Fetch venue by exact name
router.get('/name/:venueName', async (req, res) => {
  try {
    const venue = await Venue.findOne({
      where: {
        name: req.params.venueName,
        status: 'approved' // Optional: Only fetch approved venues
      }
    });

    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
