/**
 * Servicio de Inmuebles
 * Maneja la lógica de negocio para el Impuesto sobre Inmuebles Urbanos
 */

import prisma from '../../../config/database.js';

/**
 * Obtener todos los inmuebles con paginación y filtros
 */
async function getAllProperties(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.taxpayerId) {
    where.taxpayerId = filters.taxpayerId;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.propertyUse) {
    where.propertyUse = filters.propertyUse;
  }
  
  if (filters.parish) {
    where.parish = filters.parish;
  }
  
  if (filters.isExempt !== undefined) {
    where.isExempt = filters.isExempt === 'true';
  }
  
  if (filters.search) {
    where.OR = [
      { cadastralCode: { contains: filters.search, mode: 'insensitive' } },
      { address: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
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
    prisma.property.count({ where }),
  ]);
  
  return {
    data: properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un inmueble por ID
 */
async function getPropertyById(id) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      taxpayer: true,
      taxBills: {
        where: { taxType: 'PROPERTY_TAX' },
        orderBy: { fiscalYear: 'desc' },
      },
    },
  });
  
  if (!property) {
    throw new Error('Inmueble no encontrado');
  }
  
  return property;
}

/**
 * Crear un nuevo inmueble
 */
async function createProperty(data) {
  // Verificar que el contribuyente existe
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { id: data.taxpayerId },
  });
  
  if (!taxpayer) {
    throw new Error('Contribuyente no encontrado');
  }
  
  // Verificar si ya existe un inmueble con ese código catastral
  const existing = await prisma.property.findUnique({
    where: { cadastralCode: data.cadastralCode },
  });
  
  if (existing) {
    throw new Error('Ya existe un inmueble con ese código catastral');
  }
  
  const property = await prisma.property.create({
    data,
    include: {
      taxpayer: true,
    },
  });
  
  return property;
}

/**
 * Actualizar un inmueble
 */
async function updateProperty(id, data) {
  const existing = await prisma.property.findUnique({
    where: { id },
  });
  
  if (!existing) {
    throw new Error('Inmueble no encontrado');
  }
  
  // Si se está actualizando el código catastral, verificar que no exista otro
  if (data.cadastralCode && data.cadastralCode !== existing.cadastralCode) {
    const duplicate = await prisma.property.findUnique({
      where: { cadastralCode: data.cadastralCode },
    });
    
    if (duplicate) {
      throw new Error('Ya existe un inmueble con ese código catastral');
    }
  }
  
  const property = await prisma.property.update({
    where: { id },
    data,
    include: {
      taxpayer: true,
    },
  });
  
  return property;
}

/**
 * Eliminar un inmueble
 */
async function deleteProperty(id) {
  const existing = await prisma.property.findUnique({
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
    throw new Error('Inmueble no encontrado');
  }
  
  if (existing._count.taxBills > 0) {
    throw new Error('No se puede eliminar un inmueble con facturas asociadas');
  }
  
  const property = await prisma.property.delete({
    where: { id },
  });
  
  return property;
}

/**
 * Calcular el impuesto sobre inmuebles
 */
async function calculatePropertyTax(id, fiscalYear) {
  const property = await prisma.property.findUnique({
    where: { id },
  });
  
  if (!property) {
    throw new Error('Inmueble no encontrado');
  }
  
  if (property.status !== 'ACTIVE') {
    throw new Error('El inmueble no está activo');
  }
  
  // Si está exonerado, verificar vigencia
  if (property.isExempt) {
    if (property.exemptionExpiry && new Date(property.exemptionExpiry) < new Date()) {
      throw new Error('La exoneración ha vencido');
    }
    
    return {
      propertyId: property.id,
      cadastralCode: property.cadastralCode,
      address: property.address,
      fiscalYear,
      isExempt: true,
      exemptionReason: property.exemptionReason,
      taxAmount: 0,
      totalAmount: 0,
    };
  }
  
  // Base imponible: valor catastral total
  const baseAmount = parseFloat(property.totalValue);
  
  // Alícuota según ordenanza
  const taxRate = parseFloat(property.taxRate);
  
  // Cálculo del impuesto
  const taxAmount = baseAmount * taxRate;
  
  // Mínimo tributable (ejemplo: 0.5 UT)
  const minimumTax = 25;
  const finalTaxAmount = Math.max(taxAmount, minimumTax);
  
  return {
    propertyId: property.id,
    cadastralCode: property.cadastralCode,
    address: property.address,
    fiscalYear,
    isExempt: false,
    baseAmount,
    taxRate,
    taxAmount: finalTaxAmount,
    totalAmount: finalTaxAmount,
    calculation: {
      landValue: parseFloat(property.landValue),
      buildingValue: parseFloat(property.buildingValue),
      totalValue: baseAmount,
      rate: taxRate,
      calculatedTax: taxAmount,
      minimumTax,
      finalAmount: finalTaxAmount,
    },
  };
}

/**
 * Generar factura de impuesto para un inmueble
 */
async function generatePropertyTaxBill(id, fiscalYear) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { taxpayer: true },
  });
  
  if (!property) {
    throw new Error('Inmueble no encontrado');
  }
  
  // Verificar si ya existe una factura para este año
  const existingBill = await prisma.taxBill.findFirst({
    where: {
      propertyId: id,
      fiscalYear,
      taxType: 'PROPERTY_TAX',
    },
  });
  
  if (existingBill) {
    throw new Error(`Ya existe una factura para el año ${fiscalYear}`);
  }
  
  // Calcular el impuesto
  const calculation = await calculatePropertyTax(id, fiscalYear);
  
  // Si está exonerado, no generar factura
  if (calculation.isExempt) {
    throw new Error('El inmueble está exonerado del pago de impuestos');
  }
  
  // Generar número de factura
  const billNumber = await generateBillNumber('PROPERTY', fiscalYear);
  
  // Fechas
  const issueDate = new Date();
  const dueDate = new Date(fiscalYear, 11, 31); // 31 de diciembre
  
  // Crear la factura
  const taxBill = await prisma.taxBill.create({
    data: {
      billNumber,
      taxpayerId: property.taxpayerId,
      taxType: 'PROPERTY_TAX',
      propertyId: id,
      fiscalYear,
      fiscalPeriod: 'ANUAL',
      baseAmount: calculation.baseAmount,
      taxRate: calculation.taxRate,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
      balanceAmount: calculation.totalAmount,
      issueDate,
      dueDate,
      concept: `Impuesto sobre Inmuebles Urbanos - ${property.address} - Año ${fiscalYear}`,
      status: 'PENDING',
    },
    include: {
      taxpayer: true,
      property: true,
    },
  });
  
  return taxBill;
}

/**
 * Aplicar o remover exoneración
 */
async function updatePropertyExemption(id, exemptionData) {
  const property = await prisma.property.findUnique({
    where: { id },
  });
  
  if (!property) {
    throw new Error('Inmueble no encontrado');
  }
  
  const updated = await prisma.property.update({
    where: { id },
    data: {
      isExempt: exemptionData.isExempt,
      exemptionReason: exemptionData.exemptionReason || null,
      exemptionExpiry: exemptionData.exemptionExpiry || null,
    },
  });
  
  return updated;
}

/**
 * Generar número de factura único
 */
async function generateBillNumber(type, year) {
  const prefix = type === 'PROPERTY' ? 'IIU' : 'FAC';
  
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
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  calculatePropertyTax,
  generatePropertyTaxBill,
  updatePropertyExemption,
};
