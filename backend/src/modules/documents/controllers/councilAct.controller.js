/**
 * Controlador de Actas del Concejo
 */

import * as councilActService from '../services/councilAct.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import { createCouncilActSchema, updateCouncilActSchema } from '../validations.js';

async function create(req, res, next) {
  try {
    const validatedData = createCouncilActSchema.parse(req.body);
    const act = await councilActService.createCouncilAct(validatedData, req.user.id);
    res.status(201).json(successResponse(act, 'Acta del concejo creada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const act = await councilActService.getCouncilActById(req.params.id);
    res.json(successResponse(act));
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filters = {
      sessionType: req.query.sessionType,
      status: req.query.status,
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await councilActService.listCouncilActs(filters);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const validatedData = updateCouncilActSchema.parse(req.body);
    const act = await councilActService.updateCouncilAct(req.params.id, validatedData);
    res.json(successResponse(act, 'Acta actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function approve(req, res, next) {
  try {
    const { approvedBy } = req.body;
    const act = await councilActService.approveAct(req.params.id, approvedBy);
    res.json(successResponse(act, 'Acta aprobada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function publish(req, res, next) {
  try {
    const act = await councilActService.publishAct(req.params.id);
    res.json(successResponse(act, 'Acta publicada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await councilActService.deleteCouncilAct(req.params.id);
    res.json(successResponse(null, 'Acta eliminada exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { create, getById, list, update, approve, publish, remove };
