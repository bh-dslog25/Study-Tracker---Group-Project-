'use strict';

require('dotenv').config(); 

const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error("CRITICAL ERROR: JWT_SECRET not found in current Node.js process!");
    throw new Error("JWT_SECRET is not defined in .env");
  }
  
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d', 
  });
};

const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error("CRITICAL ERROR: JWT_SECRET not found in current Node.js process!");
    throw new Error("JWT_SECRET is not defined in .env");
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };