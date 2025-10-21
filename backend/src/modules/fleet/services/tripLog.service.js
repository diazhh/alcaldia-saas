/**
 * Servicio de Bitácora de Viajes
 * Maneja la lógica de negocio para el registro de viajes de vehículos
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Obtener todos los registros de viaje con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados por página
 * @returns {Promise<Object>} Lista de viajes y metadata de paginación
 */
async function getAllTripLogs(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.driverName) {
    where.driverName = { contains: filters.driverName, mode: 'insensitive' };
  }

  if (filters.startDate && filters.endDate) {
    where.departureDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const [tripLogs, total] = await Promise.all([
    prisma.tripLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { departureDate: 'desc' },
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
    prisma.tripLog.count({ where }),
  ]);

  return {
    data: tripLogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un registro de viaje por ID
 * @param {string} id - ID del registro de viaje
 * @returns {Promise<Object>} Datos del viaje
 */
async function getTripLogById(id) {
  const tripLog = await prisma.tripLog.findUnique({
    where: { id },
    include: {
      vehicle: true,
    },
  });

  if (!tripLog) {
    throw new AppError('Registro de viaje no encontrado', 404);
  }

  return tripLog;
}

/**
 * Crear un nuevo registro de viaje
 * @param {Object} data - Datos del viaje
 * @returns {Promise<Object>} Viaje creado
 */
async function createTripLog(data) {
  // Verificar que el vehículo exista
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  // Verificar que el kilometraje inicial sea mayor o igual al actual del vehículo
  if (data.startMileage < vehicle.currentMileage) {
    throw new AppError(
      'El kilometraje inicial no puede ser menor al kilometraje actual del vehículo',
      400
    );
  }

  // Crear el registro de viaje
  const tripLog = await prisma.tripLog.create({
    data: {
      ...data,
      departureDate: new Date(data.departureDate),
      returnDate: data.returnDate ? new Date(data.returnDate) : null,
    },
    include: {
      vehicle: true,
    },
  });

  return tripLog;
}

/**
 * Actualizar un registro de viaje
 * @param {string} id - ID del registro de viaje
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Viaje actualizado
 */
async function updateTripLog(id, data) {
  const tripLog = await prisma.tripLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });

  if (!tripLog) {
    throw new AppError('Registro de viaje no encontrado', 404);
  }

  // Si se actualiza el kilometraje final, calcular la distancia
  let distance = tripLog.distance;
  if (data.endMileage !== undefined) {
    const startMileage = data.startMileage || tripLog.startMileage;
    distance = data.endMileage - startMileage;

    if (distance < 0) {
      throw new AppError('El kilometraje final no puede ser menor al inicial', 400);
    }

    // Actualizar el kilometraje del vehículo si es mayor
    if (data.endMileage > tripLog.vehicle.currentMileage) {
      await prisma.fleetVehicle.update({
        where: { id: tripLog.vehicleId },
        data: { currentMileage: data.endMileage },
      });
    }
  }

  const updatedTripLog = await prisma.tripLog.update({
    where: { id },
    data: {
      ...data,
      distance,
      departureDate: data.departureDate ? new Date(data.departureDate) : undefined,
      returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
    },
    include: {
      vehicle: true,
    },
  });

  return updatedTripLog;
}

/**
 * Eliminar un registro de viaje
 * @param {string} id - ID del registro de viaje
 * @returns {Promise<Object>} Mensaje de confirmación
 */
async function deleteTripLog(id) {
  const tripLog = await prisma.tripLog.findUnique({
    where: { id },
  });

  if (!tripLog) {
    throw new AppError('Registro de viaje no encontrado', 404);
  }

  await prisma.tripLog.delete({
    where: { id },
  });

  return { message: 'Registro de viaje eliminado exitosamente' };
}

/**
 * Finalizar un viaje (registrar retorno)
 * @param {string} id - ID del registro de viaje
 * @param {Object} data - Datos de finalización (endMileage, returnDate, observations)
 * @returns {Promise<Object>} Viaje actualizado
 */
async function finalizeTripLog(id, data) {
  const tripLog = await prisma.tripLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });

  if (!tripLog) {
    throw new AppError('Registro de viaje no encontrado', 404);
  }

  if (tripLog.returnDate) {
    throw new AppError('Este viaje ya ha sido finalizado', 400);
  }

  if (!data.endMileage) {
    throw new AppError('El kilometraje final es requerido', 400);
  }

  const distance = data.endMileage - tripLog.startMileage;

  if (distance < 0) {
    throw new AppError('El kilometraje final no puede ser menor al inicial', 400);
  }

  // Actualizar el viaje y el kilometraje del vehículo en una transacción
  const [updatedTripLog] = await prisma.$transaction([
    prisma.tripLog.update({
      where: { id },
      data: {
        endMileage: data.endMileage,
        distance,
        returnDate: data.returnDate ? new Date(data.returnDate) : new Date(),
        observations: data.observations || tripLog.observations,
      },
      include: {
        vehicle: true,
      },
    }),
    prisma.fleetVehicle.update({
      where: { id: tripLog.vehicleId },
      data: { currentMileage: data.endMileage },
    }),
  ]);

  return updatedTripLog;
}

/**
 * Obtener estadísticas de viajes
 * @param {Object} filters - Filtros (vehicleId, startDate, endDate)
 * @returns {Promise<Object>} Estadísticas de viajes
 */
async function getTripStatistics(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.startDate && filters.endDate) {
    where.departureDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const [total, completed, inProgress, totalDistance] = await Promise.all([
    prisma.tripLog.count({ where }),
    prisma.tripLog.count({
      where: { ...where, returnDate: { not: null } },
    }),
    prisma.tripLog.count({
      where: { ...where, returnDate: null },
    }),
    prisma.tripLog.aggregate({
      where: { ...where, distance: { not: null } },
      _sum: { distance: true },
    }),
  ]);

  return {
    total,
    completed,
    inProgress,
    totalDistance: totalDistance._sum.distance || 0,
  };
}

export {
  getAllTripLogs,
  getTripLogById,
  createTripLog,
  updateTripLog,
  deleteTripLog,
  finalizeTripLog,
  getTripStatistics,
};
