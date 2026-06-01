'use strict';

const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation cơ bản
    if (!name || !email || !password) {
      return errorResponse(res, 'Vui lòng điền đầy đủ thông tin', 400);
    }

    const user = await authService.register({ name, email, password });
    return successResponse(res, { user }, 'Đăng ký thành công', 201);

  } catch (err) {
    logger.error(`[authController.register] ${err.message}`);
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Vui lòng nhập email và mật khẩu', 400);
    }

    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    return successResponse(res, { user, accessToken, refreshToken }, 'Đăng nhập thành công');

  } catch (err) {
    logger.error(`[authController.login] ${err.message}`);
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/**
 * POST /api/auth/refresh
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshToken(refreshToken);
    return successResponse(res, tokens, 'Làm mới token thành công');

  } catch (err) {
    logger.error(`[authController.refresh] ${err.message}`);
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/**
 * POST /api/auth/logout
 * Yêu cầu protect middleware — req.user đã có
 */
const logout = async (req, res) => {
  try {
    await authService.logout(req.user.id);
    return successResponse(res, null, 'Đăng xuất thành công');

  } catch (err) {
    logger.error(`[authController.logout] ${err.message}`);
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

/**
 * GET /api/auth/me
 * Yêu cầu protect middleware — req.user đã có
 */
const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, { user }, 'Lấy thông tin thành công');

  } catch (err) {
    logger.error(`[authController.getMe] ${err.message}`);
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

module.exports = { register, login, refresh, logout, getMe };