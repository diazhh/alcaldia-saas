import * as contractorService from '../services/contractorService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

export const createContractor = async (req, res) => {
  try {
    const contractor = await contractorService.createContractor(req.body);
    return successResponse(res, contractor, 'Contratista creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getContractors = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await contractorService.getContractors(filters, parseInt(page), parseInt(limit));
    return successResponse(res, result, 'Contratistas obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getContractorById = async (req, res) => {
  try {
    const contractor = await contractorService.getContractorById(req.params.id);
    return successResponse(res, contractor, 'Contratista obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const getContractorByRif = async (req, res) => {
  try {
    const contractor = await contractorService.getContractorByRif(req.params.rif);
    return successResponse(res, contractor, 'Contratista obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateContractor = async (req, res) => {
  try {
    const contractor = await contractorService.updateContractor(req.params.id, req.body);
    return successResponse(res, contractor, 'Contratista actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteContractor = async (req, res) => {
  try {
    await contractorService.deleteContractor(req.params.id);
    return successResponse(res, null, 'Contratista eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const blacklistContractor = async (req, res) => {
  try {
    const { reason } = req.body;
    const contractor = await contractorService.blacklistContractor(req.params.id, reason);
    return successResponse(res, contractor, 'Contratista agregado a lista negra');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const removeFromBlacklist = async (req, res) => {
  try {
    const contractor = await contractorService.removeFromBlacklist(req.params.id);
    return successResponse(res, contractor, 'Contratista removido de lista negra');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateContractorRating = async (req, res) => {
  try {
    const contractor = await contractorService.updateContractorRating(req.params.id);
    return successResponse(res, contractor, 'Rating actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getContractorStats = async (req, res) => {
  try {
    const stats = await contractorService.getContractorStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
