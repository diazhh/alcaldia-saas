/**
 * Rutas del módulo de Finanzas
 */

import express from 'express';
import * as budgetController from './controllers/budgetController.js';
import * as budgetItemController from './controllers/budgetItemController.js';
import * as transactionController from './controllers/transactionController.js';
import * as treasuryController from './controllers/treasuryController.js';
import * as accountingController from './controllers/accountingController.js';
import * as reportsController from './controllers/reportsController.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  approveBudgetSchema,
  createBudgetItemSchema,
  updateBudgetItemSchema,
  createTransactionSchema,
  updateTransactionStatusSchema,
  createBankAccountSchema,
  updateBankAccountSchema,
  createPaymentSchema,
  updatePaymentStatusSchema,
  createIncomeSchema,
  checkBudgetAvailabilitySchema,
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

export default router;
