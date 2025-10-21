/**
 * Servicio de Gestión de Vehículos
 * Maneja la lógica de negocio para el inventario de vehículos de la flota
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Obtener todos los vehículos con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados por página
 * @returns {Promise<Object>} Lista de vehículos y metadata de paginación
 */
async function getAllVehicles(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  // Construir condiciones de filtrado
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }

  if (filters.search) {
    where.OR = [
      { code: { contains: filters.search, mode: 'insensitive' } },
      { plate: { contains: filters.search, mode: 'insensitive' } },
      { brand: { contains: filters.search, mode: 'insensitive' } },
      { model: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Ejecutar consulta con paginación
  const [vehicles, total] = await Promise.all([
    prisma.fleetVehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            tripLogs: true,
            fuelControls: true,
            maintenances: true,
          },
        },
      },
    }),
    prisma.fleetVehicle.count({ where }),
  ]);

  return {
    data: vehicles,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un vehículo por ID
 * @param {string} id - ID del vehículo
 * @returns {Promise<Object>} Datos del vehículo
 */
async function getVehicleById(id) {
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id },
    include: {
      tripLogs: {
        take: 10,
        orderBy: { departureDate: 'desc' },
      },
      fuelControls: {
        take: 10,
        orderBy: { loadDate: 'desc' },
      },
      maintenances: {
        take: 10,
        orderBy: { scheduledDate: 'desc' },
      },
      insurances: {
        where: { status: 'ACTIVE' },
        orderBy: { endDate: 'desc' },
      },
      tires: {
        where: { status: 'INSTALLED' },
      },
    },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  return vehicle;
}

/**
 * Crear un nuevo vehículo
 * @param {Object} data - Datos del vehículo
 * @returns {Promise<Object>} Vehículo creado
 */
async function createVehicle(data) {
  // Verificar que el código no exista
  const existingCode = await prisma.fleetVehicle.findUnique({
    where: { code: data.code },
  });

  if (existingCode) {
    throw new AppError('Ya existe un vehículo con ese código', 400);
  }

  // Verificar que la placa no exista
  const existingPlate = await prisma.fleetVehicle.findUnique({
    where: { plate: data.plate },
  });

  if (existingPlate) {
    throw new AppError('Ya existe un vehículo con esa placa', 400);
  }

  // Crear el vehículo
  const vehicle = await prisma.fleetVehicle.create({
    data: {
      ...data,
      acquisitionDate: new Date(data.acquisitionDate),
    },
  });

  return vehicle;
}

/**
 * Actualizar un vehículo
 * @param {string} id - ID del vehículo
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Vehículo actualizado
 */
async function updateVehicle(id, data) {
  // Verificar que el vehículo exista
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  // Si se actualiza el código, verificar que no exista
  if (data.code && data.code !== vehicle.code) {
    const existingCode = await prisma.fleetVehicle.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      throw new AppError('Ya existe un vehículo con ese código', 400);
    }
  }

  // Si se actualiza la placa, verificar que no exista
  if (data.plate && data.plate !== vehicle.plate) {
    const existingPlate = await prisma.fleetVehicle.findUnique({
      where: { plate: data.plate },
    });

    if (existingPlate) {
      throw new AppError('Ya existe un vehículo con esa placa', 400);
    }
  }

  // Actualizar el vehículo
  const updatedVehicle = await prisma.fleetVehicle.update({
    where: { id },
    data: {
      ...data,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined,
    },
  });

  return updatedVehicle;
}

/**
 * Eliminar un vehículo
 * @param {string} id - ID del vehículo
 * @returns {Promise<Object>} Vehículo eliminado
 */
async function deleteVehicle(id) {
  // Verificar que el vehículo exista
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  // Eliminar el vehículo (esto eliminará en cascada los registros relacionados)
  await prisma.fleetVehicle.delete({
    where: { id },
  });

  return { message: 'Vehículo eliminado exitosamente' };
}

/**
 * Obtener estadísticas de la flota
 * @returns {Promise<Object>} Estadísticas generales
 */
async function getFleetStatistics() {
  const [
    total,
    operational,
    inRepair,
    outOfService,
    byType,
    byFuelType,
    averageMileage,
    totalValue,
  ] = await Promise.all([
    prisma.fleetVehicle.count(),
    prisma.fleetVehicle.count({ where: { status: 'OPERATIONAL' } }),
    prisma.fleetVehicle.count({ where: { status: 'IN_REPAIR' } }),
    prisma.fleetVehicle.count({ where: { status: 'OUT_OF_SERVICE' } }),
    prisma.fleetVehicle.groupBy({
      by: ['type'],
      _count: true,
    }),
    prisma.fleetVehicle.groupBy({
      by: ['fuelType'],
      _count: true,
    }),
    prisma.fleetVehicle.aggregate({
      _avg: { currentMileage: true },
    }),
    prisma.fleetVehicle.aggregate({
      _sum: { currentValue: true },
    }),
  ]);

  return {
    total,
    operational,
    inRepair,
    outOfService,
    byType,
    byFuelType,
    averageMileage: averageMileage._avg.currentMileage || 0,
    totalValue: totalValue._sum.currentValue || 0,
  };
}

/**
 * Actualizar el kilometraje de un vehículo
 * @param {string} id - ID del vehículo
 * @param {number} mileage - Nuevo kilometraje
 * @returns {Promise<Object>} Vehículo actualizado
 */
async function updateMileage(id, mileage) {
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  if (mileage < vehicle.currentMileage) {
    throw new AppError('El nuevo kilometraje no puede ser menor al actual', 400);
  }

  const updatedVehicle = await prisma.fleetVehicle.update({
    where: { id },
    data: { currentMileage: mileage },
  });

  return updatedVehicle;
}

export {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getFleetStatistics,
  updateMileage,
};
