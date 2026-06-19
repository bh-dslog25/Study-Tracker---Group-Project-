'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClassTask = sequelize.define('ClassTask', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  classId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  deadline: { type: DataTypes.DATE, allowNull: true },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), allowNull: false, defaultValue: 'medium' },
}, {
  tableName: 'class_tasks',
});

module.exports = ClassTask;

