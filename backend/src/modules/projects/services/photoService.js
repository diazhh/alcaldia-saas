import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Crea un nuevo registro de foto para un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {Object} photoData - Datos de la foto
 * @returns {Promise<Object>} Foto creada
 */
export const createPhoto = async (projectId, photoData) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }
  
  // Crear el registro de la foto
  const photo = await prisma.projectPhoto.create({
    data: {
      ...photoData,
      projectId,
      takenAt: photoData.takenAt ? new Date(photoData.takenAt) : new Date(),
    },
  });
  
  return photo;
};

/**
 * Obtiene todas las fotos de un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {string} type - Tipo de foto (opcional)
 * @returns {Promise<Array>} Lista de fotos
 */
export const getPhotosByProject = async (projectId, type = null) => {
  const where = { projectId };
  
  if (type) {
    where.type = type;
  }
  
  const photos = await prisma.projectPhoto.findMany({
    where,
    orderBy: {
      takenAt: 'desc',
    },
  });
  
  return photos;
};

/**
 * Obtiene una foto por ID
 * @param {string} photoId - ID de la foto
 * @returns {Promise<Object>} Foto encontrada
 */
export const getPhotoById = async (photoId) => {
  const photo = await prisma.projectPhoto.findUnique({
    where: { id: photoId },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
    },
  });
  
  if (!photo) {
    throw new Error('Foto no encontrada');
  }
  
  return photo;
};

/**
 * Actualiza los datos de una foto
 * @param {string} photoId - ID de la foto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Foto actualizada
 */
export const updatePhoto = async (photoId, updateData) => {
  // Verificar que la foto existe
  const existingPhoto = await prisma.projectPhoto.findUnique({
    where: { id: photoId },
  });
  
  if (!existingPhoto) {
    throw new Error('Foto no encontrada');
  }
  
  // Convertir fecha si viene como string
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.takenAt) {
    dataToUpdate.takenAt = new Date(dataToUpdate.takenAt);
  }
  
  // Actualizar la foto
  const photo = await prisma.projectPhoto.update({
    where: { id: photoId },
    data: dataToUpdate,
  });
  
  return photo;
};

/**
 * Elimina una foto
 * @param {string} photoId - ID de la foto
 * @returns {Promise<Object>} Foto eliminada
 */
export const deletePhoto = async (photoId) => {
  // Verificar que la foto existe
  const existingPhoto = await prisma.projectPhoto.findUnique({
    where: { id: photoId },
  });
  
  if (!existingPhoto) {
    throw new Error('Foto no encontrada');
  }
  
  // Eliminar la foto
  const photo = await prisma.projectPhoto.delete({
    where: { id: photoId },
  });
  
  return photo;
};

/**
 * Obtiene el conteo de fotos por tipo para un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Conteo de fotos por tipo
 */
export const getPhotoCountByType = async (projectId) => {
  const photosByType = await prisma.projectPhoto.groupBy({
    by: ['type'],
    where: { projectId },
    _count: true,
  });
  
  return photosByType.reduce((acc, item) => {
    acc[item.type] = item._count;
    return acc;
  }, {});
};
