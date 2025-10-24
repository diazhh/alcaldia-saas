/**
 * Servicio de Conciliación Bancaria
 * Maneja la conciliación de cuentas bancarias con estados de cuenta
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Crear una nueva conciliación bancaria
 */
async function createReconciliation(data, userId) {
  const {
    bankAccountId,
    reconciliationDate,
    periodStart,
    periodEnd,
    statementBalance,
    notes,
    attachmentUrl,
  } = data;

  // Verificar que la cuenta bancaria existe
  const bankAccount = await prisma.bankAccount.findUnique({
    where: { id: bankAccountId },
  });

  if (!bankAccount) {
    throw new AppError('Cuenta bancaria no encontrada', 404);
  }

  // Verificar que no exista una conciliación para la misma fecha
  const existingReconciliation = await prisma.bankReconciliation.findUnique({
    where: {
      bankAccountId_reconciliationDate: {
        bankAccountId,
        reconciliationDate: new Date(reconciliationDate),
      },
    },
  });

  if (existingReconciliation) {
    throw new AppError('Ya existe una conciliación para esta fecha', 400);
  }

  // Calcular el saldo según libros (balance actual de la cuenta)
  const bookBalance = bankAccount.balance;

  // Crear la conciliación
  const reconciliation = await prisma.bankReconciliation.create({
    data: {
      bankAccountId,
      reconciliationDate: new Date(reconciliationDate),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      statementBalance: parseFloat(statementBalance),
      bookBalance,
      adjustedBalance: bookBalance, // Inicialmente igual al saldo en libros
      totalDifference: parseFloat(statementBalance) - bookBalance,
      status: 'IN_PROGRESS',
      reconciledBy: userId,
      notes,
      attachmentUrl,
    },
    include: {
      bankAccount: true,
    },
  });

  return reconciliation;
}

/**
 * Obtener conciliaciones con filtros
 */
async function getReconciliations(filters = {}) {
  const { bankAccountId, status, startDate, endDate } = filters;

  const where = {};

  if (bankAccountId) {
    where.bankAccountId = bankAccountId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.reconciliationDate = {};
    if (startDate) where.reconciliationDate.gte = new Date(startDate);
    if (endDate) where.reconciliationDate.lte = new Date(endDate);
  }

  const reconciliations = await prisma.bankReconciliation.findMany({
    where,
    include: {
      bankAccount: true,
      items: {
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { reconciliationDate: 'desc' },
  });

  return reconciliations;
}

/**
 * Obtener una conciliación por ID
 */
async function getReconciliationById(id) {
  const reconciliation = await prisma.bankReconciliation.findUnique({
    where: { id },
    include: {
      bankAccount: true,
      items: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!reconciliation) {
    throw new AppError('Conciliación no encontrada', 404);
  }

  return reconciliation;
}

/**
 * Agregar partida a la conciliación
 */
async function addReconciliationItem(reconciliationId, itemData) {
  const { type, date, reference, description, amount, transactionId, paymentId, incomeId, notes } =
    itemData;

  // Verificar que la conciliación existe y está en progreso
  const reconciliation = await prisma.bankReconciliation.findUnique({
    where: { id: reconciliationId },
  });

  if (!reconciliation) {
    throw new AppError('Conciliación no encontrada', 404);
  }

  if (reconciliation.status !== 'IN_PROGRESS') {
    throw new AppError('Solo se pueden agregar partidas a conciliaciones en progreso', 400);
  }

  // Crear la partida
  const item = await prisma.reconciliationItem.create({
    data: {
      reconciliationId,
      type,
      date: new Date(date),
      reference,
      description,
      amount: parseFloat(amount),
      transactionId,
      paymentId,
      incomeId,
      notes,
    },
  });

  // Recalcular estadísticas de la conciliación
  await recalculateReconciliationStats(reconciliationId);

  return item;
}

/**
 * Marcar partida como conciliada
 */
async function reconcileItem(itemId) {
  const item = await prisma.reconciliationItem.findUnique({
    where: { id: itemId },
    include: { reconciliation: true },
  });

  if (!item) {
    throw new AppError('Partida no encontrada', 404);
  }

  if (item.reconciliation.status !== 'IN_PROGRESS') {
    throw new AppError('Solo se pueden conciliar partidas en conciliaciones en progreso', 400);
  }

  const updatedItem = await prisma.reconciliationItem.update({
    where: { id: itemId },
    data: {
      isReconciled: true,
      reconciledAt: new Date(),
    },
  });

  // Recalcular estadísticas
  await recalculateReconciliationStats(item.reconciliationId);

  return updatedItem;
}

/**
 * Eliminar partida de conciliación
 */
async function deleteReconciliationItem(itemId) {
  const item = await prisma.reconciliationItem.findUnique({
    where: { id: itemId },
    include: { reconciliation: true },
  });

  if (!item) {
    throw new AppError('Partida no encontrada', 404);
  }

  if (item.reconciliation.status !== 'IN_PROGRESS') {
    throw new AppError('Solo se pueden eliminar partidas de conciliaciones en progreso', 400);
  }

  await prisma.reconciliationItem.delete({
    where: { id: itemId },
  });

  // Recalcular estadísticas
  await recalculateReconciliationStats(item.reconciliationId);

  return { message: 'Partida eliminada exitosamente' };
}

/**
 * Completar conciliación
 */
async function completeReconciliation(id) {
  const reconciliation = await prisma.bankReconciliation.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!reconciliation) {
    throw new AppError('Conciliación no encontrada', 404);
  }

  if (reconciliation.status !== 'IN_PROGRESS') {
    throw new AppError('La conciliación ya fue completada', 400);
  }

  // Verificar que todas las partidas estén conciliadas
  const unreconciledItems = reconciliation.items.filter((item) => !item.isReconciled);

  if (unreconciledItems.length > 0) {
    throw new AppError(
      `Hay ${unreconciledItems.length} partidas sin conciliar. Debe conciliar todas las partidas antes de completar.`,
      400
    );
  }

  // Actualizar estado
  const updated = await prisma.bankReconciliation.update({
    where: { id },
    data: {
      status: 'COMPLETED',
    },
    include: {
      bankAccount: true,
      items: true,
    },
  });

  return updated;
}

/**
 * Aprobar conciliación
 */
async function approveReconciliation(id, userId) {
  const reconciliation = await prisma.bankReconciliation.findUnique({
    where: { id },
  });

  if (!reconciliation) {
    throw new AppError('Conciliación no encontrada', 404);
  }

  if (reconciliation.status !== 'COMPLETED') {
    throw new AppError('Solo se pueden aprobar conciliaciones completadas', 400);
  }

  // Actualizar estado
  const updated = await prisma.bankReconciliation.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    },
    include: {
      bankAccount: true,
      items: true,
    },
  });

  return updated;
}

/**
 * Rechazar conciliación
 */
async function rejectReconciliation(id, reason) {
  const reconciliation = await prisma.bankReconciliation.findUnique({
    where: { id },
  });

  if (!reconciliation) {
    throw new AppError('Conciliación no encontrada', 404);
  }

  if (reconciliation.status === 'APPROVED') {
    throw new AppError('No se puede rechazar una conciliación aprobada', 400);
  }

  // Actualizar estado y agregar razón en notas
  const updated = await prisma.bankReconciliation.update({
    where: { id },
    data: {
      status: 'REJECTED',
      notes: `${reconciliation.notes || ''}\n\nRECHAZADA: ${reason}`,
    },
    include: {
      bankAccount: true,
      items: true,
    },
  });

  return updated;
}

/**
 * Cargar transacciones automáticamente desde el sistema
 */
async function loadSystemTransactions(reconciliationId) {
  const reconciliation = await prisma.bankReconciliation.findUnique({
    where: { id: reconciliationId },
  });

  if (!reconciliation) {
    throw new AppError('Conciliación no encontrada', 404);
  }

  if (reconciliation.status !== 'IN_PROGRESS') {
    throw new AppError('Solo se pueden cargar transacciones en conciliaciones en progreso', 400);
  }

  // Obtener pagos del período
  const payments = await prisma.payment.findMany({
    where: {
      bankAccountId: reconciliation.bankAccountId,
      paymentDate: {
        gte: reconciliation.periodStart,
        lte: reconciliation.periodEnd,
      },
      status: 'COMPLETED',
    },
  });

  // Obtener ingresos del período
  const incomes = await prisma.income.findMany({
    where: {
      bankAccountId: reconciliation.bankAccountId,
      incomeDate: {
        gte: reconciliation.periodStart,
        lte: reconciliation.periodEnd,
      },
    },
  });

  // Crear partidas para pagos
  const paymentItems = payments.map((payment) => ({
    reconciliationId,
    type: 'BOOK_ONLY',
    date: payment.paymentDate,
    reference: payment.reference,
    description: `Pago: ${payment.concept}`,
    amount: payment.amount * -1, // Negativo porque es egreso
    paymentId: payment.id,
  }));

  // Crear partidas para ingresos
  const incomeItems = incomes.map((income) => ({
    reconciliationId,
    type: 'BOOK_ONLY',
    date: income.incomeDate,
    reference: income.reference,
    description: `Ingreso: ${income.concept}`,
    amount: income.amount,
    incomeId: income.id,
  }));

  // Insertar todas las partidas
  const allItems = [...paymentItems, ...incomeItems];
  await prisma.reconciliationItem.createMany({
    data: allItems,
  });

  // Recalcular estadísticas
  await recalculateReconciliationStats(reconciliationId);

  return {
    message: 'Transacciones cargadas exitosamente',
    paymentsLoaded: payments.length,
    incomesLoaded: incomes.length,
    totalItems: allItems.length,
  };
}

/**
 * Recalcular estadísticas de la conciliación
 */
async function recalculateReconciliationStats(reconciliationId) {
  const items = await prisma.reconciliationItem.findMany({
    where: { reconciliationId },
  });

  const stats = {
    itemsInTransit: items.filter((i) => i.type === 'IN_TRANSIT').length,
    bankOnlyItems: items.filter((i) => i.type === 'BANK_ONLY').length,
    bookOnlyItems: items.filter((i) => i.type === 'BOOK_ONLY').length,
  };

  // Calcular saldo ajustado
  const reconciliation = await prisma.bankReconciliation.findUnique({
    where: { id: reconciliationId },
  });

  let adjustedBalance = reconciliation.bookBalance;

  // Sumar partidas solo en banco (depósitos no registrados)
  const bankOnlySum = items
    .filter((i) => i.type === 'BANK_ONLY')
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);

  // Restar partidas solo en libros (cheques no cobrados)
  const bookOnlySum = items
    .filter((i) => i.type === 'BOOK_ONLY')
    .reduce((sum, i) => sum + parseFloat(i.amount), 0);

  adjustedBalance = adjustedBalance + bankOnlySum - bookOnlySum;

  const totalDifference = reconciliation.statementBalance - adjustedBalance;

  await prisma.bankReconciliation.update({
    where: { id: reconciliationId },
    data: {
      ...stats,
      adjustedBalance,
      totalDifference,
    },
  });
}

/**
 * Obtener estadísticas de conciliaciones
 */
async function getReconciliationStats(bankAccountId) {
  const where = bankAccountId ? { bankAccountId } : {};

  const [total, inProgress, completed, approved] = await Promise.all([
    prisma.bankReconciliation.count({ where }),
    prisma.bankReconciliation.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.bankReconciliation.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.bankReconciliation.count({ where: { ...where, status: 'APPROVED' } }),
  ]);

  return {
    total,
    inProgress,
    completed,
    approved,
  };
}

export {
  createReconciliation,
  getReconciliations,
  getReconciliationById,
  addReconciliationItem,
  reconcileItem,
  deleteReconciliationItem,
  completeReconciliation,
  approveReconciliation,
  rejectReconciliation,
  loadSystemTransactions,
  getReconciliationStats,
};
