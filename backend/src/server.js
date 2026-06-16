'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Server dang chay tai http://localhost:${PORT}`);
      logger.info(`Moi truong: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down server...`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(`Khoi dong server that bai: ${error.message}`);
    process.exit(1);
  }
};

start();
