'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Mục tiêu học tập cá nhân của student
const Goal = sequelize.define('Goal', {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    targetHours: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, validate: { min: 1 } },
    achievedHours: { type: DataTypes.INTEGER, defaultValue: 0 },
    type: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom', 'study', 'skills', 'health', 'habit'),
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
      if (goal.changed('achievedHours') && Number(goal.achievedHours) >= Number(goal.targetHours)) {
        goal.status = 'completed';
      }
      if (goal.status === 'active' && goal.endDate && new Date(goal.endDate) < new Date() && Number(goal.achievedHours) < Number(goal.targetHours)) {
        goal.status = 'failed';
      }
    },
  },
});

module.exports = Goal;