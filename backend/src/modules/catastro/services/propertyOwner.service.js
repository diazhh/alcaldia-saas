/**
 * Servicio para gestión de propietarios de inmuebles
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Obtener propietarios de una propiedad
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<Array>}
 */
export const getPropertyOwners = async (propertyId) => {
  const owners = await prisma.propertyOwner.findMany({
    where: { propertyId },
    orderBy: { startDate: 'desc' },
  });

  return owners;
};

/**
 * Obtener propietario actual de una propiedad
 * @param {string} propertyId - ID de la propiedad
 * @returns {Promise<Object>}
 */
export const getCurrentOwner = async (propertyId) => {
  const owner = await prisma.propertyOwner.findFirst({
    where: {
      propertyId,
      isCurrent: true,
    },
  });

  return owner;
};

/**
 * Crear nuevo propietario
 * @param {Object} data - Datos del propietario
 * @returns {Promise<Object>}
 */
export const createPropertyOwner = async (data) => {
  // Verificar que la propiedad exista
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
  });

  if (!property) {
    throw new NotFoundError('Propiedad no encontrada');
  }

  // Si es propietario actual, marcar otros como no actuales
  if (data.isCurrent) {
    await prisma.propertyOwner.updateMany({
      where: {
        propertyId: data.propertyId,
        isCurrent: true,
      },
      data: {
        isCurrent: false,
        endDate: new Date(),
      },
    });
  }

  const owner = await prisma.propertyOwner.create({
    data,
  });

  return owner;
};

/**
 * Actualizar propietario
 * @param {string} id - ID del propietario
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const updatePropertyOwner = async (id, data) => {
  const existing = await prisma.propertyOwner.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Propietario no encontrado');
  }

  // Si se marca como actual, desmarcar otros
  if (data.isCurrent && !existing.isCurrent) {
    await prisma.propertyOwner.updateMany({
      where: {
        propertyId: existing.propertyId,
        isCurrent: true,
        id: { not: id },
      },
      data: {
        isCurrent: false,
        endDate: new Date(),
      },
    });
  }

  const owner = await prisma.propertyOwner.update({
    where: { id },
    data,
  });

  return owner;
};

/**
 * Eliminar propietario
 * @param {string} id - ID del propietario
 * @returns {Promise<void>}
 */
export const deletePropertyOwner = async (id) => {
  const owner = await prisma.propertyOwner.findUnique({
    where: { id },
  });

  if (!owner) {
    throw new NotFoundError('Propietario no encontrado');
  }

  await prisma.propertyOwner.delete({
    where: { id },
  });
};

/**
 * Buscar propiedades por propietario
 * @param {string} ownerIdNumber - Cédula o RIF del propietario
 * @returns {Promise<Array>}
 */
export const getPropertiesByOwner = async (ownerIdNumber) => {
  const owners = await prisma.propertyOwner.findMany({
    where: { ownerIdNumber },
    include: {
      property: {
        include: {
          taxpayer: {
            select: {
              id: true,
              name: true,
              taxId: true,
            },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  return owners;
};
