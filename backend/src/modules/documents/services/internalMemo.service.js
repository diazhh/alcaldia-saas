/**
 * Servicio de Oficios Internos
 * Gestiona memorandos, oficios, circulares y providencias
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Genera el número de referencia para memo interno
 * @param {string} departmentCode - Código del departamento
 * @param {string} type - Tipo de memo
 * @returns {Promise<string>} Número de referencia generado
 */
async function generateReference(departmentCode, type) {
  const year = new Date().getFullYear();
  
  // Obtener el último número del año actual para este departamento
  const lastMemo = await prisma.internalMemo.findFirst({
    where: {
      fromDepartment: departmentCode,
      reference: {
        startsWith: `${departmentCode}-${year}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  let nextNumber = 1;
  if (lastMemo) {
    const parts = lastMemo.reference.split('-');
    const lastNumber = parseInt(parts[parts.length - 1]);
    nextNumber = lastNumber + 1;
  }
  
  // Formato: DIR-FINANZAS-2025-045
  return `${departmentCode}-${year}-${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Crear memo interno
 */
async function createInternalMemo(data, userId) {
  const reference = await generateReference(data.fromDepartment, data.type);
  
  const memo = await prisma.internalMemo.create({
    data: {
      reference,
      type: data.type,
      fromDepartment: data.fromDepartment,
      toDepartment: data.toDepartment,
      toDepartments: data.toDepartments ? JSON.stringify(data.toDepartments) : null,
      subject: data.subject,
      body: data.body,
      documentUrl: data.documentUrl,
      createdBy: userId,
      status: 'DRAFT',
    },
  });
  
  return memo;
}

/**
 * Obtener memo por ID
 */
async function getInternalMemoById(id) {
  const memo = await prisma.internalMemo.findUnique({
    where: { id },
  });
  
  if (!memo) {
    throw new NotFoundError('Memo interno no encontrado');
  }
  
  // Parsear toDepartments si existe
  if (memo.toDepartments) {
    memo.toDepartments = JSON.parse(memo.toDepartments);
  }
  
  return memo;
}

/**
 * Listar memos internos con filtros
 */
async function listInternalMemos(filters = {}) {
  const {
    type,
    status,
    fromDepartment,
    toDepartment,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;
  
  const where = {};
  
  if (type) where.type = type;
  if (status) where.status = status;
  if (fromDepartment) where.fromDepartment = fromDepartment;
  if (toDepartment) where.toDepartment = toDepartment;
  
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [memos, total] = await Promise.all([
    prisma.internalMemo.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.internalMemo.count({ where }),
  ]);
  
  // Parsear toDepartments para cada memo
  memos.forEach(memo => {
    if (memo.toDepartments) {
      memo.toDepartments = JSON.parse(memo.toDepartments);
    }
  });
  
  return {
    data: memos,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar memo interno
 */
async function updateInternalMemo(id, data) {
  await getInternalMemoById(id);
  
  const updateData = { ...data };
  if (data.toDepartments) {
    updateData.toDepartments = JSON.stringify(data.toDepartments);
  }
  
  const updated = await prisma.internalMemo.update({
    where: { id },
    data: updateData,
  });
  
  if (updated.toDepartments) {
    updated.toDepartments = JSON.parse(updated.toDepartments);
  }
  
  return updated;
}

/**
 * Aprobar memo interno
 */
async function approveMemo(id) {
  const memo = await getInternalMemoById(id);
  
  const updated = await prisma.internalMemo.update({
    where: { id },
    data: {
      status: 'APPROVED',
      issuedDate: new Date(),
    },
  });
  
  return updated;
}

/**
 * Distribuir memo interno
 */
async function distributeMemo(id) {
  const memo = await getInternalMemoById(id);
  
  const updated = await prisma.internalMemo.update({
    where: { id },
    data: {
      status: 'DISTRIBUTED',
    },
  });
  
  return updated;
}

/**
 * Archivar memo interno
 */
async function archiveMemo(id) {
  await getInternalMemoById(id);
  
  const updated = await prisma.internalMemo.update({
    where: { id },
    data: {
      status: 'ARCHIVED',
    },
  });
  
  return updated;
}

/**
 * Eliminar memo interno
 */
async function deleteInternalMemo(id) {
  await getInternalMemoById(id);
  
  await prisma.internalMemo.delete({
    where: { id },
  });
}

/**
 * Obtener estadísticas de memos internos
 */
async function getInternalMemoStats(filters = {}) {
  const { startDate, endDate, fromDepartment } = filters;
  
  const where = {};
  if (fromDepartment) where.fromDepartment = fromDepartment;
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }
  
  const [total, byStatus, byType] = await Promise.all([
    prisma.internalMemo.count({ where }),
    prisma.internalMemo.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    prisma.internalMemo.groupBy({
      by: ['type'],
      where,
      _count: true,
    }),
  ]);
  
  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    byType: byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {}),
  };
}

export {
  createInternalMemo,
  getInternalMemoById,
  listInternalMemos,
  updateInternalMemo,
  approveMemo,
  distributeMemo,
  archiveMemo,
  deleteInternalMemo,
  getInternalMemoStats,
};
