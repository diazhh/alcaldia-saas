/**
 * Rutas del módulo de catastro
 */

import express from 'express';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware.js';
import * as propertyController from './controllers/property.controller.js';
import * as propertyOwnerController from './controllers/propertyOwner.controller.js';
import * as urbanVariableController from './controllers/urbanVariable.controller.js';
import * as constructionPermitController from './controllers/constructionPermit.controller.js';
import * as urbanInspectionController from './controllers/urbanInspection.controller.js';
import * as zoneLayerController from './controllers/zoneLayer.controller.js';

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
 * @route   GET /api/catastro/properties/search/location
 * @desc    Buscar propiedades por ubicación
 * @access  Private
 */
router.get(
  '/properties/search/location',
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
// RUTAS DE PROPIETARIOS
// ============================================

/**
 * @route   GET /api/catastro/properties/:propertyId/owners
 * @desc    Obtener propietarios de una propiedad
 * @access  Private
 */
router.get(
  '/properties/:propertyId/owners',
  authenticate,
  propertyOwnerController.getPropertyOwners
);

/**
 * @route   GET /api/catastro/properties/:propertyId/owners/current
 * @desc    Obtener propietario actual
 * @access  Private
 */
router.get(
  '/properties/:propertyId/owners/current',
  authenticate,
  propertyOwnerController.getCurrentOwner
);

/**
 * @route   POST /api/catastro/properties/:propertyId/owners
 * @desc    Crear nuevo propietario
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/properties/:propertyId/owners',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyOwnerController.createPropertyOwner
);

/**
 * @route   GET /api/catastro/property-owners/taxpayer/:taxpayerId
 * @desc    Obtener propiedades de un contribuyente
 * @access  Private
 */
router.get(
  '/property-owners/taxpayer/:taxpayerId',
  authenticate,
  propertyOwnerController.getPropertiesByOwner
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
 * @route   GET /api/catastro/construction-permits/stats
 * @desc    Obtener estadísticas de permisos
 * @access  Private
 */
router.get(
  '/construction-permits/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.getPermitStats
);

/**
 * @route   GET /api/catastro/construction-permits/number/:permitNumber
 * @desc    Obtener permiso por número
 * @access  Private
 */
router.get(
  '/construction-permits/number/:permitNumber',
  authenticate,
  constructionPermitController.getPermitByNumber
);

/**
 * @route   GET /api/catastro/construction-permits
 * @desc    Obtener todos los permisos
 * @access  Private
 */
router.get(
  '/construction-permits',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  constructionPermitController.getAllPermits
);

/**
 * @route   GET /api/catastro/construction-permits/:id
 * @desc    Obtener permiso por ID
 * @access  Private
 */
router.get(
  '/construction-permits/:id',
  authenticate,
  constructionPermitController.getPermitById
);

/**
 * @route   POST /api/catastro/construction-permits
 * @desc    Crear nuevo permiso
 * @access  Private
 */
router.post(
  '/construction-permits',
  authenticate,
  constructionPermitController.createPermit
);

/**
 * @route   PUT /api/catastro/construction-permits/:id
 * @desc    Actualizar permiso
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/construction-permits/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  constructionPermitController.updatePermit
);

/**
 * @route   POST /api/catastro/construction-permits/:id/review
 * @desc    Revisar permiso (revisión técnica)
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/construction-permits/:id/review',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  constructionPermitController.reviewPermit
);

/**
 * @route   POST /api/catastro/construction-permits/:id/approve-reject
 * @desc    Aprobar o rechazar permiso
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/construction-permits/:id/approve-reject',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.approveOrRejectPermit
);

/**
 * @route   POST /api/catastro/construction-permits/:id/payment
 * @desc    Registrar pago de permiso
 * @access  Private
 */
router.post(
  '/construction-permits/:id/payment',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  constructionPermitController.registerPayment
);

/**
 * @route   POST /api/catastro/construction-permits/:id/start
 * @desc    Iniciar construcción
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/construction-permits/:id/start',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  constructionPermitController.startConstruction
);

/**
 * @route   POST /api/catastro/construction-permits/:id/complete
 * @desc    Finalizar construcción
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/construction-permits/:id/complete',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.completeConstruction
);

/**
 * @route   POST /api/catastro/construction-permits/:id/cancel
 * @desc    Cancelar permiso
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/construction-permits/:id/cancel',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  constructionPermitController.cancelPermit
);

/**
 * @route   GET /api/catastro/construction-permits/:id/inspections
 * @desc    Obtener inspecciones de un permiso
 * @access  Private
 */
router.get(
  '/construction-permits/:id/inspections',
  authenticate,
  constructionPermitController.getInspectionsByPermit
);

/**
 * @route   POST /api/catastro/construction-permits/:id/inspections
 * @desc    Crear inspección para un permiso
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/construction-permits/:id/inspections',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  constructionPermitController.createInspection
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

// ============================================
// RUTAS DE CAPAS SIG (ZONE LAYERS)
// ============================================

/**
 * @route   GET /api/catastro/zone-layers/stats
 * @desc    Obtener estadísticas de capas
 * @access  Private
 */
router.get(
  '/zone-layers/stats',
  authenticate,
  zoneLayerController.getStats
);

/**
 * @route   GET /api/catastro/zone-layers/visible
 * @desc    Obtener capas visibles
 * @access  Public
 */
router.get(
  '/zone-layers/visible',
  zoneLayerController.getVisibleLayers
);

/**
 * @route   GET /api/catastro/zone-layers/type/:layerType
 * @desc    Obtener capas por tipo
 * @access  Public
 */
router.get(
  '/zone-layers/type/:layerType',
  zoneLayerController.getLayersByType
);

/**
 * @route   GET /api/catastro/zone-layers
 * @desc    Obtener todas las capas
 * @access  Private
 */
router.get(
  '/zone-layers',
  authenticate,
  zoneLayerController.getAllLayers
);

/**
 * @route   GET /api/catastro/zone-layers/:id
 * @desc    Obtener capa por ID
 * @access  Private
 */
router.get(
  '/zone-layers/:id',
  authenticate,
  zoneLayerController.getLayerById
);

/**
 * @route   POST /api/catastro/zone-layers
 * @desc    Crear nueva capa
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/zone-layers',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  zoneLayerController.createLayer
);

/**
 * @route   PUT /api/catastro/zone-layers/:id
 * @desc    Actualizar capa
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/zone-layers/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  zoneLayerController.updateLayer
);

/**
 * @route   DELETE /api/catastro/zone-layers/:id
 * @desc    Eliminar capa
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/zone-layers/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  zoneLayerController.deleteLayer
);

/**
 * @route   PATCH /api/catastro/zone-layers/:id/toggle-visibility
 * @desc    Alternar visibilidad de capa
 * @access  Private (ADMIN, DIRECTOR)
 */
router.patch(
  '/zone-layers/:id/toggle-visibility',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  zoneLayerController.toggleVisibility
);

/**
 * @route   PATCH /api/catastro/zone-layers/:id/display-order
 * @desc    Actualizar orden de visualización
 * @access  Private (ADMIN, DIRECTOR)
 */
router.patch(
  '/zone-layers/:id/display-order',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  zoneLayerController.updateDisplayOrder
);

export default router;
