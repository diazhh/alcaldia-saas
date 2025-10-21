import * as positionService from '../services/position.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const positions = await positionService.getAllPositions(req.query);
    res.json(successResponse(positions, 'Cargos obtenidos exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const position = await positionService.getPositionById(req.params.id);
    res.json(successResponse(position, 'Cargo obtenido exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const position = await positionService.createPosition(req.body);
    res.status(201).json(successResponse(position, 'Cargo creado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const position = await positionService.updatePosition(req.params.id, req.body);
    res.json(successResponse(position, 'Cargo actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function deletePosition(req, res, next) {
  try {
    const result = await positionService.deletePosition(req.params.id);
    res.json(successResponse(result, 'Cargo eliminado exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { getAll, getById, create, update, deletePosition as delete };
