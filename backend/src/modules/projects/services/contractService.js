import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Genera un código único para el contrato
 * Formato: CONT-YYYY-NNN (ej: CONT-2025-001)
 * @returns {Promise<string>} Código generado
 */
export const generateContractNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `CONT-${year}-`;

  // Obtener el último contrato del año
  const lastContract = await prisma.projectContract.findFirst({
    where: {
      contractNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      contractNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastContract) {
    const lastNumber = parseInt(lastContract.contractNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  // Formatear con ceros a la izquierda (001, 002, etc.)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}${formattedNumber}`;
};

/**
 * Crea un nuevo contrato
 * @param {string} projectId - ID del proyecto
 * @param {Object} contractData - Datos del contrato
 * @returns {Promise<Object>} Contrato creado
 */
export const createContract = async (projectId, contractData) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  // Generar número único de contrato
  const contractNumber = await generateContractNumber();

  // Convertir fechas si vienen como strings
  const dataToCreate = { ...contractData };
  if (dataToCreate.bidOpeningDate) {
    dataToCreate.bidOpeningDate = new Date(dataToCreate.bidOpeningDate);
  }
  if (dataToCreate.adjudicationDate) {
    dataToCreate.adjudicationDate = new Date(dataToCreate.adjudicationDate);
  }
  if (dataToCreate.signedDate) {
    dataToCreate.signedDate = new Date(dataToCreate.signedDate);
  }
  if (dataToCreate.startDate) {
    dataToCreate.startDate = new Date(dataToCreate.startDate);
  }
  if (dataToCreate.endDate) {
    dataToCreate.endDate = new Date(dataToCreate.endDate);
  }

  const contract = await prisma.projectContract.create({
    data: {
      ...dataToCreate,
      projectId,
      contractNumber,
    },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      contractor: true,
    },
  });

  return contract;
};

/**
 * Obtiene contratos con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite de resultados por página (default: 10)
 * @returns {Promise<Object>} Lista de contratos y metadata de paginación
 */
export const getContracts = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Construir el objeto where para filtros
  const where = {};

  if (filters.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters.contractorId) {
    where.contractorId = filters.contractorId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.search) {
    where.OR = [
      { contractNumber: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Obtener contratos y total
  const [contracts, total] = await Promise.all([
    prisma.projectContract.findMany({
      where,
      skip,
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
          },
        },
        contractor: {
          select: {
            id: true,
            name: true,
            rif: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.projectContract.count({ where }),
  ]);

  return {
    contracts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene contratos de un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Array>} Lista de contratos
 */
export const getContractsByProject = async (projectId) => {
  const contracts = await prisma.projectContract.findMany({
    where: { projectId },
    include: {
      contractor: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return contracts;
};

/**
 * Obtiene un contrato por ID
 * @param {string} contractId - ID del contrato
 * @returns {Promise<Object>} Contrato encontrado
 */
export const getContractById = async (contractId) => {
  const contract = await prisma.projectContract.findUnique({
    where: { id: contractId },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          budget: true,
        },
      },
      contractor: true,
    },
  });

  if (!contract) {
    throw new Error('Contrato no encontrado');
  }

  // Calcular progreso de pagos
  const paymentProgress = contract.contractAmount > 0
    ? (parseFloat(contract.paidAmount) / parseFloat(contract.contractAmount)) * 100
    : 0;

  const remainingAmount = parseFloat(contract.contractAmount) - parseFloat(contract.paidAmount);

  return {
    ...contract,
    stats: {
      paymentProgress: Math.round(paymentProgress),
      remainingAmount,
      paidAmount: parseFloat(contract.paidAmount),
      contractAmount: parseFloat(contract.contractAmount),
    },
  };
};

/**
 * Actualiza un contrato
 * @param {string} contractId - ID del contrato
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Contrato actualizado
 */
export const updateContract = async (contractId, updateData) => {
  // Verificar que el contrato existe
  const existingContract = await prisma.projectContract.findUnique({
    where: { id: contractId },
  });

  if (!existingContract) {
    throw new Error('Contrato no encontrado');
  }

  // Convertir fechas si vienen como strings
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.bidOpeningDate) {
    dataToUpdate.bidOpeningDate = new Date(dataToUpdate.bidOpeningDate);
  }
  if (dataToUpdate.adjudicationDate) {
    dataToUpdate.adjudicationDate = new Date(dataToUpdate.adjudicationDate);
  }
  if (dataToUpdate.signedDate) {
    dataToUpdate.signedDate = new Date(dataToUpdate.signedDate);
  }
  if (dataToUpdate.startDate) {
    dataToUpdate.startDate = new Date(dataToUpdate.startDate);
  }
  if (dataToUpdate.endDate) {
    dataToUpdate.endDate = new Date(dataToUpdate.endDate);
  }

  const contract = await prisma.projectContract.update({
    where: { id: contractId },
    data: dataToUpdate,
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      contractor: true,
    },
  });

  return contract;
};

/**
 * Elimina un contrato
 * @param {string} contractId - ID del contrato
 * @returns {Promise<Object>} Contrato eliminado
 */
export const deleteContract = async (contractId) => {
  // Verificar que el contrato existe
  const existingContract = await prisma.projectContract.findUnique({
    where: { id: contractId },
  });

  if (!existingContract) {
    throw new Error('Contrato no encontrado');
  }

  // Solo permitir eliminar contratos en borrador
  if (existingContract.status !== 'BORRADOR') {
    throw new Error('Solo se pueden eliminar contratos en estado BORRADOR');
  }

  const contract = await prisma.projectContract.delete({
    where: { id: contractId },
  });

  return contract;
};

/**
 * Adjudica un contrato a un contratista
 * @param {string} contractId - ID del contrato
 * @param {string} contractorId - ID del contratista
 * @param {Date} adjudicationDate - Fecha de adjudicación
 * @returns {Promise<Object>} Contrato actualizado
 */
export const adjudicateContract = async (contractId, contractorId, adjudicationDate = new Date()) => {
  const contract = await prisma.projectContract.update({
    where: { id: contractId },
    data: {
      contractorId,
      adjudicationDate: new Date(adjudicationDate),
      status: 'ADJUDICADO',
    },
    include: {
      contractor: true,
      project: true,
    },
  });

  return contract;
};

/**
 * Registra un pago al contrato
 * @param {string} contractId - ID del contrato
 * @param {number} amount - Monto del pago
 * @returns {Promise<Object>} Contrato actualizado
 */
export const registerPayment = async (contractId, amount) => {
  const existingContract = await prisma.projectContract.findUnique({
    where: { id: contractId },
  });

  if (!existingContract) {
    throw new Error('Contrato no encontrado');
  }

  const newPaidAmount = parseFloat(existingContract.paidAmount) + parseFloat(amount);

  // Validar que no exceda el monto del contrato
  if (newPaidAmount > parseFloat(existingContract.contractAmount)) {
    throw new Error('El monto total de pagos no puede exceder el monto del contrato');
  }

  const contract = await prisma.projectContract.update({
    where: { id: contractId },
    data: {
      paidAmount: newPaidAmount,
    },
  });

  return contract;
};

/**
 * Obtiene estadísticas de contratos
 * @returns {Promise<Object>} Estadísticas
 */
export const getContractStats = async () => {
  const [
    total,
    byStatus,
    byType,
    totalContractAmount,
    totalPaidAmount,
  ] = await Promise.all([
    prisma.projectContract.count(),

    prisma.projectContract.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    }),

    prisma.projectContract.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    }),

    prisma.projectContract.aggregate({
      _sum: {
        contractAmount: true,
      },
    }),

    prisma.projectContract.aggregate({
      _sum: {
        paidAmount: true,
      },
    }),
  ]);

  return {
    total,
    byStatus: byStatus.map(item => ({
      status: item.status,
      count: item._count._all,
    })),
    byType: byType.map(item => ({
      type: item.type,
      count: item._count._all,
    })),
    totalContractAmount: parseFloat(totalContractAmount._sum.contractAmount || 0),
    totalPaidAmount: parseFloat(totalPaidAmount._sum.paidAmount || 0),
    pendingPayment: parseFloat(totalContractAmount._sum.contractAmount || 0) - parseFloat(totalPaidAmount._sum.paidAmount || 0),
  };
};
