'use strict';
const jwt = require('jsonwebtoken');
const { getAccessTokenSecret, getRefreshTokenSecret } = require('../config/jwt');

<<<<<<< HEAD
const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, getAccessTokenSecret(), {
=======
const generateAccessToken = (userId, role) => {
  // Đảm bảo tên biến ở đây khớp hoàn toàn với trong file .env
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("JWT_ACCESS_SECRET is not defined in .env");
  
  return jwt.sign({ id: userId, role }, secret, {
>>>>>>> f43b1a47113c54e54615d03118726a96d2649513
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

<<<<<<< HEAD
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, getRefreshTokenSecret(), {
=======
const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined in .env");

  return jwt.sign({ id: userId }, secret, {
>>>>>>> f43b1a47113c54e54615d03118726a96d2649513
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
