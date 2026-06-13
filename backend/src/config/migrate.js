// src/config/migrate.js
'use strict';
require('dotenv').config();
const { sequelize } = require('./database');
require('../models');

const migrate = async () => {
  try {
    const env = process.env.NODE_ENV || 'development';

    const shouldForce = process.env.FORCE_MIGRATE === 'true' || process.argv.includes('--force');

    if (shouldForce) {
      // Chỉ force khi truyền biến môi trường tường minh
      console.warn('FORCE MIGRATE — toàn bộ dữ liệu sẽ bị xoá!');
      await new Promise((resolve) => setTimeout(resolve, 3000)); // chờ 3s để kịp Ctrl+C
      await sequelize.sync({ force: true });
      console.log('Force migration hoàn tất!');

    } else if (env === 'production') {
      // Production: chỉ tạo bảng mới, KHÔNG đụng bảng cũ
      await sequelize.sync({ force: false, alter: false });
      console.log('Migration production hoàn tất!');

    } else if (env === 'development') {
      // Development: tự động alter nếu schema thay đổi
      await sequelize.sync({ alter: true });
      console.log('Migration development hoàn tất!');
    }

    await sequelize.close();
    process.exit(0);

  } catch (err) {
    console.error('Migration thất bại:', err.message);
    await sequelize.close();
    process.exit(1);
  }
};

migrate();
