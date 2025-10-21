/**
 * Servicio de Control de Combustible
 * Maneja la lógica de negocio para el control de combustible de vehículos
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Obtener todos los registros de combustible con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados por página
 * @returns {Promise<Object>} Lista de registros y metadata de paginación
 */
async function getAllFuelControls(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.startDate && filters.endDate) {
    where.loadDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const [fuelControls, total] = await Promise.all([
    prisma.fuelControl.findMany({
      where,
      skip,
      take: limit,
      orderBy: { loadDate: 'desc' },
      include: {
        vehicle: {
          select: {
            id: true,
            code: true,
            plate: true,
            brand: true,
            model: true,
            type: true,
          },
        },
      },
    }),
    prisma.fuelControl.count({ where }),
  ]);

  return {
    data: fuelControls,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un registro de combustible por ID
 * @param {string} id - ID del registro
 * @returns {Promise<Object>} Datos del registro
 */
async function getFuelControlById(id) {
  const fuelControl = await prisma.fuelControl.findUnique({
    where: { id },
    include: {
      vehicle: true,
    },
  });

  if (!fuelControl) {
    throw new AppError('Registro de combustible no encontrado', 404);
  }

  return fuelControl;
}

/**
 * Crear un nuevo registro de combustible
 * @param {Object} data - Datos del registro
 * @returns {Promise<Object>} Registro creado
 */
async function createFuelControl(data) {
  // Verificar que el vehículo exista
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  // Verificar que el número de vale no exista
  const existingVoucher = await prisma.fuelControl.findUnique({
    where: { voucherNumber: data.voucherNumber },
  });

  if (existingVoucher) {
    throw new AppError('Ya existe un registro con ese número de vale', 400);
  }

  // Calcular eficiencia si es posible
  let efficiency = null;
  if (data.mileageAtLoad > 0) {
    // Obtener la última carga de combustible para calcular el rendimiento
    const lastFuelControl = await prisma.fuelControl.findFirst({
      where: { vehicleId: data.vehicleId },
      orderBy: { loadDate: 'desc' },
    });

    if (lastFuelControl && lastFuelControl.mileageAtLoad < data.mileageAtLoad) {
      const distanceTraveled = data.mileageAtLoad - lastFuelControl.mileageAtLoad;
      const litersUsed = lastFuelControl.loadedLiters;
      efficiency = distanceTraveled / litersUsed;
    }
  }

  // Crear el registro
  const fuelControl = await prisma.fuelControl.create({
    data: {
      ...data,
      efficiency,
      loadDate: new Date(data.loadDate),
    },
    include: {
      vehicle: true,
    },
  });

  return fuelControl;
}

/**
 * Actualizar un registro de combustible
 * @param {string} id - ID del registro
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Registro actualizado
 */
async function updateFuelControl(id, data) {
  const fuelControl = await prisma.fuelControl.findUnique({
    where: { id },
  });

  if (!fuelControl) {
    throw new AppError('Registro de combustible no encontrado', 404);
  }

  // Si se actualiza el número de vale, verificar que no exista
  if (data.voucherNumber && data.voucherNumber !== fuelControl.voucherNumber) {
    const existingVoucher = await prisma.fuelControl.findUnique({
      where: { voucherNumber: data.voucherNumber },
    });

    if (existingVoucher) {
      throw new AppError('Ya existe un registro con ese número de vale', 400);
    }
  }

  const updatedFuelControl = await prisma.fuelControl.update({
    where: { id },
    data: {
      ...data,
      loadDate: data.loadDate ? new Date(data.loadDate) : undefined,
    },
    include: {
      vehicle: true,
    },
  });

  return updatedFuelControl;
}

/**
 * Eliminar un registro de combustible
 * @param {string} id - ID del registro
 * @returns {Promise<Object>} Mensaje de confirmación
 */
async function deleteFuelControl(id) {
  const fuelControl = await prisma.fuelControl.findUnique({
    where: { id },
  });

  if (!fuelControl) {
    throw new AppError('Registro de combustible no encontrado', 404);
  }

  await prisma.fuelControl.delete({
    where: { id },
  });

  return { message: 'Registro de combustible eliminado exitosamente' };
}

/**
 * Obtener estadísticas de consumo de combustible
 * @param {Object} filters - Filtros (vehicleId, startDate, endDate)
 * @returns {Promise<Object>} Estadísticas de consumo
 */
async function getFuelStatistics(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.startDate && filters.endDate) {
    where.loadDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const [totalLoads, totalLiters, totalCost, averageEfficiency, byVehicle] = await Promise.all([
    prisma.fuelControl.count({ where }),
    prisma.fuelControl.aggregate({
      where,
      _sum: { loadedLiters: true },
    }),
    prisma.fuelControl.aggregate({
      where: { ...where, cost: { not: null } },
      _sum: { cost: true },
    }),
    prisma.fuelControl.aggregate({
      where: { ...where, efficiency: { not: null } },
      _avg: { efficiency: true },
    }),
    prisma.fuelControl.groupBy({
      by: ['vehicleId'],
      where,
      _sum: {
        loadedLiters: true,
        cost: true,
      },
      _avg: {
        efficiency: true,
      },
      _count: true,
    }),
  ]);

  return {
    totalLoads,
    totalLiters: totalLiters._sum.loadedLiters || 0,
    totalCost: totalCost._sum.cost || 0,
    averageEfficiency: averageEfficiency._avg.efficiency || 0,
    byVehicle,
  };
}

/**
 * Obtener el rendimiento de combustible de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @param {number} months - Número de meses a considerar (por defecto 6)
 * @returns {Promise<Object>} Datos de rendimiento
 */
async function getVehicleFuelEfficiency(vehicleId, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const fuelControls = await prisma.fuelControl.findMany({
    where: {
      vehicleId,
      loadDate: { gte: startDate },
      efficiency: { not: null },
    },
    orderBy: { loadDate: 'asc' },
  });

  if (fuelControls.length === 0) {
    return {
      vehicleId,
      averageEfficiency: 0,
      minEfficiency: 0,
      maxEfficiency: 0,
      records: [],
    };
  }

  const efficiencies = fuelControls.map((fc) => parseFloat(fc.efficiency));
  const averageEfficiency = efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length;
  const minEfficiency = Math.min(...efficiencies);
  const maxEfficiency = Math.max(...efficiencies);

  return {
    vehicleId,
    averageEfficiency,
    minEfficiency,
    maxEfficiency,
    records: fuelControls,
  };
}

export {
  getAllFuelControls,
  getFuelControlById,
  createFuelControl,
  updateFuelControl,
  deleteFuelControl,
  getFuelStatistics,
  getVehicleFuelEfficiency,
};
