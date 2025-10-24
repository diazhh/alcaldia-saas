import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un código único para la orden de cambio
 * Formato: OC-YYYY-NNN (ej: OC-2025-001)
 * @returns {Promise<string>} Código generado
 */
export const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `OC-${year}-`;

  // Obtener la última orden del año
  const lastOrder = await prisma.changeOrder.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Formatear con ceros a la izquierda (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${formattedNumber}`;
};

/**
 * Crea una nueva orden de cambio
 * @param {string} projectId - ID del proyecto
 * @param {Object} orderData - Datos de la orden de cambio
 * @param {string} userId - ID del usuario que solicita
 * @returns {Promise<Object>} Orden de cambio creada
 */
export const createChangeOrder = async (projectId, orderData, userId) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // Generar número único de orden
  const orderNumber = await generateOrderNumber();

  // Convertir fechas si vienen como strings
  const dataToCreate = { ...orderData };
  if (dataToCreate.requestDate) {
    dataToCreate.requestDate = new Date(dataToCreate.requestDate);
  }

  const changeOrder = await prisma.changeOrder.create({
    data: {
      ...dataToCreate,
      projectId,
      orderNumber,
      requestedByUserId: userId,
    },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return changeOrder;
};

/**
 * Obtiene órdenes de cambio con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite de resultados por página (default: 10)
 * @returns {Promise<Object>} Lista de órdenes de cambio y metadata de paginación
 */
export const getChangeOrders = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Construir el objeto where para filtros
  const where = {};

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.requestedBy) {
    where.requestedBy = filters.requestedBy;
  }

  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { justification: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Obtener órdenes y total
  const [orders, total] = await Promise.all([
    prisma.changeOrder.findMany({
      where,
      skip,
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
          },
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        requestDate: 'desc',
      },
    }),
    prisma.changeOrder.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene órdenes de cambio de un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Array>} Lista de órdenes de cambio
 */
export const getChangeOrdersByProject = async (projectId) => {
  const orders = await prisma.changeOrder.findMany({
    where: { projectId },
    include: {
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      approver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      requestDate: 'desc',
    },
  });

  return orders;
};

/**
 * Obtiene una orden de cambio por ID
 * @param {string} orderId - ID de la orden de cambio
 * @returns {Promise<Object>} Orden de cambio encontrada
 */
export const getChangeOrderById = async (orderId) => {
  const order = await prisma.changeOrder.findUnique({
    where: { id: orderId },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          budget: true,
        },
      },
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Orden de cambio no encontrada');
  }

  return order;
};

/**
 * Actualiza una orden de cambio
 * @param {string} orderId - ID de la orden de cambio
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Orden de cambio actualizada
 */
export const updateChangeOrder = async (orderId, updateData) => {
  const existingOrder = await prisma.changeOrder.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error('Orden de cambio no encontrada');
  }

  // Convertir fechas si vienen como strings
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.requestDate) {
    dataToUpdate.requestDate = new Date(dataToUpdate.requestDate);
  }
  if (dataToUpdate.reviewDate) {
    dataToUpdate.reviewDate = new Date(dataToUpdate.reviewDate);
  }
  if (dataToUpdate.approvalDate) {
    dataToUpdate.approvalDate = new Date(dataToUpdate.approvalDate);
  }
  if (dataToUpdate.implementationDate) {
    dataToUpdate.implementationDate = new Date(dataToUpdate.implementationDate);
  }

  const order = await prisma.changeOrder.update({
    where: { id: orderId },
    data: dataToUpdate,
    include: {
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return order;
};

/**
 * Elimina una orden de cambio
 * @param {string} orderId - ID de la orden de cambio
 * @returns {Promise<Object>} Orden de cambio eliminada
 */
export const deleteChangeOrder = async (orderId) => {
  const existingOrder = await prisma.changeOrder.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error('Orden de cambio no encontrada');
  }

  // Solo permitir eliminar órdenes solicitadas
  if (existingOrder.status !== 'SOLICITADO') {
    throw new Error('Solo se pueden eliminar órdenes de cambio en estado SOLICITADO');
  }

  const order = await prisma.changeOrder.delete({
    where: { id: orderId },
  });

  return order;
};

/**
 * Revisa una orden de cambio
 * @param {string} orderId - ID de la orden de cambio
 * @param {string} reviewerId - ID del usuario revisor
 * @param {string} reviewNotes - Notas de revisión
 * @returns {Promise<Object>} Orden de cambio actualizada
 */
export const reviewChangeOrder = async (orderId, reviewerId, reviewNotes) => {
  const order = await prisma.changeOrder.update({
    where: { id: orderId },
    data: {
      status: 'EN_REVISION',
      reviewedByUserId: reviewerId,
      reviewDate: new Date(),
      reviewNotes,
    },
    include: {
      project: true,
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return order;
};

/**
 * Aprueba una orden de cambio
 * @param {string} orderId - ID de la orden de cambio
 * @param {string} approverId - ID del usuario aprobador
 * @returns {Promise<Object>} Orden de cambio actualizada
 */
export const approveChangeOrder = async (orderId, approverId) => {
  const existingOrder = await prisma.changeOrder.findUnique({
    where: { id: orderId },
    include: { project: true },
  });

  if (!existingOrder) {
    throw new Error('Orden de cambio no encontrada');
  }

  // Actualizar presupuesto y fechas del proyecto si tiene impactos
  const projectUpdates = {};
  if (existingOrder.costImpact !== 0) {
    const newBudget = parseFloat(existingOrder.project.budget) + parseFloat(existingOrder.costImpact);
    projectUpdates.budget = newBudget;
  }

  if (existingOrder.timeImpact !== 0 && existingOrder.project.endDate) {
    const newEndDate = new Date(existingOrder.project.endDate);
    newEndDate.setDate(newEndDate.getDate() + existingOrder.timeImpact);
    projectUpdates.endDate = newEndDate;
  }

  // Actualizar orden de cambio y proyecto en una transacción
  const [order] = await prisma.$transaction([
    prisma.changeOrder.update({
      where: { id: orderId },
      data: {
        status: 'APROBADO',
        approvedByUserId: approverId,
        approvalDate: new Date(),
      },
      include: {
        project: true,
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    ...(Object.keys(projectUpdates).length > 0
      ? [prisma.project.update({
          where: { id: existingOrder.projectId },
          data: projectUpdates,
        })]
      : []
    ),
  ]);

  return order;
};

/**
 * Rechaza una orden de cambio
 * @param {string} orderId - ID de la orden de cambio
 * @param {string} approverId - ID del usuario que rechaza
 * @param {string} rejectionReason - Razón del rechazo
 * @returns {Promise<Object>} Orden de cambio actualizada
 */
export const rejectChangeOrder = async (orderId, approverId, rejectionReason) => {
  const order = await prisma.changeOrder.update({
    where: { id: orderId },
    data: {
      status: 'RECHAZADO',
      approvedByUserId: approverId,
      approvalDate: new Date(),
      rejectionReason,
    },
    include: {
      project: true,
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return order;
};

/**
 * Marca una orden de cambio como implementada
 * @param {string} orderId - ID de la orden de cambio
 * @returns {Promise<Object>} Orden de cambio actualizada
 */
export const implementChangeOrder = async (orderId) => {
  const order = await prisma.changeOrder.update({
    where: { id: orderId },
    data: {
      status: 'IMPLEMENTADO',
      implementationDate: new Date(),
    },
  });

  return order;
};

/**
 * Obtiene estadísticas de órdenes de cambio
 * @param {string} projectId - ID del proyecto (opcional)
 * @returns {Promise<Object>} Estadísticas
 */
export const getChangeOrderStats = async (projectId = null) => {
  const where = projectId ? { projectId } : {};

  const [
    total,
    byStatus,
    byRequester,
    totalCostImpact,
    totalTimeImpact,
  ] = await Promise.all([
    prisma.changeOrder.count({ where }),

    prisma.changeOrder.groupBy({
      by: ['status'],
      where,
      _count: {
        _all: true,
      },
    }),

    prisma.changeOrder.groupBy({
      by: ['requestedBy'],
      where,
      _count: {
        _all: true,
      },
    }),

    prisma.changeOrder.aggregate({
      where: {
        ...where,
        status: 'APROBADO',
      },
      _sum: {
        costImpact: true,
      },
    }),

    prisma.changeOrder.aggregate({
      where: {
        ...where,
        status: 'APROBADO',
      },
      _sum: {
        timeImpact: true,
      },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.map(item => ({
      status: item.status,
      count: item._count._all,
    })),
    byRequester: byRequester.map(item => ({
      requester: item.requestedBy,
      count: item._count._all,
    })),
    totalCostImpact: parseFloat(totalCostImpact._sum.costImpact || 0),
    totalTimeImpact: totalTimeImpact._sum.timeImpact || 0,
  };
};
