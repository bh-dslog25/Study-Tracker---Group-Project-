'use strict';

const { errorResponse } = require('../utils/response');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Vui long dang nhap de tiep tuc', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Ban khong co quyen thuc hien thao tac nay', 403);
    }

    return next();
  };
};

module.exports = { authorizeRoles };
