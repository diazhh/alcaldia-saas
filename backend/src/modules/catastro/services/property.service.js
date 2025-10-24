/**
 * Servicio para gestión de fichas catastrales (propiedades)
 */

import prisma from '../../../config/database.js';
import { NotFoundError, ValidationError } from '../../../shared/utils/errors.js';

/**
 * Obtener todas las propiedades con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>}
 */
export const getAllProperties = async (filters = {}) => {
  const {
    search,
    propertyUse,
    propertyType,
    status,
    zoneCode,
    parish,
    page = 1,
    limit = 10,
  } = filters;

  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.OR = [
      { cadastralCode: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (propertyUse) where.propertyUse = propertyUse;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (zoneCode) where.zoneCode = zoneCode;
  if (parish) where.parish = parish;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: parseInt(limit),
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
        owners: {
          where: { isCurrent: true },
          select: {
            id: true,
            ownerName: true,
            ownerIdNumber: true,
            ownerType: true,
            startDate: true,
          },
        },
        _count: {
          select: {
            photos: true,
            constructionPermits: true,
            urbanInspections: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtener propiedad por ID
 * @param {string} id - ID de la propiedad
 * @returns {Promise<Object>}
 */
export const getPropertyById = async (id) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      taxpayer: {
        select: {
          id: true,
          taxId: true,
          firstName: true,
          lastName: true,
          businessName: true,
          taxpayerType: true,
          email: true,
          phone: true,
        },
      },
      owners: {
        orderBy: { startDate: 'desc' },
      },
      photos: {
        orderBy: { createdAt: 'desc' },
      },
      constructionPermits: {
        orderBy: { applicationDate: 'desc' },
        take: 5,
      },
      urbanInspections: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      taxBills: {
        where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      },
    },
  });

  if (!property) {
    throw new NotFoundError('Propiedad no encontrada');
  }

  return property;
};

/**
 * Obtener propiedad por código catastral
 * @param {string} cadastralCode - Código catastral
 * @returns {Promise<Object>}
 */
export const getPropertyByCadastralCode = async (cadastralCode) => {
  const property = await prisma.property.findUnique({
    where: { cadastralCode },
    include: {
      taxpayer: true,
      owners: {
        where: { isCurrent: true },
      },
      photos: true,
    },
  });

  if (!property) {
    throw new NotFoundError('Propiedad no encontrada');
  }

  return property;
};

/**
 * Crear nueva propiedad
 * @param {Object} data - Datos de la propiedad
 * @returns {Promise<Object>}
 */
export const createProperty = async (data) => {
  // Verificar que el código catastral no exista
  const existing = await prisma.property.findUnique({
    where: { cadastralCode: data.cadastralCode },
  });

  if (existing) {
    throw new ValidationError('El código catastral ya existe');
  }

  // Verificar que el contribuyente exista
  const taxpayer = await prisma.taxpayer.findUnique({
    where: { id: data.taxpayerId },
  });

  if (!taxpayer) {
    throw new NotFoundError('Contribuyente no encontrado');
  }

  // Crear la propiedad
  const property = await prisma.property.create({
    data: {
      ...data,
      status: 'ACTIVE',
    },
    include: {
      taxpayer: true,
    },
  });

  return property;
};

/**
 * Actualizar propiedad
 * @param {string} id - ID de la propiedad
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const updateProperty = async (id, data) => {
  // Verificar que la propiedad exista
  const existing = await prisma.property.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Propiedad no encontrada');
  }

  // Si se actualiza el código catastral, verificar que no exista
  if (data.cadastralCode && data.cadastralCode !== existing.cadastralCode) {
    const duplicate = await prisma.property.findUnique({
      where: { cadastralCode: data.cadastralCode },
    });

    if (duplicate) {
      throw new ValidationError('El código catastral ya existe');
    }
  }

  // Actualizar la propiedad
  const property = await prisma.property.update({
    where: { id },
    data,
    include: {
      taxpayer: true,
      owners: {
        where: { isCurrent: true },
      },
    },
  });

  return property;
};

/**
 * Eliminar propiedad
 * @param {string} id - ID de la propiedad
 * @returns {Promise<void>}
 */
export const deleteProperty = async (id) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new NotFoundError('Propiedad no encontrada');
  }

  await prisma.property.delete({
    where: { id },
  });
};

/**
 * Buscar propiedades por coordenadas (radio en km)
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @param {number} radius - Radio en km
 * @returns {Promise<Array>}
 */
export const searchPropertiesByLocation = async (latitude, longitude, radius = 1) => {
  // Conversión aproximada: 1 grado ≈ 111 km
  const latDelta = radius / 111;
  const lonDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));

  const properties = await prisma.property.findMany({
    where: {
      AND: [
        { latitude: { gte: latitude - latDelta, lte: latitude + latDelta } },
        { longitude: { gte: longitude - lonDelta, lte: longitude + lonDelta } },
      ],
    },
    include: {
      taxpayer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          businessName: true,
          taxId: true,
        },
      },
      owners: {
        where: { isCurrent: true },
      },
    },
  });

  return properties;
};

/**
 * Obtener estadísticas de propiedades
 * @returns {Promise<Object>}
 */
export const getPropertyStats = async () => {
  const [
    total,
    byUse,
    byType,
    byConservationState,
    byZone,
    withPermits,
    withInspections,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.groupBy({
      by: ['propertyUse'],
      _count: true,
    }),
    prisma.property.groupBy({
      by: ['propertyType'],
      _count: true,
    }),
    prisma.property.groupBy({
      by: ['conservationState'],
      _count: true,
    }),
    prisma.property.groupBy({
      by: ['zoneCode'],
      _count: true,
      orderBy: { _count: { zoneCode: 'desc' } },
      take: 10,
    }),
    prisma.property.count({
      where: {
        constructionPermits: {
          some: {},
        },
      },
    }),
    prisma.property.count({
      where: {
        urbanInspections: {
          some: {},
        },
      },
    }),
  ]);

  return {
    total,
    byUse,
    byType,
    byConservationState,
    topZones: byZone,
    withPermits,
    withInspections,
  };
};
