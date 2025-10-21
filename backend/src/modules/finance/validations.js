/**
 * Validaciones para el módulo de Finanzas
 * Utiliza Zod para validar los datos de entrada
 */

import { z } from 'zod';

// ============================================
// VALIDACIONES PARA PRESUPUESTO
// ============================================

/**
 * Schema para crear un presupuesto anual
 */
export const createBudgetSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  totalAmount: z.number().positive(),
  estimatedIncome: z.number().positive(),
  incomeSource: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema para actualizar un presupuesto
 */
export const updateBudgetSchema = z.object({
  totalAmount: z.number().positive().optional(),
  estimatedIncome: z.number().positive().optional(),
  incomeSource: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'CLOSED']).optional(),
});

/**
 * Schema para aprobar un presupuesto
 */
export const approveBudgetSchema = z.object({
  approvedBy: z.string().uuid(),
});

// ============================================
// VALIDACIONES PARA PARTIDAS PRESUPUESTARIAS
// ============================================

/**
 * Schema para crear una partida presupuestaria
 */
export const createBudgetItemSchema = z.object({
  budgetId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  allocatedAmount: z.number().positive(),
  departmentId: z.string().uuid().optional(),
  category: z.string().optional(),
});

/**
 * Schema para actualizar una partida presupuestaria
 */
export const updateBudgetItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  allocatedAmount: z.number().positive().optional(),
  departmentId: z.string().uuid().optional(),
  category: z.string().optional(),
});

// ============================================
// VALIDACIONES PARA MODIFICACIONES PRESUPUESTARIAS
// ============================================

/**
 * Schema para crear una modificación presupuestaria
 */
export const createBudgetModificationSchema = z.object({
  budgetId: z.string().uuid(),
  type: z.enum(['CREDITO_ADICIONAL', 'TRASPASO', 'RECTIFICACION', 'REDUCCION']),
  reference: z.string().min(1).max(100),
  description: z.string().min(1),
  amount: z.number().positive(),
  justification: z.string().min(10),
});

/**
 * Schema para aprobar/rechazar una modificación presupuestaria
 */
export const updateModificationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  approvedBy: z.string().uuid(),
});

// ============================================
// VALIDACIONES PARA TRANSACCIONES
// ============================================

/**
 * Schema para crear una transacción (compromiso)
 */
export const createTransactionSchema = z.object({
  type: z.enum(['GASTO', 'INGRESO', 'TRANSFERENCIA', 'AJUSTE']),
  amount: z.number().positive(),
  budgetItemId: z.string().uuid().optional(),
  concept: z.string().min(1).max(255),
  description: z.string().optional(),
  beneficiary: z.string().min(1).max(255),
  beneficiaryId: z.string().uuid().optional(),
  invoiceNumber: z.string().optional(),
  contractNumber: z.string().optional(),
  purchaseOrder: z.string().optional(),
});

/**
 * Schema para actualizar el estado de una transacción
 */
export const updateTransactionStatusSchema = z.object({
  status: z.enum(['COMPROMISO', 'CAUSADO', 'PAGADO', 'ANULADO']),
  approvedBy: z.string().uuid().optional(),
});

// ============================================
// VALIDACIONES PARA CUENTAS BANCARIAS
// ============================================

/**
 * Schema para crear una cuenta bancaria
 */
export const createBankAccountSchema = z.object({
  bankName: z.string().min(1).max(255),
  accountNumber: z.string().min(1).max(50),
  accountType: z.enum(['CORRIENTE', 'AHORRO', 'ESPECIAL']),
  currency: z.string().length(3).default('VES'),
  balance: z.number().default(0),
  description: z.string().optional(),
});

/**
 * Schema para actualizar una cuenta bancaria
 */
export const updateBankAccountSchema = z.object({
  bankName: z.string().min(1).max(255).optional(),
  accountType: z.enum(['CORRIENTE', 'AHORRO', 'ESPECIAL']).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// VALIDACIONES PARA PAGOS
// ============================================

/**
 * Schema para crear un pago
 */
export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.enum(['TRANSFERENCIA', 'CHEQUE', 'EFECTIVO', 'DOMICILIACION']),
  bankAccountId: z.string().uuid().optional(),
  beneficiary: z.string().min(1).max(255),
  beneficiaryAccount: z.string().optional(),
  beneficiaryBank: z.string().optional(),
  concept: z.string().min(1).max(255),
  notes: z.string().optional(),
  paymentDate: z.string().datetime().or(z.date()),
});

/**
 * Schema para actualizar el estado de un pago
 */
export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSED', 'COMPLETED', 'REJECTED', 'CANCELLED']),
  approvedBy: z.string().uuid().optional(),
});

// ============================================
// VALIDACIONES PARA INGRESOS
// ============================================

/**
 * Schema para registrar un ingreso
 */
export const createIncomeSchema = z.object({
  type: z.enum(['SITUADO', 'TRIBUTOS', 'TRANSFERENCIA', 'MULTAS', 'TASAS', 'OTROS']),
  amount: z.number().positive(),
  bankAccountId: z.string().uuid(),
  concept: z.string().min(1).max(255),
  description: z.string().optional(),
  source: z.string().min(1).max(255),
  incomeDate: z.string().datetime().or(z.date()),
});

// ============================================
// VALIDACIONES PARA ASIENTOS CONTABLES
// ============================================

/**
 * Schema para crear un asiento contable
 */
export const createAccountingEntrySchema = z.object({
  date: z.string().datetime().or(z.date()),
  description: z.string().min(1).max(255),
  transactionId: z.string().uuid().optional(),
  incomeId: z.string().uuid().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  details: z.array(
    z.object({
      accountCode: z.string().min(1).max(50),
      accountName: z.string().min(1).max(255),
      debit: z.number().min(0).default(0),
      credit: z.number().min(0).default(0),
      description: z.string().optional(),
    })
  ).min(2), // Al menos 2 detalles (debe y haber)
});

// ============================================
// VALIDACIONES PARA REPORTES
// ============================================

/**
 * Schema para generar reportes financieros
 */
export const generateReportSchema = z.object({
  reportType: z.enum(['BALANCE_GENERAL', 'ESTADO_RESULTADOS', 'BALANCE_COMPROBACION', 'ONAPRE_1013', 'ONAPRE_2345', 'ONAPRE_3001']),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  format: z.enum(['PDF', 'EXCEL']).default('PDF'),
  budgetId: z.string().uuid().optional(),
});

/**
 * Schema para consultar disponibilidad presupuestaria
 */
export const checkBudgetAvailabilitySchema = z.object({
  budgetItemId: z.string().uuid(),
  amount: z.number().positive(),
});
