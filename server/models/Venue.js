const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user'); // Import User model

const Venue = sequelize.define('Venue', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Define relation: one user (owner) has many venues
User.hasMany(Venue, { foreignKey: 'ownerId' });
Venue.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = Venue;
