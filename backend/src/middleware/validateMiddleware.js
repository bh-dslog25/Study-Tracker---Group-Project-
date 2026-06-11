'use strict';
const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Dữ liệu không hợp lệ', 422, errors.array());
  }
  return next();
};

module.exports = { validate };