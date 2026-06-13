'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Mục tiêu học tập cá nhân của student
const Goal = sequelize.define('Goal', {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    targetHours: { type: DataTypes.DECIMAL(6, 2), allowNull: false, validate: { min: 0.1 } },
    achievedHours: { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
    type: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
        defaultValue: 'weekly',
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'failed', 'cancelled'),
        defaultValue: 'active',
    },
    startDate:   { type: DataTypes.DATEONLY, allowNull: false },
    endDate:     { type: DataTypes.DATEONLY, allowNull: false },
    isAutoRenew: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'goals',
  hooks: {
    beforeSave: (goal) => {
      if (goal.changed('achievedHours') && goal.achievedHours >= goal.targetHours) {
        goal.status = 'completed';
      }
      if (goal.status === 'active' && goal.endDate && new Date(goal.endDate) < new Date() && goal.achievedHours < goal.targetHours) {
        goal.status = 'failed';
      }
    },
  },
});

module.exports = Goal;