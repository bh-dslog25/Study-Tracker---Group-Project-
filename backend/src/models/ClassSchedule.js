'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassSchedule = sequelize.define('ClassSchedule', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  classId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  startsAt: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'class_schedules',
});

module.exports = ClassSchedule;

