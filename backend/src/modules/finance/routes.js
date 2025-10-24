/**
 * Rutas del módulo de Finanzas
 */

import express from 'express';
import * as budgetController from './controllers/budgetController.js';
import * as budgetItemController from './controllers/budgetItemController.js';
import * as budgetModificationController from './controllers/budgetModificationController.js';
import * as transactionController from './controllers/transactionController.js';
import * as treasuryController from './controllers/treasuryController.js';
import * as accountingController from './controllers/accountingController.js';
import * as reportsController from './controllers/reportsController.js';
import * as bankReconciliationController from './controllers/bankReconciliationController.js';
import * as paymentScheduleController from './controllers/paymentScheduleController.js';
import cashFlowProjectionController from './controllers/cashFlowProjectionController.js';
import * as exportController from './controllers/exportController.stub.js'; // Temporary stub
import pettyCashController from './controllers/pettyCashController.js';
import employeeAdvanceController from './controllers/employeeAdvanceController.js';
import accountingClosureController from './controllers/accountingClosureController.js';

// Temporary stubs for missing controllers
const stubController = {
  createPettyCash: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getAllPettyCashes: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getPettyCashById: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getPettyCashStats: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  registerExpense: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  requestReimbursement: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  approveReimbursement: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  processReimbursement: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  rejectReimbursement: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  closePettyCash: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  updatePettyCash: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  requestAdvance: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getAllAdvances: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getAdvanceById: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getAdvanceStats: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getPendingInstallments: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  approveAdvance: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  rejectAdvance: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  disburseAdvance: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  registerInstallment: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  registerInstallmentPayment: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  cancelAdvance: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  createClosure: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getAllClosures: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getClosures: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getClosureById: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  getClosureStats: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  validatePreClosure: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  isPeriodClosed: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  closeMonth: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  closeYear: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
  reopenPeriod: async (req, res) => res.status(501).json({ message: 'Temporarily unavailable' }),
};
// Controllers are now imported directly above
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  approveBudgetSchema,
  createBudgetItemSchema,
  updateBudgetItemSchema,
  createBudgetModificationSchema,
  rejectModificationSchema,
  createTransactionSchema,
  updateTransactionStatusSchema,
  createBankAccountSchema,
  updateBankAccountSchema,
  createPaymentSchema,
  updatePaymentStatusSchema,
  createIncomeSchema,
  checkBudgetAvailabilitySchema,
  createReconciliationSchema,
  addReconciliationItemSchema,
  rejectReconciliationSchema,
  createPaymentScheduleSchema,
  processPaymentScheduleSchema,
  rejectPaymentScheduleSchema,
  updateScheduledDateSchema,
  createPaymentBatchSchema,
} from './validations.js';

const router = express.Router();

// ============================================
// RUTAS DE PRESUPUESTO
// ============================================

/**
 * @route   GET /api/finance/budgets
 * @desc    Obtener todos los presupuestos
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/budgets',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  budgetController.getAllBudgets
);

/**
 * @route   GET /api/finance/budgets/year/:year
 * @desc    Obtener presupuesto por año
 * @access  Private
 */
router.get(
  '/budgets/year/:year',
  authenticate,
  budgetController.getBudgetByYear
);

/**
 * @route   GET /api/finance/budgets/:id
 * @desc    Obtener un presupuesto por ID
 * @access  Private
 */
router.get(
  '/budgets/:id',
  authenticate,
  budgetController.getBudgetById
);

/**
 * @route   GET /api/finance/budgets/:id/stats
 * @desc    Obtener estadísticas de ejecución presupuestaria
 * @access  Private
 */
router.get(
  '/budgets/:id/stats',
  authenticate,
  budgetController.getBudgetExecutionStats
);

/**
 * @route   POST /api/finance/budgets
 * @desc    Crear un nuevo presupuesto
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/budgets',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(createBudgetSchema),
  budgetController.createBudget
);

/**
 * @route   PUT /api/finance/budgets/:id
 * @desc    Actualizar un presupuesto
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/budgets/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(updateBudgetSchema),
  budgetController.updateBudget
);

/**
 * @route   POST /api/finance/budgets/:id/approve
 * @desc    Aprobar un presupuesto
 * @access  Private (ADMIN)
 */
router.post(
  '/budgets/:id/approve',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  budgetController.approveBudget
);

/**
 * @route   POST /api/finance/budgets/:id/activate
 * @desc    Activar un presupuesto
 * @access  Private (ADMIN)
 */
router.post(
  '/budgets/:id/activate',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  budgetController.activateBudget
);

/**
 * @route   POST /api/finance/budgets/:id/close
 * @desc    Cerrar un presupuesto
 * @access  Private (ADMIN)
 */
router.post(
  '/budgets/:id/close',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  budgetController.closeBudget
);

/**
 * @route   DELETE /api/finance/budgets/:id
 * @desc    Eliminar un presupuesto
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/budgets/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  budgetController.deleteBudget
);

// ============================================
// RUTAS DE PARTIDAS PRESUPUESTARIAS
// ============================================

/**
 * @route   GET /api/finance/budgets/:budgetId/items
 * @desc    Obtener todas las partidas de un presupuesto
 * @access  Private
 */
router.get(
  '/budgets/:budgetId/items',
  authenticate,
  budgetItemController.getBudgetItems
);

/**
 * @route   GET /api/finance/budgets/:budgetId/items/by-category
 * @desc    Obtener resumen de partidas por categoría
 * @access  Private
 */
router.get(
  '/budgets/:budgetId/items/by-category',
  authenticate,
  budgetItemController.getBudgetItemsByCategory
);

/**
 * @route   GET /api/finance/budget-items/:id
 * @desc    Obtener una partida presupuestaria por ID
 * @access  Private
 */
router.get(
  '/budget-items/:id',
  authenticate,
  budgetItemController.getBudgetItemById
);

/**
 * @route   POST /api/finance/budget-items
 * @desc    Crear una nueva partida presupuestaria
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/budget-items',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(createBudgetItemSchema),
  budgetItemController.createBudgetItem
);

/**
 * @route   POST /api/finance/budget-items/check-availability
 * @desc    Verificar disponibilidad presupuestaria
 * @access  Private
 */
router.post(
  '/budget-items/check-availability',
  authenticate,
  validate(checkBudgetAvailabilitySchema),
  budgetItemController.checkBudgetAvailability
);

/**
 * @route   PUT /api/finance/budget-items/:id
 * @desc    Actualizar una partida presupuestaria
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/budget-items/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(updateBudgetItemSchema),
  budgetItemController.updateBudgetItem
);

/**
 * @route   DELETE /api/finance/budget-items/:id
 * @desc    Eliminar una partida presupuestaria
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/budget-items/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  budgetItemController.deleteBudgetItem
);

// ============================================
// RUTAS DE MODIFICACIONES PRESUPUESTARIAS
// ============================================

/**
 * @route   POST /api/finance/budget-modifications
 * @desc    Crear una modificación presupuestaria
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/budget-modifications',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(createBudgetModificationSchema),
  budgetModificationController.createModification
);

/**
 * @route   GET /api/finance/budgets/:budgetId/modifications
 * @desc    Obtener modificaciones de un presupuesto
 * @access  Private
 */
router.get(
  '/budgets/:budgetId/modifications',
  authenticate,
  budgetModificationController.getModifications
);

/**
 * @route   GET /api/finance/budget-modifications/:id
 * @desc    Obtener una modificación por ID
 * @access  Private
 */
router.get(
  '/budget-modifications/:id',
  authenticate,
  budgetModificationController.getModificationById
);

/**
 * @route   POST /api/finance/budget-modifications/:id/approve
 * @desc    Aprobar una modificación presupuestaria
 * @access  Private (ADMIN only)
 */
router.post(
  '/budget-modifications/:id/approve',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  budgetModificationController.approveModification
);

/**
 * @route   POST /api/finance/budget-modifications/:id/reject
 * @desc    Rechazar una modificación presupuestaria
 * @access  Private (ADMIN only)
 */
router.post(
  '/budget-modifications/:id/reject',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  validate(rejectModificationSchema),
  budgetModificationController.rejectModification
);

/**
 * @route   GET /api/finance/budgets/:budgetId/modifications/stats
 * @desc    Obtener estadísticas de modificaciones
 * @access  Private
 */
router.get(
  '/budgets/:budgetId/modifications/stats',
  authenticate,
  budgetModificationController.getModificationStats
);

// ============================================
// RUTAS DE TRANSACCIONES
// ============================================

/**
 * @route   GET /api/finance/transactions/stats
 * @desc    Obtener estadísticas de transacciones
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/transactions/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  transactionController.getTransactionStats
);

/**
 * @route   GET /api/finance/transactions
 * @desc    Obtener todas las transacciones con filtros
 * @access  Private
 */
router.get(
  '/transactions',
  authenticate,
  transactionController.getTransactions
);

/**
 * @route   GET /api/finance/transactions/:id
 * @desc    Obtener una transacción por ID
 * @access  Private
 */
router.get(
  '/transactions/:id',
  authenticate,
  transactionController.getTransactionById
);

/**
 * @route   POST /api/finance/transactions
 * @desc    Crear una nueva transacción (COMPROMISO)
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/transactions',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(createTransactionSchema),
  transactionController.createTransaction
);

/**
 * @route   POST /api/finance/transactions/:id/accrue
 * @desc    Causar una transacción (COMPROMISO → CAUSADO)
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/transactions/:id/accrue',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  transactionController.accrueTransaction
);

/**
 * @route   POST /api/finance/transactions/:id/pay
 * @desc    Pagar una transacción (CAUSADO → PAGADO)
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/transactions/:id/pay',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  transactionController.payTransaction
);

/**
 * @route   POST /api/finance/transactions/:id/cancel
 * @desc    Anular una transacción
 * @access  Private (ADMIN)
 */
router.post(
  '/transactions/:id/cancel',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  transactionController.cancelTransaction
);

// ============================================
// RUTAS DE CUENTAS BANCARIAS
// ============================================

/**
 * @route   GET /api/finance/bank-accounts
 * @desc    Obtener todas las cuentas bancarias
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/bank-accounts',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  treasuryController.getAllBankAccounts
);

/**
 * @route   GET /api/finance/bank-accounts/:id
 * @desc    Obtener una cuenta bancaria por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/bank-accounts/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  treasuryController.getBankAccountById
);

/**
 * @route   POST /api/finance/bank-accounts
 * @desc    Crear una nueva cuenta bancaria
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/bank-accounts',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(createBankAccountSchema),
  treasuryController.createBankAccount
);

/**
 * @route   PUT /api/finance/bank-accounts/:id
 * @desc    Actualizar una cuenta bancaria
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/bank-accounts/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(updateBankAccountSchema),
  treasuryController.updateBankAccount
);

// ============================================
// RUTAS DE PAGOS
// ============================================

/**
 * @route   GET /api/finance/payments
 * @desc    Obtener todos los pagos con filtros
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/payments',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  treasuryController.getPayments
);

/**
 * @route   GET /api/finance/payments/:id
 * @desc    Obtener un pago por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/payments/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  treasuryController.getPaymentById
);

/**
 * @route   POST /api/finance/payments
 * @desc    Crear un nuevo pago
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/payments',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(createPaymentSchema),
  treasuryController.createPayment
);

/**
 * @route   PATCH /api/finance/payments/:id/status
 * @desc    Actualizar el estado de un pago
 * @access  Private (ADMIN, DIRECTOR)
 */
router.patch(
  '/payments/:id/status',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(updatePaymentStatusSchema),
  treasuryController.updatePaymentStatus
);

// ============================================
// RUTAS DE INGRESOS
// ============================================

/**
 * @route   GET /api/finance/incomes
 * @desc    Obtener todos los ingresos con filtros
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/incomes',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  treasuryController.getIncomes
);

/**
 * @route   GET /api/finance/incomes/:id
 * @desc    Obtener un ingreso por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/incomes/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  treasuryController.getIncomeById
);

/**
 * @route   POST /api/finance/incomes
 * @desc    Registrar un nuevo ingreso
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/incomes',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(createIncomeSchema),
  treasuryController.createIncome
);

// ============================================
// RUTAS DE FLUJO DE CAJA
// ============================================

/**
 * @route   GET /api/finance/cash-flow
 * @desc    Obtener el flujo de caja
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/cash-flow',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  treasuryController.getCashFlow
);

// ============================================
// RUTAS DE CONTABILIDAD
// ============================================

/**
 * @route   GET /api/finance/accounting/journal
 * @desc    Obtener el libro diario
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/accounting/journal',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  accountingController.getGeneralJournal
);

/**
 * @route   GET /api/finance/accounting/ledger
 * @desc    Obtener el libro mayor
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/accounting/ledger',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  accountingController.getGeneralLedger
);

/**
 * @route   GET /api/finance/accounting/trial-balance
 * @desc    Obtener el balance de comprobación
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/accounting/trial-balance',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  accountingController.getTrialBalance
);

/**
 * @route   GET /api/finance/accounting/chart-of-accounts
 * @desc    Obtener el plan de cuentas
 * @access  Private
 */
router.get(
  '/accounting/chart-of-accounts',
  authenticate,
  accountingController.getChartOfAccounts
);

/**
 * @route   POST /api/finance/accounting/entries
 * @desc    Crear un asiento contable manual
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/accounting/entries',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  accountingController.createManualEntry
);

// ============================================
// RUTAS DE REPORTES Y ESTADOS FINANCIEROS
// ============================================

/**
 * @route   GET /api/finance/reports/balance-sheet
 * @desc    Generar Balance General
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/reports/balance-sheet',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  reportsController.getBalanceSheet
);

/**
 * @route   GET /api/finance/reports/income-statement
 * @desc    Generar Estado de Resultados
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/reports/income-statement',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  reportsController.getIncomeStatement
);

/**
 * @route   GET /api/finance/reports/cash-flow-statement
 * @desc    Generar Estado de Flujo de Efectivo
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/reports/cash-flow-statement',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  reportsController.getCashFlowStatement
);

/**
 * @route   GET /api/finance/reports/budget-execution/:year
 * @desc    Generar análisis de ejecución presupuestaria
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/reports/budget-execution/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  reportsController.getBudgetExecutionAnalysis
);

/**
 * @route   GET /api/finance/reports/onapre/form-1013/:year
 * @desc    Generar reporte ONAPRE Form 1013 (Ejecución Financiera)
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/reports/onapre/form-1013/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  reportsController.getOnapreForm1013
);

/**
 * @route   GET /api/finance/reports/onapre/form-2345
 * @desc    Generar reporte ONAPRE Form 2345 (Balance General)
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/reports/onapre/form-2345',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  reportsController.getOnapreForm2345
);

// ============================================
// RUTAS DE CONCILIACIÓN BANCARIA
// ============================================

/**
 * @route   POST /api/finance/bank-reconciliations
 * @desc    Crear una nueva conciliación bancaria
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/bank-reconciliations',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(createReconciliationSchema),
  bankReconciliationController.createReconciliation
);

/**
 * @route   GET /api/finance/bank-reconciliations
 * @desc    Obtener conciliaciones con filtros
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/bank-reconciliations',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  bankReconciliationController.getReconciliations
);

/**
 * @route   GET /api/finance/bank-reconciliations/stats
 * @desc    Obtener estadísticas de conciliaciones
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/bank-reconciliations/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  bankReconciliationController.getReconciliationStats
);

/**
 * @route   GET /api/finance/bank-reconciliations/:id
 * @desc    Obtener una conciliación por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/bank-reconciliations/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  bankReconciliationController.getReconciliationById
);

/**
 * @route   POST /api/finance/bank-reconciliations/:id/items
 * @desc    Agregar partida a conciliación
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/bank-reconciliations/:id/items',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(addReconciliationItemSchema),
  bankReconciliationController.addReconciliationItem
);

/**
 * @route   POST /api/finance/bank-reconciliations/:id/load-transactions
 * @desc    Cargar transacciones del sistema automáticamente
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/bank-reconciliations/:id/load-transactions',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  bankReconciliationController.loadSystemTransactions
);

/**
 * @route   POST /api/finance/bank-reconciliations/items/:itemId/reconcile
 * @desc    Marcar partida como conciliada
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/bank-reconciliations/items/:itemId/reconcile',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  bankReconciliationController.reconcileItem
);

/**
 * @route   DELETE /api/finance/bank-reconciliations/items/:itemId
 * @desc    Eliminar partida de conciliación
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/bank-reconciliations/items/:itemId',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  bankReconciliationController.deleteReconciliationItem
);

/**
 * @route   POST /api/finance/bank-reconciliations/:id/complete
 * @desc    Completar conciliación
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/bank-reconciliations/:id/complete',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  bankReconciliationController.completeReconciliation
);

/**
 * @route   POST /api/finance/bank-reconciliations/:id/approve
 * @desc    Aprobar conciliación
 * @access  Private (ADMIN only)
 */
router.post(
  '/bank-reconciliations/:id/approve',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  bankReconciliationController.approveReconciliation
);

/**
 * @route   POST /api/finance/bank-reconciliations/:id/reject
 * @desc    Rechazar conciliación
 * @access  Private (ADMIN only)
 */
router.post(
  '/bank-reconciliations/:id/reject',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  validate(rejectReconciliationSchema),
  bankReconciliationController.rejectReconciliation
);

// ============================================
// RUTAS DE PROGRAMACIÓN DE PAGOS
// ============================================

/**
 * @route   POST /api/finance/payment-schedules
 * @desc    Crear programación de pago
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/payment-schedules',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(createPaymentScheduleSchema),
  paymentScheduleController.createPaymentSchedule
);

/**
 * @route   GET /api/finance/payment-schedules
 * @desc    Obtener programaciones de pago
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/payment-schedules',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  paymentScheduleController.getPaymentSchedules
);

/**
 * @route   GET /api/finance/payment-schedules/stats
 * @desc    Obtener estadísticas de programación
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/payment-schedules/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  paymentScheduleController.getPaymentScheduleStats
);

/**
 * @route   GET /api/finance/payment-schedules/calendar
 * @desc    Obtener calendario de pagos
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/payment-schedules/calendar',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  paymentScheduleController.getPaymentCalendar
);

/**
 * @route   GET /api/finance/payment-schedules/:id
 * @desc    Obtener programación por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/payment-schedules/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  paymentScheduleController.getPaymentScheduleById
);

/**
 * @route   POST /api/finance/payment-schedules/:id/approve
 * @desc    Aprobar programación de pago
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/payment-schedules/:id/approve',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  paymentScheduleController.approvePaymentSchedule
);

/**
 * @route   POST /api/finance/payment-schedules/:id/reject
 * @desc    Rechazar programación de pago
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/payment-schedules/:id/reject',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(rejectPaymentScheduleSchema),
  paymentScheduleController.rejectPaymentSchedule
);

/**
 * @route   POST /api/finance/payment-schedules/:id/process
 * @desc    Procesar pago programado
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/payment-schedules/:id/process',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(processPaymentScheduleSchema),
  paymentScheduleController.processPaymentSchedule
);

/**
 * @route   POST /api/finance/payment-schedules/:id/cancel
 * @desc    Cancelar programación de pago
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/payment-schedules/:id/cancel',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(rejectPaymentScheduleSchema),
  paymentScheduleController.cancelPaymentSchedule
);

/**
 * @route   PATCH /api/finance/payment-schedules/:id/date
 * @desc    Actualizar fecha programada
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.patch(
  '/payment-schedules/:id/date',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(updateScheduledDateSchema),
  paymentScheduleController.updateScheduledDate
);

/**
 * @route   POST /api/finance/payment-schedules/batch
 * @desc    Crear lote de pagos
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/payment-schedules/batch',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(createPaymentBatchSchema),
  paymentScheduleController.createPaymentBatch
);

// ============================================
// RUTAS DE PROYECCIÓN DE FLUJO DE CAJA
// ============================================

/**
 * @route   POST /api/finance/cash-flow-projections
 * @desc    Crear proyección manual
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/cash-flow-projections',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  cashFlowProjectionController.createProjection
);

/**
 * @route   POST /api/finance/cash-flow-projections/auto
 * @desc    Generar proyección automática
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/cash-flow-projections/auto',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  cashFlowProjectionController.generateAutoProjection
);

/**
 * @route   POST /api/finance/cash-flow-projections/year
 * @desc    Generar proyecciones para todo un año
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/cash-flow-projections/year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  cashFlowProjectionController.generateYearProjections
);

/**
 * @route   GET /api/finance/cash-flow-projections
 * @desc    Obtener proyecciones con filtros
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/cash-flow-projections',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  cashFlowProjectionController.getProjections
);

/**
 * @route   GET /api/finance/cash-flow-projections/year/:year
 * @desc    Obtener proyecciones de un año
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/cash-flow-projections/year/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  cashFlowProjectionController.getYearProjections
);

/**
 * @route   GET /api/finance/cash-flow-projections/year/:year/stats
 * @desc    Obtener estadísticas de proyecciones
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/cash-flow-projections/year/:year/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  cashFlowProjectionController.getProjectionStats
);

/**
 * @route   GET /api/finance/cash-flow-projections/year/:year/alerts
 * @desc    Obtener alertas de déficit
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/cash-flow-projections/year/:year/alerts',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  cashFlowProjectionController.getDeficitAlerts
);

/**
 * @route   GET /api/finance/cash-flow-projections/scenarios/:year/:month
 * @desc    Obtener comparación de escenarios
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/cash-flow-projections/scenarios/:year/:month',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  cashFlowProjectionController.getScenarioComparison
);

/**
 * @route   GET /api/finance/cash-flow-projections/:id
 * @desc    Obtener proyección por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/cash-flow-projections/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  cashFlowProjectionController.getProjectionById
);

/**
 * @route   POST /api/finance/cash-flow-projections/:id/update-actuals
 * @desc    Actualizar con valores reales
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/cash-flow-projections/:id/update-actuals',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  cashFlowProjectionController.updateWithActuals
);

/**
 * @route   PUT /api/finance/cash-flow-projections/:id
 * @desc    Actualizar proyección
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/cash-flow-projections/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  cashFlowProjectionController.updateProjection
);

/**
 * @route   DELETE /api/finance/cash-flow-projections/:id
 * @desc    Eliminar proyección
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/cash-flow-projections/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  cashFlowProjectionController.deleteProjection
);

// ============================================
// RUTAS DE EXPORTACIÓN
// ============================================

/**
 * @route   GET /api/finance/export/balance-sheet
 * @desc    Exportar Balance General a Excel
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/balance-sheet',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportBalanceSheetToExcel
);

/**
 * @route   GET /api/finance/export/income-statement
 * @desc    Exportar Estado de Resultados a Excel
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/income-statement',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportIncomeStatementToExcel
);

/**
 * @route   GET /api/finance/export/budget-execution/:year
 * @desc    Exportar Ejecución Presupuestaria a Excel
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/budget-execution/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportBudgetExecutionToExcel
);

/**
 * @route   GET /api/finance/export/cash-flow-projection/:year
 * @desc    Exportar Proyección de Flujo de Caja a Excel
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/cash-flow-projection/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportCashFlowProjectionToExcel
);

// ============================================
// RUTAS DE EXPORTACIÓN A PDF
// ============================================

/**
 * @route   GET /api/finance/export/pdf/balance-sheet
 * @desc    Exportar balance general a PDF
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/pdf/balance-sheet',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportBalanceSheetToPDF
);

/**
 * @route   GET /api/finance/export/pdf/income-statement
 * @desc    Exportar estado de resultados a PDF
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/pdf/income-statement',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportIncomeStatementToPDF
);

/**
 * @route   GET /api/finance/export/pdf/budget-execution/:year
 * @desc    Exportar ejecución presupuestaria a PDF
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/pdf/budget-execution/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportBudgetExecutionToPDF
);

/**
 * @route   GET /api/finance/export/pdf/cash-flow-projection/:year
 * @desc    Exportar proyección de flujo de caja a PDF
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/export/pdf/cash-flow-projection/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  exportController.exportCashFlowProjectionToPDF
);

// ============================================
// RUTAS DE CAJAS CHICAS
// ============================================

/**
 * @route   POST /api/finance/petty-cash
 * @desc    Crear caja chica
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/petty-cash',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  pettyCashController.createPettyCash
);

/**
 * @route   GET /api/finance/petty-cash
 * @desc    Obtener todas las cajas chicas
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/petty-cash',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  pettyCashController.getAllPettyCashes
);

/**
 * @route   GET /api/finance/petty-cash/:id
 * @desc    Obtener caja chica por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/petty-cash/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  pettyCashController.getPettyCashById
);

/**
 * @route   GET /api/finance/petty-cash/:id/stats
 * @desc    Obtener estadísticas de caja chica
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/petty-cash/:id/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  pettyCashController.getPettyCashStats
);

/**
 * @route   POST /api/finance/petty-cash/expense
 * @desc    Registrar gasto de caja chica
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/petty-cash/expense',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  pettyCashController.registerExpense
);

/**
 * @route   POST /api/finance/petty-cash/reimbursement
 * @desc    Solicitar reembolso de caja chica
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/petty-cash/reimbursement',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  pettyCashController.requestReimbursement
);

/**
 * @route   POST /api/finance/petty-cash/reimbursement/:id/approve
 * @desc    Aprobar reembolso
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/petty-cash/reimbursement/:id/approve',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  pettyCashController.approveReimbursement
);

/**
 * @route   POST /api/finance/petty-cash/reimbursement/:id/process
 * @desc    Procesar pago de reembolso
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/petty-cash/reimbursement/:id/process',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  pettyCashController.processReimbursement
);

/**
 * @route   POST /api/finance/petty-cash/reimbursement/:id/reject
 * @desc    Rechazar reembolso
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/petty-cash/reimbursement/:id/reject',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  pettyCashController.rejectReimbursement
);

/**
 * @route   POST /api/finance/petty-cash/:id/close
 * @desc    Cerrar caja chica
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/petty-cash/:id/close',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  pettyCashController.closePettyCash
);

/**
 * @route   PUT /api/finance/petty-cash/:id
 * @desc    Actualizar caja chica
 * @access  Private (ADMIN, DIRECTOR)
 */
router.put(
  '/petty-cash/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  pettyCashController.updatePettyCash
);

// ============================================
// RUTAS DE ANTICIPOS A EMPLEADOS
// ============================================

/**
 * @route   POST /api/finance/employee-advances
 * @desc    Solicitar anticipo
 * @access  Private
 */
router.post(
  '/employee-advances',
  authenticate,
  employeeAdvanceController.requestAdvance
);

/**
 * @route   GET /api/finance/employee-advances
 * @desc    Obtener todos los anticipos
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/employee-advances',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  employeeAdvanceController.getAllAdvances
);

/**
 * @route   GET /api/finance/employee-advances/stats
 * @desc    Obtener estadísticas de anticipos
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/employee-advances/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  employeeAdvanceController.getAdvanceStats
);

/**
 * @route   GET /api/finance/employee-advances/:id
 * @desc    Obtener anticipo por ID
 * @access  Private
 */
router.get(
  '/employee-advances/:id',
  authenticate,
  employeeAdvanceController.getAdvanceById
);

/**
 * @route   GET /api/finance/employee-advances/employee/:employeeId/pending
 * @desc    Obtener cuotas pendientes de un empleado
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/employee-advances/employee/:employeeId/pending',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  employeeAdvanceController.getPendingInstallments
);

/**
 * @route   POST /api/finance/employee-advances/:id/approve
 * @desc    Aprobar anticipo
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/employee-advances/:id/approve',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  employeeAdvanceController.approveAdvance
);

/**
 * @route   POST /api/finance/employee-advances/:id/reject
 * @desc    Rechazar anticipo
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/employee-advances/:id/reject',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  employeeAdvanceController.rejectAdvance
);

/**
 * @route   POST /api/finance/employee-advances/:id/disburse
 * @desc    Desembolsar anticipo
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/employee-advances/:id/disburse',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  employeeAdvanceController.disburseAdvance
);

/**
 * @route   POST /api/finance/employee-advances/:id/installment
 * @desc    Registrar descuento de cuota
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/employee-advances/:id/installment',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  employeeAdvanceController.registerInstallmentPayment
);

/**
 * @route   POST /api/finance/employee-advances/:id/cancel
 * @desc    Cancelar anticipo
 * @access  Private (ADMIN, DIRECTOR)
 */
router.post(
  '/employee-advances/:id/cancel',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  employeeAdvanceController.cancelAdvance
);

// ============================================
// RUTAS DE CIERRE CONTABLE
// ============================================

/**
 * @route   GET /api/finance/accounting-closures/validate
 * @desc    Validar pre-cierre
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/accounting-closures/validate',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  accountingClosureController.validatePreClosure
);

/**
 * @route   GET /api/finance/accounting-closures/check
 * @desc    Verificar si período está cerrado
 * @access  Private
 */
router.get(
  '/accounting-closures/check',
  authenticate,
  accountingClosureController.isPeriodClosed
);

/**
 * @route   GET /api/finance/accounting-closures
 * @desc    Obtener cierres
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/accounting-closures',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  accountingClosureController.getClosures
);

/**
 * @route   GET /api/finance/accounting-closures/stats/:year
 * @desc    Obtener estadísticas de cierre
 * @access  Private (ADMIN, DIRECTOR)
 */
router.get(
  '/accounting-closures/stats/:year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  accountingClosureController.getClosureStats
);

/**
 * @route   GET /api/finance/accounting-closures/:id
 * @desc    Obtener cierre por ID
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/accounting-closures/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  accountingClosureController.getClosureById
);

/**
 * @route   POST /api/finance/accounting-closures/month
 * @desc    Cerrar mes
 * @access  Private (ADMIN only)
 */
router.post(
  '/accounting-closures/month',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  accountingClosureController.closeMonth
);

/**
 * @route   POST /api/finance/accounting-closures/year
 * @desc    Cerrar año
 * @access  Private (ADMIN only)
 */
router.post(
  '/accounting-closures/year',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  accountingClosureController.closeYear
);

/**
 * @route   POST /api/finance/accounting-closures/:id/reopen
 * @desc    Reabrir período
 * @access  Private (SUPER_ADMIN only)
 */
router.post(
  '/accounting-closures/:id/reopen',
  authenticate,
  authorize('SUPER_ADMIN'),
  accountingClosureController.reopenPeriod
);

export default router;
