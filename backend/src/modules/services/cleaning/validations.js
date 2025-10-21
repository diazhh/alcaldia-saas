/**
 * Validaciones para el módulo de Aseo Urbano
 * Valida datos de rutas de recolección, operaciones y campañas de limpieza
 */

import { z } from 'zod';

/**
 * Schema de validación para crear una ruta de recolección
 */
const createRouteSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  sector: z.string().min(1, 'El sector es requerido'),
  streets: z.string().min(1, 'Las calles son requeridas'),
  collectionType: z.enum(['DOMICILIARIA', 'COMERCIAL', 'HOSPITALARIA', 'ESPECIAL']),
  schedule: z.string().min(1, 'El horario es requerido'),
  startTime: z.string().optional(),
  routeCoordinates: z.string().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  distanceKm: z.number().positive().optional(),
});

/**
 * Schema de validación para actualizar una ruta
 */
const updateRouteSchema = createRouteSchema.partial();

/**
 * Schema de validación para crear una operación de recolección
 */
const createOperationSchema = z.object({
  routeId: z.string().uuid('ID de ruta inválido'),
  date: z.string().datetime('Fecha inválida'),
  scheduledStart: z.string().datetime('Hora de inicio inválida'),
  actualStart: z.string().datetime('Hora de inicio real inválida').optional(),
  actualEnd: z.string().datetime('Hora de fin real inválida').optional(),
  truckId: z.string().optional(),
  driverId: z.string().optional(),
  crewMembers: z.string().optional(),
  status: z.enum(['PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO', 'INCIDENTE']).optional(),
  vehicleChecked: z.boolean().optional(),
  fuelLevel: z.string().optional(),
  tonsCollected: z.number().positive().optional(),
  disposalSite: z.string().optional(),
  disposalTime: z.string().datetime().optional(),
  incidents: z.string().optional(),
  blockedStreets: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema de validación para actualizar una operación
 */
const updateOperationSchema = createOperationSchema.partial().omit({ routeId: true });

/**
 * Schema de validación para crear un punto de recolección
 */
const createPointSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['CONTENEDOR', 'MERCADO', 'FERIA', 'EVENTO']),
  address: z.string().min(1, 'La dirección es requerida'),
  sector: z.string().min(1, 'El sector es requerido'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  containerType: z.string().optional(),
  capacity: z.number().positive().optional(),
  collectionFrequency: z.string().optional(),
  lastCollection: z.string().datetime().optional(),
  nextCollection: z.string().datetime().optional(),
  status: z.string().optional(),
  fillLevel: z.number().int().min(0).max(100).optional(),
  notes: z.string().optional(),
});

/**
 * Schema de validación para actualizar un punto
 */
const updatePointSchema = createPointSchema.partial();

/**
 * Schema de validación para crear una campaña de limpieza
 */
const createCampaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  sector: z.string().min(1, 'El sector es requerido'),
  location: z.string().min(1, 'La ubicación es requerida'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  date: z.string().datetime('Fecha inválida'),
  startTime: z.string().min(1, 'Hora de inicio requerida'),
  endTime: z.string().optional(),
  volunteers: z.number().int().nonnegative().optional(),
  municipalCrew: z.number().int().nonnegative().optional(),
  materialsCollected: z.number().positive().optional(),
  areasCleaned: z.string().optional(),
  photosBefore: z.string().optional(),
  photosAfter: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema de validación para actualizar una campaña
 */
const updateCampaignSchema = createCampaignSchema.partial();

export {
  createRouteSchema,
  updateRouteSchema,
  createOperationSchema,
  updateOperationSchema,
  createPointSchema,
  updatePointSchema,
  createCampaignSchema,
  updateCampaignSchema,
};
