'use strict';
const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    logger.info(`Đăng ký thành công: ${req.body.email} [${result.user.role}]`);
    return successResponse(res, result, 'Đăng ký thành công', 201);
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    logger.info(`Đăng nhập: ${req.body.email}`);
    return successResponse(res, result, 'Đăng nhập thành công');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

const refresh = async (req, res) => {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    return successResponse(res, tokens, 'Làm mới token thành công');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 401);
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user);
    return successResponse(res, null, 'Đăng xuất thành công');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getMe = (req, res) =>
  successResponse(res, req.user, 'Lấy thông tin thành công');

const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    await req.user.update({ name });
    return successResponse(res, req.user, 'Cập nhật thành công');
  } catch (err) {
    return errorResponse(res, 'Cập nhật thất bại', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    await authService.changePassword(req.user, req.body.currentPassword, req.body.newPassword);
    return successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { register, login, refresh, logout, getMe, updateMe, changePassword };
