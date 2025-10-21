/**
 * Controlador para la gestión de tesorería
 */

import * as treasuryService from '../services/treasury.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

// ============================================
// CUENTAS BANCARIAS
// ============================================

/**
 * Crea una nueva cuenta bancaria
 * @route POST /api/finance/bank-accounts
 */
export const createBankAccount = async (req, res) => {
  try {
    const bankAccount = await treasuryService.createBankAccount(req.body);
    
    return successResponse(res, bankAccount, 'Cuenta bancaria creada exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene una cuenta bancaria por ID
 * @route GET /api/finance/bank-accounts/:id
 */
export const getBankAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const bankAccount = await treasuryService.getBankAccountById(id);
    
    return successResponse(res, bankAccount, 'Cuenta bancaria obtenida exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};

/**
 * Lista todas las cuentas bancarias
 * @route GET /api/finance/bank-accounts
 */
export const getAllBankAccounts = async (req, res) => {
  try {
    const { isActive, currency } = req.query;
    
    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (currency) filters.currency = currency;
    
    const bankAccounts = await treasuryService.getAllBankAccounts(filters);
    
    return successResponse(res, bankAccounts, 'Cuentas bancarias obtenidas exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Actualiza una cuenta bancaria
 * @route PUT /api/finance/bank-accounts/:id
 */
export const updateBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const bankAccount = await treasuryService.updateBankAccount(id, req.body);
    
    return successResponse(res, bankAccount, 'Cuenta bancaria actualizada exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

// ============================================
// PAGOS
// ============================================

/**
 * Crea un nuevo pago
 * @route POST /api/finance/payments
 */
export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const payment = await treasuryService.createPayment(req.body, userId);
    
    return successResponse(res, payment, 'Pago creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene un pago por ID
 * @route GET /api/finance/payments/:id
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await treasuryService.getPaymentById(id);
    
    return successResponse(res, payment, 'Pago obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};

/**
 * Lista pagos con filtros y paginación
 * @route GET /api/finance/payments
 */
export const getPayments = async (req, res) => {
  try {
    const {
      status,
      bankAccountId,
      startDate,
      endDate,
      search,
      page,
      limit,
    } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (bankAccountId) filters.bankAccountId = bankAccountId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (search) filters.search = search;
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    
    const result = await treasuryService.getPayments(filters);
    
    return successResponse(res, result, 'Pagos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

/**
 * Actualiza el estado de un pago
 * @route PATCH /api/finance/payments/:id/status
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const payment = await treasuryService.updatePaymentStatus(id, status, userId);
    
    return successResponse(res, payment, 'Estado del pago actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

// ============================================
// INGRESOS
// ============================================

/**
 * Registra un nuevo ingreso
 * @route POST /api/finance/incomes
 */
export const createIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await treasuryService.createIncome(req.body, userId);
    
    return successResponse(res, income, 'Ingreso registrado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 400);
  }
};

/**
 * Obtiene un ingreso por ID
 * @route GET /api/finance/incomes/:id
 */
export const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await treasuryService.getIncomeById(id);
    
    return successResponse(res, income, 'Ingreso obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || 404);
  }
};

/**
 * Lista ingresos con filtros y paginación
 * @route GET /api/finance/incomes
 */
export const getIncomes = async (req, res) => {
  try {
    const {
      type,
      bankAccountId,
      startDate,
      endDate,
      search,
      page,
      limit,
    } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (bankAccountId) filters.bankAccountId = bankAccountId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (search) filters.search = search;
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);
    
    const result = await treasuryService.getIncomes(filters);
    
    return successResponse(res, result, 'Ingresos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// ============================================
// FLUJO DE CAJA
// ============================================

/**
 * Obtiene el flujo de caja
 * @route GET /api/finance/cash-flow
 */
export const getCashFlow = async (req, res) => {
  try {
    const { startDate, endDate, bankAccountId } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (bankAccountId) filters.bankAccountId = bankAccountId;
    
    const cashFlow = await treasuryService.getCashFlow(filters);
    
    return successResponse(res, cashFlow, 'Flujo de caja obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
