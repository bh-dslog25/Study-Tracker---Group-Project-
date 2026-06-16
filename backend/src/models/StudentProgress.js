'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tiến độ của student với từng ClassTask — giáo viên theo dõi được
const StudentProgress = sequelize.define('StudentProgress', {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    classId:     { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    classTaskId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    studentId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: {
        type: DataTypes.ENUM('assigned', 'in_progress', 'completed', 'late'),
        defaultValue: 'assigned',
    },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    note:        { type: DataTypes.TEXT, allowNull: true },
}, {
    tableName: 'student_progress',
    hooks: {
        beforeSave: (p) => {
        if (p.changed('status') && p.status === 'completed' && !p.completedAt) {
            p.completedAt = new Date();
        }
        },
    },
});

module.exports = StudentProgress;