'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimeLog = sequelize.define('TimeLog', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  startedAt: { type: DataTypes.DATE, allowNull: false },
  endedAt: { type: DataTypes.DATE, allowNull: false },
  minutes: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'time_logs',
});

module.exports = TimeLog;

