/**
 * Servicio de Ordenanzas Municipales
 * Gestiona el repositorio de ordenanzas
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Crear ordenanza
 */
async function createOrdinance(data, userId) {
  const ordinanceData = {
    ...data,
    publicationDate: new Date(data.publicationDate),
    gazetteDate: data.gazetteDate ? new Date(data.gazetteDate) : null,
    relatedOrdinances: data.relatedOrdinances ? JSON.stringify(data.relatedOrdinances) : null,
    regulations: data.regulations ? JSON.stringify(data.regulations) : null,
    approvedBy: data.approvedBy ? JSON.stringify(data.approvedBy) : null,
    keywords: data.keywords ? JSON.stringify(data.keywords) : null,
  };
  
  const ordinance = await prisma.ordinance.create({
    data: ordinanceData,
  });
  
  return parseOrdinance(ordinance);
}

/**
 * Parsear campos JSON de ordenanza
 */
function parseOrdinance(ordinance) {
  if (ordinance.relatedOrdinances) {
    ordinance.relatedOrdinances = JSON.parse(ordinance.relatedOrdinances);
  }
  if (ordinance.regulations) {
    ordinance.regulations = JSON.parse(ordinance.regulations);
  }
  if (ordinance.approvedBy) {
    ordinance.approvedBy = JSON.parse(ordinance.approvedBy);
  }
  if (ordinance.keywords) {
    ordinance.keywords = JSON.parse(ordinance.keywords);
  }
  return ordinance;
}

/**
 * Obtener ordenanza por ID
 */
async function getOrdinanceById(id) {
  const ordinance = await prisma.ordinance.findUnique({
    where: { id },
  });
  
  if (!ordinance) {
    throw new NotFoundError('Ordenanza no encontrada');
  }
  
  return parseOrdinance(ordinance);
}

/**
 * Buscar ordenanzas
 */
async function searchOrdinances(filters = {}) {
  const {
    search,
    status,
    subject,
    year,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;
  
  const where = {};
  
  if (status) where.status = status;
  if (subject) where.subject = { contains: subject, mode: 'insensitive' };
  if (year) where.year = parseInt(year);
  
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { fullText: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (startDate || endDate) {
    where.publicationDate = {};
    if (startDate) where.publicationDate.gte = new Date(startDate);
    if (endDate) where.publicationDate.lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [ordinances, total] = await Promise.all([
    prisma.ordinance.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        publicationDate: 'desc',
      },
    }),
    prisma.ordinance.count({ where }),
  ]);
  
  return {
    data: ordinances.map(parseOrdinance),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar ordenanza
 */
async function updateOrdinance(id, data) {
  await getOrdinanceById(id);
  
  const updateData = { ...data };
  if (data.relatedOrdinances) {
    updateData.relatedOrdinances = JSON.stringify(data.relatedOrdinances);
  }
  if (data.regulations) {
    updateData.regulations = JSON.stringify(data.regulations);
  }
  if (data.keywords) {
    updateData.keywords = JSON.stringify(data.keywords);
  }
  
  const updated = await prisma.ordinance.update({
    where: { id },
    data: updateData,
  });
  
  return parseOrdinance(updated);
}

/**
 * Eliminar ordenanza
 */
async function deleteOrdinance(id) {
  await getOrdinanceById(id);
  
  await prisma.ordinance.delete({
    where: { id },
  });
}

/**
 * Obtener ordenanzas vigentes
 */
async function getActiveOrdinances() {
  const ordinances = await prisma.ordinance.findMany({
    where: {
      status: 'VIGENTE',
    },
    orderBy: {
      publicationDate: 'desc',
    },
  });
  
  return ordinances.map(parseOrdinance);
}

export {
  createOrdinance,
  getOrdinanceById,
  searchOrdinances,
  updateOrdinance,
  deleteOrdinance,
  getActiveOrdinances,
};
