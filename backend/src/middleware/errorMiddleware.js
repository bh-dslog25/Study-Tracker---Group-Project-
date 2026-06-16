'use strict';

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFound = (req, res) => {
  return errorResponse(res, `Khong tim thay route: ${req.method} ${req.originalUrl}`, 404);
};

const getErrorPayload = (err) => {
  if (err.name === 'SequelizeValidationError') {
    return {
      statusCode: 422,
      message: 'Du lieu khong hop le',
      errors: err.errors?.map((item) => ({
        field: item.path,
        message: item.message,
        value: item.value,
      })),
    };
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return {
      statusCode: 409,
      message: 'Du lieu da ton tai',
      errors: err.errors?.map((item) => ({
        field: item.path,
        message: item.message,
        value: item.value,
      })),
    };
  }

  if (err.name === 'JsonWebTokenError') {
    return { statusCode: 401, message: 'Token khong hop le' };
  }

  if (err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Token da het han' };
  }

  return {
    statusCode: err.status || err.statusCode || 500,
    message: err.message || 'Loi server noi bo',
    errors: err.errors || null,
  };
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // BỔ SUNG: In hẳn object lỗi gốc ra terminal backend để nhìn thấy chuỗi token gửi lên bị sai ra sao
  console.error("=== ĐANG XỬ LÝ LỖI TẬP TRUNG ===", { name: err.name, message: err.message });

  const { statusCode, message, errors } = getErrorPayload(err);

  logger.error({
    message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
  });

  return errorResponse(res, message, statusCode, errors);
};

module.exports = { asyncHandler, notFound, errorHandler };