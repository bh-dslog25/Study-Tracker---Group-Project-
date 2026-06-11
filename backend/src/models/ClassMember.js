'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Quan hệ N:N giữa Class và Student
const ClassMember = sequelize.define('ClassMember', {
  id:        { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  classId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  joinedAt:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: {
    type: DataTypes.ENUM('active', 'removed'),
    defaultValue: 'active',
  },
}, { tableName: 'class_members' });

module.exports = ClassMember;