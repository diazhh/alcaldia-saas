/**
 * Servicio para la gestión de presupuestos
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Crea un nuevo presupuesto anual
 * @param {Object} budgetData - Datos del presupuesto
 * @param {string} userId - ID del usuario que crea el presupuesto
 * @returns {Promise<Object>} Presupuesto creado
 */
export const createBudget = async (budgetData, userId) => {
  // Verificar si ya existe un presupuesto para ese año
  const existingBudget = await prisma.budget.findUnique({
    where: { year: budgetData.year },
  });

  if (existingBudget) {
    throw new AppError(`Ya existe un presupuesto para el año ${budgetData.year}`, 400);
  }

  // Crear el presupuesto
  const budget = await prisma.budget.create({
    data: {
      ...budgetData,
    },
    include: {
      items: true,
      modifications: true,
    },
  });

  return budget;
};

/**
 * Obtiene un presupuesto por año
 * @param {number} year - Año del presupuesto
 * @returns {Promise<Object>} Presupuesto encontrado
 */
export const getBudgetByYear = async (year) => {
  const budget = await prisma.budget.findUnique({
    where: { year: parseInt(year) },
    include: {
      items: {
        orderBy: { code: 'asc' },
      },
      modifications: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!budget) {
    throw new AppError(`No se encontró presupuesto para el año ${year}`, 404);
  }

  return budget;
};

/**
 * Obtiene un presupuesto por ID
 * @param {string} id - ID del presupuesto
 * @returns {Promise<Object>} Presupuesto encontrado
 */
export const getBudgetById = async (id) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { code: 'asc' },
      },
      modifications: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!budget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  return budget;
};

/**
 * Lista todos los presupuestos
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Lista de presupuestos
 */
export const getAllBudgets = async (filters = {}) => {
  const { status, year } = filters;

  const where = {};
  if (status) where.status = status;
  if (year) where.year = parseInt(year);

  const budgets = await prisma.budget.findMany({
    where,
    include: {
      items: {
        select: {
          id: true,
          code: true,
          name: true,
          allocatedAmount: true,
          committedAmount: true,
          accruedAmount: true,
          paidAmount: true,
          availableAmount: true,
        },
      },
      _count: {
        select: {
          items: true,
          modifications: true,
        },
      },
    },
    orderBy: { year: 'desc' },
  });

  return budgets;
};

/**
 * Actualiza un presupuesto
 * @param {string} id - ID del presupuesto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Presupuesto actualizado
 */
export const updateBudget = async (id, updateData) => {
  // Verificar que el presupuesto existe
  const existingBudget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!existingBudget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  // No permitir actualizar si está cerrado
  if (existingBudget.status === 'CLOSED') {
    throw new AppError('No se puede actualizar un presupuesto cerrado', 400);
  }

  const budget = await prisma.budget.update({
    where: { id },
    data: updateData,
    include: {
      items: true,
      modifications: true,
    },
  });

  return budget;
};

/**
 * Aprueba un presupuesto
 * @param {string} id - ID del presupuesto
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<Object>} Presupuesto aprobado
 */
export const approveBudget = async (id, userId) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  if (budget.status !== 'SUBMITTED') {
    throw new AppError('Solo se pueden aprobar presupuestos en estado SUBMITTED', 400);
  }

  const updatedBudget = await prisma.budget.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    },
    include: {
      items: true,
      modifications: true,
    },
  });

  return updatedBudget;
};

/**
 * Activa un presupuesto (lo pone en ejecución)
 * @param {string} id - ID del presupuesto
 * @returns {Promise<Object>} Presupuesto activado
 */
export const activateBudget = async (id) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  if (budget.status !== 'APPROVED') {
    throw new AppError('Solo se pueden activar presupuestos aprobados', 400);
  }

  // Verificar si hay otro presupuesto activo para el mismo año
  const activeBudget = await prisma.budget.findFirst({
    where: {
      year: budget.year,
      status: 'ACTIVE',
      id: { not: id },
    },
  });

  if (activeBudget) {
    throw new AppError(`Ya existe un presupuesto activo para el año ${budget.year}`, 400);
  }

  const updatedBudget = await prisma.budget.update({
    where: { id },
    data: { status: 'ACTIVE' },
    include: {
      items: true,
      modifications: true,
    },
  });

  return updatedBudget;
};

/**
 * Cierra un presupuesto
 * @param {string} id - ID del presupuesto
 * @returns {Promise<Object>} Presupuesto cerrado
 */
export const closeBudget = async (id) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  if (budget.status === 'CLOSED') {
    throw new AppError('El presupuesto ya está cerrado', 400);
  }

  const updatedBudget = await prisma.budget.update({
    where: { id },
    data: { status: 'CLOSED' },
    include: {
      items: true,
      modifications: true,
    },
  });

  return updatedBudget;
};

/**
 * Elimina un presupuesto (solo si está en borrador)
 * @param {string} id - ID del presupuesto
 * @returns {Promise<void>}
 */
export const deleteBudget = async (id) => {
  const budget = await prisma.budget.findUnique({
    where: { id },
  });

  if (!budget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  if (budget.status !== 'DRAFT') {
    throw new AppError('Solo se pueden eliminar presupuestos en estado DRAFT', 400);
  }

  await prisma.budget.delete({
    where: { id },
  });
};

/**
 * Obtiene estadísticas de ejecución presupuestaria
 * @param {string} budgetId - ID del presupuesto
 * @returns {Promise<Object>} Estadísticas
 */
export const getBudgetExecutionStats = async (budgetId) => {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: {
      items: true,
    },
  });

  if (!budget) {
    throw new AppError('Presupuesto no encontrado', 404);
  }

  // Calcular totales
  const stats = budget.items.reduce(
    (acc, item) => ({
      totalAllocated: acc.totalAllocated + Number(item.allocatedAmount),
      totalCommitted: acc.totalCommitted + Number(item.committedAmount),
      totalAccrued: acc.totalAccrued + Number(item.accruedAmount),
      totalPaid: acc.totalPaid + Number(item.paidAmount),
      totalAvailable: acc.totalAvailable + Number(item.availableAmount),
    }),
    {
      totalAllocated: 0,
      totalCommitted: 0,
      totalAccrued: 0,
      totalPaid: 0,
      totalAvailable: 0,
    }
  );

  // Calcular porcentajes
  stats.committedPercentage = stats.totalAllocated > 0 
    ? (stats.totalCommitted / stats.totalAllocated) * 100 
    : 0;
  stats.accruedPercentage = stats.totalAllocated > 0 
    ? (stats.totalAccrued / stats.totalAllocated) * 100 
    : 0;
  stats.paidPercentage = stats.totalAllocated > 0 
    ? (stats.totalPaid / stats.totalAllocated) * 100 
    : 0;
  stats.availablePercentage = stats.totalAllocated > 0 
    ? (stats.totalAvailable / stats.totalAllocated) * 100 
    : 0;

  return {
    budgetId: budget.id,
    year: budget.year,
    status: budget.status,
    ...stats,
  };
};
