/**
 * Controlador de Expedientes Digitales
 */

import * as digitalFileService from '../services/digitalFile.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import { createDigitalFileSchema, updateDigitalFileSchema, addFileMovementSchema } from '../validations.js';

async function create(req, res, next) {
  try {
    const validatedData = createDigitalFileSchema.parse(req.body);
    const file = await digitalFileService.createDigitalFile(validatedData, req.user.id);
    res.status(201).json(successResponse(file, 'Expediente creado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const file = await digitalFileService.getDigitalFileById(req.params.id);
    res.json(successResponse(file));
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      departmentId: req.query.departmentId,
      assignedTo: req.query.assignedTo,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await digitalFileService.listDigitalFiles(filters);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const validatedData = updateDigitalFileSchema.parse(req.body);
    const file = await digitalFileService.updateDigitalFile(req.params.id, validatedData);
    res.json(successResponse(file, 'Expediente actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function addMovement(req, res, next) {
  try {
    const validatedData = addFileMovementSchema.parse(req.body);
    const file = await digitalFileService.addMovement(req.params.id, validatedData, req.user.id);
    res.json(successResponse(file, 'Movimiento agregado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function close(req, res, next) {
  try {
    const file = await digitalFileService.closeFile(req.params.id, req.user.id);
    res.json(successResponse(file, 'Expediente cerrado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function archive(req, res, next) {
  try {
    const file = await digitalFileService.archiveFile(req.params.id);
    res.json(successResponse(file, 'Expediente archivado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await digitalFileService.deleteDigitalFile(req.params.id);
    res.json(successResponse(null, 'Expediente eliminado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const filters = { departmentId: req.query.departmentId };
    const stats = await digitalFileService.getFileStats(filters);
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

export { create, getById, list, update, addMovement, close, archive, remove, getStats };
