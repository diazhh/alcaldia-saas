import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de gestión de cargos/posiciones
 */



/**
 * Obtener todos los cargos
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>}
 */
async function getAllPositions(filters = {}) {
  const { isActive, departmentId, level, category } = filters;
  
  const where = {};
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  
  if (departmentId) {
    where.departmentId = departmentId;
  }
  
  if (level) {
    where.level = level;
  }
  
  if (category) {
    where.category = category;
  }
  
  const positions = await prisma.position.findMany({
    where,
    include: {
      _count: {
        select: {
          employees: true,
        },
      },
    },
    orderBy: {
      code: 'asc',
    },
  });
  
  return positions;
}

/**
 * Obtener un cargo por ID
 * @param {string} id - ID del cargo
 * @returns {Promise<Object>}
 */
async function getPositionById(id) {
  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      employees: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
        },
      },
    },
  });
  
  if (!position) {
    throw new AppError('Cargo no encontrado', 404);
  }
  
  return position;
}

/**
 * Crear un nuevo cargo
 * @param {Object} data - Datos del cargo
 * @returns {Promise<Object>}
 */
async function createPosition(data) {
  // Verificar que el código no esté duplicado
  const existingPosition = await prisma.position.findUnique({
    where: { code: data.code },
  });
  
  if (existingPosition) {
    throw new AppError('Ya existe un cargo con este código', 400);
  }
  
  const position = await prisma.position.create({
    data,
  });
  
  return position;
}

/**
 * Actualizar un cargo
 * @param {string} id - ID del cargo
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
async function updatePosition(id, data) {
  const position = await prisma.position.findUnique({
    where: { id },
  });
  
  if (!position) {
    throw new AppError('Cargo no encontrado', 404);
  }
  
  // Si se actualiza el código, verificar que no esté duplicado
  if (data.code && data.code !== position.code) {
    const existingPosition = await prisma.position.findUnique({
      where: { code: data.code },
    });
    
    if (existingPosition) {
      throw new AppError('Ya existe un cargo con este código', 400);
    }
  }
  
  const updatedPosition = await prisma.position.update({
    where: { id },
    data,
  });
  
  return updatedPosition;
}

/**
 * Eliminar un cargo
 * @param {string} id - ID del cargo
 * @returns {Promise<Object>}
 */
async function deletePosition(id) {
  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          employees: true,
        },
      },
    },
  });
  
  if (!position) {
    throw new AppError('Cargo no encontrado', 404);
  }
  
  // Verificar que no tenga empleados asignados
  if (position._count.employees > 0) {
    throw new AppError('No se puede eliminar un cargo con empleados asignados', 400);
  }
  
  await prisma.position.delete({
    where: { id },
  });
  
  return { message: 'Cargo eliminado exitosamente' };
}

export {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
};
