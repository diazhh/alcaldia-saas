/**
 * Servicio para la gestión de tesorería
 * Maneja cuentas bancarias, pagos e ingresos
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

// ============================================
// CUENTAS BANCARIAS
// ============================================

/**
 * Crea una nueva cuenta bancaria
 * @param {Object} accountData - Datos de la cuenta
 * @returns {Promise<Object>} Cuenta creada
 */
export const createBankAccount = async (accountData) => {
  // Verificar que no exista una cuenta con el mismo número
  const existingAccount = await prisma.bankAccount.findUnique({
    where: { accountNumber: accountData.accountNumber },
  });

  if (existingAccount) {
    throw new AppError('Ya existe una cuenta con ese número', 400);
  }

  const bankAccount = await prisma.bankAccount.create({
    data: accountData,
  });

  return bankAccount;
};

/**
 * Obtiene una cuenta bancaria por ID
 * @param {string} id - ID de la cuenta
 * @returns {Promise<Object>} Cuenta encontrada
 */
export const getBankAccountById = async (id) => {
  const bankAccount = await prisma.bankAccount.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          payments: true,
          incomes: true,
        },
      },
    },
  });

  if (!bankAccount) {
    throw new AppError('Cuenta bancaria no encontrada', 404);
  }

  return bankAccount;
};

/**
 * Lista todas las cuentas bancarias
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de cuentas
 */
export const getAllBankAccounts = async (filters = {}) => {
  const { isActive, currency } = filters;

  const where = {};
  if (isActive !== undefined) where.isActive = isActive;
  if (currency) where.currency = currency;

  const bankAccounts = await prisma.bankAccount.findMany({
    where,
    include: {
      _count: {
        select: {
          payments: true,
          incomes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bankAccounts;
};

/**
 * Actualiza una cuenta bancaria
 * @param {string} id - ID de la cuenta
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Cuenta actualizada
 */
export const updateBankAccount = async (id, updateData) => {
  const existingAccount = await prisma.bankAccount.findUnique({
    where: { id },
  });

  if (!existingAccount) {
    throw new AppError('Cuenta bancaria no encontrada', 404);
  }

  const bankAccount = await prisma.bankAccount.update({
    where: { id },
    data: updateData,
  });

  return bankAccount;
};

/**
 * Actualiza el saldo de una cuenta bancaria
 * @param {string} accountId - ID de la cuenta
 * @param {number} amount - Monto a sumar (positivo) o restar (negativo)
 * @returns {Promise<Object>} Cuenta actualizada
 */
export const updateBankAccountBalance = async (accountId, amount) => {
  const account = await prisma.bankAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError('Cuenta bancaria no encontrada', 404);
  }

  const newBalance = Number(account.balance) + amount;

  if (newBalance < 0) {
    throw new AppError('El saldo de la cuenta no puede ser negativo', 400);
  }

  const updatedAccount = await prisma.bankAccount.update({
    where: { id: accountId },
    data: { balance: newBalance },
  });

  return updatedAccount;
};

// ============================================
// PAGOS
// ============================================

/**
 * Genera un número de referencia único para pagos
 * @returns {Promise<string>} Número de referencia
 */
const generatePaymentReference = async () => {
  const year = new Date().getFullYear();
  const prefix = 'PAG';
  
  const count = await prisma.payment.count({
    where: {
      reference: {
        startsWith: `${prefix}-${year}`,
      },
    },
  });

  const sequence = (count + 1).toString().padStart(5, '0');
  return `${prefix}-${year}-${sequence}`;
};

/**
 * Crea un nuevo pago
 * @param {Object} paymentData - Datos del pago
 * @param {string} userId - ID del usuario que crea el pago
 * @returns {Promise<Object>} Pago creado
 */
export const createPayment = async (paymentData, userId) => {
  // Verificar que la cuenta bancaria existe y tiene saldo suficiente
  if (paymentData.bankAccountId) {
    const account = await prisma.bankAccount.findUnique({
      where: { id: paymentData.bankAccountId },
    });

    if (!account) {
      throw new AppError('Cuenta bancaria no encontrada', 404);
    }

    if (!account.isActive) {
      throw new AppError('La cuenta bancaria no está activa', 400);
    }

    if (Number(account.balance) < paymentData.amount) {
      throw new AppError('Saldo insuficiente en la cuenta bancaria', 400);
    }
  }

  // Generar referencia única
  const reference = await generatePaymentReference();

  const payment = await prisma.payment.create({
    data: {
      ...paymentData,
      reference,
      createdBy: userId,
    },
    include: {
      bankAccount: {
        select: {
          bankName: true,
          accountNumber: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Obtiene un pago por ID
 * @param {string} id - ID del pago
 * @returns {Promise<Object>} Pago encontrado
 */
export const getPaymentById = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      bankAccount: {
        select: {
          bankName: true,
          accountNumber: true,
          currency: true,
        },
      },
      transaction: {
        select: {
          reference: true,
          concept: true,
          budgetItem: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Pago no encontrado', 404);
  }

  return payment;
};

/**
 * Lista pagos con filtros
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} Lista paginada de pagos
 */
export const getPayments = async (filters = {}) => {
  const {
    status,
    bankAccountId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
  if (status) where.status = status;
  if (bankAccountId) where.bankAccountId = bankAccountId;
  
  if (startDate || endDate) {
    where.paymentDate = {};
    if (startDate) where.paymentDate.gte = new Date(startDate);
    if (endDate) where.paymentDate.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { beneficiary: { contains: search, mode: 'insensitive' } },
      { concept: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Actualiza el estado de un pago
 * @param {string} id - ID del pago
 * @param {string} newStatus - Nuevo estado
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Pago actualizado
 */
export const updatePaymentStatus = async (id, newStatus, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      bankAccount: true,
    },
  });

  if (!payment) {
    throw new AppError('Pago no encontrado', 404);
  }

  const updateData = {
    status: newStatus,
  };

  if (newStatus === 'APPROVED') {
    updateData.approvedBy = userId;
  } else if (newStatus === 'PROCESSED' || newStatus === 'COMPLETED') {
    updateData.processedAt = new Date();
  }

  // Si se completa el pago, descontar del saldo de la cuenta
  const updatedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.payment.update({
      where: { id },
      data: updateData,
      include: {
        bankAccount: true,
      },
    });

    // Descontar del saldo si se completa el pago
    if (newStatus === 'COMPLETED' && payment.status !== 'COMPLETED' && payment.bankAccountId) {
      await updateBankAccountBalance(payment.bankAccountId, -payment.amount);
    }

    // Revertir descuento si se cancela o rechaza
    if ((newStatus === 'CANCELLED' || newStatus === 'REJECTED') && 
        payment.status === 'COMPLETED' && payment.bankAccountId) {
      await updateBankAccountBalance(payment.bankAccountId, payment.amount);
    }

    return updated;
  });

  return updatedPayment;
};

// ============================================
// INGRESOS
// ============================================

/**
 * Genera un número de referencia único para ingresos
 * @returns {Promise<string>} Número de referencia
 */
const generateIncomeReference = async () => {
  const year = new Date().getFullYear();
  const prefix = 'ING';
  
  const count = await prisma.income.count({
    where: {
      reference: {
        startsWith: `${prefix}-${year}`,
      },
    },
  });

  const sequence = (count + 1).toString().padStart(5, '0');
  return `${prefix}-${year}-${sequence}`;
};

/**
 * Registra un nuevo ingreso
 * @param {Object} incomeData - Datos del ingreso
 * @param {string} userId - ID del usuario que registra
 * @returns {Promise<Object>} Ingreso registrado
 */
export const createIncome = async (incomeData, userId) => {
  // Verificar que la cuenta bancaria existe
  const account = await prisma.bankAccount.findUnique({
    where: { id: incomeData.bankAccountId },
  });

  if (!account) {
    throw new AppError('Cuenta bancaria no encontrada', 404);
  }

  if (!account.isActive) {
    throw new AppError('La cuenta bancaria no está activa', 400);
  }

  // Generar referencia única
  const reference = await generateIncomeReference();

  // Crear ingreso y actualizar saldo en transacción
  const income = await prisma.$transaction(async (tx) => {
    const newIncome = await tx.income.create({
      data: {
        ...incomeData,
        reference,
        registeredBy: userId,
      },
      include: {
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
          },
        },
      },
    });

    // Actualizar saldo de la cuenta
    await updateBankAccountBalance(incomeData.bankAccountId, incomeData.amount);

    return newIncome;
  });

  return income;
};

/**
 * Obtiene un ingreso por ID
 * @param {string} id - ID del ingreso
 * @returns {Promise<Object>} Ingreso encontrado
 */
export const getIncomeById = async (id) => {
  const income = await prisma.income.findUnique({
    where: { id },
    include: {
      bankAccount: {
        select: {
          bankName: true,
          accountNumber: true,
          currency: true,
        },
      },
    },
  });

  if (!income) {
    throw new AppError('Ingreso no encontrado', 404);
  }

  return income;
};

/**
 * Lista ingresos con filtros
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} Lista paginada de ingresos
 */
export const getIncomes = async (filters = {}) => {
  const {
    type,
    bankAccountId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
  if (type) where.type = type;
  if (bankAccountId) where.bankAccountId = bankAccountId;
  
  if (startDate || endDate) {
    where.incomeDate = {};
    if (startDate) where.incomeDate.gte = new Date(startDate);
    if (endDate) where.incomeDate.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { concept: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [incomes, total] = await Promise.all([
    prisma.income.findMany({
      where,
      include: {
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
          },
        },
      },
      orderBy: { incomeDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.income.count({ where }),
  ]);

  return {
    incomes,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene el flujo de caja (ingresos vs egresos)
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} Flujo de caja
 */
export const getCashFlow = async (filters = {}) => {
  const { startDate, endDate, bankAccountId } = filters;

  const where = {};
  if (bankAccountId) where.bankAccountId = bankAccountId;

  const dateFilter = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate);

  const [totalIncomes, totalPayments] = await Promise.all([
    prisma.income.aggregate({
      where: {
        ...where,
        ...(Object.keys(dateFilter).length > 0 && { incomeDate: dateFilter }),
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.payment.aggregate({
      where: {
        ...where,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { paymentDate: dateFilter }),
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const incomes = Number(totalIncomes._sum.amount || 0);
  const payments = Number(totalPayments._sum.amount || 0);
  const netCashFlow = incomes - payments;

  return {
    incomes,
    payments,
    netCashFlow,
    period: {
      startDate,
      endDate,
    },
  };
};
