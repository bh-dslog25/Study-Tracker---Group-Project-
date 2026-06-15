'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getAccessTokenSecret } = require('../config/jwt');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(res, 'Token xac thuc khong duoc cung cap', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getAccessTokenSecret());

    const user = await User.findOne({
      where: { id: decoded.id, isActive: true },
    });

    if (!user) {
      return errorResponse(res, 'Nguoi dung khong ton tai hoac da bi khoa', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token da het han', 401);
    }

    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Token khong hop le', 401);
    }

    return errorResponse(res, error.message || 'Loi xac thuc', 500);
  }
};

module.exports = { authenticate };
