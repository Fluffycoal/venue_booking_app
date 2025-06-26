const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('client', 'owner', 'admin'),
    defaultValue: 'client'
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active'
  }
});

module.exports = User;
