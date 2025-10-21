/**
 * Servicio para gestión de inspecciones de permisos de construcción
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Generar número de inspección único
 * @returns {Promise<string>}
 */
const generateInspectionNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.permitInspection.count({
    where: {
      inspectionNumber: {
        startsWith: `INS-${year}-`,
      },
    },
  });

  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `INS-${year}-${nextNumber}`;
};

/**
 * Obtener inspecciones de un permiso
 * @param {string} permitId - ID del permiso
 * @returns {Promise<Array>}
 */
export const getInspectionsByPermit = async (permitId) => {
  const inspections = await prisma.permitInspection.findMany({
    where: { permitId },
    orderBy: { inspectionDate: 'desc' },
  });

  return inspections;
};

/**
 * Obtener inspección por ID
 * @param {string} id - ID de la inspección
 * @returns {Promise<Object>}
 */
export const getInspectionById = async (id) => {
  const inspection = await prisma.permitInspection.findUnique({
    where: { id },
    include: {
      permit: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!inspection) {
    throw new NotFoundError('Inspección no encontrada');
  }

  return inspection;
};

/**
 * Crear nueva inspección
 * @param {Object} data - Datos de la inspección
 * @returns {Promise<Object>}
 */
export const createInspection = async (data) => {
  // Verificar que el permiso exista
  const permit = await prisma.constructionPermit.findUnique({
    where: { id: data.permitId },
  });

  if (!permit) {
    throw new NotFoundError('Permiso de construcción no encontrado');
  }

  // Generar número de inspección
  const inspectionNumber = await generateInspectionNumber();

  const inspection = await prisma.permitInspection.create({
    data: {
      ...data,
      inspectionNumber,
    },
    include: {
      permit: true,
    },
  });

  return inspection;
};

/**
 * Actualizar inspección
 * @param {string} id - ID de la inspección
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const updateInspection = async (id, data) => {
  const existing = await prisma.permitInspection.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Inspección no encontrada');
  }

  const inspection = await prisma.permitInspection.update({
    where: { id },
    data,
    include: {
      permit: true,
    },
  });

  return inspection;
};

/**
 * Eliminar inspección
 * @param {string} id - ID de la inspección
 * @returns {Promise<void>}
 */
export const deleteInspection = async (id) => {
  const inspection = await prisma.permitInspection.findUnique({
    where: { id },
  });

  if (!inspection) {
    throw new NotFoundError('Inspección no encontrada');
  }

  await prisma.permitInspection.delete({
    where: { id },
  });
};

/**
 * Obtener todas las inspecciones con filtros
 * @param {Object} filters - Filtros
 * @returns {Promise<Object>}
 */
export const getAllInspections = async (filters = {}) => {
  const { status, inspectionType, inspectorId, page = 1, limit = 10 } = filters;

  const skip = (page - 1) * limit;
  const where = {};

  if (status) where.status = status;
  if (inspectionType) where.inspectionType = inspectionType;
  if (inspectorId) where.inspectorId = inspectorId;

  const [inspections, total] = await Promise.all([
    prisma.permitInspection.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        permit: {
          select: {
            id: true,
            permitNumber: true,
            property: {
              select: {
                cadastralCode: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
    }),
    prisma.permitInspection.count({ where }),
  ]);

  return {
    inspections,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};
