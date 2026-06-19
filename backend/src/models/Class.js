'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Class = sequelize.define('Class', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  teacherId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  inviteCode: { type: DataTypes.STRING(50), allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  maxStudents: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
}, {
  tableName: 'classes',
});

module.exports = Class;

