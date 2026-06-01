'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Token helpers ────────────────────────────────────────────────────────────

const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

// ─── Service methods ──────────────────────────────────────────────────────────

/**
 * Đăng ký tài khoản mới
 */
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error('Email đã được sử dụng');
    err.statusCode = 409;
    throw err;
  }

  // password được hash tự động qua beforeCreate hook trong User model
  const user = await User.create({ name, email, password });
  return user; // toJSON() đã loại bỏ password
};

/**
 * Đăng nhập — trả về accessToken + refreshToken
 */
const login = async ({ email, password }) => {
  // Lấy cả password (bị ẩn bởi toJSON) nên dùng scope raw
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Email hoặc mật khẩu không đúng');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Email hoặc mật khẩu không đúng');
    err.statusCode = 401;
    throw err;
  }

  const payload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Lưu refreshToken vào DB để có thể revoke sau này
  await user.update({ refreshToken });

  return { user, accessToken, refreshToken };
};

/**
 * Làm mới accessToken bằng refreshToken hợp lệ
 */
const refreshToken = async (token) => {
  if (!token) {
    const err = new Error('Refresh token không được cung cấp');
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    const err = new Error('Refresh token không hợp lệ hoặc đã hết hạn');
    err.statusCode = 403;
    throw err;
  }

  const user = await User.findOne({ where: { id: decoded.id, refreshToken: token } });
  if (!user) {
    const err = new Error('Refresh token không tồn tại hoặc đã bị thu hồi');
    err.statusCode = 403;
    throw err;
  }

  const payload = { id: user.id, email: user.email };
  const newAccessToken = generateAccessToken(payload);
  // Rotate refresh token
  const newRefreshToken = generateRefreshToken(payload);
  await user.update({ refreshToken: newRefreshToken });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Đăng xuất — xoá refreshToken trong DB
 */
const logout = async (userId) => {
  await User.update({ refreshToken: null }, { where: { id: userId } });
};

/**
 * Lấy thông tin user hiện tại
 */
const getMe = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Người dùng không tồn tại');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, refreshToken, logout, getMe };