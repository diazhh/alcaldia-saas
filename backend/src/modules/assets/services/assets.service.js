/**
 * Servicio para gestión de bienes municipales
 */

import prisma from '../../../config/database.js';

/**
 * Genera el siguiente código de bien
 * @returns {Promise<string>} Código generado (ej: BM-2025-0001)
 */
async function generateAssetCode() {
  const year = new Date().getFullYear();
  const prefix = `BM-${year}-`;
  
  // Buscar el último bien del año
  const lastAsset = await prisma.asset.findFirst({
    where: {
      code: {
        startsWith: prefix
      }
    },
    orderBy: {
      code: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastAsset) {
    const lastNumber = parseInt(lastAsset.code.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Calcula la depreciación mensual de un bien
 * @param {number} acquisitionValue - Valor de adquisición
 * @param {number} usefulLife - Vida útil en meses
 * @returns {number} Depreciación mensual
 */
function calculateMonthlyDepreciation(acquisitionValue, usefulLife) {
  if (!usefulLife || usefulLife <= 0) return 0;
  return acquisitionValue / usefulLife;
}

/**
 * Calcula la depreciación acumulada de un bien
 * @param {Date} acquisitionDate - Fecha de adquisición
 * @param {number} monthlyDepreciation - Depreciación mensual
 * @returns {number} Depreciación acumulada
 */
function calculateAccumulatedDepreciation(acquisitionDate, monthlyDepreciation) {
  const now = new Date();
  const monthsElapsed = (now.getFullYear() - acquisitionDate.getFullYear()) * 12 +
                       (now.getMonth() - acquisitionDate.getMonth());
  
  return Math.max(0, monthsElapsed * monthlyDepreciation);
}

/**
 * Obtiene todos los bienes con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de bienes
 */
async function getAllAssets(filters = {}) {
  const { type, status, condition, departmentId, search, page = 1, limit = 50 } = filters;
  
  const where = {};
  
  if (type) where.type = type;
  if (status) where.status = status;
  if (condition) where.condition = condition;
  if (departmentId) where.departmentId = departmentId;
  
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.asset.count({ where }),
  ]);
  
  return {
    assets,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene un bien por ID
 * @param {string} id - ID del bien
 * @returns {Promise<Object>} Bien encontrado
 */
async function getAssetById(id) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      movements: {
        orderBy: { movementDate: 'desc' },
        take: 10,
      },
      maintenances: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  
  if (!asset) {
    throw new Error('Bien no encontrado');
  }
  
  return asset;
}

/**
 * Crea un nuevo bien
 * @param {Object} data - Datos del bien
 * @param {string} userId - ID del usuario que crea
 * @returns {Promise<Object>} Bien creado
 */
async function createAsset(data, userId) {
  // Generar código único
  const code = await generateAssetCode();
  
  // Calcular depreciación si se proporciona vida útil
  let monthlyDepreciation = null;
  let accumulatedDepreciation = 0;
  
  if (data.usefulLife) {
    monthlyDepreciation = calculateMonthlyDepreciation(data.acquisitionValue, data.usefulLife);
    accumulatedDepreciation = calculateAccumulatedDepreciation(
      new Date(data.acquisitionDate),
      monthlyDepreciation
    );
  }
  
  // Calcular valor actual
  const currentValue = data.currentValue || (data.acquisitionValue - accumulatedDepreciation);
  
  const asset = await prisma.asset.create({
    data: {
      ...data,
      code,
      currentValue,
      monthlyDepreciation,
      accumulatedDepreciation,
      acquisitionDate: new Date(data.acquisitionDate),
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
      assignedAt: data.custodianId ? new Date() : null,
    },
  });
  
  return asset;
}

/**
 * Actualiza un bien
 * @param {string} id - ID del bien
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Bien actualizado
 */
async function updateAsset(id, data) {
  const asset = await getAssetById(id);
  
  // Recalcular depreciación si cambia la vida útil o valor
  let updateData = { ...data };
  
  if (data.usefulLife || data.acquisitionValue) {
    const usefulLife = data.usefulLife || asset.usefulLife;
    const acquisitionValue = data.acquisitionValue || asset.acquisitionValue;
    
    if (usefulLife) {
      updateData.monthlyDepreciation = calculateMonthlyDepreciation(acquisitionValue, usefulLife);
      updateData.accumulatedDepreciation = calculateAccumulatedDepreciation(
        asset.acquisitionDate,
        updateData.monthlyDepreciation
      );
      updateData.currentValue = acquisitionValue - updateData.accumulatedDepreciation;
    }
  }
  
  // Convertir fechas si existen
  if (data.acquisitionDate) updateData.acquisitionDate = new Date(data.acquisitionDate);
  if (data.warrantyExpiry) updateData.warrantyExpiry = new Date(data.warrantyExpiry);
  if (data.insuranceExpiry) updateData.insuranceExpiry = new Date(data.insuranceExpiry);
  
  // Si se asigna custodio por primera vez, registrar fecha
  if (data.custodianId && !asset.custodianId) {
    updateData.assignedAt = new Date();
  }
  
  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: updateData,
  });
  
  return updatedAsset;
}

/**
 * Elimina un bien
 * @param {string} id - ID del bien
 * @returns {Promise<Object>} Bien eliminado
 */
async function deleteAsset(id) {
  await getAssetById(id); // Verificar que existe
  
  const asset = await prisma.asset.delete({
    where: { id },
  });
  
  return asset;
}

/**
 * Actualiza la depreciación de todos los bienes
 * @returns {Promise<number>} Número de bienes actualizados
 */
async function updateAllDepreciations() {
  const assets = await prisma.asset.findMany({
    where: {
      usefulLife: { not: null },
      monthlyDepreciation: { not: null },
    },
  });
  
  let updated = 0;
  
  for (const asset of assets) {
    const accumulatedDepreciation = calculateAccumulatedDepreciation(
      asset.acquisitionDate,
      asset.monthlyDepreciation
    );
    
    const currentValue = Math.max(0, asset.acquisitionValue - accumulatedDepreciation);
    
    await prisma.asset.update({
      where: { id: asset.id },
      data: {
        accumulatedDepreciation,
        currentValue,
      },
    });
    
    updated++;
  }
  
  return updated;
}

/**
 * Obtiene estadísticas de bienes
 * @returns {Promise<Object>} Estadísticas
 */
async function getAssetStats() {
  const [
    totalAssets,
    byType,
    byStatus,
    byCondition,
    totalValue,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.groupBy({
      by: ['type'],
      _count: true,
    }),
    prisma.asset.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.asset.groupBy({
      by: ['condition'],
      _count: true,
    }),
    prisma.asset.aggregate({
      _sum: {
        currentValue: true,
        acquisitionValue: true,
      },
    }),
  ]);
  
  return {
    totalAssets,
    byType: byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {}),
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    byCondition: byCondition.reduce((acc, item) => {
      acc[item.condition] = item._count;
      return acc;
    }, {}),
    totalCurrentValue: totalValue._sum.currentValue || 0,
    totalAcquisitionValue: totalValue._sum.acquisitionValue || 0,
  };
}

export {
  generateAssetCode,
  calculateMonthlyDepreciation,
  calculateAccumulatedDepreciation,
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  updateAllDepreciations,
  getAssetStats,
};
