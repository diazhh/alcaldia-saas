/**
 * Servicio para gestión del Portal de Transparencia
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Publica un documento de transparencia
 * @param {Object} data - Datos del documento
 * @param {string} userId - ID del usuario que publica
 * @returns {Promise<Object>} Documento publicado
 */
export async function publishDocument(data, userId) {
  const documentData = {
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    publishedBy: userId,
    publishedAt: new Date()
  };
  
  const document = await prisma.transparencyDocument.create({
    data: documentData
  });
  
  // Parsear JSON
  if (document.tags) {
    document.tags = JSON.parse(document.tags);
  }
  
  return document;
}

/**
 * Obtiene un documento por ID
 * @param {string} id - ID del documento
 * @returns {Promise<Object>} Documento encontrado
 */
export async function getDocumentById(id) {
  const document = await prisma.transparencyDocument.findUnique({
    where: { id }
  });
  
  if (!document) {
    throw new AppError('Documento no encontrado', 404);
  }
  
  // Parsear JSON
  if (document.tags) {
    document.tags = JSON.parse(document.tags);
  }
  
  return document;
}

/**
 * Lista documentos con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de documentos
 */
export async function listDocuments(filters = {}) {
  const {
    category,
    year,
    month,
    quarter,
    search,
    page = 1,
    limit = 10
  } = filters;
  
  const where = {
    isActive: true
  };
  
  if (category) where.category = category;
  if (year) where.year = parseInt(year);
  if (month) where.month = parseInt(month);
  if (quarter) where.quarter = parseInt(quarter);
  
  // Búsqueda por texto
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const [documents, total] = await Promise.all([
    prisma.transparencyDocument.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' }
    }),
    prisma.transparencyDocument.count({ where })
  ]);
  
  // Parsear JSON en cada documento
  documents.forEach(doc => {
    if (doc.tags) {
      doc.tags = JSON.parse(doc.tags);
    }
  });
  
  return {
    data: documents,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Actualiza un documento
 * @param {string} id - ID del documento
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Documento actualizado
 */
export async function updateDocument(id, data) {
  await getDocumentById(id);
  
  const updateData = { ...data };
  
  // Convertir array a JSON
  if (updateData.tags) {
    updateData.tags = JSON.stringify(updateData.tags);
  }
  
  const document = await prisma.transparencyDocument.update({
    where: { id },
    data: updateData
  });
  
  // Parsear JSON
  if (document.tags) {
    document.tags = JSON.parse(document.tags);
  }
  
  return document;
}

/**
 * Elimina (desactiva) un documento
 * @param {string} id - ID del documento
 * @returns {Promise<Object>} Documento desactivado
 */
export async function deleteDocument(id) {
  await getDocumentById(id);
  
  const document = await prisma.transparencyDocument.update({
    where: { id },
    data: {
      isActive: false
    }
  });
  
  return document;
}

/**
 * Registra una descarga de documento
 * @param {string} id - ID del documento
 * @returns {Promise<Object>} Documento actualizado
 */
export async function registerDownload(id) {
  const document = await prisma.transparencyDocument.update({
    where: { id },
    data: {
      downloadCount: {
        increment: 1
      }
    }
  });
  
  return document;
}

/**
 * Registra una visualización de documento
 * @param {string} id - ID del documento
 * @returns {Promise<Object>} Documento actualizado
 */
export async function registerView(id) {
  const document = await prisma.transparencyDocument.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1
      }
    }
  });
  
  return document;
}

/**
 * Obtiene documentos por categoría
 * @param {string} category - Categoría
 * @returns {Promise<Array>} Lista de documentos
 */
export async function getDocumentsByCategory(category) {
  const documents = await prisma.transparencyDocument.findMany({
    where: {
      category,
      isActive: true
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { publishedAt: 'desc' }
    ]
  });
  
  // Parsear JSON
  documents.forEach(doc => {
    if (doc.tags) {
      doc.tags = JSON.parse(doc.tags);
    }
  });
  
  return documents;
}

/**
 * Obtiene documentos más descargados
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Lista de documentos
 */
export async function getMostDownloaded(limit = 10) {
  const documents = await prisma.transparencyDocument.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      downloadCount: 'desc'
    },
    take: limit
  });
  
  // Parsear JSON
  documents.forEach(doc => {
    if (doc.tags) {
      doc.tags = JSON.parse(doc.tags);
    }
  });
  
  return documents;
}

/**
 * Obtiene documentos más vistos
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Lista de documentos
 */
export async function getMostViewed(limit = 10) {
  const documents = await prisma.transparencyDocument.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      viewCount: 'desc'
    },
    take: limit
  });
  
  // Parsear JSON
  documents.forEach(doc => {
    if (doc.tags) {
      doc.tags = JSON.parse(doc.tags);
    }
  });
  
  return documents;
}

/**
 * Obtiene estadísticas del portal
 * @returns {Promise<Object>} Estadísticas
 */
export async function getTransparencyStats() {
  const [
    totalDocuments,
    documentsByCategory,
    totalDownloads,
    totalViews,
    recentDocuments
  ] = await Promise.all([
    prisma.transparencyDocument.count({
      where: { isActive: true }
    }),
    
    prisma.transparencyDocument.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: true
    }),
    
    prisma.transparencyDocument.aggregate({
      where: { isActive: true },
      _sum: {
        downloadCount: true
      }
    }),
    
    prisma.transparencyDocument.aggregate({
      where: { isActive: true },
      _sum: {
        viewCount: true
      }
    }),
    
    prisma.transparencyDocument.findMany({
      where: { isActive: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        publishedAt: true
      }
    })
  ]);
  
  return {
    totalDocuments,
    byCategory: documentsByCategory.reduce((acc, item) => {
      acc[item.category] = item._count;
      return acc;
    }, {}),
    totalDownloads: totalDownloads._sum.downloadCount || 0,
    totalViews: totalViews._sum.viewCount || 0,
    recentDocuments
  };
}

/**
 * Busca documentos por texto completo
 * @param {string} query - Texto a buscar
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Lista de documentos
 */
export async function searchDocuments(query, limit = 20) {
  const documents = await prisma.transparencyDocument.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { subcategory: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { publishedAt: 'desc' },
    take: limit
  });
  
  // Parsear JSON
  documents.forEach(doc => {
    if (doc.tags) {
      doc.tags = JSON.parse(doc.tags);
    }
  });
  
  return documents;
}

/**
 * Obtiene años disponibles en el portal
 * @returns {Promise<Array>} Lista de años
 */
export async function getAvailableYears() {
  const years = await prisma.transparencyDocument.findMany({
    where: {
      isActive: true,
      year: { not: null }
    },
    select: {
      year: true
    },
    distinct: ['year'],
    orderBy: {
      year: 'desc'
    }
  });
  
  return years.map(item => item.year);
}

/**
 * Obtiene categorías con conteo de documentos
 * @returns {Promise<Array>} Lista de categorías
 */
export async function getCategoriesWithCount() {
  const categories = await prisma.transparencyDocument.groupBy({
    by: ['category'],
    where: { isActive: true },
    _count: true,
    orderBy: {
      _count: {
        category: 'desc'
      }
    }
  });
  
  return categories.map(item => ({
    category: item.category,
    count: item._count
  }));
}
