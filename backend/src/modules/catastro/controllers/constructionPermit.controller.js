/**
 * Controlador para gestión de permisos de construcción
 */

import * as permitService from '../services/constructionPermit.service.js';
import { successResponse } from '../../../shared/utils/response.js';
import {
  createConstructionPermitSchema,
  updateConstructionPermitSchema,
} from '../validations.js';

/**
 * Obtener todos los permisos
 */
export const getAllPermits = async (req, res, next) => {
  try {
    const result = await permitService.getAllPermits(req.query);
    return successResponse(res, result, 'Permisos obtenidos exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener permiso por ID
 */
export const getPermitById = async (req, res, next) => {
  try {
    const permit = await permitService.getPermitById(req.params.id);
    return successResponse(res, permit, 'Permiso obtenido exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener permiso por número
 */
export const getPermitByNumber = async (req, res, next) => {
  try {
    const permit = await permitService.getPermitByNumber(req.params.permitNumber);
    return successResponse(res, permit, 'Permiso obtenido exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nuevo permiso
 */
export const createPermit = async (req, res, next) => {
  try {
    const validatedData = createConstructionPermitSchema.parse(req.body);
    const permit = await permitService.createPermit(validatedData);
    return successResponse(res, permit, 'Permiso creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar permiso
 */
export const updatePermit = async (req, res, next) => {
  try {
    const validatedData = updateConstructionPermitSchema.parse(req.body);
    const permit = await permitService.updatePermit(req.params.id, validatedData);
    return successResponse(res, permit, 'Permiso actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Revisar permiso (revisión técnica)
 */
export const reviewPermit = async (req, res, next) => {
  try {
    const permit = await permitService.reviewPermit(req.params.id, req.body);
    return successResponse(res, permit, 'Revisión registrada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Aprobar o rechazar permiso
 */
export const approveOrRejectPermit = async (req, res, next) => {
  try {
    const permit = await permitService.approveOrRejectPermit(req.params.id, req.body);
    res.json(
      successResponse(
        permit,
        req.body.approved ? 'Permiso aprobado exitosamente' : 'Permiso rechazado'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Registrar pago de permiso
 */
export const registerPayment = async (req, res, next) => {
  try {
    const permit = await permitService.registerPayment(req.params.id, req.body);
    return successResponse(res, permit, 'Pago registrado exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Iniciar construcción
 */
export const startConstruction = async (req, res, next) => {
  try {
    const permit = await permitService.startConstruction(req.params.id);
    return successResponse(res, permit, 'Construcción iniciada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Finalizar construcción
 */
export const completeConstruction = async (req, res, next) => {
  try {
    const permit = await permitService.completeConstruction(req.params.id);
    return successResponse(res, permit, 'Construcción completada exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancelar permiso
 */
export const cancelPermit = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const permit = await permitService.cancelPermit(req.params.id, reason);
    return successResponse(res, permit, 'Permiso cancelado exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de permisos
 */
export const getPermitStats = async (req, res, next) => {
  try {
    const stats = await permitService.getPermitStats();
    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener inspecciones de un permiso
 */
export const getInspectionsByPermit = async (req, res, next) => {
  try {
    const inspections = await permitService.getInspectionsByPermit(req.params.id);
    return successResponse(res, inspections, 'Inspecciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
};

/**
 * Crear inspección para un permiso
 */
export const createInspection = async (req, res, next) => {
  try {
    const inspection = await permitService.createInspection(req.params.id, req.body);
    return successResponse(res, inspection, 'Inspección creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
};
