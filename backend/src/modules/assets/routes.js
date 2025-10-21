/**
 * Rutas para el módulo de Inventario y Bienes Municipales
 */

import express from 'express';
const router = express.Router();

// Middlewares
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';

// Controladores
import * as assetsController from './controllers/assets.controller.js';
import * as movementsController from './controllers/movements.controller.js';
import * as maintenancesController from './controllers/maintenances.controller.js';
import * as inventoryController from './controllers/inventory.controller.js';
import * as purchaseRequestsController from './controllers/purchase-requests.controller.js';

// Validaciones
import {
  createAssetSchema,
  updateAssetSchema,
  createMovementSchema,
  updateMovementStatusSchema,
  createAssetMaintenanceSchema,
  updateAssetMaintenanceSchema,
  createInventoryItemSchema,
  updateInventoryItemSchema,
  createInventoryEntrySchema,
  createInventoryExitSchema,
  createPurchaseRequestSchema,
  updatePurchaseRequestSchema,
  updatePurchaseRequestStatusSchema,
  addQuotationSchema,
  addPurchaseOrderSchema,
  markAsReceivedSchema,
} from './validations.js';

// ============================================
// RUTAS DE BIENES
// ============================================

/**
 * @route   GET /api/assets
 * @desc    Obtiene todos los bienes
 * @access  Private
 */
router.get('/', authenticate, assetsController.getAllAssets);

/**
 * @route   GET /api/assets/stats
 * @desc    Obtiene estadísticas de bienes
 * @access  Private
 */
router.get('/stats', authenticate, assetsController.getStats);

/**
 * @route   POST /api/assets/update-depreciations
 * @desc    Actualiza la depreciación de todos los bienes
 * @access  Private (Admin)
 */
router.post('/update-depreciations', authenticate, assetsController.updateDepreciations);

/**
 * @route   GET /api/assets/:id
 * @desc    Obtiene un bien por ID
 * @access  Private
 */
router.get('/:id', authenticate, assetsController.getAssetById);

/**
 * @route   POST /api/assets
 * @desc    Crea un nuevo bien
 * @access  Private
 */
router.post('/', authenticate, validate(createAssetSchema), assetsController.createAsset);

/**
 * @route   PUT /api/assets/:id
 * @desc    Actualiza un bien
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateAssetSchema), assetsController.updateAsset);

/**
 * @route   DELETE /api/assets/:id
 * @desc    Elimina un bien
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, assetsController.deleteAsset);

// ============================================
// RUTAS DE MOVIMIENTOS
// ============================================

/**
 * @route   GET /api/assets/movements
 * @desc    Obtiene todos los movimientos
 * @access  Private
 */
router.get('/movements', authenticate, movementsController.getAllMovements);

/**
 * @route   GET /api/assets/movements/:id
 * @desc    Obtiene un movimiento por ID
 * @access  Private
 */
router.get('/movements/:id', authenticate, movementsController.getMovementById);

/**
 * @route   GET /api/assets/:assetId/movements
 * @desc    Obtiene historial de movimientos de un bien
 * @access  Private
 */
router.get('/:assetId/movements', authenticate, movementsController.getAssetHistory);

/**
 * @route   POST /api/assets/movements
 * @desc    Crea un nuevo movimiento
 * @access  Private
 */
router.post('/movements', authenticate, validate(createMovementSchema), movementsController.createMovement);

/**
 * @route   POST /api/assets/movements/:id/approve
 * @desc    Aprueba un movimiento
 * @access  Private
 */
router.post('/movements/:id/approve', authenticate, movementsController.approveMovement);

/**
 * @route   POST /api/assets/movements/:id/complete
 * @desc    Completa un movimiento
 * @access  Private
 */
router.post('/movements/:id/complete', authenticate, movementsController.completeMovement);

/**
 * @route   POST /api/assets/movements/:id/reject
 * @desc    Rechaza un movimiento
 * @access  Private
 */
router.post('/movements/:id/reject', authenticate, movementsController.rejectMovement);

/**
 * @route   POST /api/assets/movements/:id/cancel
 * @desc    Cancela un movimiento
 * @access  Private
 */
router.post('/movements/:id/cancel', authenticate, movementsController.cancelMovement);

// ============================================
// RUTAS DE MANTENIMIENTOS
// ============================================

/**
 * @route   GET /api/assets/maintenances
 * @desc    Obtiene todos los mantenimientos
 * @access  Private
 */
router.get('/maintenances', authenticate, maintenancesController.getAllMaintenances);

/**
 * @route   GET /api/assets/maintenances/stats
 * @desc    Obtiene estadísticas de mantenimientos
 * @access  Private
 */
router.get('/maintenances/stats', authenticate, maintenancesController.getStats);

/**
 * @route   GET /api/assets/maintenances/:id
 * @desc    Obtiene un mantenimiento por ID
 * @access  Private
 */
router.get('/maintenances/:id', authenticate, maintenancesController.getMaintenanceById);

/**
 * @route   GET /api/assets/:assetId/maintenances
 * @desc    Obtiene historial de mantenimientos de un bien
 * @access  Private
 */
router.get('/:assetId/maintenances', authenticate, maintenancesController.getAssetHistory);

/**
 * @route   POST /api/assets/maintenances
 * @desc    Crea un nuevo mantenimiento
 * @access  Private
 */
router.post('/maintenances', authenticate, validate(createAssetMaintenanceSchema), maintenancesController.createMaintenance);

/**
 * @route   PUT /api/assets/maintenances/:id
 * @desc    Actualiza un mantenimiento
 * @access  Private
 */
router.put('/maintenances/:id', authenticate, validate(updateAssetMaintenanceSchema), maintenancesController.updateMaintenance);

/**
 * @route   POST /api/assets/maintenances/:id/start
 * @desc    Inicia un mantenimiento
 * @access  Private
 */
router.post('/maintenances/:id/start', authenticate, maintenancesController.startMaintenance);

/**
 * @route   POST /api/assets/maintenances/:id/complete
 * @desc    Completa un mantenimiento
 * @access  Private
 */
router.post('/maintenances/:id/complete', authenticate, maintenancesController.completeMaintenance);

/**
 * @route   POST /api/assets/maintenances/:id/cancel
 * @desc    Cancela un mantenimiento
 * @access  Private
 */
router.post('/maintenances/:id/cancel', authenticate, maintenancesController.cancelMaintenance);

/**
 * @route   DELETE /api/assets/maintenances/:id
 * @desc    Elimina un mantenimiento
 * @access  Private
 */
router.delete('/maintenances/:id', authenticate, maintenancesController.deleteMaintenance);

// ============================================
// RUTAS DE INVENTARIO
// ============================================

/**
 * @route   GET /api/assets/inventory/items
 * @desc    Obtiene todos los items de inventario
 * @access  Private
 */
router.get('/inventory/items', authenticate, inventoryController.getAllItems);

/**
 * @route   GET /api/assets/inventory/items/low-stock
 * @desc    Obtiene items con stock bajo
 * @access  Private
 */
router.get('/inventory/items/low-stock', authenticate, inventoryController.getLowStockItems);

/**
 * @route   GET /api/assets/inventory/stats
 * @desc    Obtiene estadísticas de inventario
 * @access  Private
 */
router.get('/inventory/stats', authenticate, inventoryController.getStats);

/**
 * @route   GET /api/assets/inventory/items/:id
 * @desc    Obtiene un item por ID
 * @access  Private
 */
router.get('/inventory/items/:id', authenticate, inventoryController.getItemById);

/**
 * @route   POST /api/assets/inventory/items
 * @desc    Crea un nuevo item
 * @access  Private
 */
router.post('/inventory/items', authenticate, validate(createInventoryItemSchema), inventoryController.createItem);

/**
 * @route   PUT /api/assets/inventory/items/:id
 * @desc    Actualiza un item
 * @access  Private
 */
router.put('/inventory/items/:id', authenticate, validate(updateInventoryItemSchema), inventoryController.updateItem);

/**
 * @route   DELETE /api/assets/inventory/items/:id
 * @desc    Desactiva un item
 * @access  Private
 */
router.delete('/inventory/items/:id', authenticate, inventoryController.deleteItem);

/**
 * @route   GET /api/assets/inventory/entries
 * @desc    Obtiene todas las entradas
 * @access  Private
 */
router.get('/inventory/entries', authenticate, inventoryController.getAllEntries);

/**
 * @route   POST /api/assets/inventory/entries
 * @desc    Crea una entrada de inventario
 * @access  Private
 */
router.post('/inventory/entries', authenticate, validate(createInventoryEntrySchema), inventoryController.createEntry);

/**
 * @route   GET /api/assets/inventory/exits
 * @desc    Obtiene todas las salidas
 * @access  Private
 */
router.get('/inventory/exits', authenticate, inventoryController.getAllExits);

/**
 * @route   POST /api/assets/inventory/exits
 * @desc    Crea una salida de inventario
 * @access  Private
 */
router.post('/inventory/exits', authenticate, validate(createInventoryExitSchema), inventoryController.createExit);

// ============================================
// RUTAS DE SOLICITUDES DE COMPRA
// ============================================

/**
 * @route   GET /api/assets/purchase-requests
 * @desc    Obtiene todas las solicitudes de compra
 * @access  Private
 */
router.get('/purchase-requests', authenticate, purchaseRequestsController.getAllRequests);

/**
 * @route   GET /api/assets/purchase-requests/stats
 * @desc    Obtiene estadísticas de solicitudes
 * @access  Private
 */
router.get('/purchase-requests/stats', authenticate, purchaseRequestsController.getStats);

/**
 * @route   GET /api/assets/purchase-requests/:id
 * @desc    Obtiene una solicitud por ID
 * @access  Private
 */
router.get('/purchase-requests/:id', authenticate, purchaseRequestsController.getRequestById);

/**
 * @route   POST /api/assets/purchase-requests
 * @desc    Crea una nueva solicitud
 * @access  Private
 */
router.post('/purchase-requests', authenticate, validate(createPurchaseRequestSchema), purchaseRequestsController.createRequest);

/**
 * @route   PUT /api/assets/purchase-requests/:id
 * @desc    Actualiza una solicitud
 * @access  Private
 */
router.put('/purchase-requests/:id', authenticate, validate(updatePurchaseRequestSchema), purchaseRequestsController.updateRequest);

/**
 * @route   POST /api/assets/purchase-requests/:id/approve-head
 * @desc    Aprueba por jefe de departamento
 * @access  Private
 */
router.post('/purchase-requests/:id/approve-head', authenticate, purchaseRequestsController.approveByHead);

/**
 * @route   POST /api/assets/purchase-requests/:id/approve-budget
 * @desc    Aprueba por presupuesto
 * @access  Private
 */
router.post('/purchase-requests/:id/approve-budget', authenticate, purchaseRequestsController.approveByBudget);

/**
 * @route   POST /api/assets/purchase-requests/:id/approve-purchasing
 * @desc    Aprueba por compras
 * @access  Private
 */
router.post('/purchase-requests/:id/approve-purchasing', authenticate, purchaseRequestsController.approveByPurchasing);

/**
 * @route   POST /api/assets/purchase-requests/:id/approve
 * @desc    Aprueba completamente
 * @access  Private
 */
router.post('/purchase-requests/:id/approve', authenticate, purchaseRequestsController.approveCompletely);

/**
 * @route   POST /api/assets/purchase-requests/:id/reject
 * @desc    Rechaza una solicitud
 * @access  Private
 */
router.post('/purchase-requests/:id/reject', authenticate, validate(updatePurchaseRequestStatusSchema), purchaseRequestsController.rejectRequest);

/**
 * @route   POST /api/assets/purchase-requests/:id/cancel
 * @desc    Cancela una solicitud
 * @access  Private
 */
router.post('/purchase-requests/:id/cancel', authenticate, purchaseRequestsController.cancelRequest);

/**
 * @route   POST /api/assets/purchase-requests/:id/quotation
 * @desc    Agrega cotización
 * @access  Private
 */
router.post('/purchase-requests/:id/quotation', authenticate, validate(addQuotationSchema), purchaseRequestsController.addQuotation);

/**
 * @route   POST /api/assets/purchase-requests/:id/purchase-order
 * @desc    Genera orden de compra
 * @access  Private
 */
router.post('/purchase-requests/:id/purchase-order', authenticate, validate(addPurchaseOrderSchema), purchaseRequestsController.generatePurchaseOrder);

/**
 * @route   POST /api/assets/purchase-requests/:id/receive
 * @desc    Marca como recibida
 * @access  Private
 */
router.post('/purchase-requests/:id/receive', authenticate, validate(markAsReceivedSchema), purchaseRequestsController.markAsReceived);

export default router;
