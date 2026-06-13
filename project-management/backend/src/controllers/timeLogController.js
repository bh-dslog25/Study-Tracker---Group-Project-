'use strict';
const timeLogService = require('../services/timeLogService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const getAll = async (req, res) => {
  try {
    const { count, rows } = await timeLogService.getAll({ userId: req.user.id, ...req.query });
    return paginatedResponse(res, rows, count, req.query.page || 1, req.query.limit || 20, 'Lấy danh sách phiên học thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const start = async (req, res) => {
  try {
    const log = await timeLogService.start(req.user.id, req.body);
    return successResponse(res, log, 'Bắt đầu phiên học thành công', 201);
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const stop = async (req, res) => {
  try {
    const log = await timeLogService.stop(req.params.id, req.user.id, req.body);
    return successResponse(res, log, 'Kết thúc phiên học thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const getStats = async (req, res) => {
  try {
    const stats = await timeLogService.getStats(req.user.id, req.query);
    return successResponse(res, stats, 'Lấy thống kê thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await timeLogService.remove(req.params.id, req.user.id);
    return successResponse(res, null, 'Xoá phiên học thành công');
  } catch (err) { return errorResponse(res, err.message, err.status || 500); }
};

module.exports = { getAll, start, stop, getStats, remove };