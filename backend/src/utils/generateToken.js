'use strict';
const jwt = require('jsonwebtoken');
const { getAccessTokenSecret, getRefreshTokenSecret } = require('../config/jwt');

const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, getAccessTokenSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, getRefreshTokenSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

module.exports = { generateAccessToken, generateRefreshToken };
