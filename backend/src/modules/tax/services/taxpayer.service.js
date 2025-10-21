/**
 * Servicio de Contribuyentes
 * Maneja la lógica de negocio para el registro y gestión de contribuyentes
 */

import prisma from '../../../config/database.js';

/**
 * Obtener todos los contribuyentes con paginación y filtros
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Object>} Lista de contribuyentes y metadata
 */
async function getAllTaxpayers(filters = {}, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const where = {};
  
  // Filtros
  if (filters.taxId) {
    where.taxId = { contains: filters.taxId, mode: 'insensitive' };
  }
  
  if (filters.taxpayerType) {
    where.taxpayerType = filters.taxpayerType;
  }
  
  if (filters.status) {
    where.status = filters.status;
  }
  
  if (filters.search) {
    where.OR = [
      { taxId: { contains: filters.search, mode: 'insensitive' } },
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { businessName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  
  const [taxpayers, total] = await Promise.all([
    prisma.taxpayer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            businesses: true,
            properties: true,
            vehicles: true,
            taxBills: true,
          },
        },
      },
    }),
    prisma.taxpayer.count({ where }),
  ]);
  
  return {
    data: taxpayers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener un contribuyente por ID
 * @param {string} id - ID del contribuyente
 * @returns {Promise<Object>} Contribuyente encontrado
 */
async function getTaxpayerById(id) {
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { id },
    include: {
      businesses: {
        where: { status: { not: 'CLOSED' } },
        orderBy: { createdAt: 'desc' },
      },
      properties: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
      vehicles: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      },
      taxBills: {
        where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        orderBy: { dueDate: 'asc' },
        take: 10,
      },
      solvencies: {
        where: { status: 'ACTIVE' },
        orderBy: { issueDate: 'desc' },
        take: 5,
      },
    },
  });
  
  if (!taxpayer) {
    throw new Error('Contribuyente no encontrado');
  }
  
  return taxpayer;
}

/**
 * Obtener un contribuyente por RIF/CI
 * @param {string} taxId - RIF o CI del contribuyente
 * @returns {Promise<Object>} Contribuyente encontrado
 */
async function getTaxpayerByTaxId(taxId) {
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { taxId },
    include: {
      businesses: {
        where: { status: { not: 'CLOSED' } },
      },
      properties: {
        where: { status: 'ACTIVE' },
      },
      vehicles: {
        where: { status: 'ACTIVE' },
      },
      taxBills: {
        where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        orderBy: { dueDate: 'asc' },
      },
    },
  });
  
  if (!taxpayer) {
    throw new Error('Contribuyente no encontrado');
  }
  
  return taxpayer;
}

/**
 * Crear un nuevo contribuyente
 * @param {Object} data - Datos del contribuyente
 * @returns {Promise<Object>} Contribuyente creado
 */
async function createTaxpayer(data) {
  // Verificar si ya existe un contribuyente con ese RIF/CI
  const existing = await prisma.taxpayer.findUnique({
    where: { taxId: data.taxId },
  });
  
  if (existing) {
    throw new Error('Ya existe un contribuyente con ese RIF/CI');
  }
  
  const taxpayer = await prisma.taxpayer.create({
    data,
  });
  
  return taxpayer;
}

/**
 * Actualizar un contribuyente
 * @param {string} id - ID del contribuyente
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Contribuyente actualizado
 */
async function updateTaxpayer(id, data) {
  // Verificar que existe
  const existing = await prisma.taxpayer.findUnique({
    where: { id },
  });
  
  if (!existing) {
    throw new Error('Contribuyente no encontrado');
  }
  
  // Si se está actualizando el taxId, verificar que no exista otro con ese ID
  if (data.taxId && data.taxId !== existing.taxId) {
    const duplicate = await prisma.taxpayer.findUnique({
      where: { taxId: data.taxId },
    });
    
    if (duplicate) {
      throw new Error('Ya existe un contribuyente con ese RIF/CI');
    }
  }
  
  const taxpayer = await prisma.taxpayer.update({
    where: { id },
    data,
  });
  
  return taxpayer;
}

/**
 * Eliminar un contribuyente
 * @param {string} id - ID del contribuyente
 * @returns {Promise<Object>} Contribuyente eliminado
 */
async function deleteTaxpayer(id) {
  // Verificar que existe
  const existing = await prisma.taxpayer.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          businesses: true,
          properties: true,
          vehicles: true,
          taxBills: true,
        },
      },
    },
  });
  
  if (!existing) {
    throw new Error('Contribuyente no encontrado');
  }
  
  // Verificar que no tenga registros relacionados activos
  if (
    existing._count.businesses > 0 ||
    existing._count.properties > 0 ||
    existing._count.vehicles > 0 ||
    existing._count.taxBills > 0
  ) {
    throw new Error(
      'No se puede eliminar un contribuyente con negocios, propiedades, vehículos o facturas asociadas'
    );
  }
  
  const taxpayer = await prisma.taxpayer.delete({
    where: { id },
  });
  
  return taxpayer;
}

/**
 * Obtener el estado de cuenta de un contribuyente
 * @param {string} id - ID del contribuyente
 * @returns {Promise<Object>} Estado de cuenta
 */
async function getTaxpayerAccountStatus(id) {
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { id },
    include: {
      taxBills: {
        where: {
          status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 10,
      },
    },
  });
  
  if (!taxpayer) {
    throw new Error('Contribuyente no encontrado');
  }
  
  // Calcular totales
  const totalDebt = taxpayer.taxBills.reduce(
    (sum, bill) => sum + parseFloat(bill.balanceAmount),
    0
  );
  
  const overdueBills = taxpayer.taxBills.filter(
    (bill) => new Date(bill.dueDate) < new Date() && bill.status !== 'PAID'
  );
  
  const totalOverdue = overdueBills.reduce(
    (sum, bill) => sum + parseFloat(bill.balanceAmount),
    0
  );
  
  return {
    taxpayer: {
      id: taxpayer.id,
      taxId: taxpayer.taxId,
      name:
        taxpayer.taxpayerType === 'NATURAL'
          ? `${taxpayer.firstName} ${taxpayer.lastName}`
          : taxpayer.businessName,
      taxpayerType: taxpayer.taxpayerType,
    },
    summary: {
      totalDebt,
      totalOverdue,
      pendingBills: taxpayer.taxBills.length,
      overdueBills: overdueBills.length,
    },
    bills: taxpayer.taxBills,
    recentPayments: taxpayer.payments,
  };
}

/**
 * Verificar si un contribuyente está solvente
 * @param {string} id - ID del contribuyente
 * @returns {Promise<boolean>} True si está solvente
 */
async function isTaxpayerSolvent(id) {
  const pendingBills = await prisma.taxBill.count({
    where: {
      taxpayerId: id,
      status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
    },
  });
  
  return pendingBills === 0;
}

export {
  getAllTaxpayers,
  getTaxpayerById,
  getTaxpayerByTaxId,
  createTaxpayer,
  updateTaxpayer,
  deleteTaxpayer,
  getTaxpayerAccountStatus,
  isTaxpayerSolvent,
};
