// server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('../src/app.js');
const { connectDB } = require('../src/config/database.js');
const logger = require('../src/utils/logger.js');

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
      await connectDB();

      const server = app.listen(PORT, () => {
        logger.info(`Server đang chạy tại http://localhost:${PORT}`);
        logger.info(`Môi trường: ${process.env.NODE_ENV || 'development'}`);
      });

      // Graceful shutdown
      const shutdown = (signal) => {
        logger.info(`\n${signal} nhận được — đang tắt server...`);
        server.close(() => {
          logger.info('Server đã đóng kết nối');
          process.exit(0);
        });
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT',  () => shutdown('SIGINT'));

    } catch (error) {
      logger.error('Khởi động server thất bại:', error.message);
      process.exit(1);
    }
};

start();
