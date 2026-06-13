'use strict';

const { User } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

/**
 * Helper: Trả về user mà không có password hash
 */
const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user.get({ plain: true });
  return userWithoutPassword;
};

const register = async({ username, email, password, role }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw { status: 409, message: 'Email đã được sử dụng' };
  
  const user = await User.create({ 
    username, 
    email, 
    password, 
    role: role || 'student',
    isActive: true 
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);
  
  await user.update({ refreshToken, lastLogin: new Date() });
  
  return { user: sanitizeUser(user), accessToken, refreshToken };  
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.isActive) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };
 
  // Đảm bảo model User có phương thức comparePassword
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw { status: 401, message: 'Email hoặc mật khẩu không đúng' };
 
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);
  
  await user.update({ refreshToken, lastLogin: new Date() });
  return { user: sanitizeUser(user), accessToken, refreshToken };
};
 
const refresh = async (refreshToken) => {
  if (!refreshToken) throw { status: 400, message: 'Refresh token không được cung cấp' };
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ where: { id: decoded.id, refreshToken, isActive: true } });
    if (!user) throw { status: 401, message: 'Refresh token không hợp lệ' };
    
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    
    await user.update({ refreshToken: newRefreshToken });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw { status: 401, message: 'Phiên đăng nhập đã hết hạn' };
  }
};
 
const logout = async (userId) => {
  const user = await User.findByPk(userId);
  if (user) await user.update({ refreshToken: null });
};
 
const changePassword = async (user, currentPassword, newPassword) => {
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw { status: 400, message: 'Mật khẩu hiện tại không đúng' };
  
  // Sequelize sẽ tự hash nếu bạn có hook beforeSave trong model
  user.password = newPassword; 
  await user.save();
};
 
module.exports = { register, login, refresh, logout, changePassword };