import prisma from '../../../config/database.js';
import { z } from 'zod';

/**
 * Servicio para gestión de capas SIG (Sistema de Información Geográfica)
 */

// Esquema de validación para crear/actualizar capa
const zoneLayerSchema = z.object({
  layerName: z.string().min(1, 'El nombre de la capa es requerido'),
  layerType: z.enum([
    'ZONIFICACION',
    'VIALIDAD',
    'SERVICIOS_PUBLICOS',
    'AREA_PROTEGIDA',
    'RED_AGUA',
    'RED_CLOACAS',
    'RED_ELECTRICA',
    'RED_GAS',
    'LIMITES_PARROQUIALES',
    'PARCELAS',
    'OTROS',
  ]),
  geometry: z.any(), // GeoJSON object
  properties: z.any().optional(),
  style: z.any().optional(),
  isVisible: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  description: z.string().optional(),
});

/**
 * Obtener todas las capas con filtros opcionales
 */
export async function getAllLayers(filters = {}) {
  const { layerType, isVisible, page = 1, limit = 50 } = filters;

  const where = {};
  if (layerType) where.layerType = layerType;
  if (isVisible !== undefined) where.isVisible = isVisible;

  const skip = (page - 1) * limit;

  const [layers, total] = await Promise.all([
    prisma.zoneLayer.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }, { layerName: 'asc' }],
    }),
    prisma.zoneLayer.count({ where }),
  ]);

  return {
    layers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener capa por ID
 */
export async function getLayerById(id) {
  const layer = await prisma.zoneLayer.findUnique({
    where: { id },
  });

  if (!layer) {
    throw new Error('Capa no encontrada');
  }

  return layer;
}

/**
 * Obtener capas por tipo
 */
export async function getLayersByType(layerType) {
  return await prisma.zoneLayer.findMany({
    where: { layerType },
    orderBy: [{ displayOrder: 'asc' }, { layerName: 'asc' }],
  });
}

/**
 * Obtener capas visibles
 */
export async function getVisibleLayers() {
  return await prisma.zoneLayer.findMany({
    where: { isVisible: true },
    orderBy: [{ displayOrder: 'asc' }, { layerName: 'asc' }],
  });
}

/**
 * Crear nueva capa
 */
export async function createLayer(data) {
  // Validar datos
  const validatedData = zoneLayerSchema.parse(data);

  // Crear capa
  const layer = await prisma.zoneLayer.create({
    data: validatedData,
  });

  return layer;
}

/**
 * Actualizar capa
 */
export async function updateLayer(id, data) {
  // Verificar que existe
  await getLayerById(id);

  // Validar datos parciales
  const partialSchema = zoneLayerSchema.partial();
  const validatedData = partialSchema.parse(data);

  // Actualizar
  const layer = await prisma.zoneLayer.update({
    where: { id },
    data: validatedData,
  });

  return layer;
}

/**
 * Eliminar capa
 */
export async function deleteLayer(id) {
  // Verificar que existe
  await getLayerById(id);

  // Eliminar
  await prisma.zoneLayer.delete({
    where: { id },
  });

  return { message: 'Capa eliminada exitosamente' };
}

/**
 * Alternar visibilidad de capa
 */
export async function toggleLayerVisibility(id) {
  const layer = await getLayerById(id);

  const updated = await prisma.zoneLayer.update({
    where: { id },
    data: { isVisible: !layer.isVisible },
  });

  return updated;
}

/**
 * Actualizar orden de visualización
 */
export async function updateDisplayOrder(id, displayOrder) {
  await getLayerById(id);

  const updated = await prisma.zoneLayer.update({
    where: { id },
    data: { displayOrder },
  });

  return updated;
}

/**
 * Obtener estadísticas de capas
 */
export async function getLayerStats() {
  const [total, byType, visible] = await Promise.all([
    prisma.zoneLayer.count(),
    prisma.zoneLayer.groupBy({
      by: ['layerType'],
      _count: true,
    }),
    prisma.zoneLayer.count({ where: { isVisible: true } }),
  ]);

  return {
    total,
    visible,
    hidden: total - visible,
    byType: byType.map((item) => ({
      type: item.layerType,
      count: item._count,
    })),
  };
}

export default {
  getAllLayers,
  getLayerById,
  getLayersByType,
  getVisibleLayers,
  createLayer,
  updateLayer,
  deleteLayer,
  toggleLayerVisibility,
  updateDisplayOrder,
  getLayerStats,
};
