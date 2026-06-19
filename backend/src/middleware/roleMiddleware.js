'use strict';

const { errorResponse } = require('../utils/response');

// usage: authorizeRoles('teacher')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return errorResponse(res, 'Not authenticated', 401);
    }
    if (!roles.includes(userRole)) {
      return errorResponse(res, 'Access denied', 403);
    }
    next();
  };
};

module.exports = { authorizeRoles };

