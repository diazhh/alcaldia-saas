import * as positionService from '../services/position.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const positions = await positionService.getAllPositions(req.query);
    return successResponse(res, positions, 'Cargos obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const position = await positionService.getPositionById(req.params.id);
    return successResponse(res, position, 'Cargo obtenido exitosamente');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const position = await positionService.createPosition(req.body);
    return successResponse(res, position, 'Cargo creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const position = await positionService.updatePosition(req.params.id, req.body);
    return successResponse(res, position, 'Cargo actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function deletePosition(req, res, next) {
  try {
    const result = await positionService.deletePosition(req.params.id);
    return successResponse(res, result, 'Cargo eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

export { getAll, getById, create, update, deletePosition as delete };
