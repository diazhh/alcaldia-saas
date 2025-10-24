import * as payrollConceptService from '../services/payroll-concept.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function getAll(req, res, next) {
  try {
    const concepts = await payrollConceptService.getAllConcepts(req.query);
    return successResponse(res, concepts, 'Conceptos obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const concept = await payrollConceptService.createConcept(req.body);
    return successResponse(res, concept, 'Concepto creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const concept = await payrollConceptService.updateConcept(req.params.id, req.body);
    return successResponse(res, concept, 'Concepto actualizado exitosamente');
  } catch (error) {
    next(error);
  }
}

async function deleteConcept(req, res, next) {
  try {
    const result = await payrollConceptService.deleteConcept(req.params.id);
    return successResponse(res, result, 'Concepto eliminado exitosamente');
  } catch (error) {
    next(error);
  }
}

export { getAll, create, update, deleteConcept as delete };
