const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');
const Venue = require('./Venue');

const Review = sequelize.define('Review', {
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Relationships
User.hasMany(Review, { foreignKey: 'clientId' });
Review.belongsTo(User, { foreignKey: 'clientId' });

Venue.hasMany(Review, { foreignKey: 'venueId' });
Review.belongsTo(Venue, { foreignKey: 'venueId' });

module.exports = Review;
