import * as payrollConceptService from '../services/payroll-concept.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const concepts = await payrollConceptService.getAllConcepts(req.query);
    res.json(successResponse(concepts, 'Conceptos obtenidos exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const concept = await payrollConceptService.createConcept(req.body);
    res.status(201).json(successResponse(concept, 'Concepto creado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const concept = await payrollConceptService.updateConcept(req.params.id, req.body);
    res.json(successResponse(concept, 'Concepto actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function deleteConcept(req, res, next) {
  try {
    const result = await payrollConceptService.deleteConcept(req.params.id);
    res.json(successResponse(result, 'Concepto eliminado exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { getAll, create, update, deleteConcept as delete };
