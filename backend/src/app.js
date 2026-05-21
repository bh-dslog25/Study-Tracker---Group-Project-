    // src/app.js
    'use strict';
    require('dotenv').config();
    const express = require('express');
    const cors    = require('cors');
    const morgan  = require('morgan');
    require('./models'); // load models & associations
    const routes  = require('./routes');
    const logger  = require('./utils/logger');
    const { errorResponse } = require('./utils/response');

    const app = express();

    // ====== MIDDLEWARES ======
    app.use(cors({
    origin:         process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
        stream: { write: (msg) => logger.info(msg.trim()) },
    }));
    }

    // ====== HEALTH CHECK ======
    app.get('/health', (req, res) => {
    res.json({
        status:      'OK',
        message:     '🎓 Study Tracker API đang hoạt động',
        timestamp:   new Date().toISOString(),
        version:     '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
    });

    // ====== API ROUTES ======
    app.use('/api', routes);

    // ====== 404 HANDLER ======
    app.use((req, res) => {
    return errorResponse(res, `Không tìm thấy route: ${req.method} ${req.originalUrl}`, 404);
    });

    // ====== GLOBAL ERROR HANDLER ======
    app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    return errorResponse(res, err.message || 'Lỗi server nội bộ', err.status || 500);
    });

    module.exports = app;