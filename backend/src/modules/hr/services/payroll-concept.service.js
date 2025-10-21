import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de gestión de conceptos de nómina
 */



/**
 * Obtener todos los conceptos de nómina
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>}
 */
async function getAllConcepts(filters = {}) {
  const { type, isActive } = filters;
  
  const where = {};
  
  if (type) {
    where.type = type;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  
  const concepts = await prisma.payrollConcept.findMany({
    where,
    orderBy: {
      order: 'asc',
    },
  });
  
  return concepts;
}

/**
 * Crear un concepto de nómina
 * @param {Object} data - Datos del concepto
 * @returns {Promise<Object>}
 */
async function createConcept(data) {
  // Verificar que el código no esté duplicado
  const existingConcept = await prisma.payrollConcept.findUnique({
    where: { code: data.code },
  });
  
  if (existingConcept) {
    throw new AppError('Ya existe un concepto con este código', 400);
  }
  
  const concept = await prisma.payrollConcept.create({
    data,
  });
  
  return concept;
}

/**
 * Actualizar un concepto de nómina
 * @param {string} id - ID del concepto
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
async function updateConcept(id, data) {
  const concept = await prisma.payrollConcept.findUnique({
    where: { id },
  });
  
  if (!concept) {
    throw new AppError('Concepto no encontrado', 404);
  }
  
  // Si se actualiza el código, verificar que no esté duplicado
  if (data.code && data.code !== concept.code) {
    const existingConcept = await prisma.payrollConcept.findUnique({
      where: { code: data.code },
    });
    
    if (existingConcept) {
      throw new AppError('Ya existe un concepto con este código', 400);
    }
  }
  
  const updatedConcept = await prisma.payrollConcept.update({
    where: { id },
    data,
  });
  
  return updatedConcept;
}

/**
 * Eliminar un concepto de nómina
 * @param {string} id - ID del concepto
 * @returns {Promise<Object>}
 */
async function deleteConcept(id) {
  const concept = await prisma.payrollConcept.findUnique({
    where: { id },
  });
  
  if (!concept) {
    throw new AppError('Concepto no encontrado', 404);
  }
  
  // Marcar como inactivo en lugar de eliminar
  await prisma.payrollConcept.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
  
  return { message: 'Concepto desactivado exitosamente' };
}

export {
  getAllConcepts,
  createConcept,
  updateConcept,
  deleteConcept,
};
