'use strict';
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/response');

const authenticate = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return errorResponse(res, 'Authentication token is required', 401);
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const targetId = decoded.id || decoded.user?.id; 

      if (!targetId) {
        return errorResponse(res, 'Invalid token (invalid payload structure)', 401);
      }

      const user = await User.findOne({ 
        where: { 
          id: Number(targetId), 
          isActive: true 
        } 
      });

      if (!user) return errorResponse(res, 'User does not exist or has been deactivated', 401);

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError')  return errorResponse(res, 'Token has expired', 401);
      if (error.name === 'JsonWebTokenError')  return errorResponse(res, 'Invalid token', 401);
      return errorResponse(res, 'Authentication error', 500);
    }
};

module.exports = authenticate;