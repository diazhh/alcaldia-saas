import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Crea un nuevo hito para un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {Object} milestoneData - Datos del hito
 * @returns {Promise<Object>} Hito creado
 */
export const createMilestone = async (projectId, milestoneData) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  
  if (!project) {
    throw new Error('Proyecto no encontrado');
  }
  
  // Crear el hito
  const milestone = await prisma.milestone.create({
    data: {
      ...milestoneData,
      projectId,
      dueDate: new Date(milestoneData.dueDate),
    },
  });
  
  return milestone;
};

/**
 * Obtiene todos los hitos de un proyecto
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Array>} Lista de hitos
 */
export const getMilestonesByProject = async (projectId) => {
  const milestones = await prisma.milestone.findMany({
    where: { projectId },
    orderBy: {
      order: 'asc',
    },
  });
  
  return milestones;
};

/**
 * Obtiene un hito por ID
 * @param {string} milestoneId - ID del hito
 * @returns {Promise<Object>} Hito encontrado
 */
export const getMilestoneById = async (milestoneId) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
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
  
  if (!milestone) {
    throw new Error('Hito no encontrado');
  }
  
  return milestone;
};

/**
 * Actualiza un hito
 * @param {string} milestoneId - ID del hito
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Hito actualizado
 */
export const updateMilestone = async (milestoneId, updateData) => {
  // Verificar que el hito existe
  const existingMilestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });
  
  if (!existingMilestone) {
    throw new Error('Hito no encontrado');
  }
  
  // Convertir fechas si vienen como strings
  const dataToUpdate = { ...updateData };
  if (dataToUpdate.dueDate) {
    dataToUpdate.dueDate = new Date(dataToUpdate.dueDate);
  }
  if (dataToUpdate.completedAt) {
    dataToUpdate.completedAt = new Date(dataToUpdate.completedAt);
  }
  
  // Si se marca como completado y no tiene fecha de completado, agregarla
  if (dataToUpdate.status === 'COMPLETED' && !dataToUpdate.completedAt && !existingMilestone.completedAt) {
    dataToUpdate.completedAt = new Date();
    dataToUpdate.progress = 100;
  }
  
  // Actualizar el hito
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: dataToUpdate,
  });
  
  return milestone;
};

/**
 * Elimina un hito
 * @param {string} milestoneId - ID del hito
 * @returns {Promise<Object>} Hito eliminado
 */
export const deleteMilestone = async (milestoneId) => {
  // Verificar que el hito existe
  const existingMilestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });
  
  if (!existingMilestone) {
    throw new Error('Hito no encontrado');
  }
  
  // Eliminar el hito
  const milestone = await prisma.milestone.delete({
    where: { id: milestoneId },
  });
  
  return milestone;
};

/**
 * Marca un hito como completado
 * @param {string} milestoneId - ID del hito
 * @returns {Promise<Object>} Hito actualizado
 */
export const completeMilestone = async (milestoneId) => {
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status: 'COMPLETED',
      progress: 100,
      completedAt: new Date(),
    },
  });
  
  return milestone;
};

/**
 * Actualiza el progreso de un hito
 * @param {string} milestoneId - ID del hito
 * @param {number} progress - Porcentaje de progreso (0-100)
 * @returns {Promise<Object>} Hito actualizado
 */
export const updateMilestoneProgress = async (milestoneId, progress) => {
  if (progress < 0 || progress > 100) {
    throw new Error('El progreso debe estar entre 0 y 100');
  }
  
  const updateData = {
    progress,
  };
  
  // Si el progreso es 100, marcar como completado
  if (progress === 100) {
    updateData.status = 'COMPLETED';
    updateData.completedAt = new Date();
  } else if (progress > 0) {
    updateData.status = 'IN_PROGRESS';
  }
  
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: updateData,
  });
  
  return milestone;
};
