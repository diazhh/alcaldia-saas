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
    res.json(successResponse(result, 'Permisos obtenidos exitosamente'));
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
    res.json(successResponse(permit, 'Permiso obtenido exitosamente'));
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
    res.json(successResponse(permit, 'Permiso obtenido exitosamente'));
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
    res.status(201).json(successResponse(permit, 'Permiso creado exitosamente'));
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
    res.json(successResponse(permit, 'Permiso actualizado exitosamente'));
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
    res.json(successResponse(permit, 'Revisión registrada exitosamente'));
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
    res.json(successResponse(permit, 'Pago registrado exitosamente'));
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
    res.json(successResponse(permit, 'Construcción iniciada exitosamente'));
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
    res.json(successResponse(permit, 'Construcción completada exitosamente'));
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
    res.json(successResponse(permit, 'Permiso cancelado exitosamente'));
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
    res.json(successResponse(stats, 'Estadísticas obtenidas exitosamente'));
  } catch (error) {
    next(error);
  }
};
