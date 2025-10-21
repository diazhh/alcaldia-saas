/**
 * Rutas del módulo de Aseo Urbano
 */

import express from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validation.middleware.js';
import {
  routeController,
  operationController,
  pointController,
  campaignController,
} from './controllers/cleaning.controller.js';
import {
  createRouteSchema,
  updateRouteSchema,
  createOperationSchema,
  updateOperationSchema,
  createPointSchema,
  updatePointSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from './validations.js';

const router = express.Router();

// ============================================
// RUTAS DE RECOLECCIÓN
// ============================================

/**
 * @route   GET /api/services/cleaning/routes
 * @desc    Obtener todas las rutas de recolección
 * @access  Private
 */
router.get('/routes', authenticate, routeController.getAll);

/**
 * @route   GET /api/services/cleaning/routes/stats
 * @desc    Obtener estadísticas de rutas
 * @access  Private
 */
router.get('/routes/stats', authenticate, routeController.getStats);

/**
 * @route   GET /api/services/cleaning/routes/:id
 * @desc    Obtener una ruta por ID
 * @access  Private
 */
router.get('/routes/:id', authenticate, routeController.getById);

/**
 * @route   POST /api/services/cleaning/routes
 * @desc    Crear una nueva ruta
 * @access  Private
 */
router.post('/routes', authenticate, validate(createRouteSchema), routeController.create);

/**
 * @route   PUT /api/services/cleaning/routes/:id
 * @desc    Actualizar una ruta
 * @access  Private
 */
router.put('/routes/:id', authenticate, validate(updateRouteSchema), routeController.update);

/**
 * @route   DELETE /api/services/cleaning/routes/:id
 * @desc    Eliminar una ruta
 * @access  Private
 */
router.delete('/routes/:id', authenticate, routeController.delete);

// ============================================
// OPERACIONES DE RECOLECCIÓN
// ============================================

/**
 * @route   GET /api/services/cleaning/operations
 * @desc    Obtener todas las operaciones
 * @access  Private
 */
router.get('/operations', authenticate, operationController.getAll);

/**
 * @route   GET /api/services/cleaning/operations/stats
 * @desc    Obtener estadísticas de operaciones
 * @access  Private
 */
router.get('/operations/stats', authenticate, operationController.getStats);

/**
 * @route   GET /api/services/cleaning/operations/:id
 * @desc    Obtener una operación por ID
 * @access  Private
 */
router.get('/operations/:id', authenticate, operationController.getById);

/**
 * @route   POST /api/services/cleaning/operations
 * @desc    Crear una nueva operación
 * @access  Private
 */
router.post('/operations', authenticate, validate(createOperationSchema), operationController.create);

/**
 * @route   PUT /api/services/cleaning/operations/:id
 * @desc    Actualizar una operación
 * @access  Private
 */
router.put('/operations/:id', authenticate, validate(updateOperationSchema), operationController.update);

/**
 * @route   DELETE /api/services/cleaning/operations/:id
 * @desc    Eliminar una operación
 * @access  Private
 */
router.delete('/operations/:id', authenticate, operationController.delete);

// ============================================
// PUNTOS DE RECOLECCIÓN
// ============================================

/**
 * @route   GET /api/services/cleaning/points
 * @desc    Obtener todos los puntos
 * @access  Private
 */
router.get('/points', authenticate, pointController.getAll);

/**
 * @route   GET /api/services/cleaning/points/:id
 * @desc    Obtener un punto por ID
 * @access  Private
 */
router.get('/points/:id', authenticate, pointController.getById);

/**
 * @route   POST /api/services/cleaning/points
 * @desc    Crear un nuevo punto
 * @access  Private
 */
router.post('/points', authenticate, validate(createPointSchema), pointController.create);

/**
 * @route   PUT /api/services/cleaning/points/:id
 * @desc    Actualizar un punto
 * @access  Private
 */
router.put('/points/:id', authenticate, validate(updatePointSchema), pointController.update);

/**
 * @route   DELETE /api/services/cleaning/points/:id
 * @desc    Eliminar un punto
 * @access  Private
 */
router.delete('/points/:id', authenticate, pointController.delete);

// ============================================
// CAMPAÑAS DE LIMPIEZA
// ============================================

/**
 * @route   GET /api/services/cleaning/campaigns
 * @desc    Obtener todas las campañas
 * @access  Private
 */
router.get('/campaigns', authenticate, campaignController.getAll);

/**
 * @route   GET /api/services/cleaning/campaigns/:id
 * @desc    Obtener una campaña por ID
 * @access  Private
 */
router.get('/campaigns/:id', authenticate, campaignController.getById);

/**
 * @route   POST /api/services/cleaning/campaigns
 * @desc    Crear una nueva campaña
 * @access  Private
 */
router.post('/campaigns', authenticate, validate(createCampaignSchema), campaignController.create);

/**
 * @route   PUT /api/services/cleaning/campaigns/:id
 * @desc    Actualizar una campaña
 * @access  Private
 */
router.put('/campaigns/:id', authenticate, validate(updateCampaignSchema), campaignController.update);

/**
 * @route   DELETE /api/services/cleaning/campaigns/:id
 * @desc    Eliminar una campaña
 * @access  Private
 */
router.delete('/campaigns/:id', authenticate, campaignController.delete);

export default router;
