'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Nhiệm vụ do giáo viên tạo cho lớp
const ClassTask = sequelize.define('ClassTask', {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    classId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    createdBy:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    dueDate:     { type: DataTypes.DATEONLY, allowNull: true },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high'),
        defaultValue: 'medium',
    },
    attachmentUrl: { type: DataTypes.STRING(500), allowNull: true },
}, { tableName: 'class_tasks' });

module.exports = ClassTask;