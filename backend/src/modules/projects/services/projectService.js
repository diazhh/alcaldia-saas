import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un código único para el proyecto
 * Formato: PRO-YYYY-NNN (ej: PRO-2025-001)
 * @returns {Promise<string>} Código generado
 */
export const generateProjectCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `PRO-${year}-`;
  
  // Obtener el último proyecto del año
  const lastProject = await prisma.project.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });
  
  let nextNumber = 1;
  if (lastProject) {
    const lastNumber = parseInt(lastProject.code.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  // Formatear con ceros a la izquierda (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${formattedNumber}`;
};

/**
 * Crea un nuevo proyecto
 * @param {Object} projectData - Datos del proyecto
 * @param {string} userId - ID del usuario que crea el proyecto
 * @returns {Promise<Object>} Proyecto creado
 */
export const createProject = async (projectData, userId) => {
  // Generar código único
  const code = await generateProjectCode();
  
  // Usar el userId como managerId si no se proporciona
  const managerId = projectData.managerId || userId;
  
  // Crear el proyecto
  const project = await prisma.project.create({
    data: {
      ...projectData,
      code,
      managerId,
      // Convertir fechas si vienen como strings
      startDate: new Date(projectData.startDate),
      endDate: new Date(projectData.endDate),
    },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  
  return project;
};

/**
 * Obtiene todos los proyectos con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite de resultados por página (default: 10)
 * @returns {Promise<Object>} Lista de proyectos y metadata de paginación
 */
export const getProjects = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  // Construir el objeto where para filtros
  const where = {};
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.sector) {
    where.sector = filters.sector;
  }
  
  if (filters.category) {
    where.category = filters.category;
  }
  
  if (filters.priority) {
    where.priority = filters.priority;
  }
  
  if (filters.managerId) {
    where.managerId = filters.managerId;
  }
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { code: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  // Obtener proyectos y total
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            milestones: true,
            expenses: true,
            photos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.project.count({ where }),
  ]);
  
  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene un proyecto por ID
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Proyecto encontrado
 */
export const getProjectById = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      milestones: {
        orderBy: {
          order: 'asc',
        },
      },
      expenses: {
        orderBy: {
          date: 'desc',
        },
      },
      photos: {
        orderBy: {
          takenAt: 'desc',
        },
      },
    },
  });
  
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }
  
  // Calcular estadísticas del proyecto
  const totalExpenses = project.expenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount);
  }, 0);
  
  const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
  const totalMilestones = project.milestones.length;
  const progressPercentage = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100) 
    : 0;
  
  return {
    ...project,
    stats: {
      totalExpenses,
      remainingBudget: parseFloat(project.budget) - totalExpenses,
      budgetUsedPercentage: parseFloat(project.budget) > 0 
        ? Math.round((totalExpenses / parseFloat(project.budget)) * 100) 
        : 0,
      completedMilestones,
      totalMilestones,
      progressPercentage,
    },
  };
};

/**
 * Actualiza un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Proyecto actualizado
 */
export const updateProject = async (projectId, updateData) => {
  // Verificar que el proyecto existe
  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
  });
  
  if (!existingProject) {
    throw new Error('Proyecto no encontrado');
  }
  
  // Convertir fechas si vienen como strings
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.startDate) {
    dataToUpdate.startDate = new Date(dataToUpdate.startDate);
  }
  if (dataToUpdate.endDate) {
    dataToUpdate.endDate = new Date(dataToUpdate.endDate);
  }
  if (dataToUpdate.actualStartDate) {
    dataToUpdate.actualStartDate = new Date(dataToUpdate.actualStartDate);
  }
  if (dataToUpdate.actualEndDate) {
    dataToUpdate.actualEndDate = new Date(dataToUpdate.actualEndDate);
  }
  
  // Actualizar el proyecto
  const project = await prisma.project.update({
    where: { id: projectId },
    data: dataToUpdate,
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  
  return project;
};

/**
 * Elimina un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Proyecto eliminado
 */
export const deleteProject = async (projectId) => {
  // Verificar que el proyecto existe
  const existingProject = await prisma.project.findUnique({
    where: { id: projectId },
  });
  
  if (!existingProject) {
    throw new Error('Proyecto no encontrado');
  }
  
  // Eliminar el proyecto (cascade eliminará hitos, gastos y fotos)
  const project = await prisma.project.delete({
    where: { id: projectId },
  });
  
  return project;
};

/**
 * Obtiene estadísticas generales de proyectos
 * @returns {Promise<Object>} Estadísticas
 */
export const getProjectStats = async () => {
  const [
    total,
    byStatus,
    bySector,
    byCategory,
    byPriority,
    totalBudgetData,
    totalExpensesData,
    topByBudget,
  ] = await Promise.all([
    // Total de proyectos
    prisma.project.count(),
    
    // Proyectos por estado
    prisma.project.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    }),
    
    // Proyectos por sector con presupuesto total
    prisma.project.groupBy({
      by: ['sector'],
      _count: {
        _all: true,
      },
      _sum: {
        budget: true,
      },
    }),
    
    // Proyectos por categoría
    prisma.project.groupBy({
      by: ['category'],
      _count: {
        _all: true,
      },
    }),
    
    // Proyectos por prioridad
    prisma.project.groupBy({
      by: ['priority'],
      _count: {
        _all: true,
      },
    }),
    
    // Presupuesto total
    prisma.project.aggregate({
      _sum: {
        budget: true,
      },
    }),
    
    // Total de gastos
    prisma.projectExpense.aggregate({
      _sum: {
        amount: true,
      },
    }),
    
    // Top 5 proyectos por presupuesto
    prisma.project.findMany({
      take: 5,
      orderBy: {
        budget: 'desc',
      },
      select: {
        id: true,
        name: true,
        code: true,
        budget: true,
        status: true,
        sector: true,
        category: true,
      },
    }),
  ]);
  
  return {
    total,
    byStatus: byStatus.map(item => ({
      status: item.status,
      count: item._count._all,
    })),
    bySector: bySector.map(item => ({
      sector: item.sector,
      count: item._count._all,
      totalBudget: parseFloat(item._sum.budget || 0),
    })),
    byCategory: byCategory.map(item => ({
      category: item.category,
      count: item._count._all,
    })),
    byPriority: byPriority.map(item => ({
      priority: item.priority,
      count: item._count._all,
    })),
    totalBudget: parseFloat(totalBudgetData._sum.budget || 0),
    totalExpenses: parseFloat(totalExpensesData._sum.amount || 0),
    topByBudget: topByBudget.map(project => ({
      id: project.id,
      name: project.name,
      code: project.code,
      budget: parseFloat(project.budget),
      status: project.status,
      sector: project.sector,
      category: project.category,
    })),
  };
};
