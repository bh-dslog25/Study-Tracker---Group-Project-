'use strict';

const { User } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

const register = async({ name, email, password, role }) => {
  const existing = await User.findOne({ where: {email}});
  if (existing) throw { status: 409, message: 'Email da duoc su dung'};
  
  const user = await User.create({ name, email, password, role: role || 'student'});
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);
  await user.update({ refreshToken, lastLogin: new Date() });
  return { user, accessToken, refreshToken };  
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email, isActive: true } });
  if (!user) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };
 
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };
 
  const accessToken  = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);
  await user.update({ refreshToken, lastLogin: new Date() });
  return { user, accessToken, refreshToken };
};
 
const refresh = async (refreshToken) => {
  if (!refreshToken) throw { status: 400, message: 'Refresh token không được cung cấp' };
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findOne({ where: { id: decoded.id, refreshToken, isActive: true } });
  if (!user) throw { status: 401, message: 'Refresh token không hợp lệ' };
 
  const newAccessToken  = generateAccessToken(user.id, user.role);
  const newRefreshToken = generateRefreshToken(user.id);
  await user.update({ refreshToken: newRefreshToken });
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
 
const logout = async (user) => {
  await user.update({ refreshToken: null });
};
 
const changePassword = async (user, currentPassword, newPassword) => {
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw { status: 400, message: 'Mật khẩu hiện tại không đúng' };
  await user.update({ password: newPassword });
};
 
module.exports = { register, login, refresh, logout, changePassword };