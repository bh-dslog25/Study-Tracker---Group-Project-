'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

/**
 * Bảo vệ route — yêu cầu accessToken hợp lệ
 * Gắn user vào req.user để các controller dùng tiếp
 */
const protect = async (req, res, next) => {
  try {
    // 1. Lấy token từ Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Không có token xác thực', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token đã hết hạn', 401);
      }
      return errorResponse(res, 'Token không hợp lệ', 401);
    }

    // 3. Kiểm tra user còn tồn tại trong DB không
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, 'Tài khoản không tồn tại', 401);
    }

    // 4. Gắn user vào request để controller dùng
    req.user = user;
    next();

  } catch (err) {
    return errorResponse(res, 'Lỗi xác thực', 500);
  }
};

/**
 * Lấy token từ cookie (nếu sau này dùng httpOnly cookie thay Bearer)
 * Hiện tại để dự phòng, chưa dùng
 */
const protectCookie = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return errorResponse(res, 'Không có token xác thực', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token đã hết hạn', 401);
      }
      return errorResponse(res, 'Token không hợp lệ', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return errorResponse(res, 'Tài khoản không tồn tại', 401);
    }

    req.user = user;
    next();

  } catch (err) {
    return errorResponse(res, 'Lỗi xác thực', 500);
  }
};

module.exports = { protect, protectCookie };