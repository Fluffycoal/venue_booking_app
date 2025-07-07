const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Venue = require('./Venue');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  venueId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  eventTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending'
  }
});

// Relationships
User.hasMany(Booking, { foreignKey: 'clientId' });
Booking.belongsTo(User, { foreignKey: 'clientId' });

Venue.hasMany(Booking, { foreignKey: 'venueId' });
Booking.belongsTo(Venue, { foreignKey: 'venueId' });

module.exports = Booking;
