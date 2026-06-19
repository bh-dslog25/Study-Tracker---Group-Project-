'use strict';

const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return errorResponse(res, 'Dữ liệu không hợp lệ', 422, result.array());
  }
  next();
};

module.exports = { validate };

