import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Servicio para gestión de modificaciones presupuestarias
 * Maneja créditos adicionales, traspasos, rectificaciones y reducciones
 */

/**
 * Crear una modificación presupuestaria
 */
export const createBudgetModification = async (modificationData, userId) => {
  const { budgetId, type, reference, description, amount, justification, fromBudgetItemId, toBudgetItemId } = modificationData;

  // Validar que el presupuesto existe y está activo
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId }
  });

  if (!budget) {
    throw new Error('Presupuesto no encontrado');
  }

  if (budget.status !== 'ACTIVE') {
    throw new Error('Solo se pueden hacer modificaciones a presupuestos activos');
  }

  // Validar según el tipo de modificación
  if (type === 'TRASPASO') {
    if (!fromBudgetItemId || !toBudgetItemId) {
      throw new Error('Para traspasos se requieren partidas origen y destino');
    }

    // Verificar que la partida origen tiene disponibilidad
    const fromItem = await prisma.budgetItem.findUnique({
      where: { id: fromBudgetItemId }
    });

    if (!fromItem || fromItem.availableAmount < amount) {
      throw new Error('La partida origen no tiene suficiente disponibilidad');
    }
  }

  // Crear la modificación
  const modification = await prisma.budgetModification.create({
    data: {
      budgetId,
      type,
      reference,
      description,
      amount,
      justification,
      status: 'PENDING',
      fromBudgetItemId,
      toBudgetItemId
    },
    include: {
      budget: true,
      fromBudgetItem: true,
      toBudgetItem: true
    }
  });

  return modification;
};

/**
 * Obtener todas las modificaciones de un presupuesto
 */
export const getBudgetModifications = async (budgetId, filters = {}) => {
  const { status, type } = filters;

  const where = { budgetId };
  if (status) where.status = status;
  if (type) where.type = type;

  const modifications = await prisma.budgetModification.findMany({
    where,
    include: {
      budget: true,
      fromBudgetItem: true,
      toBudgetItem: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return modifications;
};

/**
 * Obtener una modificación por ID
 */
export const getBudgetModificationById = async (id) => {
  const modification = await prisma.budgetModification.findUnique({
    where: { id },
    include: {
      budget: true,
      fromBudgetItem: true,
      toBudgetItem: true
    }
  });

  if (!modification) {
    throw new Error('Modificación presupuestaria no encontrada');
  }

  return modification;
};

/**
 * Aprobar una modificación presupuestaria
 */
export const approveBudgetModification = async (id, userId) => {
  const modification = await getBudgetModificationById(id);

  if (modification.status !== 'PENDING') {
    throw new Error('Solo se pueden aprobar modificaciones pendientes');
  }

  // Iniciar transacción para aplicar los cambios
  const result = await prisma.$transaction(async (tx) => {
    // Actualizar estado de la modificación
    const updatedModification = await tx.budgetModification.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date()
      }
    });

    // Aplicar cambios según el tipo
    switch (modification.type) {
      case 'TRASPASO':
        // Reducir partida origen
        await tx.budgetItem.update({
          where: { id: modification.fromBudgetItemId },
          data: {
            allocatedAmount: { decrement: modification.amount },
            availableAmount: { decrement: modification.amount }
          }
        });

        // Aumentar partida destino
        await tx.budgetItem.update({
          where: { id: modification.toBudgetItemId },
          data: {
            allocatedAmount: { increment: modification.amount },
            availableAmount: { increment: modification.amount }
          }
        });
        break;

      case 'CREDITO_ADICIONAL':
        // Aumentar partida y presupuesto total
        if (modification.toBudgetItemId) {
          await tx.budgetItem.update({
            where: { id: modification.toBudgetItemId },
            data: {
              allocatedAmount: { increment: modification.amount },
              availableAmount: { increment: modification.amount }
            }
          });
        }

        await tx.budget.update({
          where: { id: modification.budgetId },
          data: {
            totalAmount: { increment: modification.amount }
          }
        });
        break;

      case 'REDUCCION':
        // Reducir partida y presupuesto total
        if (modification.fromBudgetItemId) {
          await tx.budgetItem.update({
            where: { id: modification.fromBudgetItemId },
            data: {
              allocatedAmount: { decrement: modification.amount },
              availableAmount: { decrement: modification.amount }
            }
          });
        }

        await tx.budget.update({
          where: { id: modification.budgetId },
          data: {
            totalAmount: { decrement: modification.amount }
          }
        });
        break;

      case 'RECTIFICACION':
        // La rectificación puede involucrar múltiples ajustes
        // Por ahora solo actualizamos el estado
        break;
    }

    return updatedModification;
  });

  return result;
};

/**
 * Rechazar una modificación presupuestaria
 */
export const rejectBudgetModification = async (id, userId, reason) => {
  const modification = await getBudgetModificationById(id);

  if (modification.status !== 'PENDING') {
    throw new Error('Solo se pueden rechazar modificaciones pendientes');
  }

  const updatedModification = await prisma.budgetModification.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approvedBy: userId,
      approvedAt: new Date(),
      notes: reason
    }
  });

  return updatedModification;
};

/**
 * Obtener estadísticas de modificaciones
 */
export const getModificationStats = async (budgetId) => {
  const modifications = await prisma.budgetModification.findMany({
    where: { budgetId }
  });

  const stats = {
    total: modifications.length,
    pending: modifications.filter(m => m.status === 'PENDING').length,
    approved: modifications.filter(m => m.status === 'APPROVED').length,
    rejected: modifications.filter(m => m.status === 'REJECTED').length,
    byType: {
      TRASPASO: modifications.filter(m => m.type === 'TRASPASO').length,
      CREDITO_ADICIONAL: modifications.filter(m => m.type === 'CREDITO_ADICIONAL').length,
      REDUCCION: modifications.filter(m => m.type === 'REDUCCION').length,
      RECTIFICACION: modifications.filter(m => m.type === 'RECTIFICACION').length
    },
    totalAmount: modifications
      .filter(m => m.status === 'APPROVED')
      .reduce((sum, m) => sum + Number(m.amount), 0)
  };

  return stats;
};
