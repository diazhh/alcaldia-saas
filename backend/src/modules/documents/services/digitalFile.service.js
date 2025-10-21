/**
 * Servicio de Expedientes Digitales
 * Gestiona expedientes y su trazabilidad
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Genera el número de expediente
 */
async function generateFileNumber(type) {
  const year = new Date().getFullYear();
  const typePrefix = type.substring(0, 3).toUpperCase();
  
  const lastFile = await prisma.digitalFile.findFirst({
    where: {
      fileNumber: {
        startsWith: `EXP-${typePrefix}-${year}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  let nextNumber = 1;
  if (lastFile) {
    const parts = lastFile.fileNumber.split('-');
    const lastNumber = parseInt(parts[parts.length - 1]);
    nextNumber = lastNumber + 1;
  }
  
  return `EXP-${typePrefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Parsear campos JSON del expediente
 */
function parseDigitalFile(file) {
  if (file.documentIndex) {
    file.documentIndex = JSON.parse(file.documentIndex);
  }
  if (file.movements) {
    file.movements = JSON.parse(file.movements);
  }
  return file;
}

/**
 * Crear expediente digital
 */
async function createDigitalFile(data, userId) {
  const fileNumber = await generateFileNumber(data.type);
  
  const file = await prisma.digitalFile.create({
    data: {
      fileNumber,
      title: data.title,
      type: data.type,
      subject: data.subject,
      applicantName: data.applicantName,
      applicantId: data.applicantId,
      applicantContact: data.applicantContact,
      departmentId: data.departmentId,
      assignedTo: data.assignedTo,
      notes: data.notes,
      nextStep: data.nextStep,
      nextStepDate: data.nextStepDate ? new Date(data.nextStepDate) : null,
      createdBy: userId,
      status: 'EN_TRAMITE',
      movements: JSON.stringify([{
        date: new Date().toISOString(),
        action: 'APERTURA',
        department: data.departmentId,
        user: userId,
        notes: 'Expediente abierto',
      }]),
    },
  });
  
  return parseDigitalFile(file);
}

/**
 * Obtener expediente por ID
 */
async function getDigitalFileById(id) {
  const file = await prisma.digitalFile.findUnique({
    where: { id },
    include: {
      documents: {
        orderBy: {
          documentDate: 'asc',
        },
      },
    },
  });
  
  if (!file) {
    throw new NotFoundError('Expediente no encontrado');
  }
  
  return parseDigitalFile(file);
}

/**
 * Listar expedientes
 */
async function listDigitalFiles(filters = {}) {
  const {
    type,
    status,
    departmentId,
    assignedTo,
    search,
    page = 1,
    limit = 20,
  } = filters;
  
  const where = {};
  
  if (type) where.type = type;
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;
  if (assignedTo) where.assignedTo = assignedTo;
  
  if (search) {
    where.OR = [
      { fileNumber: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { applicantName: { contains: search, mode: 'insensitive' } },
      { applicantId: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const [files, total] = await Promise.all([
    prisma.digitalFile.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    }),
    prisma.digitalFile.count({ where }),
  ]);
  
  return {
    data: files.map(parseDigitalFile),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar expediente
 */
async function updateDigitalFile(id, data) {
  await getDigitalFileById(id);
  
  const updateData = { ...data };
  if (data.nextStepDate) {
    updateData.nextStepDate = new Date(data.nextStepDate);
  }
  if (data.closedAt) {
    updateData.closedAt = new Date(data.closedAt);
  }
  
  const updated = await prisma.digitalFile.update({
    where: { id },
    data: updateData,
  });
  
  return parseDigitalFile(updated);
}

/**
 * Agregar movimiento al expediente
 */
async function addMovement(id, movementData, userId) {
  const file = await getDigitalFileById(id);
  
  const movements = file.movements || [];
  movements.push({
    date: new Date().toISOString(),
    fromDepartment: movementData.fromDepartment,
    toDepartment: movementData.toDepartment,
    movedBy: userId,
    reason: movementData.reason,
    notes: movementData.notes,
  });
  
  const updated = await prisma.digitalFile.update({
    where: { id },
    data: {
      movements: JSON.stringify(movements),
    },
  });
  
  return parseDigitalFile(updated);
}

/**
 * Cerrar expediente
 */
async function closeFile(id, userId) {
  const file = await getDigitalFileById(id);
  
  const movements = file.movements || [];
  movements.push({
    date: new Date().toISOString(),
    action: 'CIERRE',
    user: userId,
    notes: 'Expediente cerrado',
  });
  
  const updated = await prisma.digitalFile.update({
    where: { id },
    data: {
      status: 'CERRADO',
      closedAt: new Date(),
      movements: JSON.stringify(movements),
    },
  });
  
  return parseDigitalFile(updated);
}

/**
 * Archivar expediente
 */
async function archiveFile(id) {
  await getDigitalFileById(id);
  
  const updated = await prisma.digitalFile.update({
    where: { id },
    data: {
      status: 'ARCHIVADO',
    },
  });
  
  return parseDigitalFile(updated);
}

/**
 * Eliminar expediente
 */
async function deleteDigitalFile(id) {
  await getDigitalFileById(id);
  
  await prisma.digitalFile.delete({
    where: { id },
  });
}

/**
 * Obtener estadísticas de expedientes
 */
async function getFileStats(filters = {}) {
  const { departmentId } = filters;
  
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  
  const [total, byStatus, byType] = await Promise.all([
    prisma.digitalFile.count({ where }),
    prisma.digitalFile.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    prisma.digitalFile.groupBy({
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
  createDigitalFile,
  getDigitalFileById,
  listDigitalFiles,
  updateDigitalFile,
  addMovement,
  closeFile,
  archiveFile,
  deleteDigitalFile,
  getFileStats,
};
