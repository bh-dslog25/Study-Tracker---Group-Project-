'use strict';

require('dotenv').config(); 

const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role) => {
  
  const secret = process.env.JWT_ACCESS_SECRET;
  
  
  if (!secret) {
    console.error("CRITICAL ERROR: Không tìm thấy JWT_ACCESS_SECRET trong tiến trình Node.js hiện tại!");
    throw new Error("JWT_ACCESS_SECRET is not defined in .env");
  }
  
  return jwt.sign({ id: userId, role }, secret, {
    
    expiresIn: process.env.JWT_EXPIRES_IN || '1d', 
  });
};

const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  
  if (!secret) {
    console.error("CRITICAL ERROR: Không tìm thấy JWT_REFRESH_SECRET trong tiến trình Node.js hiện tại!");
    throw new Error("JWT_REFRESH_SECRET is not defined in .env");
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };