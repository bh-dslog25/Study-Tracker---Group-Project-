'use strict';

const successResponse = (res, data, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

const paginatedResponse = (res, rows, count, page, limit, message = 'OK') => {
  const totalPages = Math.max(1, Math.ceil(count / limit));
  return res.status(200).json({
    success: true,
    message,
    data: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems: count,
      totalPages,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};

