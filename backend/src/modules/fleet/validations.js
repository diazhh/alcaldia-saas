/**
 * Validaciones para el módulo de Gestión de Flota
 * Utiliza Zod para validar los datos de entrada
 */

import { z } from 'zod';

/**
 * Schema de validación para crear un vehículo
 */
const createVehicleSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  plate: z.string().min(1, 'La placa es requerida'),
  type: z.enum([
    'GARBAGE_TRUCK',
    'AMBULANCE',
    'PATROL',
    'PICKUP',
    'CAR',
    'DUMP_TRUCK',
    'BUS',
    'MOTORCYCLE',
    'HEAVY_MACHINERY',
    'OTHER',
  ]),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'El color es requerido'),
  vin: z.string().optional(),
  engineSerial: z.string().optional(),
  engineCapacity: z.string().optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'GAS', 'ELECTRIC', 'HYBRID']),
  capacity: z.string().optional(),
  registrationCert: z.string().optional(),
  ownershipTitle: z.string().optional(),
  acquisitionValue: z.number().positive('El valor de adquisición debe ser positivo'),
  currentValue: z.number().positive('El valor actual debe ser positivo'),
  acquisitionDate: z.string().datetime(),
  status: z
    .enum(['OPERATIONAL', 'IN_REPAIR', 'OUT_OF_SERVICE', 'TOTALED', 'DECOMMISSIONED'])
    .optional(),
  assignedTo: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  currentMileage: z.number().int().min(0).optional(),
  photo: z.string().optional(),
});

/**
 * Schema de validación para actualizar un vehículo
 */
const updateVehicleSchema = createVehicleSchema.partial();

/**
 * Schema de validación para crear un registro de viaje
 */
const createTripLogSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  driverName: z.string().min(1, 'El nombre del conductor es requerido'),
  driverLicense: z.string().optional(),
  startMileage: z.number().int().min(0, 'El kilometraje inicial debe ser positivo'),
  endMileage: z.number().int().min(0).optional(),
  departureDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  destination: z.string().min(1, 'El destino es requerido'),
  purpose: z.string().min(1, 'El motivo del viaje es requerido'),
  observations: z.string().optional(),
  signature: z.string().optional(),
});

/**
 * Schema de validación para actualizar un registro de viaje
 */
const updateTripLogSchema = createTripLogSchema.partial();

/**
 * Schema de validación para crear un control de combustible
 */
const createFuelControlSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  voucherNumber: z.string().min(1, 'El número de vale es requerido'),
  authorizedLiters: z.number().positive('Los litros autorizados deben ser positivos'),
  gasStation: z.string().min(1, 'La estación de servicio es requerida'),
  loadDate: z.string().datetime(),
  loadedLiters: z.number().positive('Los litros cargados deben ser positivos'),
  cost: z.number().positive().optional(),
  mileageAtLoad: z.number().int().min(0, 'El kilometraje debe ser positivo'),
  notes: z.string().optional(),
});

/**
 * Schema de validación para actualizar un control de combustible
 */
const updateFuelControlSchema = createFuelControlSchema.partial();

/**
 * Schema de validación para crear un mantenimiento
 */
const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE']),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  scheduledDate: z.string().datetime(),
  completedDate: z.string().datetime().optional(),
  scheduledMileage: z.number().int().min(0).optional(),
  actualMileage: z.number().int().min(0).optional(),
  workshop: z.string().optional(),
  mechanic: z.string().optional(),
  workPerformed: z.string().optional(),
  partsUsed: z.string().optional(),
  laborCost: z.number().min(0).optional(),
  partsCost: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
  nextMileage: z.number().int().min(0).optional(),
  nextDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  createdBy: z.string().uuid(),
  approvedBy: z.string().uuid().optional(),
});

/**
 * Schema de validación para actualizar un mantenimiento
 */
const updateMaintenanceSchema = createMaintenanceSchema.partial();

/**
 * Schema de validación para crear un neumático
 */
const createTireSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  brand: z.string().min(1, 'La marca es requerida'),
  size: z.string().min(1, 'La medida es requerida'),
  position: z.string().min(1, 'La posición es requerida'),
  installationDate: z.string().datetime(),
  removalDate: z.string().datetime().optional(),
  status: z.enum(['INSTALLED', 'IN_STORAGE', 'DISCARDED']).optional(),
  expectedLifeKm: z.number().int().min(0).optional(),
  actualLifeKm: z.number().int().min(0).optional(),
  cost: z.number().positive('El costo debe ser positivo'),
  notes: z.string().optional(),
});

/**
 * Schema de validación para actualizar un neumático
 */
const updateTireSchema = createTireSchema.partial();

/**
 * Schema de validación para crear un seguro
 */
const createInsuranceSchema = z.object({
  vehicleId: z.string().uuid('ID de vehículo inválido'),
  policyNumber: z.string().min(1, 'El número de póliza es requerido'),
  insurer: z.string().min(1, 'La aseguradora es requerida'),
  coverage: z.string().min(1, 'La cobertura es requerida'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  premium: z.number().positive('La prima debe ser positiva'),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
});

/**
 * Schema de validación para actualizar un seguro
 */
const updateInsuranceSchema = createInsuranceSchema.partial();

/**
 * Schema de validación para crear un siniestro
 */
const createClaimSchema = z.object({
  insuranceId: z.string().uuid('ID de seguro inválido'),
  claimNumber: z.string().min(1, 'El número de reclamo es requerido'),
  incidentDate: z.string().datetime(),
  location: z.string().min(1, 'La ubicación es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  driverName: z.string().min(1, 'El nombre del conductor es requerido'),
  driverLicense: z.string().optional(),
  materialDamage: z.string().optional(),
  personalInjury: z.string().optional(),
  reportedDate: z.string().datetime().optional(),
  status: z
    .enum(['REPORTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED'])
    .optional(),
  estimatedCost: z.number().positive().optional(),
  coveredAmount: z.number().positive().optional(),
  deductible: z.number().positive().optional(),
  resolvedDate: z.string().datetime().optional(),
  resolution: z.string().optional(),
});

/**
 * Schema de validación para actualizar un siniestro
 */
const updateClaimSchema = createClaimSchema.partial();

export {
  createVehicleSchema,
  updateVehicleSchema,
  createTripLogSchema,
  updateTripLogSchema,
  createFuelControlSchema,
  updateFuelControlSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  createTireSchema,
  updateTireSchema,
  createInsuranceSchema,
  updateInsuranceSchema,
  createClaimSchema,
  updateClaimSchema,
};
