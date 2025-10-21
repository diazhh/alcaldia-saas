/**
 * Controlador de Ordenanzas
 */

import * as ordinanceService from '../services/ordinance.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import { createOrdinanceSchema, updateOrdinanceSchema } from '../validations.js';

async function create(req, res, next) {
  try {
    const validatedData = createOrdinanceSchema.parse(req.body);
    const ordinance = await ordinanceService.createOrdinance(validatedData, req.user.id);
    res.status(201).json(successResponse(ordinance, 'Ordenanza creada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const ordinance = await ordinanceService.getOrdinanceById(req.params.id);
    res.json(successResponse(ordinance));
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  try {
    const filters = {
      search: req.query.search,
      status: req.query.status,
      subject: req.query.subject,
      year: req.query.year,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await ordinanceService.searchOrdinances(filters);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const validatedData = updateOrdinanceSchema.parse(req.body);
    const ordinance = await ordinanceService.updateOrdinance(req.params.id, validatedData);
    res.json(successResponse(ordinance, 'Ordenanza actualizada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await ordinanceService.deleteOrdinance(req.params.id);
    res.json(successResponse(null, 'Ordenanza eliminada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getActive(req, res, next) {
  try {
    const ordinances = await ordinanceService.getActiveOrdinances();
    res.json(successResponse(ordinances));
  } catch (error) {
    next(error);
  }
}

export { create, getById, search, update, remove, getActive };
