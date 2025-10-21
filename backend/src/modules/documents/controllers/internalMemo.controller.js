/**
 * Controlador de Oficios Internos
 */

import * as internalMemoService from '../services/internalMemo.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import { createInternalMemoSchema, updateInternalMemoSchema } from '../validations.js';

async function create(req, res, next) {
  try {
    const validatedData = createInternalMemoSchema.parse(req.body);
    const memo = await internalMemoService.createInternalMemo(validatedData, req.user.id);
    res.status(201).json(successResponse(memo, 'Memo interno creado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const memo = await internalMemoService.getInternalMemoById(req.params.id);
    res.json(successResponse(memo));
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      fromDepartment: req.query.fromDepartment,
      toDepartment: req.query.toDepartment,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await internalMemoService.listInternalMemos(filters);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const validatedData = updateInternalMemoSchema.parse(req.body);
    const memo = await internalMemoService.updateInternalMemo(req.params.id, validatedData);
    res.json(successResponse(memo, 'Memo actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function approve(req, res, next) {
  try {
    const memo = await internalMemoService.approveMemo(req.params.id);
    res.json(successResponse(memo, 'Memo aprobado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function distribute(req, res, next) {
  try {
    const memo = await internalMemoService.distributeMemo(req.params.id);
    res.json(successResponse(memo, 'Memo distribuido exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function archive(req, res, next) {
  try {
    const memo = await internalMemoService.archiveMemo(req.params.id);
    res.json(successResponse(memo, 'Memo archivado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await internalMemoService.deleteInternalMemo(req.params.id);
    res.json(successResponse(null, 'Memo eliminado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      fromDepartment: req.query.fromDepartment,
    };
    const stats = await internalMemoService.getInternalMemoStats(filters);
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

export { create, getById, list, update, approve, distribute, archive, remove, getStats };
