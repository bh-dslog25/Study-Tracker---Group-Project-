'use strict';
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return errorResponse(res, 'Please provide full information', 400);
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', 409);
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'student',
    });
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    return successResponse(res, {
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role, isActive: newUser.isActive },
      accessToken,
      refreshToken,
    }, 'Register successfully', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Server error during registration', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Incorrect email or password', 401);
    }
    if (!user.isActive) {
      return errorResponse(res, 'Account has been deactivated', 403);
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect email or password', 401);
    }
    await user.update({ lastLogin: new Date() });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return successResponse(res, {
      user: { id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive },
      accessToken,
      refreshToken,
    }, 'Login successfully');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error during login', 500);
  }
};

const logout = async (req, res) => {
  return successResponse(res, null, 'Logout successfully');
};

const verifyAdminPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return errorResponse(res, 'Password is required', 400);
    }
    const adminPassword = process.env.ADMIN_ACCESS_PASSWORD;
    if (!adminPassword) {
      return errorResponse(res, 'Server configuration error', 500);
    }
    if (password !== adminPassword) {
      return errorResponse(res, 'Incorrect admin password', 401);
    }
    return successResponse(res, { verified: true }, 'Admin password verified');
  } catch (error) {
    console.error('Verify admin password error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide current password and new password', 400);
    }
    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', 400);
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    await user.update({ password: hashedPassword });
    return successResponse(res, null, 'Change password successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 'Server error when changing password', 500);
  }
};

module.exports = { register, login, logout, changePassword, verifyAdminPassword };
