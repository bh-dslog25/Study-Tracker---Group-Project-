'use strict';
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return errorResponse(res, 'Token xác thực không được cung cấp', 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // --- ĐOẠN ĐƯỢC CẢI TIẾN ĐỂ TRÁNH LỖI ĐỒNG BỘ DỮ LIỆU ---
      // Lấy ID an toàn: Đề phòng trường hợp lúc tạo token bạn bọc user trong 1 object khác (ví dụ: decoded.user.id)
      const targetId = decoded.id || decoded.user?.id; 

      if (!targetId) {
        // Nếu giải mã ra thành công nhưng không tìm thấy trường id nào trong payload
        return errorResponse(res, 'Token không hợp lệ (Cấu trúc payload sai)', 401);
      }

      // Ép kiểu targetId về số nguyên (Number) để khớp 100% với kiểu INT UNSIGNED trong MySQL
      const user = await User.findOne({ 
        where: { 
          id: Number(targetId), 
          isActive: true 
        } 
      });
      // ----------------------------------------------------

      if (!user) return errorResponse(res, 'Người dùng không tồn tại hoặc đã bị khoá', 401);

      req.user = user;
      next();
    } catch (error) {
      // Log lỗi cụ thể ra Terminal của Backend để bạn dễ debug chính xác nguyên nhân
      console.error("=== LỖI TẠI AUTH MIDDLEWARE ===", error.message);

      if (error.name === 'TokenExpiredError')  return errorResponse(res, 'Token đã hết hạn', 401);
      if (error.name === 'JsonWebTokenError')  return errorResponse(res, 'Token không hợp lệ', 401);
      return errorResponse(res, 'Lỗi xác thực', 500);
    }
};

module.exports = authenticate;