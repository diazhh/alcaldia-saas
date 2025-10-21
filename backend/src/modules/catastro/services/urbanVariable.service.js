/**
 * Servicio para gestión de variables urbanas
 */

import prisma from '../../../config/database.js';
import { NotFoundError, ValidationError } from '../../../shared/utils/errors.js';

/**
 * Obtener todas las variables urbanas
 * @param {Object} filters - Filtros
 * @returns {Promise<Array>}
 */
export const getAllUrbanVariables = async (filters = {}) => {
  const { zoneType, isActive, search } = filters;

  const where = {};

  if (zoneType) where.zoneType = zoneType;
  if (isActive !== undefined) where.isActive = isActive === 'true';
  if (search) {
    where.OR = [
      { zoneCode: { contains: search, mode: 'insensitive' } },
      { zoneName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const variables = await prisma.urbanVariable.findMany({
    where,
    orderBy: { zoneName: 'asc' },
  });

  return variables;
};

/**
 * Obtener variable urbana por ID
 * @param {string} id - ID de la variable
 * @returns {Promise<Object>}
 */
export const getUrbanVariableById = async (id) => {
  const variable = await prisma.urbanVariable.findUnique({
    where: { id },
  });

  if (!variable) {
    throw new NotFoundError('Variable urbana no encontrada');
  }

  return variable;
};

/**
 * Obtener variable urbana por código de zona
 * @param {string} zoneCode - Código de zona
 * @returns {Promise<Object>}
 */
export const getUrbanVariableByZoneCode = async (zoneCode) => {
  const variable = await prisma.urbanVariable.findUnique({
    where: { zoneCode },
  });

  if (!variable) {
    throw new NotFoundError('Variable urbana no encontrada para esta zona');
  }

  return variable;
};

/**
 * Crear nueva variable urbana
 * @param {Object} data - Datos de la variable
 * @returns {Promise<Object>}
 */
export const createUrbanVariable = async (data) => {
  // Verificar que el código de zona no exista
  const existing = await prisma.urbanVariable.findUnique({
    where: { zoneCode: data.zoneCode },
  });

  if (existing) {
    throw new ValidationError('El código de zona ya existe');
  }

  const variable = await prisma.urbanVariable.create({
    data,
  });

  return variable;
};

/**
 * Actualizar variable urbana
 * @param {string} id - ID de la variable
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const updateUrbanVariable = async (id, data) => {
  const existing = await prisma.urbanVariable.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Variable urbana no encontrada');
  }

  // Si se actualiza el código de zona, verificar que no exista
  if (data.zoneCode && data.zoneCode !== existing.zoneCode) {
    const duplicate = await prisma.urbanVariable.findUnique({
      where: { zoneCode: data.zoneCode },
    });

    if (duplicate) {
      throw new ValidationError('El código de zona ya existe');
    }
  }

  const variable = await prisma.urbanVariable.update({
    where: { id },
    data,
  });

  return variable;
};

/**
 * Eliminar variable urbana
 * @param {string} id - ID de la variable
 * @returns {Promise<void>}
 */
export const deleteUrbanVariable = async (id) => {
  const variable = await prisma.urbanVariable.findUnique({
    where: { id },
  });

  if (!variable) {
    throw new NotFoundError('Variable urbana no encontrada');
  }

  await prisma.urbanVariable.delete({
    where: { id },
  });
};

/**
 * Verificar cumplimiento de variables urbanas para un proyecto
 * @param {string} zoneCode - Código de zona
 * @param {Object} projectData - Datos del proyecto
 * @returns {Promise<Object>}
 */
export const checkCompliance = async (zoneCode, projectData) => {
  const variable = await getUrbanVariableByZoneCode(zoneCode);

  const compliance = {
    complies: true,
    violations: [],
    warnings: [],
  };

  // Verificar retiros
  if (variable.frontSetback && projectData.frontSetback < variable.frontSetback) {
    compliance.complies = false;
    compliance.violations.push(
      `Retiro frontal insuficiente. Requerido: ${variable.frontSetback}m, Propuesto: ${projectData.frontSetback}m`
    );
  }

  if (variable.rearSetback && projectData.rearSetback < variable.rearSetback) {
    compliance.complies = false;
    compliance.violations.push(
      `Retiro posterior insuficiente. Requerido: ${variable.rearSetback}m, Propuesto: ${projectData.rearSetback}m`
    );
  }

  if (variable.leftSetback && projectData.leftSetback < variable.leftSetback) {
    compliance.complies = false;
    compliance.violations.push(
      `Retiro lateral izquierdo insuficiente. Requerido: ${variable.leftSetback}m, Propuesto: ${projectData.leftSetback}m`
    );
  }

  if (variable.rightSetback && projectData.rightSetback < variable.rightSetback) {
    compliance.complies = false;
    compliance.violations.push(
      `Retiro lateral derecho insuficiente. Requerido: ${variable.rightSetback}m, Propuesto: ${projectData.rightSetback}m`
    );
  }

  // Verificar altura
  if (variable.maxHeight && projectData.height > variable.maxHeight) {
    compliance.complies = false;
    compliance.violations.push(
      `Altura excedida. Máximo: ${variable.maxHeight}m, Propuesto: ${projectData.height}m`
    );
  }

  // Verificar número de pisos
  if (variable.maxFloors && projectData.floors > variable.maxFloors) {
    compliance.complies = false;
    compliance.violations.push(
      `Número de pisos excedido. Máximo: ${variable.maxFloors}, Propuesto: ${projectData.floors}`
    );
  }

  // Verificar densidad de construcción
  if (variable.buildingDensity && projectData.buildingDensity > variable.buildingDensity) {
    compliance.complies = false;
    compliance.violations.push(
      `Densidad de construcción excedida. Máximo: ${variable.buildingDensity}%, Propuesto: ${projectData.buildingDensity}%`
    );
  }

  // Verificar cobertura máxima
  if (variable.maxCoverage && projectData.coverage > variable.maxCoverage) {
    compliance.complies = false;
    compliance.violations.push(
      `Cobertura máxima excedida. Máximo: ${variable.maxCoverage}%, Propuesto: ${projectData.coverage}%`
    );
  }

  // Verificar estacionamientos
  if (variable.parkingRequired && !projectData.parkingSpaces) {
    compliance.complies = false;
    compliance.violations.push(
      `Se requieren estacionamientos. Ratio: ${variable.parkingRatio}`
    );
  }

  // Verificar uso permitido
  if (variable.allowedUses) {
    try {
      const allowedUses = JSON.parse(variable.allowedUses);
      if (!allowedUses.includes(projectData.propertyUse)) {
        compliance.complies = false;
        compliance.violations.push(
          `Uso no permitido en esta zona. Usos permitidos: ${allowedUses.join(', ')}`
        );
      }
    } catch (error) {
      compliance.warnings.push('Error al verificar usos permitidos');
    }
  }

  return {
    variable,
    compliance,
  };
};

/**
 * Obtener estadísticas de zonas
 * @returns {Promise<Object>}
 */
export const getZoneStats = async () => {
  const [total, byType, activeZones] = await Promise.all([
    prisma.urbanVariable.count(),
    prisma.urbanVariable.groupBy({
      by: ['zoneType'],
      _count: true,
    }),
    prisma.urbanVariable.count({
      where: { isActive: true },
    }),
  ]);

  return {
    total,
    byType,
    activeZones,
  };
};
