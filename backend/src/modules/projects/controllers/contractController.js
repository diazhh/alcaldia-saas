import * as contractService from '../services/contractService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

export const createContract = async (req, res) => {
  try {
    const contract = await contractService.createContract(req.params.projectId, req.body);
    return successResponse(res, contract, 'Contrato creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getContracts = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const result = await contractService.getContracts(filters, parseInt(page), parseInt(limit));
    return successResponse(res, result, 'Contratos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getContractsByProject = async (req, res) => {
  try {
    const contracts = await contractService.getContractsByProject(req.params.projectId);
    return successResponse(res, contracts, 'Contratos del proyecto obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getContractById = async (req, res) => {
  try {
    const contract = await contractService.getContractById(req.params.id);
    return successResponse(res, contract, 'Contrato obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateContract = async (req, res) => {
  try {
    const contract = await contractService.updateContract(req.params.id, req.body);
    return successResponse(res, contract, 'Contrato actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteContract = async (req, res) => {
  try {
    await contractService.deleteContract(req.params.id);
    return successResponse(res, null, 'Contrato eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const adjudicateContract = async (req, res) => {
  try {
    const { contractorId, adjudicationDate } = req.body;
    const contract = await contractService.adjudicateContract(req.params.id, contractorId, adjudicationDate);
    return successResponse(res, contract, 'Contrato adjudicado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const registerPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const contract = await contractService.registerPayment(req.params.id, amount);
    return successResponse(res, contract, 'Pago registrado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getContractStats = async (req, res) => {
  try {
    const stats = await contractService.getContractStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
