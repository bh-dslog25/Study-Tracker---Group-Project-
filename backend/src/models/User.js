'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// User model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(200), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('teacher', 'student'), allowNull: false, defaultValue: 'student' },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  lastLogin: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'users',
  indexes: [
    { unique: true, fields: ['email'] },
  ],
});

module.exports = User;

