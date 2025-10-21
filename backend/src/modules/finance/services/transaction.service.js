/**
 * Servicio para la gestión de transacciones financieras
 * Implementa el ciclo del gasto: COMPROMISO → CAUSADO → PAGADO
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';
import { checkBudgetAvailability, updateBudgetItemAmounts } from './budgetItem.service.js';

/**
 * Genera un número de referencia único para transacciones
 * @param {string} type - Tipo de transacción
 * @returns {Promise<string>} Número de referencia
 */
const generateTransactionReference = async (type) => {
  const year = new Date().getFullYear();
  const prefix = type === 'GASTO' ? 'TRX-G' : type === 'INGRESO' ? 'TRX-I' : 'TRX';
  
  // Contar transacciones del año actual
  const count = await prisma.transaction.count({
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
 * Crea una nueva transacción (COMPROMISO)
 * @param {Object} transactionData - Datos de la transacción
 * @param {string} userId - ID del usuario que crea la transacción
 * @returns {Promise<Object>} Transacción creada
 */
export const createTransaction = async (transactionData, userId) => {
  // Si es un gasto, verificar disponibilidad presupuestaria
  if (transactionData.type === 'GASTO' && transactionData.budgetItemId) {
    const availability = await checkBudgetAvailability(
      transactionData.budgetItemId,
      transactionData.amount
    );

    if (!availability.available) {
      throw new AppError(
        `No hay disponibilidad presupuestaria suficiente. ${availability.reason}`,
        400
      );
    }
  }

  // Generar referencia única
  const reference = await generateTransactionReference(transactionData.type);

  // Crear la transacción en estado COMPROMISO
  const transaction = await prisma.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: {
        ...transactionData,
        reference,
        status: 'COMPROMISO',
        committedAt: new Date(),
        createdBy: userId,
      },
      include: {
        budgetItem: {
          select: {
            code: true,
            name: true,
            availableAmount: true,
          },
        },
      },
    });

    // Si es un gasto, actualizar la partida presupuestaria
    if (transactionData.type === 'GASTO' && transactionData.budgetItemId) {
      await updateBudgetItemAmounts(
        transactionData.budgetItemId,
        'commit',
        transactionData.amount
      );
    }

    return newTransaction;
  });

  return transaction;
};

/**
 * Obtiene una transacción por ID
 * @param {string} id - ID de la transacción
 * @returns {Promise<Object>} Transacción encontrada
 */
export const getTransactionById = async (id) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      budgetItem: {
        select: {
          code: true,
          name: true,
          budget: {
            select: {
              year: true,
            },
          },
        },
      },
      payment: true,
      accountingEntries: {
        include: {
          details: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new AppError('Transacción no encontrada', 404);
  }

  return transaction;
};

/**
 * Lista transacciones con filtros
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} Lista paginada de transacciones
 */
export const getTransactions = async (filters = {}) => {
  const {
    type,
    status,
    budgetItemId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (budgetItemId) where.budgetItemId = budgetItemId;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { concept: { contains: search, mode: 'insensitive' } },
      { beneficiary: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        budgetItem: {
          select: {
            code: true,
            name: true,
          },
        },
        payment: {
          select: {
            reference: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Actualiza el estado de una transacción (ciclo del gasto)
 * @param {string} id - ID de la transacción
 * @param {string} newStatus - Nuevo estado
 * @param {string} userId - ID del usuario que actualiza
 * @returns {Promise<Object>} Transacción actualizada
 */
export const updateTransactionStatus = async (id, newStatus, userId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      budgetItem: true,
    },
  });

  if (!transaction) {
    throw new AppError('Transacción no encontrada', 404);
  }

  // Validar transiciones de estado válidas
  const validTransitions = {
    COMPROMISO: ['CAUSADO', 'ANULADO'],
    CAUSADO: ['PAGADO', 'ANULADO'],
    PAGADO: [],
    ANULADO: [],
  };

  if (!validTransitions[transaction.status].includes(newStatus)) {
    throw new AppError(
      `No se puede cambiar de ${transaction.status} a ${newStatus}`,
      400
    );
  }

  const updateData = {
    status: newStatus,
    approvedBy: userId,
  };

  // Actualizar fechas según el estado
  if (newStatus === 'CAUSADO') {
    updateData.accruedAt = new Date();
  } else if (newStatus === 'PAGADO') {
    updateData.paidAt = new Date();
  }

  // Ejecutar actualización en transacción
  const updatedTransaction = await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id },
      data: updateData,
      include: {
        budgetItem: true,
        payment: true,
      },
    });

    // Actualizar montos de la partida presupuestaria
    if (transaction.budgetItemId) {
      if (newStatus === 'CAUSADO') {
        await updateBudgetItemAmounts(
          transaction.budgetItemId,
          'accrue',
          transaction.amount
        );
      } else if (newStatus === 'PAGADO') {
        await updateBudgetItemAmounts(
          transaction.budgetItemId,
          'pay',
          transaction.amount
        );
      } else if (newStatus === 'ANULADO') {
        // Liberar el compromiso
        await updateBudgetItemAmounts(
          transaction.budgetItemId,
          'cancel',
          transaction.amount
        );
      }
    }

    return updated;
  });

  return updatedTransaction;
};

/**
 * Causa una transacción (COMPROMISO → CAUSADO)
 * @param {string} id - ID de la transacción
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Transacción causada
 */
export const accrueTransaction = async (id, userId) => {
  return updateTransactionStatus(id, 'CAUSADO', userId);
};

/**
 * Paga una transacción (CAUSADO → PAGADO)
 * @param {string} id - ID de la transacción
 * @param {string} userId - ID del usuario
 * @param {string} paymentId - ID del pago asociado
 * @returns {Promise<Object>} Transacción pagada
 */
export const payTransaction = async (id, userId, paymentId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new AppError('Transacción no encontrada', 404);
  }

  if (transaction.status !== 'CAUSADO') {
    throw new AppError('Solo se pueden pagar transacciones causadas', 400);
  }

  const updatedTransaction = await prisma.$transaction(async (tx) => {
    const updated = await tx.transaction.update({
      where: { id },
      data: {
        status: 'PAGADO',
        paidAt: new Date(),
        paymentId,
        approvedBy: userId,
      },
      include: {
        budgetItem: true,
        payment: true,
      },
    });

    // Actualizar monto pagado en la partida
    if (transaction.budgetItemId) {
      await updateBudgetItemAmounts(
        transaction.budgetItemId,
        'pay',
        transaction.amount
      );
    }

    return updated;
  });

  return updatedTransaction;
};

/**
 * Anula una transacción
 * @param {string} id - ID de la transacción
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Transacción anulada
 */
export const cancelTransaction = async (id, userId) => {
  return updateTransactionStatus(id, 'ANULADO', userId);
};

/**
 * Obtiene estadísticas de transacciones
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} Estadísticas
 */
export const getTransactionStats = async (filters = {}) => {
  const { budgetId, startDate, endDate } = filters;

  const where = {};
  
  if (budgetId) {
    where.budgetItem = {
      budgetId,
    };
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [byStatus, byType] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        amount: true,
      },
    }),
    prisma.transaction.groupBy({
      by: ['type'],
      where,
      _count: true,
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    byStatus,
    byType,
  };
};
