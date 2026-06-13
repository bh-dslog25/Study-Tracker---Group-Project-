'use strict';
const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    // 1. Kiểm tra dữ liệu đầu vào cơ bản
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return errorResponse(res, 'Vui lòng điền đầy đủ thông tin bắt buộc', 422);
    }

    // SỬA CHÚT XỈU: Truyền tường minh Object vào service để đảm bảo nhận đủ username
    const result = await authService.register({ username, email, password, role: req.body.role });
    logger.info(`Đăng ký thành công: ${email}`);
    
    // Đảm bảo trả về đúng cấu trúc { user, accessToken, refreshToken }
    return successResponse(res, result, 'Đăng ký thành công', 201);
  } catch (err) {
    logger.error(`Lỗi đăng ký: ${err.message}`);
    return errorResponse(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Vui lòng nhập email và mật khẩu', 400);
    }

    const result = await authService.login(req.body);
    logger.info(`Đăng nhập thành công: ${email}`);
    
    return successResponse(res, result, 'Đăng nhập thành công');
  } catch (err) {
    logger.error(`Lỗi đăng nhập: ${err.message}`);
    return errorResponse(res, err.message, err.status || 401);
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, 'Thiếu refresh token', 400);

    const tokens = await authService.refresh(refreshToken);
    return successResponse(res, tokens, 'Làm mới token thành công');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 401);
  }
};

const logout = async (req, res) => {
  try {
    if (req.user) await authService.logout(req.user);
    return successResponse(res, null, 'Đăng xuất thành công');
  } catch (err) {
    logger.error(`Lỗi logout: ${err.message}`);
    return errorResponse(res, 'Đăng xuất thất bại', 500);
  }
};

const getMe = (req, res) => {
  // Trả về thông tin user đã được middleware xác thực gán vào req.user
  return successResponse(res, req.user, 'Lấy thông tin thành công');
};

const updateMe = async (req, res) => {
  try {

    const { username } = req.body;
    if (!username) return errorResponse(res, 'Tên không được để trống', 400);
    
    await req.user.update({ username });
    return successResponse(res, req.user, 'Cập nhật thành công');
  } catch (err) {
    logger.error(`Lỗi updateMe: ${err.message}`);
    return errorResponse(res, 'Cập nhật thất bại', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Vui lòng cung cấp mật khẩu cũ và mới', 400);
    }
    await authService.changePassword(req.user, currentPassword, newPassword);
    return successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { register, login, refresh, logout, getMe, updateMe, changePassword };