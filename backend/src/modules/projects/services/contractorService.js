import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Crea un nuevo contratista
 * @param {Object} contractorData - Datos del contratista
 * @returns {Promise<Object>} Contratista creado
 */
export const createContractor = async (contractorData) => {
  // Verificar que el RIF no esté duplicado
  const existingContractor = await prisma.contractor.findUnique({
    where: { rif: contractorData.rif },
  });

  if (existingContractor) {
    throw new Error('Ya existe un contratista con este RIF');
  }

  const contractor = await prisma.contractor.create({
    data: contractorData,
  });

  return contractor;
};

/**
 * Obtiene todos los contratistas con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Límite de resultados por página (default: 10)
 * @returns {Promise<Object>} Lista de contratistas y metadata de paginación
 */
export const getContractors = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Construir el objeto where para filtros
  const where = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive === 'true' || filters.isActive === true;
  }

  if (filters.isBlacklisted !== undefined) {
    where.isBlacklisted = filters.isBlacklisted === 'true' || filters.isBlacklisted === true;
  }

  if (filters.specialty) {
    where.specialty = { contains: filters.specialty, mode: 'insensitive' };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { rif: { contains: filters.search, mode: 'insensitive' } },
      { legalRepresentative: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Obtener contratistas y total
  const [contractors, total] = await Promise.all([
    prisma.contractor.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            contracts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.contractor.count({ where }),
  ]);

  return {
    contractors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene un contratista por ID
 * @param {string} contractorId - ID del contratista
 * @returns {Promise<Object>} Contratista encontrado
 */
export const getContractorById = async (contractorId) => {
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
    include: {
      contracts: {
        include: {
          project: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!contractor) {
    throw new Error('Contratista no encontrado');
  }

  return contractor;
};

/**
 * Obtiene un contratista por RIF
 * @param {string} rif - RIF del contratista
 * @returns {Promise<Object>} Contratista encontrado
 */
export const getContractorByRif = async (rif) => {
  const contractor = await prisma.contractor.findUnique({
    where: { rif },
    include: {
      _count: {
        select: {
          contracts: true,
        },
      },
    },
  });

  return contractor;
};

/**
 * Actualiza un contratista
 * @param {string} contractorId - ID del contratista
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Contratista actualizado
 */
export const updateContractor = async (contractorId, updateData) => {
  // Verificar que el contratista existe
  const existingContractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
  });

  if (!existingContractor) {
    throw new Error('Contratista no encontrado');
  }

  // Si se está cambiando el RIF, verificar que no esté duplicado
  if (updateData.rif && updateData.rif !== existingContractor.rif) {
    const duplicateRif = await prisma.contractor.findUnique({
      where: { rif: updateData.rif },
    });

    if (duplicateRif) {
      throw new Error('Ya existe un contratista con este RIF');
    }
  }

  const contractor = await prisma.contractor.update({
    where: { id: contractorId },
    data: updateData,
  });

  return contractor;
};

/**
 * Elimina un contratista
 * @param {string} contractorId - ID del contratista
 * @returns {Promise<Object>} Contratista eliminado
 */
export const deleteContractor = async (contractorId) => {
  // Verificar que el contratista existe
  const existingContractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
    include: {
      _count: {
        select: {
          contracts: true,
        },
      },
    },
  });

  if (!existingContractor) {
    throw new Error('Contratista no encontrado');
  }

  // Verificar que no tenga contratos activos
  if (existingContractor._count.contracts > 0) {
    throw new Error('No se puede eliminar un contratista con contratos asociados. Considere desactivarlo en su lugar.');
  }

  const contractor = await prisma.contractor.delete({
    where: { id: contractorId },
  });

  return contractor;
};

/**
 * Agrega un contratista a la lista negra
 * @param {string} contractorId - ID del contratista
 * @param {string} reason - Razón para lista negra
 * @returns {Promise<Object>} Contratista actualizado
 */
export const blacklistContractor = async (contractorId, reason) => {
  const contractor = await prisma.contractor.update({
    where: { id: contractorId },
    data: {
      isBlacklisted: true,
      blacklistReason: reason,
      isActive: false, // También lo desactivamos
    },
  });

  return contractor;
};

/**
 * Remueve un contratista de la lista negra
 * @param {string} contractorId - ID del contratista
 * @returns {Promise<Object>} Contratista actualizado
 */
export const removeFromBlacklist = async (contractorId) => {
  const contractor = await prisma.contractor.update({
    where: { id: contractorId },
    data: {
      isBlacklisted: false,
      blacklistReason: null,
      isActive: true,
    },
  });

  return contractor;
};

/**
 * Actualiza la calificación promedio de un contratista
 * @param {string} contractorId - ID del contratista
 * @returns {Promise<Object>} Contratista actualizado
 */
export const updateContractorRating = async (contractorId) => {
  // Obtener todos los proyectos completados con evaluación de este contratista
  const contracts = await prisma.projectContract.findMany({
    where: {
      contractorId,
      status: 'FINALIZADO',
    },
    include: {
      project: {
        select: {
          contractorEvaluation: true,
        },
      },
    },
  });

  // Calcular el promedio de evaluaciones
  const evaluations = contracts
    .map(c => c.project.contractorEvaluation)
    .filter(rating => rating !== null && rating !== undefined);

  if (evaluations.length === 0) {
    return await prisma.contractor.findUnique({
      where: { id: contractorId },
    });
  }

  const averageRating = evaluations.reduce((sum, rating) => sum + rating, 0) / evaluations.length;

  const contractor = await prisma.contractor.update({
    where: { id: contractorId },
    data: {
      averageRating: parseFloat(averageRating.toFixed(2)),
    },
  });

  return contractor;
};

/**
 * Obtiene estadísticas de contratistas
 * @returns {Promise<Object>} Estadísticas
 */
export const getContractorStats = async () => {
  const [
    total,
    active,
    blacklisted,
    bySpecialty,
  ] = await Promise.all([
    prisma.contractor.count(),
    prisma.contractor.count({ where: { isActive: true } }),
    prisma.contractor.count({ where: { isBlacklisted: true } }),
    prisma.contractor.groupBy({
      by: ['specialty'],
      _count: {
        _all: true,
      },
      where: {
        specialty: { not: null },
      },
    }),
  ]);

  return {
    total,
    active,
    inactive: total - active,
    blacklisted,
    bySpecialty: bySpecialty.map(item => ({
      specialty: item.specialty,
      count: item._count._all,
    })),
  };
};
