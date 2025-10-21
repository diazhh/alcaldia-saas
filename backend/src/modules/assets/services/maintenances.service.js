/**
 * Servicio para gestión de mantenimientos de bienes
 */

import prisma from '../../../config/database.js';

/**
 * Obtiene todos los mantenimientos con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de mantenimientos
 */
async function getAllMaintenances(filters = {}) {
  const { assetId, type, status, page = 1, limit = 50 } = filters;
  
  const where = {};
  if (assetId) where.assetId = assetId;
  if (type) where.type = type;
  if (status) where.status = status;
  
  const skip = (page - 1) * limit;
  
  const [maintenances, total] = await Promise.all([
    prisma.assetMaintenance.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        asset: {
          select: {
            code: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.assetMaintenance.count({ where }),
  ]);
  
  return {
    maintenances,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene un mantenimiento por ID
 * @param {string} id - ID del mantenimiento
 * @returns {Promise<Object>} Mantenimiento encontrado
 */
async function getMaintenanceById(id) {
  const maintenance = await prisma.assetMaintenance.findUnique({
    where: { id },
    include: {
      asset: true,
    },
  });
  
  if (!maintenance) {
    throw new Error('Mantenimiento no encontrado');
  }
  
  return maintenance;
}

/**
 * Crea un nuevo mantenimiento
 * @param {Object} data - Datos del mantenimiento
 * @returns {Promise<Object>} Mantenimiento creado
 */
async function createMaintenance(data) {
  // Verificar que el bien existe
  const asset = await prisma.asset.findUnique({
    where: { id: data.assetId },
  });
  
  if (!asset) {
    throw new Error('Bien no encontrado');
  }
  
  const maintenance = await prisma.assetMaintenance.create({
    data: {
      ...data,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      completionDate: data.completionDate ? new Date(data.completionDate) : null,
    },
    include: {
      asset: true,
    },
  });
  
  return maintenance;
}

/**
 * Actualiza un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Mantenimiento actualizado
 */
async function updateMaintenance(id, data) {
  await getMaintenanceById(id);
  
  const updateData = { ...data };
  if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.completionDate) updateData.completionDate = new Date(data.completionDate);
  
  const maintenance = await prisma.assetMaintenance.update({
    where: { id },
    data: updateData,
  });
  
  return maintenance;
}

/**
 * Inicia un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @returns {Promise<Object>} Mantenimiento actualizado
 */
async function startMaintenance(id) {
  const maintenance = await getMaintenanceById(id);
  
  if (maintenance.status !== 'SCHEDULED') {
    throw new Error('Solo se pueden iniciar mantenimientos programados');
  }
  
  const updated = await prisma.assetMaintenance.update({
    where: { id },
    data: {
      status: 'IN_PROGRESS',
      startDate: new Date(),
    },
  });
  
  return updated;
}

/**
 * Completa un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @returns {Promise<Object>} Mantenimiento completado
 */
async function completeMaintenance(id) {
  const maintenance = await getMaintenanceById(id);
  
  if (maintenance.status === 'COMPLETED' || maintenance.status === 'CANCELLED') {
    throw new Error('El mantenimiento ya está completado o cancelado');
  }
  
  const updated = await prisma.assetMaintenance.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completionDate: new Date(),
    },
  });
  
  return updated;
}

/**
 * Cancela un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @returns {Promise<Object>} Mantenimiento cancelado
 */
async function cancelMaintenance(id) {
  const maintenance = await getMaintenanceById(id);
  
  if (maintenance.status === 'COMPLETED') {
    throw new Error('No se pueden cancelar mantenimientos completados');
  }
  
  const updated = await prisma.assetMaintenance.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });
  
  return updated;
}

/**
 * Elimina un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @returns {Promise<Object>} Mantenimiento eliminado
 */
async function deleteMaintenance(id) {
  await getMaintenanceById(id);
  
  const maintenance = await prisma.assetMaintenance.delete({
    where: { id },
  });
  
  return maintenance;
}

/**
 * Obtiene el historial de mantenimientos de un bien
 * @param {string} assetId - ID del bien
 * @returns {Promise<Array>} Historial de mantenimientos
 */
async function getAssetMaintenanceHistory(assetId) {
  const maintenances = await prisma.assetMaintenance.findMany({
    where: { assetId },
    orderBy: { createdAt: 'desc' },
  });
  
  return maintenances;
}

/**
 * Obtiene estadísticas de mantenimientos
 * @returns {Promise<Object>} Estadísticas
 */
async function getMaintenanceStats() {
  const [
    total,
    byType,
    byStatus,
    totalCost,
  ] = await Promise.all([
    prisma.assetMaintenance.count(),
    prisma.assetMaintenance.groupBy({
      by: ['type'],
      _count: true,
    }),
    prisma.assetMaintenance.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.assetMaintenance.aggregate({
      _sum: {
        cost: true,
      },
    }),
  ]);
  
  return {
    total,
    byType: byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {}),
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    totalCost: totalCost._sum.cost || 0,
  };
}

export {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  deleteMaintenance,
  getAssetMaintenanceHistory,
  getMaintenanceStats,
};
