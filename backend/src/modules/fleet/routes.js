/**
 * Rutas del módulo de Gestión de Flota
 */

import express from 'express';
import * as vehicleController from './controllers/vehicle.controller.js';
import * as tripLogController from './controllers/tripLog.controller.js';
import * as fuelControlController from './controllers/fuelControl.controller.js';
import * as maintenanceController from './controllers/maintenance.controller.js';
import * as tcoController from './controllers/tco.controller.js';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  createTripLogSchema,
  updateTripLogSchema,
  createFuelControlSchema,
  updateFuelControlSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from './validations.js';

const router = express.Router();

// ============================================
// RUTAS DE VEHÍCULOS
// ============================================

/**
 * @route   GET /api/fleet/vehicles
 * @desc    Obtener todos los vehículos
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/vehicles',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.getAllVehicles
);

/**
 * @route   GET /api/fleet/vehicles/statistics
 * @desc    Obtener estadísticas de la flota
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/vehicles/statistics',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  vehicleController.getFleetStatistics
);

/**
 * @route   GET /api/fleet/vehicles/:id
 * @desc    Obtener un vehículo por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/vehicles/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.getVehicleById
);

/**
 * @route   POST /api/fleet/vehicles
 * @desc    Crear un nuevo vehículo
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/vehicles',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);

/**
 * @route   PUT /api/fleet/vehicles/:id
 * @desc    Actualizar un vehículo
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/vehicles/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);

/**
 * @route   PATCH /api/fleet/vehicles/:id/mileage
 * @desc    Actualizar el kilometraje de un vehículo
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.patch(
  '/vehicles/:id/mileage',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.updateMileage
);

/**
 * @route   DELETE /api/fleet/vehicles/:id
 * @desc    Eliminar un vehículo
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/vehicles/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  vehicleController.deleteVehicle
);

// ============================================
// RUTAS DE BITÁCORA DE VIAJES
// ============================================

/**
 * @route   GET /api/fleet/trip-logs
 * @desc    Obtener todos los registros de viaje
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/trip-logs',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  tripLogController.getAllTripLogs
);

/**
 * @route   GET /api/fleet/trip-logs/statistics
 * @desc    Obtener estadísticas de viajes
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/trip-logs/statistics',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  tripLogController.getTripStatistics
);

/**
 * @route   GET /api/fleet/trip-logs/:id
 * @desc    Obtener un registro de viaje por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/trip-logs/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  tripLogController.getTripLogById
);

/**
 * @route   POST /api/fleet/trip-logs
 * @desc    Crear un nuevo registro de viaje
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR, EMPLEADO)
 */
router.post(
  '/trip-logs',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  validate(createTripLogSchema),
  tripLogController.createTripLog
);

/**
 * @route   PUT /api/fleet/trip-logs/:id
 * @desc    Actualizar un registro de viaje
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/trip-logs/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(updateTripLogSchema),
  tripLogController.updateTripLog
);

/**
 * @route   PATCH /api/fleet/trip-logs/:id/finalize
 * @desc    Finalizar un viaje (registrar retorno)
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR, EMPLEADO)
 */
router.patch(
  '/trip-logs/:id/finalize',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  tripLogController.finalizeTripLog
);

/**
 * @route   DELETE /api/fleet/trip-logs/:id
 * @desc    Eliminar un registro de viaje
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/trip-logs/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  tripLogController.deleteTripLog
);

// ============================================
// RUTAS DE CONTROL DE COMBUSTIBLE
// ============================================

/**
 * @route   GET /api/fleet/fuel-controls
 * @desc    Obtener todos los registros de combustible
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/fuel-controls',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  fuelControlController.getAllFuelControls
);

/**
 * @route   GET /api/fleet/fuel-controls/statistics
 * @desc    Obtener estadísticas de consumo de combustible
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/fuel-controls/statistics',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  fuelControlController.getFuelStatistics
);

/**
 * @route   GET /api/fleet/fuel-controls/efficiency/:vehicleId
 * @desc    Obtener rendimiento de combustible de un vehículo
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/fuel-controls/efficiency/:vehicleId',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  fuelControlController.getVehicleFuelEfficiency
);

/**
 * @route   GET /api/fleet/fuel-controls/:id
 * @desc    Obtener un registro de combustible por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/fuel-controls/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  fuelControlController.getFuelControlById
);

/**
 * @route   POST /api/fleet/fuel-controls
 * @desc    Crear un nuevo registro de combustible
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/fuel-controls',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(createFuelControlSchema),
  fuelControlController.createFuelControl
);

/**
 * @route   PUT /api/fleet/fuel-controls/:id
 * @desc    Actualizar un registro de combustible
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/fuel-controls/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(updateFuelControlSchema),
  fuelControlController.updateFuelControl
);

/**
 * @route   DELETE /api/fleet/fuel-controls/:id
 * @desc    Eliminar un registro de combustible
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/fuel-controls/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  fuelControlController.deleteFuelControl
);

// ============================================
// RUTAS DE MANTENIMIENTO
// ============================================

/**
 * @route   GET /api/fleet/maintenances
 * @desc    Obtener todos los mantenimientos
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/maintenances',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  maintenanceController.getAllMaintenances
);

/**
 * @route   GET /api/fleet/maintenances/upcoming
 * @desc    Obtener mantenimientos próximos o vencidos
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/maintenances/upcoming',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  maintenanceController.getUpcomingMaintenances
);

/**
 * @route   GET /api/fleet/maintenances/statistics
 * @desc    Obtener estadísticas de mantenimiento
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/maintenances/statistics',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  maintenanceController.getMaintenanceStatistics
);

/**
 * @route   GET /api/fleet/maintenances/vehicle/:vehicleId
 * @desc    Obtener historial de mantenimiento de un vehículo
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/maintenances/vehicle/:vehicleId',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  maintenanceController.getVehicleMaintenanceHistory
);

/**
 * @route   GET /api/fleet/maintenances/:id
 * @desc    Obtener un mantenimiento por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/maintenances/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  maintenanceController.getMaintenanceById
);

/**
 * @route   POST /api/fleet/maintenances
 * @desc    Crear un nuevo mantenimiento
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/maintenances',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(createMaintenanceSchema),
  maintenanceController.createMaintenance
);

/**
 * @route   PUT /api/fleet/maintenances/:id
 * @desc    Actualizar un mantenimiento
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/maintenances/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(updateMaintenanceSchema),
  maintenanceController.updateMaintenance
);

/**
 * @route   PATCH /api/fleet/maintenances/:id/complete
 * @desc    Completar un mantenimiento
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.patch(
  '/maintenances/:id/complete',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  maintenanceController.completeMaintenance
);

/**
 * @route   DELETE /api/fleet/maintenances/:id
 * @desc    Eliminar un mantenimiento
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/maintenances/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  maintenanceController.deleteMaintenance
);

// ============================================
// RUTAS DE TCO (Total Cost of Ownership)
// ============================================

/**
 * @route   GET /api/fleet/tco/vehicle/:vehicleId
 * @desc    Calcular TCO de un vehículo
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/tco/vehicle/:vehicleId',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  tcoController.calculateVehicleTCO
);

/**
 * @route   GET /api/fleet/tco/fleet
 * @desc    Calcular TCO de toda la flota
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/tco/fleet',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  tcoController.calculateFleetTCO
);

/**
 * @route   POST /api/fleet/tco/compare
 * @desc    Comparar TCO de múltiples vehículos
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/tco/compare',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  tcoController.compareVehicleTCO
);

export default router;
