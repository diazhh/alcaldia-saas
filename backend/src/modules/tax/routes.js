/**
 * Rutas del módulo tributario
 */

import express from 'express';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware.js';
import * as taxpayerController from './controllers/taxpayer.controller.js';
import * as businessController from './controllers/business.controller.js';
import * as propertyController from './controllers/property.controller.js';
import * as vehicleController from './controllers/vehicle.controller.js';
import feeController from './controllers/fee.controller.js';
import paymentController from './controllers/payment.controller.js';
import collectionController from './controllers/collection.controller.js';
import solvencyController from './controllers/solvency.controller.js';

const router = express.Router();

// ============================================
// RUTAS DE CONTRIBUYENTES
// ============================================

/**
 * @route   GET /api/tax/taxpayers
 * @desc    Obtener todos los contribuyentes
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/taxpayers',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  taxpayerController.getAllTaxpayers
);

/**
 * @route   GET /api/tax/taxpayers/by-tax-id/:taxId
 * @desc    Obtener contribuyente por RIF/CI
 * @access  Private
 */
router.get(
  '/taxpayers/by-tax-id/:taxId',
  authenticate,
  taxpayerController.getTaxpayerByTaxId
);

/**
 * @route   GET /api/tax/taxpayers/:id
 * @desc    Obtener un contribuyente por ID
 * @access  Private
 */
router.get(
  '/taxpayers/:id',
  authenticate,
  taxpayerController.getTaxpayerById
);

/**
 * @route   POST /api/tax/taxpayers
 * @desc    Crear un nuevo contribuyente
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/taxpayers',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  taxpayerController.createTaxpayer
);

/**
 * @route   PUT /api/tax/taxpayers/:id
 * @desc    Actualizar un contribuyente
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/taxpayers/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  taxpayerController.updateTaxpayer
);

/**
 * @route   DELETE /api/tax/taxpayers/:id
 * @desc    Eliminar un contribuyente
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/taxpayers/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  taxpayerController.deleteTaxpayer
);

/**
 * @route   GET /api/tax/taxpayers/:id/account-status
 * @desc    Obtener estado de cuenta de un contribuyente
 * @access  Private
 */
router.get(
  '/taxpayers/:id/account-status',
  authenticate,
  taxpayerController.getTaxpayerAccountStatus
);

/**
 * @route   GET /api/tax/taxpayers/:id/is-solvent
 * @desc    Verificar si un contribuyente está solvente
 * @access  Private
 */
router.get(
  '/taxpayers/:id/is-solvent',
  authenticate,
  taxpayerController.checkTaxpayerSolvency
);

// ============================================
// RUTAS DE NEGOCIOS (PATENTES)
// ============================================

/**
 * @route   GET /api/tax/businesses
 * @desc    Obtener todos los negocios
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/businesses',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  businessController.getAllBusinesses
);

/**
 * @route   GET /api/tax/businesses/:id
 * @desc    Obtener un negocio por ID
 * @access  Private
 */
router.get(
  '/businesses/:id',
  authenticate,
  businessController.getBusinessById
);

/**
 * @route   POST /api/tax/businesses
 * @desc    Crear un nuevo negocio
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/businesses',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  businessController.createBusiness
);

/**
 * @route   PUT /api/tax/businesses/:id
 * @desc    Actualizar un negocio
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/businesses/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  businessController.updateBusiness
);

/**
 * @route   DELETE /api/tax/businesses/:id
 * @desc    Eliminar un negocio
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/businesses/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  businessController.deleteBusiness
);

/**
 * @route   POST /api/tax/businesses/:id/calculate-tax
 * @desc    Calcular impuesto de actividades económicas
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/businesses/:id/calculate-tax',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  businessController.calculateBusinessTax
);

/**
 * @route   POST /api/tax/businesses/:id/generate-bill
 * @desc    Generar factura de impuesto
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/businesses/:id/generate-bill',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  businessController.generateBusinessTaxBill
);

/**
 * @route   POST /api/tax/businesses/:id/renew-license
 * @desc    Renovar licencia de negocio
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/businesses/:id/renew-license',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  businessController.renewBusinessLicense
);

// ============================================
// RUTAS DE INMUEBLES
// ============================================

/**
 * @route   GET /api/tax/properties
 * @desc    Obtener todos los inmuebles
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/properties',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyController.getAllProperties
);

/**
 * @route   GET /api/tax/properties/:id
 * @desc    Obtener un inmueble por ID
 * @access  Private
 */
router.get(
  '/properties/:id',
  authenticate,
  propertyController.getPropertyById
);

/**
 * @route   POST /api/tax/properties
 * @desc    Crear un nuevo inmueble
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/properties',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyController.createProperty
);

/**
 * @route   PUT /api/tax/properties/:id
 * @desc    Actualizar un inmueble
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/properties/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyController.updateProperty
);

/**
 * @route   DELETE /api/tax/properties/:id
 * @desc    Eliminar un inmueble
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/properties/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  propertyController.deleteProperty
);

/**
 * @route   POST /api/tax/properties/:id/calculate-tax
 * @desc    Calcular impuesto sobre inmuebles
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/properties/:id/calculate-tax',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyController.calculatePropertyTax
);

/**
 * @route   POST /api/tax/properties/:id/generate-bill
 * @desc    Generar factura de impuesto
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/properties/:id/generate-bill',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  propertyController.generatePropertyTaxBill
);

/**
 * @route   PUT /api/tax/properties/:id/exemption
 * @desc    Actualizar exoneración de inmueble
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/properties/:id/exemption',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  propertyController.updatePropertyExemption
);

// ============================================
// RUTAS DE VEHÍCULOS
// ============================================

/**
 * @route   GET /api/tax/vehicles
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
 * @route   GET /api/tax/vehicles/:id
 * @desc    Obtener un vehículo por ID
 * @access  Private
 */
router.get(
  '/vehicles/:id',
  authenticate,
  vehicleController.getVehicleById
);

/**
 * @route   POST /api/tax/vehicles
 * @desc    Crear un nuevo vehículo
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/vehicles',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.createVehicle
);

/**
 * @route   PUT /api/tax/vehicles/:id
 * @desc    Actualizar un vehículo
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/vehicles/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.updateVehicle
);

/**
 * @route   DELETE /api/tax/vehicles/:id
 * @desc    Eliminar un vehículo
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/vehicles/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  vehicleController.deleteVehicle
);

/**
 * @route   POST /api/tax/vehicles/:id/calculate-tax
 * @desc    Calcular impuesto sobre vehículos
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/vehicles/:id/calculate-tax',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.calculateVehicleTax
);

/**
 * @route   POST /api/tax/vehicles/:id/generate-bill
 * @desc    Generar factura de impuesto
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/vehicles/:id/generate-bill',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.generateVehicleTaxBill
);

/**
 * @route   POST /api/tax/vehicles/:id/transfer
 * @desc    Transferir vehículo a otro contribuyente
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/vehicles/:id/transfer',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  vehicleController.transferVehicle
);

// ============================================
// RUTAS DE FACTURACIÓN DE TASAS
// ============================================

/**
 * @route   GET /api/tax/fees
 * @desc    Obtener todas las facturas de tasas
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/fees',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  feeController.getFeeBills
);

/**
 * @route   GET /api/tax/fees/statistics
 * @desc    Obtener estadísticas de facturación de tasas
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/fees/statistics',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  feeController.getFeeStatistics
);

/**
 * @route   GET /api/tax/fees/:id
 * @desc    Obtener una factura de tasa por ID
 * @access  Private
 */
router.get(
  '/fees/:id',
  authenticate,
  feeController.getFeeBillById
);

/**
 * @route   GET /api/tax/fees/number/:billNumber
 * @desc    Obtener una factura de tasa por número
 * @access  Private
 */
router.get(
  '/fees/number/:billNumber',
  authenticate,
  feeController.getFeeBillByNumber
);

/**
 * @route   POST /api/tax/fees
 * @desc    Crear una nueva factura de tasa
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/fees',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  feeController.createFeeBill
);

/**
 * @route   POST /api/tax/fees/generate-urban-cleaning
 * @desc    Generar facturas masivas de aseo urbano
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/fees/generate-urban-cleaning',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  feeController.generateUrbanCleaningBills
);

/**
 * @route   PUT /api/tax/fees/:id
 * @desc    Actualizar una factura de tasa
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/fees/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  feeController.updateFeeBill
);

/**
 * @route   POST /api/tax/fees/:id/cancel
 * @desc    Anular una factura de tasa
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/fees/:id/cancel',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  feeController.cancelFeeBill
);

// ============================================
// RUTAS DE PORTAL DE AUTOPAGO
// ============================================

/**
 * @route   GET /api/tax/payments/debts/:taxId
 * @desc    Consultar deudas por RIF/CI (público)
 * @access  Public
 */
router.get(
  '/payments/debts/:taxId',
  paymentController.getDebtsByTaxId
);

/**
 * @route   POST /api/tax/payments/generate-slip
 * @desc    Generar planilla de pago (público)
 * @access  Public
 */
router.post(
  '/payments/generate-slip',
  paymentController.generatePaymentSlip
);

/**
 * @route   GET /api/tax/payments/verify/:paymentCode
 * @desc    Verificar código de pago (público)
 * @access  Public
 */
router.get(
  '/payments/verify/:paymentCode',
  paymentController.verifyPaymentCode
);

/**
 * @route   POST /api/tax/payments
 * @desc    Registrar un pago
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/payments',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  paymentController.registerPayment
);

/**
 * @route   GET /api/tax/payments/receipt/:receiptNumber
 * @desc    Obtener recibo de pago (público)
 * @access  Public
 */
router.get(
  '/payments/receipt/:receiptNumber',
  paymentController.getReceipt
);

/**
 * @route   GET /api/tax/payments/history/:taxpayerId
 * @desc    Obtener historial de pagos
 * @access  Private
 */
router.get(
  '/payments/history/:taxpayerId',
  authenticate,
  paymentController.getPaymentHistory
);

// ============================================
// RUTAS DE GESTIÓN DE COBRANZA
// ============================================

/**
 * @route   POST /api/tax/collections/identify
 * @desc    Identificar contribuyentes morosos
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/collections/identify',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  collectionController.identifyDefaulters
);

/**
 * @route   GET /api/tax/collections
 * @desc    Obtener todos los casos de cobranza
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/collections',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  collectionController.getCollections
);

/**
 * @route   GET /api/tax/collections/statistics
 * @desc    Obtener estadísticas de cobranza
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/collections/statistics',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  collectionController.getCollectionStatistics
);

/**
 * @route   GET /api/tax/collections/:id
 * @desc    Obtener un caso de cobranza por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/collections/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  collectionController.getCollectionById
);

/**
 * @route   POST /api/tax/collections/:id/actions
 * @desc    Registrar una acción de cobranza
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/collections/:id/actions',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  collectionController.registerAction
);

/**
 * @route   POST /api/tax/collections/send-notifications
 * @desc    Enviar notificaciones a morosos
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/collections/send-notifications',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  collectionController.sendNotifications
);

/**
 * @route   POST /api/tax/collections/:id/payment-plan
 * @desc    Crear convenio de pago
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/collections/:id/payment-plan',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  collectionController.createPaymentPlan
);

/**
 * @route   GET /api/tax/collections/interest/:billId
 * @desc    Calcular intereses moratorios
 * @access  Private
 */
router.get(
  '/collections/interest/:billId',
  authenticate,
  collectionController.calculateLateInterest
);

/**
 * @route   POST /api/tax/collections/:id/close
 * @desc    Cerrar un caso de cobranza
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/collections/:id/close',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  collectionController.closeCollection
);

// ============================================
// RUTAS DE SOLVENCIAS
// ============================================

/**
 * @route   GET /api/tax/solvencies/check/:taxpayerId
 * @desc    Verificar si un contribuyente está solvente
 * @access  Private
 */
router.get(
  '/solvencies/check/:taxpayerId',
  authenticate,
  solvencyController.checkSolvency
);

/**
 * @route   GET /api/tax/solvencies
 * @desc    Obtener todas las solvencias
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/solvencies',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  solvencyController.getSolvencies
);

/**
 * @route   GET /api/tax/solvencies/statistics
 * @desc    Obtener estadísticas de solvencias
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/solvencies/statistics',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  solvencyController.getSolvencyStatistics
);

/**
 * @route   GET /api/tax/solvencies/expiring
 * @desc    Obtener solvencias próximas a vencer
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/solvencies/expiring',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  solvencyController.getExpiringsSolvencies
);

/**
 * @route   GET /api/tax/solvencies/verify/:qrCode
 * @desc    Verificar solvencia por código QR (público)
 * @access  Public
 */
router.get(
  '/solvencies/verify/:qrCode',
  solvencyController.verifySolvencyByQR
);

/**
 * @route   GET /api/tax/solvencies/:id
 * @desc    Obtener una solvencia por ID
 * @access  Private
 */
router.get(
  '/solvencies/:id',
  authenticate,
  solvencyController.getSolvencyById
);

/**
 * @route   GET /api/tax/solvencies/number/:solvencyNumber
 * @desc    Obtener una solvencia por número
 * @access  Private
 */
router.get(
  '/solvencies/number/:solvencyNumber',
  authenticate,
  solvencyController.getSolvencyByNumber
);

/**
 * @route   POST /api/tax/solvencies
 * @desc    Generar una solvencia
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/solvencies',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  solvencyController.generateSolvency
);

/**
 * @route   POST /api/tax/solvencies/:id/revoke
 * @desc    Revocar una solvencia
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/solvencies/:id/revoke',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  solvencyController.revokeSolvency
);

export default router;
