/**
 * Servicio para la gestión de partidas presupuestarias
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Crea una nueva partida presupuestaria
 * @param {Object} itemData - Datos de la partida
 * @returns {Promise<Object>} Partida creada
 */
export const createBudgetItem = async (itemData) => {
  // Verificar que el presupuesto existe
  const budget = await prisma.budget.findUnique({
    where: { id: itemData.budgetId },
  });

  if (!budget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  // Verificar que el presupuesto no esté cerrado
  if (budget.status === 'CLOSED') {
    throw new AppError('No se pueden agregar partidas a un presupuesto cerrado', 400);
  }

  // Verificar que no exista una partida con el mismo código en este presupuesto
  const existingItem = await prisma.budgetItem.findFirst({
    where: {
      budgetId: itemData.budgetId,
      code: itemData.code,
    },
  });

  if (existingItem) {
    throw new AppError(`Ya existe una partida con el código ${itemData.code} en este presupuesto`, 400);
  }

  // Calcular el monto disponible inicial (igual al asignado)
  const availableAmount = itemData.allocatedAmount;

  const budgetItem = await prisma.budgetItem.create({
    data: {
      ...itemData,
      availableAmount,
    },
  });

  return budgetItem;
};

/**
 * Obtiene una partida presupuestaria por ID
 * @param {string} id - ID de la partida
 * @returns {Promise<Object>} Partida encontrada
 */
export const getBudgetItemById = async (id) => {
  const budgetItem = await prisma.budgetItem.findUnique({
    where: { id },
    include: {
      budget: {
        select: {
          id: true,
          year: true,
          status: true,
        },
      },
      transactions: {
        select: {
          id: true,
          reference: true,
          amount: true,
          status: true,
          concept: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!budgetItem) {
    throw new AppError('Partida presupuestaria no encontrada', 404);
  }

  return budgetItem;
};

/**
 * Lista todas las partidas de un presupuesto
 * @param {string} budgetId - ID del presupuesto
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de partidas
 */
export const getBudgetItems = async (budgetId, filters = {}) => {
  const { departmentId, category, search } = filters;

  const where = { budgetId };
  if (departmentId) where.departmentId = departmentId;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  const budgetItems = await prisma.budgetItem.findMany({
    where,
    include: {
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { code: 'asc' },
  });

  return budgetItems;
};

/**
 * Actualiza una partida presupuestaria
 * @param {string} id - ID de la partida
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Partida actualizada
 */
export const updateBudgetItem = async (id, updateData) => {
  const existingItem = await prisma.budgetItem.findUnique({
    where: { id },
    include: { budget: true },
  });

  if (!existingItem) {
    throw new AppError('Partida presupuestaria no encontrada', 404);
  }

  // No permitir actualizar si el presupuesto está cerrado
  if (existingItem.budget.status === 'CLOSED') {
    throw new AppError('No se puede actualizar una partida de un presupuesto cerrado', 400);
  }

  // Si se actualiza el monto asignado, recalcular el disponible
  if (updateData.allocatedAmount !== undefined) {
    const committedAmount = Number(existingItem.committedAmount);
    updateData.availableAmount = updateData.allocatedAmount - committedAmount;

    if (updateData.availableAmount < 0) {
      throw new AppError('El monto asignado no puede ser menor al monto comprometido', 400);
    }
  }

  const budgetItem = await prisma.budgetItem.update({
    where: { id },
    data: updateData,
  });

  return budgetItem;
};

/**
 * Elimina una partida presupuestaria
 * @param {string} id - ID de la partida
 * @returns {Promise<void>}
 */
export const deleteBudgetItem = async (id) => {
  const budgetItem = await prisma.budgetItem.findUnique({
    where: { id },
    include: {
      budget: true,
      transactions: true,
    },
  });

  if (!budgetItem) {
    throw new AppError('Partida presupuestaria no encontrada', 404);
  }

  // No permitir eliminar si tiene transacciones asociadas
  if (budgetItem.transactions.length > 0) {
    throw new AppError('No se puede eliminar una partida con transacciones asociadas', 400);
  }

  // No permitir eliminar si el presupuesto está cerrado
  if (budgetItem.budget.status === 'CLOSED') {
    throw new AppError('No se puede eliminar una partida de un presupuesto cerrado', 400);
  }

  await prisma.budgetItem.delete({
    where: { id },
  });
};

/**
 * Verifica la disponibilidad presupuestaria de una partida
 * @param {string} budgetItemId - ID de la partida
 * @param {number} amount - Monto a verificar
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const checkBudgetAvailability = async (budgetItemId, amount) => {
  const budgetItem = await prisma.budgetItem.findUnique({
    where: { id: budgetItemId },
    include: {
      budget: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!budgetItem) {
    throw new AppError('Partida presupuestaria no encontrada', 404);
  }

  // Verificar que el presupuesto esté activo
  if (budgetItem.budget.status !== 'ACTIVE') {
    return {
      available: false,
      reason: 'El presupuesto no está activo',
      budgetItem: {
        code: budgetItem.code,
        name: budgetItem.name,
        availableAmount: Number(budgetItem.availableAmount),
      },
    };
  }

  const availableAmount = Number(budgetItem.availableAmount);
  const available = availableAmount >= amount;

  return {
    available,
    reason: available ? 'Disponibilidad suficiente' : 'Disponibilidad insuficiente',
    budgetItem: {
      code: budgetItem.code,
      name: budgetItem.name,
      allocatedAmount: Number(budgetItem.allocatedAmount),
      committedAmount: Number(budgetItem.committedAmount),
      accruedAmount: Number(budgetItem.accruedAmount),
      paidAmount: Number(budgetItem.paidAmount),
      availableAmount,
    },
    requestedAmount: amount,
    difference: availableAmount - amount,
  };
};

/**
 * Actualiza los montos de una partida después de una transacción
 * @param {string} budgetItemId - ID de la partida
 * @param {string} operation - Tipo de operación (commit, accrue, pay, cancel)
 * @param {number} amount - Monto de la operación
 * @returns {Promise<Object>} Partida actualizada
 */
export const updateBudgetItemAmounts = async (budgetItemId, operation, amount) => {
  const budgetItem = await prisma.budgetItem.findUnique({
    where: { id: budgetItemId },
  });

  if (!budgetItem) {
    throw new AppError('Partida presupuestaria no encontrada', 404);
  }

  let updateData = {};

  switch (operation) {
    case 'commit':
      // Comprometer: reduce disponible, aumenta comprometido
      updateData = {
        committedAmount: Number(budgetItem.committedAmount) + amount,
        availableAmount: Number(budgetItem.availableAmount) - amount,
      };
      break;

    case 'accrue':
      // Causar: aumenta causado
      updateData = {
        accruedAmount: Number(budgetItem.accruedAmount) + amount,
      };
      break;

    case 'pay':
      // Pagar: aumenta pagado
      updateData = {
        paidAmount: Number(budgetItem.paidAmount) + amount,
      };
      break;

    case 'cancel':
      // Anular: libera comprometido, aumenta disponible
      updateData = {
        committedAmount: Number(budgetItem.committedAmount) - amount,
        availableAmount: Number(budgetItem.availableAmount) + amount,
      };
      break;

    default:
      throw new AppError('Operación no válida', 400);
  }

  const updatedItem = await prisma.budgetItem.update({
    where: { id: budgetItemId },
    data: updateData,
  });

  return updatedItem;
};

/**
 * Obtiene el resumen de ejecución por categoría
 * @param {string} budgetId - ID del presupuesto
 * @returns {Promise<Array>} Resumen por categoría
 */
export const getBudgetItemsByCategory = async (budgetId) => {
  const items = await prisma.budgetItem.findMany({
    where: { budgetId },
  });

  // Agrupar por categoría
  const categoryMap = new Map();

  items.forEach((item) => {
    const category = item.category || 'Sin categoría';
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        totalAllocated: 0,
        totalCommitted: 0,
        totalAccrued: 0,
        totalPaid: 0,
        totalAvailable: 0,
        itemCount: 0,
      });
    }

    const categoryData = categoryMap.get(category);
    categoryData.totalAllocated += Number(item.allocatedAmount);
    categoryData.totalCommitted += Number(item.committedAmount);
    categoryData.totalAccrued += Number(item.accruedAmount);
    categoryData.totalPaid += Number(item.paidAmount);
    categoryData.totalAvailable += Number(item.availableAmount);
    categoryData.itemCount += 1;
  });

  return Array.from(categoryMap.values());
};
