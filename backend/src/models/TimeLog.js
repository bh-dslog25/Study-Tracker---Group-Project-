'use strict';
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Phiên học của student (tự ghi lại thời gian học)
const TimeLog = sequelize.define('TimeLog', {
    id:          { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId:      { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    notes:       { type: DataTypes.TEXT, allowNull: true },
    startTime:   { type: DataTypes.DATE, allowNull: false },
    endTime:     { type: DataTypes.DATE, allowNull: true },
    durationMinutes: { type: DataTypes.INTEGER, allowNull: true },
    status: {
        type: DataTypes.ENUM('ongoing', 'completed', 'paused'),
        defaultValue: 'ongoing',
    },
    rating:     { type: DataTypes.TINYINT.UNSIGNED, allowNull: true, validate: { min: 1, max: 5 } },
    focusScore: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true, validate: { min: 1, max: 10 } },
    tags:       { type: DataTypes.JSON, defaultValue: [] },
}, {
    tableName: 'time_logs',
    hooks: {
        beforeSave: (log) => {
        if (log.startTime && log.endTime) {
            log.durationMinutes = Math.round((new Date(log.endTime) - new Date(log.startTime)) / 60000);
            }
        },
    },
});

module.exports = TimeLog;