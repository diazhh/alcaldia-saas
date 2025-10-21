/**
 * Servicio para gestión de solicitudes de compra
 */

import prisma from '../../../config/database.js';

/**
 * Genera el siguiente número de solicitud
 * @returns {Promise<string>} Número generado
 */
async function generateRequestNumber() {
  const year = new Date().getFullYear();
  const prefix = `SOL-${year}-`;
  
  const lastRequest = await prisma.purchaseRequest.findFirst({
    where: {
      requestNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      requestNumber: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.requestNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Obtiene todas las solicitudes con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de solicitudes
 */
async function getAllRequests(filters = {}) {
  const { status, departmentId, priority, page = 1, limit = 50 } = filters;
  
  const where = {};
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;
  if (priority) where.priority = priority;
  
  const skip = (page - 1) * limit;
  
  const [requests, total] = await Promise.all([
    prisma.purchaseRequest.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        items: true,
      },
      orderBy: { requestDate: 'desc' },
    }),
    prisma.purchaseRequest.count({ where }),
  ]);
  
  return {
    requests,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene una solicitud por ID
 * @param {string} id - ID de la solicitud
 * @returns {Promise<Object>} Solicitud encontrada
 */
async function getRequestById(id) {
  const request = await prisma.purchaseRequest.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });
  
  if (!request) {
    throw new Error('Solicitud no encontrada');
  }
  
  return request;
}

/**
 * Crea una nueva solicitud de compra
 * @param {Object} data - Datos de la solicitud
 * @param {string} userId - ID del usuario que solicita
 * @returns {Promise<Object>} Solicitud creada
 */
async function createRequest(data, userId) {
  const requestNumber = await generateRequestNumber();
  
  // Calcular total de items
  const itemsTotal = data.items.reduce((sum, item) => {
    return sum + (item.quantity * item.estimatedUnitPrice);
  }, 0);
  
  const request = await prisma.purchaseRequest.create({
    data: {
      requestNumber,
      departmentId: data.departmentId,
      department: data.department,
      requestedBy: userId,
      priority: data.priority || 'MEDIUM',
      justification: data.justification,
      estimatedAmount: data.estimatedAmount || itemsTotal,
      budgetItemId: data.budgetItemId,
      requiredDate: data.requiredDate ? new Date(data.requiredDate) : null,
      notes: data.notes,
      items: {
        create: data.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          estimatedUnitPrice: item.estimatedUnitPrice,
          estimatedTotal: item.quantity * item.estimatedUnitPrice,
          specifications: item.specifications,
        })),
      },
    },
    include: {
      items: true,
    },
  });
  
  return request;
}

/**
 * Actualiza una solicitud
 * @param {string} id - ID de la solicitud
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function updateRequest(id, data) {
  const request = await getRequestById(id);
  
  if (request.status !== 'PENDING') {
    throw new Error('Solo se pueden actualizar solicitudes pendientes');
  }
  
  const updateData = { ...data };
  if (data.requiredDate) updateData.requiredDate = new Date(data.requiredDate);
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: updateData,
  });
  
  return updated;
}

/**
 * Aprueba una solicitud por el jefe de departamento
 * @param {string} id - ID de la solicitud
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function approveByHead(id, userId) {
  const request = await getRequestById(id);
  
  if (request.status !== 'PENDING') {
    throw new Error('Solo se pueden aprobar solicitudes pendientes');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'APPROVED_HEAD',
      approvedByHead: userId,
    },
  });
  
  return updated;
}

/**
 * Aprueba una solicitud por presupuesto
 * @param {string} id - ID de la solicitud
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function approveByBudget(id, userId) {
  const request = await getRequestById(id);
  
  if (request.status !== 'APPROVED_HEAD') {
    throw new Error('La solicitud debe estar aprobada por el jefe primero');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'APPROVED_BUDGET',
      approvedByBudget: userId,
    },
  });
  
  return updated;
}

/**
 * Aprueba una solicitud por compras
 * @param {string} id - ID de la solicitud
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function approveByPurchasing(id, userId) {
  const request = await getRequestById(id);
  
  if (request.status !== 'APPROVED_BUDGET') {
    throw new Error('La solicitud debe estar aprobada por presupuesto primero');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'APPROVED_PURCHASING',
      approvedByPurchasing: userId,
    },
  });
  
  return updated;
}

/**
 * Aprueba completamente una solicitud
 * @param {string} id - ID de la solicitud
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function approveCompletely(id, userId) {
  const request = await getRequestById(id);
  
  if (request.status !== 'APPROVED_PURCHASING') {
    throw new Error('La solicitud debe pasar por todas las aprobaciones previas');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedByDirector: userId,
      approvedAt: new Date(),
    },
  });
  
  return updated;
}

/**
 * Rechaza una solicitud
 * @param {string} id - ID de la solicitud
 * @param {string} userId - ID del usuario que rechaza
 * @param {string} reason - Razón del rechazo
 * @returns {Promise<Object>} Solicitud rechazada
 */
async function rejectRequest(id, userId, reason) {
  const request = await getRequestById(id);
  
  if (request.status === 'REJECTED' || request.status === 'CANCELLED') {
    throw new Error('La solicitud ya está rechazada o cancelada');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectedAt: new Date(),
      rejectionReason: reason,
    },
  });
  
  return updated;
}

/**
 * Cancela una solicitud
 * @param {string} id - ID de la solicitud
 * @returns {Promise<Object>} Solicitud cancelada
 */
async function cancelRequest(id) {
  const request = await getRequestById(id);
  
  if (request.status === 'RECEIVED' || request.status === 'REJECTED') {
    throw new Error('No se puede cancelar una solicitud recibida o rechazada');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });
  
  return updated;
}

/**
 * Agrega cotización a una solicitud
 * @param {string} id - ID de la solicitud
 * @param {Object} quotation - Datos de cotización
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function addQuotation(id, quotation) {
  const request = await getRequestById(id);
  
  if (request.status !== 'APPROVED') {
    throw new Error('Solo se pueden cotizar solicitudes aprobadas');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'IN_QUOTATION',
      quotationReceived: true,
      quotationAmount: quotation.quotationAmount,
      quotationSupplier: quotation.quotationSupplier,
    },
  });
  
  return updated;
}

/**
 * Genera orden de compra
 * @param {string} id - ID de la solicitud
 * @param {Object} orderData - Datos de la orden
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function generatePurchaseOrder(id, orderData) {
  const request = await getRequestById(id);
  
  if (request.status !== 'IN_QUOTATION' && request.status !== 'APPROVED') {
    throw new Error('La solicitud debe estar cotizada o aprobada');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'ORDERED',
      purchaseOrderNumber: orderData.purchaseOrderNumber,
      purchaseOrderDate: new Date(orderData.purchaseOrderDate),
    },
  });
  
  return updated;
}

/**
 * Marca una solicitud como recibida
 * @param {string} id - ID de la solicitud
 * @param {string} userId - ID del usuario que recibe
 * @param {Date} receivedDate - Fecha de recepción
 * @returns {Promise<Object>} Solicitud actualizada
 */
async function markAsReceived(id, userId, receivedDate) {
  const request = await getRequestById(id);
  
  if (request.status !== 'ORDERED') {
    throw new Error('Solo se pueden marcar como recibidas las solicitudes ordenadas');
  }
  
  const updated = await prisma.purchaseRequest.update({
    where: { id },
    data: {
      status: 'RECEIVED',
      receivedDate: new Date(receivedDate),
      receivedBy: userId,
    },
  });
  
  return updated;
}

/**
 * Obtiene estadísticas de solicitudes
 * @returns {Promise<Object>} Estadísticas
 */
async function getRequestStats() {
  const [
    total,
    byStatus,
    byPriority,
    totalAmount,
  ] = await Promise.all([
    prisma.purchaseRequest.count(),
    prisma.purchaseRequest.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.purchaseRequest.groupBy({
      by: ['priority'],
      _count: true,
    }),
    prisma.purchaseRequest.aggregate({
      _sum: {
        estimatedAmount: true,
        quotationAmount: true,
      },
    }),
  ]);
  
  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    byPriority: byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {}),
    totalEstimatedAmount: totalAmount._sum.estimatedAmount || 0,
    totalQuotationAmount: totalAmount._sum.quotationAmount || 0,
  };
}

export {
  generateRequestNumber,
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  approveByHead,
  approveByBudget,
  approveByPurchasing,
  approveCompletely,
  rejectRequest,
  cancelRequest,
  addQuotation,
  generatePurchaseOrder,
  markAsReceived,
  getRequestStats,
};
