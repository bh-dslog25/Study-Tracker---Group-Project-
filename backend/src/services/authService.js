'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getRefreshTokenSecret } = require('../config/jwt');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const sanitizeUser = (user) => {
  const plain = user.get({ plain: true });
  delete plain.password;
  delete plain.refreshToken;
  return plain;
};

const register = async ({ name, username, email, password, role }) => {
  const displayName = name || username;
  const existing = await User.findOne({ where: { email } });

  if (existing) {
    throw { status: 409, message: 'Email da duoc su dung' };
  }

  const user = await User.create({
    name: displayName,
    email,
    password,
    role: role || 'student',
    isActive: true,
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await user.update({ refreshToken, lastLogin: new Date() });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email, isActive: true } });

  if (!user) {
    throw { status: 401, message: 'Email hoac mat khau khong dung' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw { status: 401, message: 'Email hoac mat khau khong dung' };
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await user.update({ refreshToken, lastLogin: new Date() });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw { status: 400, message: 'Refresh token khong duoc cung cap' };
  }

  try {
    const decoded = jwt.verify(refreshToken, getRefreshTokenSecret());
    const user = await User.findOne({
      where: { id: decoded.id, refreshToken, isActive: true },
    });

    if (!user) {
      throw { status: 401, message: 'Refresh token khong hop le' };
    }

    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    await user.update({ refreshToken: newRefreshToken });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw { status: 401, message: error.message || 'Phien dang nhap da het han' };
  }
};

const logout = async (user) => {
  if (user) {
    await user.update({ refreshToken: null });
  }
};

const changePassword = async (user, currentPassword, newPassword) => {
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw { status: 400, message: 'Mat khau hien tai khong dung' };
  }

  await user.update({ password: newPassword });
};

module.exports = { register, login, refresh, logout, changePassword };
