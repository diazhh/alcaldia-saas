/**
 * Rutas del módulo de catastro
 */

import express from 'express';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware.js';
import * as propertyController from './controllers/property.controller.js';
import * as urbanVariableController from './controllers/urbanVariable.controller.js';
import * as constructionPermitController from './controllers/constructionPermit.controller.js';
import * as urbanInspectionController from './controllers/urbanInspection.controller.js';

const router = express.Router();

// ============================================
// RUTAS DE PROPIEDADES (FICHA CATASTRAL)
// ============================================

/**
 * @route   GET /api/catastro/properties
 * @desc    Obtener todas las propiedades
 * @access  Private
 */
router.get(
  '/properties',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  propertyController.getAllProperties
);

/**
 * @route   GET /api/catastro/properties/stats
 * @desc    Obtener estadísticas de propiedades
 * @access  Private
 */
router.get(
  '/properties/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  propertyController.getPropertyStats
);

/**
 * @route   GET /api/catastro/properties/search-location
 * @desc    Buscar propiedades por ubicación
 * @access  Private
 */
router.get(
  '/properties/search-location',
  authenticate,
  propertyController.searchPropertiesByLocation
);

/**
 * @route   GET /api/catastro/properties/cadastral/:cadastralCode
 * @desc    Obtener propiedad por código catastral
 * @access  Private
 */
router.get(
  '/properties/cadastral/:cadastralCode',
  authenticate,
  propertyController.getPropertyByCadastralCode
);

/**
 * @route   GET /api/catastro/properties/:id
 * @desc    Obtener propiedad por ID
 * @access  Private
 */
router.get(
  '/properties/:id',
  authenticate,
  propertyController.getPropertyById
);

/**
 * @route   POST /api/catastro/properties
 * @desc    Crear nueva propiedad
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/properties',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyController.createProperty
);

/**
 * @route   PUT /api/catastro/properties/:id
 * @desc    Actualizar propiedad
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/properties/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyController.updateProperty
);

/**
 * @route   DELETE /api/catastro/properties/:id
 * @desc    Eliminar propiedad
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/properties/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  propertyController.deleteProperty
);

// ============================================
// RUTAS DE VARIABLES URBANAS
// ============================================

/**
 * @route   GET /api/catastro/urban-variables
 * @desc    Obtener todas las variables urbanas
 * @access  Private
 */
router.get(
  '/urban-variables',
  authenticate,
  urbanVariableController.getAllUrbanVariables
);

/**
 * @route   GET /api/catastro/urban-variables/stats
 * @desc    Obtener estadísticas de zonas
 * @access  Private
 */
router.get(
  '/urban-variables/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  urbanVariableController.getZoneStats
);

/**
 * @route   GET /api/catastro/urban-variables/zone/:zoneCode
 * @desc    Obtener variable urbana por código de zona
 * @access  Private
 */
router.get(
  '/urban-variables/zone/:zoneCode',
  authenticate,
  urbanVariableController.getUrbanVariableByZoneCode
);

/**
 * @route   POST /api/catastro/urban-variables/check-compliance/:zoneCode
 * @desc    Verificar cumplimiento de variables urbanas
 * @access  Private
 */
router.post(
  '/urban-variables/check-compliance/:zoneCode',
  authenticate,
  urbanVariableController.checkCompliance
);

/**
 * @route   GET /api/catastro/urban-variables/:id
 * @desc    Obtener variable urbana por ID
 * @access  Private
 */
router.get(
  '/urban-variables/:id',
  authenticate,
  urbanVariableController.getUrbanVariableById
);

/**
 * @route   POST /api/catastro/urban-variables
 * @desc    Crear nueva variable urbana
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/urban-variables',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  urbanVariableController.createUrbanVariable
);

/**
 * @route   PUT /api/catastro/urban-variables/:id
 * @desc    Actualizar variable urbana
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/urban-variables/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  urbanVariableController.updateUrbanVariable
);

/**
 * @route   DELETE /api/catastro/urban-variables/:id
 * @desc    Eliminar variable urbana
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/urban-variables/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  urbanVariableController.deleteUrbanVariable
);

// ============================================
// RUTAS DE PERMISOS DE CONSTRUCCIÓN
// ============================================

/**
 * @route   GET /api/catastro/permits
 * @desc    Obtener todos los permisos
 * @access  Private
 */
router.get(
  '/permits',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  constructionPermitController.getAllPermits
);

/**
 * @route   GET /api/catastro/permits/stats
 * @desc    Obtener estadísticas de permisos
 * @access  Private
 */
router.get(
  '/permits/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.getPermitStats
);

/**
 * @route   GET /api/catastro/permits/number/:permitNumber
 * @desc    Obtener permiso por número
 * @access  Private
 */
router.get(
  '/permits/number/:permitNumber',
  authenticate,
  constructionPermitController.getPermitByNumber
);

/**
 * @route   GET /api/catastro/permits/:id
 * @desc    Obtener permiso por ID
 * @access  Private
 */
router.get(
  '/permits/:id',
  authenticate,
  constructionPermitController.getPermitById
);

/**
 * @route   POST /api/catastro/permits
 * @desc    Crear nuevo permiso
 * @access  Private
 */
router.post(
  '/permits',
  authenticate,
  constructionPermitController.createPermit
);

/**
 * @route   PUT /api/catastro/permits/:id
 * @desc    Actualizar permiso
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/permits/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  constructionPermitController.updatePermit
);

/**
 * @route   POST /api/catastro/permits/:id/review
 * @desc    Revisar permiso (revisión técnica)
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/permits/:id/review',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  constructionPermitController.reviewPermit
);

/**
 * @route   POST /api/catastro/permits/:id/approve-reject
 * @desc    Aprobar o rechazar permiso
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/permits/:id/approve-reject',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.approveOrRejectPermit
);

/**
 * @route   POST /api/catastro/permits/:id/payment
 * @desc    Registrar pago de permiso
 * @access  Private
 */
router.post(
  '/permits/:id/payment',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  constructionPermitController.registerPayment
);

/**
 * @route   POST /api/catastro/permits/:id/start-construction
 * @desc    Iniciar construcción
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/permits/:id/start-construction',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  constructionPermitController.startConstruction
);

/**
 * @route   POST /api/catastro/permits/:id/complete-construction
 * @desc    Finalizar construcción
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/permits/:id/complete-construction',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.completeConstruction
);

/**
 * @route   POST /api/catastro/permits/:id/cancel
 * @desc    Cancelar permiso
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/permits/:id/cancel',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.cancelPermit
);

// ============================================
// RUTAS DE INSPECCIONES URBANAS
// ============================================

/**
 * @route   GET /api/catastro/urban-inspections
 * @desc    Obtener todas las inspecciones urbanas
 * @access  Private
 */
router.get(
  '/urban-inspections',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  urbanInspectionController.getAllUrbanInspections
);

/**
 * @route   GET /api/catastro/urban-inspections/stats
 * @desc    Obtener estadísticas de inspecciones
 * @access  Private
 */
router.get(
  '/urban-inspections/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  urbanInspectionController.getUrbanInspectionStats
);

/**
 * @route   GET /api/catastro/urban-inspections/property/:propertyId
 * @desc    Obtener inspecciones de una propiedad
 * @access  Private
 */
router.get(
  '/urban-inspections/property/:propertyId',
  authenticate,
  urbanInspectionController.getInspectionsByProperty
);

/**
 * @route   GET /api/catastro/urban-inspections/number/:inspectionNumber
 * @desc    Obtener inspección por número
 * @access  Private
 */
router.get(
  '/urban-inspections/number/:inspectionNumber',
  authenticate,
  urbanInspectionController.getUrbanInspectionByNumber
);

/**
 * @route   GET /api/catastro/urban-inspections/:id
 * @desc    Obtener inspección por ID
 * @access  Private
 */
router.get(
  '/urban-inspections/:id',
  authenticate,
  urbanInspectionController.getUrbanInspectionById
);

/**
 * @route   POST /api/catastro/urban-inspections
 * @desc    Crear nueva inspección
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/urban-inspections',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  urbanInspectionController.createUrbanInspection
);

/**
 * @route   PUT /api/catastro/urban-inspections/:id
 * @desc    Actualizar inspección
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/urban-inspections/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  urbanInspectionController.updateUrbanInspection
);

/**
 * @route   DELETE /api/catastro/urban-inspections/:id
 * @desc    Eliminar inspección
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/urban-inspections/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  urbanInspectionController.deleteUrbanInspection
);

/**
 * @route   POST /api/catastro/urban-inspections/:id/notification
 * @desc    Registrar notificación
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/urban-inspections/:id/notification',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  urbanInspectionController.registerNotification
);

/**
 * @route   POST /api/catastro/urban-inspections/:id/sanction
 * @desc    Registrar sanción
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/urban-inspections/:id/sanction',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  urbanInspectionController.registerSanction
);

/**
 * @route   POST /api/catastro/urban-inspections/:id/resolve
 * @desc    Resolver inspección
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/urban-inspections/:id/resolve',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  urbanInspectionController.resolveInspection
);

export default router;
