/**
 * Servicio de Vehículos
 * Maneja la lógica de negocio para el Impuesto sobre Vehículos
 */

import prisma from '../../../config/database.js';

/**
 * Obtener todos los vehículos con paginación y filtros
 */
async function getAllVehicles(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.taxpayerId) {
    where.taxpayerId = filters.taxpayerId;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.vehicleType) {
    where.vehicleType = filters.vehicleType;
  }
  
  if (filters.search) {
    where.OR = [
      { plate: { contains: filters.search, mode: 'insensitive' } },
      { brand: { contains: filters.search, mode: 'insensitive' } },
      { model: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        taxpayer: {
          select: {
            id: true,
            taxId: true,
            firstName: true,
            lastName: true,
            businessName: true,
            taxpayerType: true,
          },
        },
        _count: {
          select: {
            taxBills: true,
          },
        },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);
  
  return {
    data: vehicles,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un vehículo por ID
 */
async function getVehicleById(id) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      taxpayer: true,
      taxBills: {
        where: { taxType: 'VEHICLE_TAX' },
        orderBy: { fiscalYear: 'desc' },
      },
    },
  });
  
  if (!vehicle) {
    throw new Error('Vehículo no encontrado');
  }
  
  return vehicle;
}

/**
 * Crear un nuevo vehículo
 */
async function createVehicle(data) {
  // Verificar que el contribuyente existe
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { id: data.taxpayerId },
  });
  
  if (!taxpayer) {
    throw new Error('Contribuyente no encontrado');
  }
  
  // Verificar si ya existe un vehículo con esa placa
  const existing = await prisma.vehicle.findUnique({
    where: { plate: data.plate },
  });
  
  if (existing) {
    throw new Error('Ya existe un vehículo con esa placa');
  }
  
  const vehicle = await prisma.vehicle.create({
    data,
    include: {
      taxpayer: true,
    },
  });
  
  return vehicle;
}

/**
 * Actualizar un vehículo
 */
async function updateVehicle(id, data) {
  const existing = await prisma.vehicle.findUnique({
    where: { id },
  });
  
  if (!existing) {
    throw new Error('Vehículo no encontrado');
  }
  
  // Si se está actualizando la placa, verificar que no exista otro
  if (data.plate && data.plate !== existing.plate) {
    const duplicate = await prisma.vehicle.findUnique({
      where: { plate: data.plate },
    });
    
    if (duplicate) {
      throw new Error('Ya existe un vehículo con esa placa');
    }
  }
  
  const vehicle = await prisma.vehicle.update({
    where: { id },
    data,
    include: {
      taxpayer: true,
    },
  });
  
  return vehicle;
}

/**
 * Eliminar un vehículo
 */
async function deleteVehicle(id) {
  const existing = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          taxBills: true,
        },
      },
    },
  });
  
  if (!existing) {
    throw new Error('Vehículo no encontrado');
  }
  
  if (existing._count.taxBills > 0) {
    throw new Error('No se puede eliminar un vehículo con facturas asociadas');
  }
  
  const vehicle = await prisma.vehicle.delete({
    where: { id },
  });
  
  return vehicle;
}

/**
 * Calcular el impuesto sobre vehículos
 */
async function calculateVehicleTax(id, fiscalYear) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });
  
  if (!vehicle) {
    throw new Error('Vehículo no encontrado');
  }
  
  if (vehicle.status !== 'ACTIVE') {
    throw new Error('El vehículo no está activo');
  }
  
  // Base imponible: valor fiscal del vehículo
  const baseAmount = parseFloat(vehicle.assessedValue);
  
  // Alícuota según ordenanza
  const taxRate = parseFloat(vehicle.taxRate);
  
  // Factor de depreciación por año
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicle.year;
  const depreciationFactor = Math.max(1 - (vehicleAge * 0.05), 0.3); // Máximo 70% depreciación
  
  // Valor ajustado por depreciación
  const adjustedValue = baseAmount * depreciationFactor;
  
  // Cálculo del impuesto
  const taxAmount = adjustedValue * taxRate;
  
  // Mínimo tributable (ejemplo: 0.3 UT)
  const minimumTax = 15;
  const finalTaxAmount = Math.max(taxAmount, minimumTax);
  
  return {
    vehicleId: vehicle.id,
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    fiscalYear,
    baseAmount,
    adjustedValue,
    taxRate,
    taxAmount: finalTaxAmount,
    totalAmount: finalTaxAmount,
    calculation: {
      assessedValue: baseAmount,
      vehicleAge,
      depreciationFactor,
      adjustedValue,
      rate: taxRate,
      calculatedTax: taxAmount,
      minimumTax,
      finalAmount: finalTaxAmount,
    },
  };
}

/**
 * Generar factura de impuesto para un vehículo
 */
async function generateVehicleTaxBill(id, fiscalYear) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { taxpayer: true },
  });
  
  if (!vehicle) {
    throw new Error('Vehículo no encontrado');
  }
  
  // Verificar si ya existe una factura para este año
  const existingBill = await prisma.taxBill.findFirst({
    where: {
      vehicleId: id,
      fiscalYear,
      taxType: 'VEHICLE_TAX',
    },
  });
  
  if (existingBill) {
    throw new Error(`Ya existe una factura para el año ${fiscalYear}`);
  }
  
  // Calcular el impuesto
  const calculation = await calculateVehicleTax(id, fiscalYear);
  
  // Generar número de factura
  const billNumber = await generateBillNumber('VEHICLE', fiscalYear);
  
  // Fechas
  const issueDate = new Date();
  const dueDate = new Date(fiscalYear, 11, 31); // 31 de diciembre
  
  // Crear la factura
  const taxBill = await prisma.taxBill.create({
    data: {
      billNumber,
      taxpayerId: vehicle.taxpayerId,
      taxType: 'VEHICLE_TAX',
      vehicleId: id,
      fiscalYear,
      fiscalPeriod: 'ANUAL',
      baseAmount: calculation.adjustedValue,
      taxRate: calculation.taxRate,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
      balanceAmount: calculation.totalAmount,
      issueDate,
      dueDate,
      concept: `Impuesto sobre Vehículos - ${vehicle.brand} ${vehicle.model} (${vehicle.plate}) - Año ${fiscalYear}`,
      status: 'PENDING',
    },
    include: {
      taxpayer: true,
      vehicle: true,
    },
  });
  
  return taxBill;
}

/**
 * Transferir vehículo a otro contribuyente
 */
async function transferVehicle(id, newTaxpayerId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });
  
  if (!vehicle) {
    throw new Error('Vehículo no encontrado');
  }
  
  // Verificar que el nuevo contribuyente existe
  const newTaxpayer = await prisma.taxpayer.findUnique({
    where: { id: newTaxpayerId },
  });
  
  if (!newTaxpayer) {
    throw new Error('Nuevo contribuyente no encontrado');
  }
  
  // Verificar que no tenga deudas pendientes
  const pendingBills = await prisma.taxBill.count({
    where: {
      vehicleId: id,
      status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
    },
  });
  
  if (pendingBills > 0) {
    throw new Error('El vehículo tiene deudas pendientes. Debe estar solvente para transferir.');
  }
  
  const updated = await prisma.vehicle.update({
    where: { id },
    data: {
      taxpayerId: newTaxpayerId,
    },
    include: {
      taxpayer: true,
    },
  });
  
  return updated;
}

/**
 * Generar número de factura único
 */
async function generateBillNumber(type, year) {
  const prefix = type === 'VEHICLE' ? 'IVH' : 'FAC';
  
  const count = await prisma.taxBill.count({
    where: {
      fiscalYear: year,
      billNumber: {
        startsWith: `${prefix}-${year}`,
      },
    },
  });
  
  const sequential = String(count + 1).padStart(6, '0');
  return `${prefix}-${year}-${sequential}`;
}

export {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  calculateVehicleTax,
  generateVehicleTaxBill,
  transferVehicle,
};
