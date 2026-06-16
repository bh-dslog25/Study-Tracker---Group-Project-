'use strict';

const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const name = req.body.name || req.body.username;
    const { email, password, role } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Vui long dien day du thong tin bat buoc', 422);
    }

    const result = await authService.register({ name, email, password, role });
    logger.info(`Dang ky thanh cong: ${email}`);

    return successResponse(res, result, 'Dang ky thanh cong', 201);
  } catch (err) {
    logger.error(`Loi dang ky: ${err.message}`);
    return errorResponse(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Vui long nhap email va mat khau', 400);
    }

    const result = await authService.login({ email, password });
    logger.info(`Dang nhap thanh cong: ${email}`);

    return successResponse(res, result, 'Dang nhap thanh cong');
  } catch (err) {
    logger.error(`Loi dang nhap: ${err.message}`);
    return errorResponse(res, err.message, err.status || 401);
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Thieu refresh token', 400);
    }

    const tokens = await authService.refresh(refreshToken);
    return successResponse(res, tokens, 'Lam moi token thanh cong');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 401);
  }
};

const logout = async (req, res) => {
  try {
    await authService.logout(req.user);
    return successResponse(res, null, 'Dang xuat thanh cong');
  } catch (err) {
    logger.error(`Loi logout: ${err.message}`);
    return errorResponse(res, 'Dang xuat that bai', 500);
  }
};

const getMe = (req, res) => {
  return successResponse(res, req.user, 'Lay thong tin thanh cong');
};

const updateMe = async (req, res) => {
  try {
    const name = req.body.name || req.body.username;

    if (!name) {
      return errorResponse(res, 'Ten khong duoc de trong', 400);
    }

    await req.user.update({ name });
    return successResponse(res, req.user, 'Cap nhat thanh cong');
  } catch (err) {
    logger.error(`Loi updateMe: ${err.message}`);
    return errorResponse(res, 'Cap nhat that bai', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Vui long cung cap mat khau cu va moi', 400);
    }

    await authService.changePassword(req.user, currentPassword, newPassword);
    return successResponse(res, null, 'Doi mat khau thanh cong');
  } catch (err) {
    return errorResponse(res, err.message, err.status || 500);
  }
};

module.exports = { register, login, refresh, logout, getMe, updateMe, changePassword };
