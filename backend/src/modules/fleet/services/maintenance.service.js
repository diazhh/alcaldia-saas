/**
 * Servicio de Mantenimiento
 * Maneja la lógica de negocio para mantenimientos preventivos y correctivos
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Obtener todos los mantenimientos con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados por página
 * @returns {Promise<Object>} Lista de mantenimientos y metadata de paginación
 */
async function getAllMaintenances(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate && filters.endDate) {
    where.scheduledDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const [maintenances, total] = await Promise.all([
    prisma.maintenance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { scheduledDate: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            code: true,
            plate: true,
            brand: true,
            model: true,
            type: true,
            currentMileage: true,
          },
        },
      },
    }),
    prisma.maintenance.count({ where }),
  ]);

  return {
    data: maintenances,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un mantenimiento por ID
 * @param {string} id - ID del mantenimiento
 * @returns {Promise<Object>} Datos del mantenimiento
 */
async function getMaintenanceById(id) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
    include: {
      vehicle: true,
    },
  });

  if (!maintenance) {
    throw new AppError('Mantenimiento no encontrado', 404);
  }

  return maintenance;
}

/**
 * Crear un nuevo mantenimiento
 * @param {Object} data - Datos del mantenimiento
 * @returns {Promise<Object>} Mantenimiento creado
 */
async function createMaintenance(data) {
  // Verificar que el vehículo exista
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  // Calcular el costo total si se proporcionan los costos parciales
  const laborCost = parseFloat(data.laborCost || 0);
  const partsCost = parseFloat(data.partsCost || 0);
  const totalCost = laborCost + partsCost || parseFloat(data.totalCost || 0);

  // Crear el mantenimiento
  const maintenance = await prisma.maintenance.create({
    data: {
      ...data,
      totalCost,
      scheduledDate: new Date(data.scheduledDate),
      completedDate: data.completedDate ? new Date(data.completedDate) : null,
      nextDate: data.nextDate ? new Date(data.nextDate) : null,
    },
    include: {
      vehicle: true,
    },
  });

  return maintenance;
}

/**
 * Actualizar un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Mantenimiento actualizado
 */
async function updateMaintenance(id, data) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
  });

  if (!maintenance) {
    throw new AppError('Mantenimiento no encontrado', 404);
  }

  // Recalcular el costo total si se actualizan los costos parciales
  let totalCost = parseFloat(maintenance.totalCost);
  if (data.laborCost !== undefined || data.partsCost !== undefined) {
    const laborCost = data.laborCost !== undefined ? parseFloat(data.laborCost) : parseFloat(maintenance.laborCost);
    const partsCost = data.partsCost !== undefined ? parseFloat(data.partsCost) : parseFloat(maintenance.partsCost);
    totalCost = laborCost + partsCost;
  }

  const updatedMaintenance = await prisma.maintenance.update({
    where: { id },
    data: {
      ...data,
      totalCost,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
      completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      nextDate: data.nextDate ? new Date(data.nextDate) : undefined,
    },
    include: {
      vehicle: true,
    },
  });

  return updatedMaintenance;
}

/**
 * Eliminar un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @returns {Promise<Object>} Mensaje de confirmación
 */
async function deleteMaintenance(id) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
  });

  if (!maintenance) {
    throw new AppError('Mantenimiento no encontrado', 404);
  }

  await prisma.maintenance.delete({
    where: { id },
  });

  return { message: 'Mantenimiento eliminado exitosamente' };
}

/**
 * Completar un mantenimiento
 * @param {string} id - ID del mantenimiento
 * @param {Object} data - Datos de completado
 * @returns {Promise<Object>} Mantenimiento actualizado
 */
async function completeMaintenance(id, data) {
  const maintenance = await prisma.maintenance.findUnique({
    where: { id },
    include: { vehicle: true },
  });

  if (!maintenance) {
    throw new AppError('Mantenimiento no encontrado', 404);
  }

  if (maintenance.status === 'COMPLETED') {
    throw new AppError('Este mantenimiento ya ha sido completado', 400);
  }

  // Calcular el costo total
  const totalCost = parseFloat(data.laborCost || 0) + parseFloat(data.partsCost || 0);

  // Calcular el próximo mantenimiento si es preventivo
  let nextMileage = null;
  let nextDate = null;

  const mileageInterval = 5000; // Intervalo por defecto
  if (maintenance.type === 'PREVENTIVE') {
    // Próximo mantenimiento basado en kilometraje (por defecto cada 5000 km)
    nextMileage = (data.actualMileage || maintenance.vehicle.currentMileage) + mileageInterval;

    // Próximo mantenimiento basado en tiempo (por defecto cada 3 meses)
    const timeInterval = 3; // meses
    nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + timeInterval);
  }

  const updatedMaintenance = await prisma.maintenance.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedDate: new Date(),
      workPerformed: data.workPerformed,
      partsUsed: data.partsUsed,
      laborCost: data.laborCost || 0,
      partsCost: data.partsCost || 0,
      totalCost,
      actualMileage: data.actualMileage,
      nextMileage,
      nextDate,
      notes: data.notes,
      approvedBy: data.approvedBy,
    },
    include: {
      vehicle: true,
    },
  });

  // Si es preventivo, crear el próximo mantenimiento automáticamente
  if (maintenance.type === 'PREVENTIVE' && nextMileage && nextDate) {
    await prisma.maintenance.create({
      data: {
        vehicleId: maintenance.vehicleId,
        type: 'PREVENTIVE',
        status: 'SCHEDULED',
        description: `Mantenimiento preventivo programado (${mileageInterval} km)`,
        scheduledDate: nextDate,
        scheduledMileage: nextMileage,
        createdBy: maintenance.createdBy,
      },
    });
  }

  return updatedMaintenance;
}

/**
 * Obtener mantenimientos vencidos o próximos a vencer
 * @param {number} daysAhead - Días de anticipación para alertas (por defecto 7)
 * @returns {Promise<Array>} Lista de mantenimientos vencidos o próximos
 */
async function getUpcomingMaintenances(daysAhead = 7) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const maintenances = await prisma.maintenance.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledDate: {
        lte: futureDate,
      },
    },
    include: {
      vehicle: {
        select: {
          id: true,
          code: true,
          plate: true,
          brand: true,
          model: true,
          currentMileage: true,
        },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  // Clasificar en vencidos y próximos
  const overdue = maintenances.filter((m) => m.scheduledDate < today);
  const upcoming = maintenances.filter((m) => m.scheduledDate >= today);

  return {
    overdue,
    upcoming,
    total: maintenances.length,
  };
}

/**
 * Obtener estadísticas de mantenimiento
 * @param {Object} filters - Filtros (vehicleId, startDate, endDate)
 * @returns {Promise<Object>} Estadísticas de mantenimiento
 */
async function getMaintenanceStatistics(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.startDate && filters.endDate) {
    where.scheduledDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const [
    total,
    preventive,
    corrective,
    scheduled,
    inProgress,
    completed,
    totalCost,
    averageCost,
  ] = await Promise.all([
    prisma.maintenance.count({ where }),
    prisma.maintenance.count({ where: { ...where, type: 'PREVENTIVE' } }),
    prisma.maintenance.count({ where: { ...where, type: 'CORRECTIVE' } }),
    prisma.maintenance.count({ where: { ...where, status: 'SCHEDULED' } }),
    prisma.maintenance.count({ where: { ...where, status: 'IN_PROGRESS' } }),
    prisma.maintenance.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.maintenance.aggregate({
      where: { ...where, status: 'COMPLETED' },
      _sum: { totalCost: true },
    }),
    prisma.maintenance.aggregate({
      where: { ...where, status: 'COMPLETED' },
      _avg: { totalCost: true },
    }),
  ]);

  return {
    total,
    preventive,
    corrective,
    scheduled,
    inProgress,
    completed,
    totalCost: totalCost._sum.totalCost || 0,
    averageCost: averageCost._avg.totalCost || 0,
  };
}

/**
 * Obtener historial de mantenimiento de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @returns {Promise<Array>} Historial de mantenimientos
 */
async function getVehicleMaintenanceHistory(vehicleId) {
  const maintenances = await prisma.maintenance.findMany({
    where: { vehicleId },
    orderBy: { scheduledDate: 'desc' },
  });

  return maintenances;
}

export {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  completeMaintenance,
  getUpcomingMaintenances,
  getMaintenanceStatistics,
  getVehicleMaintenanceHistory,
};
