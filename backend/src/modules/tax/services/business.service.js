/**
 * Servicio de Negocios (Patentes Comerciales)
 * Maneja la lógica de negocio para el Impuesto sobre Actividades Económicas
 */

import prisma from '../../../config/database.js';

/**
 * Obtener todos los negocios con paginación y filtros
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Lista de negocios y metadata
 */
async function getAllBusinesses(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (filters.taxpayerId) {
    where.taxpayerId = filters.taxpayerId;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.activityCode) {
    where.activityCode = filters.activityCode;
  }
  
  if (filters.parish) {
    where.parish = filters.parish;
  }
  
  if (filters.search) {
    where.OR = [
      { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
      { businessName: { contains: filters.search, mode: 'insensitive' } },
      { tradeName: { contains: filters.search, mode: 'insensitive' } },
      { activityName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
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
            inspections: true,
            taxBills: true,
          },
        },
      },
    }),
    prisma.business.count({ where }),
  ]);
  
  return {
    data: businesses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un negocio por ID
 * @param {string} id - ID del negocio
 * @returns {Promise<Object>} Negocio encontrado
 */
async function getBusinessById(id) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      taxpayer: true,
      inspections: {
        orderBy: { inspectionDate: 'desc' },
      },
      taxBills: {
        where: { taxType: 'BUSINESS_TAX' },
        orderBy: { fiscalYear: 'desc' },
      },
    },
  });
  
  if (!business) {
    throw new Error('Negocio no encontrado');
  }
  
  return business;
}

/**
 * Crear un nuevo negocio
 * @param {Object} data - Datos del negocio
 * @returns {Promise<Object>} Negocio creado
 */
async function createBusiness(data) {
  // Verificar que el contribuyente existe
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { id: data.taxpayerId },
  });
  
  if (!taxpayer) {
    throw new Error('Contribuyente no encontrado');
  }
  
  // Verificar si ya existe un negocio con ese número de licencia
  const existing = await prisma.business.findUnique({
    where: { licenseNumber: data.licenseNumber },
  });
  
  if (existing) {
    throw new Error('Ya existe un negocio con ese número de licencia');
  }
  
  const business = await prisma.business.create({
    data,
    include: {
      taxpayer: true,
    },
  });
  
  return business;
}

/**
 * Actualizar un negocio
 * @param {string} id - ID del negocio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Negocio actualizado
 */
async function updateBusiness(id, data) {
  const existing = await prisma.business.findUnique({
    where: { id },
  });
  
  if (!existing) {
    throw new Error('Negocio no encontrado');
  }
  
  // Si se está actualizando el número de licencia, verificar que no exista otro
  if (data.licenseNumber && data.licenseNumber !== existing.licenseNumber) {
    const duplicate = await prisma.business.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });
    
    if (duplicate) {
      throw new Error('Ya existe un negocio con ese número de licencia');
    }
  }
  
  const business = await prisma.business.update({
    where: { id },
    data,
    include: {
      taxpayer: true,
    },
  });
  
  return business;
}

/**
 * Eliminar un negocio
 * @param {string} id - ID del negocio
 * @returns {Promise<Object>} Negocio eliminado
 */
async function deleteBusiness(id) {
  const existing = await prisma.business.findUnique({
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
    throw new Error('Negocio no encontrado');
  }
  
  // Verificar que no tenga facturas asociadas
  if (existing._count.taxBills > 0) {
    throw new Error('No se puede eliminar un negocio con facturas asociadas');
  }
  
  const business = await prisma.business.delete({
    where: { id },
  });
  
  return business;
}

/**
 * Calcular el impuesto de actividades económicas para un negocio
 * @param {string} id - ID del negocio
 * @param {number} fiscalYear - Año fiscal
 * @returns {Promise<Object>} Cálculo del impuesto
 */
async function calculateBusinessTax(id, fiscalYear) {
  const business = await prisma.business.findUnique({
    where: { id },
  });
  
  if (!business) {
    throw new Error('Negocio no encontrado');
  }
  
  // Verificar que el negocio esté activo
  if (business.status !== 'ACTIVE') {
    throw new Error('El negocio no está activo');
  }
  
  // Base imponible: ingresos brutos anuales
  const baseAmount = business.annualIncome || 0;
  
  // Alícuota según categoría
  const taxRate = business.taxRate;
  
  // Cálculo del impuesto
  const taxAmount = baseAmount * taxRate;
  
  // Mínimo tributable (ejemplo: 1 UT)
  const minimumTax = 50; // Ajustar según ordenanza
  const finalTaxAmount = Math.max(taxAmount, minimumTax);
  
  return {
    businessId: business.id,
    businessName: business.businessName,
    licenseNumber: business.licenseNumber,
    fiscalYear,
    baseAmount,
    taxRate,
    taxAmount: finalTaxAmount,
    calculation: {
      annualIncome: baseAmount,
      rate: taxRate,
      calculatedTax: taxAmount,
      minimumTax,
      finalAmount: finalTaxAmount,
    },
  };
}

/**
 * Generar factura de impuesto para un negocio
 * @param {string} id - ID del negocio
 * @param {number} fiscalYear - Año fiscal
 * @returns {Promise<Object>} Factura generada
 */
async function generateBusinessTaxBill(id, fiscalYear) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: { taxpayer: true },
  });
  
  if (!business) {
    throw new Error('Negocio no encontrado');
  }
  
  // Verificar si ya existe una factura para este año
  const existingBill = await prisma.taxBill.findFirst({
    where: {
      businessId: id,
      fiscalYear,
      taxType: 'BUSINESS_TAX',
    },
  });
  
  if (existingBill) {
    throw new Error(`Ya existe una factura para el año ${fiscalYear}`);
  }
  
  // Calcular el impuesto
  const calculation = await calculateBusinessTax(id, fiscalYear);
  
  // Generar número de factura
  const billNumber = await generateBillNumber('BUSINESS', fiscalYear);
  
  // Fechas
  const issueDate = new Date();
  const dueDate = new Date(fiscalYear, 11, 31); // 31 de diciembre del año fiscal
  
  // Crear la factura
  const taxBill = await prisma.taxBill.create({
    data: {
      billNumber,
      taxpayerId: business.taxpayerId,
      taxType: 'BUSINESS_TAX',
      businessId: id,
      fiscalYear,
      fiscalPeriod: 'ANUAL',
      baseAmount: calculation.baseAmount,
      taxRate: calculation.taxRate,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.taxAmount,
      balanceAmount: calculation.taxAmount,
      issueDate,
      dueDate,
      concept: `Impuesto sobre Actividades Económicas - ${business.businessName} - Año ${fiscalYear}`,
      status: 'PENDING',
    },
    include: {
      taxpayer: true,
      business: true,
    },
  });
  
  return taxBill;
}

/**
 * Renovar licencia de un negocio
 * @param {string} id - ID del negocio
 * @param {Date} newExpiryDate - Nueva fecha de vencimiento
 * @returns {Promise<Object>} Negocio actualizado
 */
async function renewBusinessLicense(id, newExpiryDate) {
  const business = await prisma.business.findUnique({
    where: { id },
  });
  
  if (!business) {
    throw new Error('Negocio no encontrado');
  }
  
  const updated = await prisma.business.update({
    where: { id },
    data: {
      licenseDate: new Date(),
      expiryDate: newExpiryDate,
      status: 'ACTIVE',
    },
  });
  
  return updated;
}

/**
 * Generar número de factura único
 * @param {string} type - Tipo de factura
 * @param {number} year - Año
 * @returns {Promise<string>} Número de factura
 */
async function generateBillNumber(type, year) {
  const prefix = type === 'BUSINESS' ? 'IAE' : 'FAC';
  
  // Contar facturas del año
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
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  calculateBusinessTax,
  generateBusinessTaxBill,
  renewBusinessLicense,
};
