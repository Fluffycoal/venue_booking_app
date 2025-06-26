const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load models (must be required so Sequelize syncs them)
require('./models/user');    // User model
require('./models/Venue');   // Venue model
require('./models/Booking'); // Add this below Venue model
require('./models/Review');


// Import routes
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venue');
const bookingRoutes = require('./routes/booking');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Connect to database and start server
sequelize.authenticate()
  .then(() => {
    console.log('MySQL Connected...');
    return sequelize.sync(); // Sync tables
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
