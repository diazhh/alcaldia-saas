/**
 * Servicio de Documentos
 * Gestiona documentos base, búsqueda y versionamiento
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Generar número de documento
 */
async function generateDocumentNumber(type) {
  const year = new Date().getFullYear();
  const typePrefix = type.substring(0, 3).toUpperCase();
  
  const lastDoc = await prisma.document.findFirst({
    where: {
      documentNumber: {
        startsWith: `DOC-${typePrefix}-${year}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  let nextNumber = 1;
  if (lastDoc) {
    const parts = lastDoc.documentNumber.split('-');
    const lastNumber = parseInt(parts[parts.length - 1]);
    nextNumber = lastNumber + 1;
  }
  
  return `DOC-${typePrefix}-${year}-${nextNumber.toString().padStart(5, '0')}`;
}

/**
 * Parsear campos JSON del documento
 */
function parseDocument(doc) {
  if (doc.keywords) {
    doc.keywords = JSON.parse(doc.keywords);
  }
  if (doc.tags) {
    doc.tags = JSON.parse(doc.tags);
  }
  return doc;
}

/**
 * Crear documento
 */
async function createDocument(data, userId) {
  const documentNumber = await generateDocumentNumber(data.type);
  
  const document = await prisma.document.create({
    data: {
      documentNumber,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      keywords: data.keywords ? JSON.stringify(data.keywords) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      documentDate: data.documentDate ? new Date(data.documentDate) : new Date(),
      departmentId: data.departmentId,
      folderId: data.folderId,
      isPublic: data.isPublic || false,
      isConfidential: data.isConfidential || false,
      accessLevel: data.accessLevel || 'INTERNAL',
      ocrText: data.ocrText,
      createdBy: userId,
      status: 'DRAFT',
    },
  });
  
  // Crear primera versión
  if (data.fileUrl) {
    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        versionNumber: 1,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        changeLog: 'Versión inicial',
        createdBy: userId,
      },
    });
  }
  
  return parseDocument(document);
}

/**
 * Obtener documento por ID
 */
async function getDocumentById(id) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: {
          versionNumber: 'desc',
        },
      },
      signatures: {
        orderBy: {
          signedAt: 'desc',
        },
      },
      folder: {
        select: {
          fileNumber: true,
          title: true,
        },
      },
    },
  });
  
  if (!document) {
    throw new NotFoundError('Documento no encontrado');
  }
  
  return parseDocument(document);
}

/**
 * Buscar documentos (Motor de búsqueda)
 */
async function searchDocuments(filters = {}) {
  const {
    search,
    type,
    status,
    departmentId,
    folderId,
    isPublic,
    accessLevel,
    startDate,
    endDate,
    tags,
    page = 1,
    limit = 20,
  } = filters;
  
  const where = {};
  
  if (type) where.type = type;
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;
  if (folderId) where.folderId = folderId;
  if (isPublic !== undefined) where.isPublic = isPublic;
  if (accessLevel) where.accessLevel = accessLevel;
  
  // Búsqueda de texto completo
  if (search) {
    where.OR = [
      { documentNumber: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { ocrText: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  // Filtro por fechas
  if (startDate || endDate) {
    where.documentDate = {};
    if (startDate) where.documentDate.gte = new Date(startDate);
    if (endDate) where.documentDate.lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        documentDate: 'desc',
      },
      include: {
        _count: {
          select: {
            versions: true,
            signatures: true,
          },
        },
      },
    }),
    prisma.document.count({ where }),
  ]);
  
  return {
    data: documents.map(parseDocument),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar documento
 */
async function updateDocument(id, data) {
  await getDocumentById(id);
  
  const updateData = { ...data };
  if (data.keywords) {
    updateData.keywords = JSON.stringify(data.keywords);
  }
  if (data.tags) {
    updateData.tags = JSON.stringify(data.tags);
  }
  if (data.documentDate) {
    updateData.documentDate = new Date(data.documentDate);
  }
  
  const updated = await prisma.document.update({
    where: { id },
    data: updateData,
  });
  
  return parseDocument(updated);
}

/**
 * Crear nueva versión del documento
 */
async function createDocumentVersion(documentId, data, userId) {
  const document = await getDocumentById(documentId);
  
  // Obtener última versión
  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: {
      versionNumber: 'desc',
    },
  });
  
  const newVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;
  
  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: newVersionNumber,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      changeLog: data.changeLog,
      createdBy: userId,
    },
  });
  
  // Actualizar documento con nueva versión
  await prisma.document.update({
    where: { id: documentId },
    data: {
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    },
  });
  
  return version;
}

/**
 * Obtener versiones de un documento
 */
async function getDocumentVersions(documentId) {
  const versions = await prisma.documentVersion.findMany({
    where: { documentId },
    orderBy: {
      versionNumber: 'desc',
    },
  });
  
  return versions;
}

/**
 * Comparar dos versiones
 */
async function compareVersions(documentId, version1, version2) {
  const [v1, v2] = await Promise.all([
    prisma.documentVersion.findFirst({
      where: {
        documentId,
        versionNumber: version1,
      },
    }),
    prisma.documentVersion.findFirst({
      where: {
        documentId,
        versionNumber: version2,
      },
    }),
  ]);
  
  if (!v1 || !v2) {
    throw new NotFoundError('Una o ambas versiones no encontradas');
  }
  
  return {
    version1: v1,
    version2: v2,
    differences: {
      fileName: v1.fileName !== v2.fileName,
      fileSize: v1.fileSize !== v2.fileSize,
      changeLog: {
        v1: v1.changeLog,
        v2: v2.changeLog,
      },
    },
  };
}

/**
 * Restaurar versión anterior
 */
async function restoreVersion(documentId, versionNumber, userId) {
  const version = await prisma.documentVersion.findFirst({
    where: {
      documentId,
      versionNumber,
    },
  });
  
  if (!version) {
    throw new NotFoundError('Versión no encontrada');
  }
  
  // Crear nueva versión con el contenido de la versión a restaurar
  const lastVersion = await prisma.documentVersion.findFirst({
    where: { documentId },
    orderBy: {
      versionNumber: 'desc',
    },
  });
  
  const newVersion = await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: lastVersion.versionNumber + 1,
      fileUrl: version.fileUrl,
      fileName: version.fileName,
      fileSize: version.fileSize,
      changeLog: `Restaurada desde versión ${versionNumber}`,
      createdBy: userId,
    },
  });
  
  // Actualizar documento
  await prisma.document.update({
    where: { id: documentId },
    data: {
      fileUrl: version.fileUrl,
      fileName: version.fileName,
      fileSize: version.fileSize,
    },
  });
  
  return newVersion;
}

/**
 * Archivar documento
 */
async function archiveDocument(id) {
  await getDocumentById(id);
  
  const updated = await prisma.document.update({
    where: { id },
    data: {
      isArchived: true,
      status: 'ARCHIVED',
    },
  });
  
  return parseDocument(updated);
}

/**
 * Eliminar documento
 */
async function deleteDocument(id) {
  await getDocumentById(id);
  
  await prisma.document.delete({
    where: { id },
  });
}

/**
 * Obtener estadísticas de documentos
 */
async function getDocumentStats(filters = {}) {
  const { departmentId } = filters;
  
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  
  const [total, byType, byStatus] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.groupBy({
      by: ['type'],
      where,
      _count: true,
    }),
    prisma.document.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);
  
  return {
    total,
    byType: byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {}),
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
  };
}

export {
  createDocument,
  getDocumentById,
  searchDocuments,
  updateDocument,
  createDocumentVersion,
  getDocumentVersions,
  compareVersions,
  restoreVersion,
  archiveDocument,
  deleteDocument,
  getDocumentStats,
};
