'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Goal = sequelize.define('Goal', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  subjectId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: { model: 'subjects', key: 'id' },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
    defaultValue: 'weekly',
  },
  targetHours: { // số giờ hoàn thành nhiệm vụ tính toàn theo số task*thời gian từng task
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    validate: { min: 0.1 },
  },
  achievedHours: { // số giờ hoàn thành task thực tế
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'failed', 'cancelled'),
    defaultValue: 'active',
  },
}, {
  tableName: 'goals',
});

module.exports = Goal;
