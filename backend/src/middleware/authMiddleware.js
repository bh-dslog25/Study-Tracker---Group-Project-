'use strict';
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');
const { getAccessTokenSecret } = require('../config/jwt');

const authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return errorResponse(res, 'Token xác thực không được cung cấp', 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, getAccessTokenSecret());

      const user = await User.findOne({ where: { id: decoded.id, isActive: true } });
      if (!user) return errorResponse(res, 'Người dùng không tồn tại hoặc đã bị khoá', 401);

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError')  return errorResponse(res, 'Token đã hết hạn', 401);
      if (error.name === 'JsonWebTokenError')  return errorResponse(res, 'Token không hợp lệ', 401);
      return errorResponse(res, 'Lỗi xác thực', 500);
    }
};

<<<<<<< HEAD
module.exports = { authenticate };
=======
module.exports = authenticate;
>>>>>>> f43b1a47113c54e54615d03118726a96d2649513
