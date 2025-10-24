import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Crea un nuevo gasto para un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {Object} expenseData - Datos del gasto
 * @returns {Promise<Object>} Gasto creado
 */
export const createExpense = async (projectId, expenseData) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      expenses: true,
    },
  });
  
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }
  
  // Calcular total de gastos actuales
  const currentExpenses = project.expenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount);
  }, 0);
  
  // Validar que el nuevo gasto no exceda el presupuesto
  const newTotal = currentExpenses + parseFloat(expenseData.amount);
  const budget = parseFloat(project.budget);
  
  if (newTotal > budget) {
    throw new Error(
      `El gasto excede el presupuesto disponible. Presupuesto: ${budget}, Gastado: ${currentExpenses}, Nuevo gasto: ${expenseData.amount}`
    );
  }
  
  // Crear el gasto
  const expense = await prisma.projectExpense.create({
    data: {
      ...expenseData,
      projectId,
      date: new Date(expenseData.date),
    },
  });
  
  return expense;
};

/**
 * Obtiene todos los gastos de un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Array>} Lista de gastos
 */
export const getExpensesByProject = async (projectId) => {
  const expenses = await prisma.projectExpense.findMany({
    where: { projectId },
    orderBy: {
      date: 'desc',
    },
  });
  
  return expenses;
};

/**
 * Obtiene un gasto por ID
 * @param {string} expenseId - ID del gasto
 * @returns {Promise<Object>} Gasto encontrado
 */
export const getExpenseById = async (expenseId) => {
  const expense = await prisma.projectExpense.findUnique({
    where: { id: expenseId },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
          budget: true,
        },
      },
    },
  });
  
  if (!expense) {
    throw new Error('Gasto no encontrado');
  }
  
  return expense;
};

/**
 * Actualiza un gasto
 * @param {string} expenseId - ID del gasto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Gasto actualizado
 */
export const updateExpense = async (expenseId, updateData) => {
  // Verificar que el gasto existe
  const existingExpense = await prisma.projectExpense.findUnique({
    where: { id: expenseId },
    include: {
      project: {
        include: {
          expenses: true,
        },
      },
    },
  });
  
  if (!existingExpense) {
    throw new Error('Gasto no encontrado');
  }
  
  // Si se actualiza el monto, validar presupuesto
  if (updateData.amount !== undefined) {
    const otherExpenses = existingExpense.project.expenses
      .filter(e => e.id !== expenseId)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const newTotal = otherExpenses + parseFloat(updateData.amount);
    const budget = parseFloat(existingExpense.project.budget);
    
    if (newTotal > budget) {
      throw new Error(
        `El gasto actualizado excede el presupuesto disponible. Presupuesto: ${budget}, Total con cambio: ${newTotal}`
      );
    }
  }
  
  // Convertir fecha si viene como string
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.date) {
    dataToUpdate.date = new Date(dataToUpdate.date);
  }
  
  // Actualizar el gasto
  const expense = await prisma.projectExpense.update({
    where: { id: expenseId },
    data: dataToUpdate,
  });
  
  return expense;
};

/**
 * Elimina un gasto
 * @param {string} expenseId - ID del gasto
 * @returns {Promise<Object>} Gasto eliminado
 */
export const deleteExpense = async (expenseId) => {
  // Verificar que el gasto existe
  const existingExpense = await prisma.projectExpense.findUnique({
    where: { id: expenseId },
  });
  
  if (!existingExpense) {
    throw new Error('Gasto no encontrado');
  }
  
  // Eliminar el gasto
  const expense = await prisma.projectExpense.delete({
    where: { id: expenseId },
  });
  
  return expense;
};

/**
 * Obtiene estadísticas de gastos por categoría para un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Estadísticas de gastos
 */
export const getExpenseStatsByProject = async (projectId) => {
  const [expenses, byCategory] = await Promise.all([
    // Total de gastos
    prisma.projectExpense.aggregate({
      where: { projectId },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
    
    // Gastos por categoría
    prisma.projectExpense.groupBy({
      by: ['category'],
      where: { projectId },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    }),
  ]);
  
  return {
    total: parseFloat(expenses._sum.amount || 0),
    count: expenses._count._all,
    byCategory: byCategory.map(item => ({
      category: item.category,
      total: parseFloat(item._sum.amount || 0),
      count: item._count._all,
    })),
  };
};
