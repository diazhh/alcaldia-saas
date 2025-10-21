/**
 * Servicio para gestión de movimientos de bienes
 */

import prisma from '../../../config/database.js';

/**
 * Genera el siguiente número de acta
 * @returns {Promise<string>} Número de acta generado
 */
async function generateActNumber() {
  const year = new Date().getFullYear();
  const prefix = `ACTA-${year}-`;
  
  const lastMovement = await prisma.assetMovement.findFirst({
    where: {
      actNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      actNumber: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastMovement && lastMovement.actNumber) {
    const lastNumber = parseInt(lastMovement.actNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Obtiene todos los movimientos con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de movimientos
 */
async function getAllMovements(filters = {}) {
  const { assetId, type, status, page = 1, limit = 50 } = filters;
  
  const where = {};
  if (assetId) where.assetId = assetId;
  if (type) where.type = type;
  if (status) where.status = status;
  
  const skip = (page - 1) * limit;
  
  const [movements, total] = await Promise.all([
    prisma.assetMovement.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        asset: {
          select: {
            code: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { movementDate: 'desc' },
    }),
    prisma.assetMovement.count({ where }),
  ]);
  
  return {
    movements,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene un movimiento por ID
 * @param {string} id - ID del movimiento
 * @returns {Promise<Object>} Movimiento encontrado
 */
async function getMovementById(id) {
  const movement = await prisma.assetMovement.findUnique({
    where: { id },
    include: {
      asset: true,
    },
  });
  
  if (!movement) {
    throw new Error('Movimiento no encontrado');
  }
  
  return movement;
}

/**
 * Crea un nuevo movimiento de bien
 * @param {Object} data - Datos del movimiento
 * @param {string} userId - ID del usuario que solicita
 * @returns {Promise<Object>} Movimiento creado
 */
async function createMovement(data, userId) {
  // Verificar que el bien existe
  const asset = await prisma.asset.findUnique({
    where: { id: data.assetId },
  });
  
  if (!asset) {
    throw new Error('Bien no encontrado');
  }
  
  // Generar número de acta
  const actNumber = await generateActNumber();
  
  const movement = await prisma.assetMovement.create({
    data: {
      ...data,
      actNumber,
      requestedBy: userId,
      movementDate: new Date(data.movementDate),
      expectedReturn: data.expectedReturn ? new Date(data.expectedReturn) : null,
    },
    include: {
      asset: true,
    },
  });
  
  return movement;
}

/**
 * Aprueba un movimiento y actualiza el bien
 * @param {string} id - ID del movimiento
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<Object>} Movimiento actualizado
 */
async function approveMovement(id, userId) {
  const movement = await getMovementById(id);
  
  if (movement.status !== 'PENDING') {
    throw new Error('Solo se pueden aprobar movimientos pendientes');
  }
  
  // Actualizar el movimiento
  const updatedMovement = await prisma.assetMovement.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedBy: userId,
    },
  });
  
  // Actualizar el bien según el tipo de movimiento
  const updateData = {};
  
  switch (movement.type) {
    case 'ASIGNACION_INICIAL':
    case 'TRASPASO':
      updateData.departmentId = movement.toDepartmentId;
      updateData.location = movement.toLocation;
      updateData.custodianId = movement.toCustodianId;
      updateData.custodianName = movement.toCustodian;
      updateData.assignedAt = new Date();
      updateData.status = 'OPERATIVO';
      break;
      
    case 'PRESTAMO':
      updateData.status = 'EN_PRESTAMO';
      break;
      
    case 'REPARACION':
      updateData.status = 'EN_REPARACION';
      break;
      
    case 'BAJA':
      updateData.status = 'DADO_BAJA';
      break;
  }
  
  if (Object.keys(updateData).length > 0) {
    await prisma.asset.update({
      where: { id: movement.assetId },
      data: updateData,
    });
  }
  
  return updatedMovement;
}

/**
 * Completa un movimiento
 * @param {string} id - ID del movimiento
 * @param {string} userId - ID del usuario que recibe
 * @returns {Promise<Object>} Movimiento completado
 */
async function completeMovement(id, userId) {
  const movement = await getMovementById(id);
  
  if (movement.status !== 'APPROVED' && movement.status !== 'IN_TRANSIT') {
    throw new Error('Solo se pueden completar movimientos aprobados o en tránsito');
  }
  
  const updatedMovement = await prisma.assetMovement.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      receivedBy: userId,
      actualReturn: movement.type === 'PRESTAMO' || movement.type === 'DEVOLUCION' ? new Date() : null,
    },
  });
  
  // Si es devolución o retorno de reparación, actualizar el bien
  if (movement.type === 'DEVOLUCION' || movement.type === 'RETORNO_REPARACION') {
    await prisma.asset.update({
      where: { id: movement.assetId },
      data: {
        status: 'OPERATIVO',
        departmentId: movement.toDepartmentId,
        location: movement.toLocation,
        custodianId: movement.toCustodianId,
        custodianName: movement.toCustodian,
      },
    });
  }
  
  return updatedMovement;
}

/**
 * Rechaza un movimiento
 * @param {string} id - ID del movimiento
 * @param {string} userId - ID del usuario que rechaza
 * @returns {Promise<Object>} Movimiento rechazado
 */
async function rejectMovement(id, userId) {
  const movement = await getMovementById(id);
  
  if (movement.status !== 'PENDING') {
    throw new Error('Solo se pueden rechazar movimientos pendientes');
  }
  
  const updatedMovement = await prisma.assetMovement.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approvedBy: userId,
    },
  });
  
  return updatedMovement;
}

/**
 * Cancela un movimiento
 * @param {string} id - ID del movimiento
 * @returns {Promise<Object>} Movimiento cancelado
 */
async function cancelMovement(id) {
  const movement = await getMovementById(id);
  
  if (movement.status === 'COMPLETED') {
    throw new Error('No se pueden cancelar movimientos completados');
  }
  
  const updatedMovement = await prisma.assetMovement.update({
    where: { id },
    data: {
      status: 'CANCELLED',
    },
  });
  
  return updatedMovement;
}

/**
 * Obtiene el historial de movimientos de un bien
 * @param {string} assetId - ID del bien
 * @returns {Promise<Array>} Historial de movimientos
 */
async function getAssetMovementHistory(assetId) {
  const movements = await prisma.assetMovement.findMany({
    where: { assetId },
    orderBy: { movementDate: 'desc' },
  });
  
  return movements;
}

export {
  generateActNumber,
  getAllMovements,
  getMovementById,
  createMovement,
  approveMovement,
  completeMovement,
  rejectMovement,
  cancelMovement,
  getAssetMovementHistory,
};
