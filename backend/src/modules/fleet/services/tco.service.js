/**
 * Servicio de Cálculo de TCO (Total Cost of Ownership)
 * Calcula el costo total de propiedad de vehículos de la flota
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Calcular el TCO de un vehículo
 * @param {string} vehicleId - ID del vehículo
 * @param {Object} options - Opciones de cálculo (startDate, endDate)
 * @returns {Promise<Object>} Datos del TCO
 */
async function calculateVehicleTCO(vehicleId, options = {}) {
  // Verificar que el vehículo exista
  const vehicle = await prisma.fleetVehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw new AppError('Vehículo no encontrado', 404);
  }

  // Definir rango de fechas (por defecto último año)
  const endDate = options.endDate ? new Date(options.endDate) : new Date();
  const startDate = options.startDate
    ? new Date(options.startDate)
    : new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());

  // 1. Costo de combustible
  const fuelCost = await prisma.fuelControl.aggregate({
    where: {
      vehicleId,
      loadDate: { gte: startDate, lte: endDate },
      cost: { not: null },
    },
    _sum: { cost: true },
  });

  // 2. Costo de mantenimiento (preventivo y correctivo)
  const maintenanceCost = await prisma.maintenance.aggregate({
    where: {
      vehicleId,
      completedDate: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
    _sum: { totalCost: true },
  });

  // 3. Costo de seguros
  const insuranceCost = await prisma.fleetInsurance.aggregate({
    where: {
      vehicleId,
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    _sum: { premium: true },
  });

  // 4. Costo de neumáticos
  const tireCost = await prisma.tire.aggregate({
    where: {
      vehicleId,
      installationDate: { gte: startDate, lte: endDate },
    },
    _sum: { cost: true },
  });

  // 5. Depreciación
  const vehicleAge = new Date().getFullYear() - vehicle.year;
  const depreciationRate = 0.15; // 15% anual (ajustable según política)
  const yearsInPeriod =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const depreciation =
    parseFloat(vehicle.acquisitionValue) * depreciationRate * yearsInPeriod;

  // 6. Kilometraje recorrido en el período
  const tripLogs = await prisma.tripLog.findMany({
    where: {
      vehicleId,
      departureDate: { gte: startDate, lte: endDate },
      distance: { not: null },
    },
  });

  const totalDistance = tripLogs.reduce((sum, trip) => sum + (trip.distance || 0), 0);

  // Calcular totales
  const totalFuelCost = parseFloat(fuelCost._sum.cost || 0);
  const totalMaintenanceCost = parseFloat(maintenanceCost._sum.totalCost || 0);
  const totalInsuranceCost = parseFloat(insuranceCost._sum.premium || 0);
  const totalTireCost = parseFloat(tireCost._sum.cost || 0);

  const totalOperatingCost =
    totalFuelCost + totalMaintenanceCost + totalInsuranceCost + totalTireCost;

  const totalCost = totalOperatingCost + depreciation;

  // Costo por kilómetro
  const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

  return {
    vehicleId,
    vehicle: {
      code: vehicle.code,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      acquisitionValue: parseFloat(vehicle.acquisitionValue),
      currentValue: parseFloat(vehicle.currentValue),
    },
    period: {
      startDate,
      endDate,
      days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
    },
    costs: {
      fuel: totalFuelCost,
      maintenance: totalMaintenanceCost,
      insurance: totalInsuranceCost,
      tires: totalTireCost,
      depreciation,
      totalOperating: totalOperatingCost,
      total: totalCost,
    },
    usage: {
      totalDistance,
      costPerKm,
    },
    breakdown: {
      fuelPercentage: totalCost > 0 ? (totalFuelCost / totalCost) * 100 : 0,
      maintenancePercentage: totalCost > 0 ? (totalMaintenanceCost / totalCost) * 100 : 0,
      insurancePercentage: totalCost > 0 ? (totalInsuranceCost / totalCost) * 100 : 0,
      tiresPercentage: totalCost > 0 ? (totalTireCost / totalCost) * 100 : 0,
      depreciationPercentage: totalCost > 0 ? (depreciation / totalCost) * 100 : 0,
    },
  };
}

/**
 * Calcular el TCO de toda la flota
 * @param {Object} options - Opciones de cálculo (startDate, endDate, type, status)
 * @returns {Promise<Object>} TCO de la flota
 */
async function calculateFleetTCO(options = {}) {
  // Definir rango de fechas (por defecto último año)
  const endDate = options.endDate ? new Date(options.endDate) : new Date();
  const startDate = options.startDate
    ? new Date(options.startDate)
    : new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());

  // Filtros de vehículos
  const vehicleWhere = {};
  if (options.type) {
    vehicleWhere.type = options.type;
  }
  if (options.status) {
    vehicleWhere.status = options.status;
  }

  // Obtener todos los vehículos que cumplen los filtros
  const vehicles = await prisma.fleetVehicle.findMany({
    where: vehicleWhere,
  });

  // Calcular TCO para cada vehículo
  const vehicleTCOs = await Promise.all(
    vehicles.map((vehicle) =>
      calculateVehicleTCO(vehicle.id, { startDate, endDate })
    )
  );

  // Agregar totales
  const totalCosts = vehicleTCOs.reduce(
    (acc, tco) => ({
      fuel: acc.fuel + tco.costs.fuel,
      maintenance: acc.maintenance + tco.costs.maintenance,
      insurance: acc.insurance + tco.costs.insurance,
      tires: acc.tires + tco.costs.tires,
      depreciation: acc.depreciation + tco.costs.depreciation,
      totalOperating: acc.totalOperating + tco.costs.totalOperating,
      total: acc.total + tco.costs.total,
    }),
    {
      fuel: 0,
      maintenance: 0,
      insurance: 0,
      tires: 0,
      depreciation: 0,
      totalOperating: 0,
      total: 0,
    }
  );

  const totalDistance = vehicleTCOs.reduce((sum, tco) => sum + tco.usage.totalDistance, 0);

  const averageCostPerKm = totalDistance > 0 ? totalCosts.total / totalDistance : 0;

  // Ordenar vehículos por costo total (más costosos primero)
  const rankedVehicles = vehicleTCOs
    .sort((a, b) => b.costs.total - a.costs.total)
    .map((tco, index) => ({
      rank: index + 1,
      vehicleId: tco.vehicleId,
      vehicle: tco.vehicle,
      totalCost: tco.costs.total,
      costPerKm: tco.usage.costPerKm,
    }));

  return {
    period: {
      startDate,
      endDate,
      days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
    },
    fleet: {
      totalVehicles: vehicles.length,
      totalDistance,
    },
    costs: totalCosts,
    averageCostPerKm,
    rankedVehicles,
    breakdown: {
      fuelPercentage: totalCosts.total > 0 ? (totalCosts.fuel / totalCosts.total) * 100 : 0,
      maintenancePercentage:
        totalCosts.total > 0 ? (totalCosts.maintenance / totalCosts.total) * 100 : 0,
      insurancePercentage:
        totalCosts.total > 0 ? (totalCosts.insurance / totalCosts.total) * 100 : 0,
      tiresPercentage: totalCosts.total > 0 ? (totalCosts.tires / totalCosts.total) * 100 : 0,
      depreciationPercentage:
        totalCosts.total > 0 ? (totalCosts.depreciation / totalCosts.total) * 100 : 0,
    },
  };
}

/**
 * Comparar TCO de múltiples vehículos
 * @param {Array<string>} vehicleIds - IDs de los vehículos a comparar
 * @param {Object} options - Opciones de cálculo (startDate, endDate)
 * @returns {Promise<Array>} Comparación de TCOs
 */
async function compareVehicleTCO(vehicleIds, options = {}) {
  const tcos = await Promise.all(
    vehicleIds.map((id) => calculateVehicleTCO(id, options))
  );

  return tcos.sort((a, b) => b.costs.total - a.costs.total);
}

export {
  calculateVehicleTCO,
  calculateFleetTCO,
  compareVehicleTCO,
};
