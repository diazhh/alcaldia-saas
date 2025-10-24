import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Crea un nuevo documento técnico
 * @param {string} projectId - ID del proyecto
 * @param {Object} documentData - Datos del documento
 * @param {string} userId - ID del usuario que sube el documento
 * @returns {Promise<Object>} Documento creado
 */
export const createDocument = async (projectId, documentData, userId) => {
  // Verificar que el proyecto existe
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error('Proyecto no encontrado');
  }

  const document = await prisma.projectDocument.create({
    data: {
      ...documentData,
      projectId,
      uploadedBy: userId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return document;
};

/**
 * Obtiene documentos de un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {string} type - Tipo de documento (opcional)
 * @returns {Promise<Array>} Lista de documentos
 */
export const getDocumentsByProject = async (projectId, type = null) => {
  const where = { projectId };

  if (type) {
    where.type = type;
  }

  const documents = await prisma.projectDocument.findMany({
    where,
    include: {
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return documents;
};

/**
 * Obtiene un documento por ID
 * @param {string} documentId - ID del documento
 * @returns {Promise<Object>} Documento encontrado
 */
export const getDocumentById = async (documentId) => {
  const document = await prisma.projectDocument.findUnique({
    where: { id: documentId },
    include: {
      project: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  return document;
};

/**
 * Actualiza un documento
 * @param {string} documentId - ID del documento
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Documento actualizado
 */
export const updateDocument = async (documentId, updateData) => {
  const existingDocument = await prisma.projectDocument.findUnique({
    where: { id: documentId },
  });

  if (!existingDocument) {
    throw new Error('Documento no encontrado');
  }

  const document = await prisma.projectDocument.update({
    where: { id: documentId },
    data: updateData,
    include: {
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return document;
};

/**
 * Elimina un documento
 * @param {string} documentId - ID del documento
 * @returns {Promise<Object>} Documento eliminado
 */
export const deleteDocument = async (documentId) => {
  const existingDocument = await prisma.projectDocument.findUnique({
    where: { id: documentId },
  });

  if (!existingDocument) {
    throw new Error('Documento no encontrado');
  }

  const document = await prisma.projectDocument.delete({
    where: { id: documentId },
  });

  return document;
};

/**
 * Obtiene el conteo de documentos por tipo
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Array>} Conteo por tipo
 */
export const getDocumentCountByType = async (projectId) => {
  const counts = await prisma.projectDocument.groupBy({
    by: ['type'],
    where: { projectId },
    _count: {
      _all: true,
    },
  });

  return counts.map(item => ({
    type: item.type,
    count: item._count._all,
  }));
};
