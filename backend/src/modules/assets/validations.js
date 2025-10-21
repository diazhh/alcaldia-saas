/**
 * Validaciones para el módulo de Inventario y Bienes Municipales
 * Usa Zod para validación de schemas
 */

import { z } from 'zod';

/**
 * Schema de validación para crear un bien
 */
const createAssetSchema = z.object({
  type: z.enum(['INMUEBLE', 'MUEBLE', 'MAQUINARIA', 'VEHICULO', 'INTANGIBLE']),
  category: z.string().min(1, 'La categoría es requerida'),
  subcategory: z.string().optional(),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  acquisitionValue: z.number().positive('El valor de adquisición debe ser positivo'),
  currentValue: z.number().positive('El valor actual debe ser positivo').optional(),
  depreciationMethod: z.string().default('LINEA_RECTA'),
  usefulLife: z.number().int().positive().optional(),
  acquisitionDate: z.string().datetime().or(z.date()),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  purchaseOrder: z.string().optional(),
  status: z.enum(['OPERATIVO', 'EN_REPARACION', 'FUERA_SERVICIO', 'EN_PRESTAMO', 'DADO_BAJA', 'PERDIDO']).default('OPERATIVO'),
  condition: z.enum(['EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'OBSOLETO', 'INSERVIBLE']).default('BUENO'),
  departmentId: z.string().uuid().optional(),
  location: z.string().optional(),
  custodianId: z.string().uuid().optional(),
  custodianName: z.string().optional(),
  warranty: z.string().optional(),
  warrantyExpiry: z.string().datetime().or(z.date()).optional(),
  insurancePolicy: z.string().optional(),
  insuranceExpiry: z.string().datetime().or(z.date()).optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
  // Campos específicos para inmuebles
  address: z.string().optional(),
  area: z.number().positive().optional(),
  propertyDocument: z.string().optional(),
  cadastralCode: z.string().optional(),
});

/**
 * Schema de validación para actualizar un bien
 */
const updateAssetSchema = createAssetSchema.partial();

/**
 * Schema de validación para crear un movimiento de bien
 */
const createMovementSchema = z.object({
  assetId: z.string().uuid('ID de bien inválido'),
  type: z.enum([
    'ASIGNACION_INICIAL',
    'TRASPASO',
    'PRESTAMO',
    'DEVOLUCION',
    'REPARACION',
    'RETORNO_REPARACION',
    'BAJA',
    'DONACION'
  ]),
  fromDepartmentId: z.string().uuid().optional(),
  fromDepartment: z.string().optional(),
  fromCustodianId: z.string().uuid().optional(),
  fromCustodian: z.string().optional(),
  fromLocation: z.string().optional(),
  toDepartmentId: z.string().uuid().optional(),
  toDepartment: z.string().optional(),
  toCustodianId: z.string().uuid().optional(),
  toCustodian: z.string().optional(),
  toLocation: z.string().optional(),
  reason: z.string().min(1, 'La razón del movimiento es requerida'),
  description: z.string().optional(),
  movementDate: z.string().datetime().or(z.date()),
  expectedReturn: z.string().datetime().or(z.date()).optional(),
  actNumber: z.string().optional(),
});

/**
 * Schema de validación para aprobar/rechazar movimiento
 */
const updateMovementStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
});

/**
 * Schema de validación para crear mantenimiento de bien
 */
const createAssetMaintenanceSchema = z.object({
  assetId: z.string().uuid('ID de bien inválido'),
  type: z.enum(['PREVENTIVO', 'CORRECTIVO', 'CALIBRACION', 'ACTUALIZACION']),
  description: z.string().min(1, 'La descripción es requerida'),
  cost: z.number().nonnegative('El costo no puede ser negativo'),
  provider: z.string().optional(),
  invoiceNumber: z.string().optional(),
  scheduledDate: z.string().datetime().or(z.date()).optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  completionDate: z.string().datetime().or(z.date()).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  performedBy: z.string().optional(),
  authorizedBy: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema de validación para actualizar mantenimiento
 */
const updateAssetMaintenanceSchema = createAssetMaintenanceSchema.partial().omit({ assetId: true });

/**
 * Schema de validación para crear item de inventario
 */
const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  subcategory: z.string().optional(),
  unit: z.string().min(1, 'La unidad de medida es requerida'),
  currentStock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
  maxStock: z.number().int().positive().optional(),
  unitCost: z.number().positive('El costo unitario debe ser positivo'),
  warehouseLocation: z.string().optional(),
  preferredSupplier: z.string().optional(),
});

/**
 * Schema de validación para actualizar item de inventario
 */
const updateInventoryItemSchema = createInventoryItemSchema.partial();

/**
 * Schema de validación para entrada de inventario
 */
const createInventoryEntrySchema = z.object({
  itemId: z.string().uuid('ID de item inválido'),
  quantity: z.number().int().positive('La cantidad debe ser positiva'),
  unitCost: z.number().positive('El costo unitario debe ser positivo'),
  source: z.enum(['COMPRA', 'DONACION', 'TRANSFERENCIA', 'DEVOLUCION', 'AJUSTE']),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  purchaseOrder: z.string().optional(),
  entryDate: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
});

/**
 * Schema de validación para salida de inventario
 */
const createInventoryExitSchema = z.object({
  itemId: z.string().uuid('ID de item inválido'),
  quantity: z.number().int().positive('La cantidad debe ser positiva'),
  departmentId: z.string().uuid().optional(),
  department: z.string().optional(),
  purpose: z.string().min(1, 'El propósito es requerido'),
  exitDate: z.string().datetime().or(z.date()),
  notes: z.string().optional(),
});

/**
 * Schema de validación para crear solicitud de compra
 */
const createPurchaseRequestSchema = z.object({
  departmentId: z.string().uuid().optional(),
  department: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  justification: z.string().min(1, 'La justificación es requerida'),
  estimatedAmount: z.number().positive('El monto estimado debe ser positivo'),
  budgetItemId: z.string().uuid().optional(),
  requiredDate: z.string().datetime().or(z.date()).optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'La descripción del item es requerida'),
    quantity: z.number().int().positive('La cantidad debe ser positiva'),
    unit: z.string().min(1, 'La unidad es requerida'),
    estimatedUnitPrice: z.number().positive('El precio unitario debe ser positivo'),
    specifications: z.string().optional(),
  })).min(1, 'Debe incluir al menos un item'),
  notes: z.string().optional(),
});

/**
 * Schema de validación para actualizar solicitud de compra
 */
const updatePurchaseRequestSchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  justification: z.string().optional(),
  estimatedAmount: z.number().positive().optional(),
  budgetItemId: z.string().uuid().optional(),
  requiredDate: z.string().datetime().or(z.date()).optional(),
  notes: z.string().optional(),
});

/**
 * Schema de validación para aprobar/rechazar solicitud
 */
const updatePurchaseRequestStatusSchema = z.object({
  status: z.enum([
    'APPROVED_HEAD',
    'APPROVED_BUDGET',
    'APPROVED_PURCHASING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
  ]),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Schema de validación para cotización
 */
const addQuotationSchema = z.object({
  quotationAmount: z.number().positive('El monto de cotización debe ser positivo'),
  quotationSupplier: z.string().min(1, 'El proveedor es requerido'),
});

/**
 * Schema de validación para orden de compra
 */
const addPurchaseOrderSchema = z.object({
  purchaseOrderNumber: z.string().min(1, 'El número de orden es requerido'),
  purchaseOrderDate: z.string().datetime().or(z.date()),
});

/**
 * Schema de validación para recepción
 */
const markAsReceivedSchema = z.object({
  receivedDate: z.string().datetime().or(z.date()),
});

export {
  createAssetSchema,
  updateAssetSchema,
  createMovementSchema,
  updateMovementStatusSchema,
  createAssetMaintenanceSchema,
  updateAssetMaintenanceSchema,
  createInventoryItemSchema,
  updateInventoryItemSchema,
  createInventoryEntrySchema,
  createInventoryExitSchema,
  createPurchaseRequestSchema,
  updatePurchaseRequestSchema,
  updatePurchaseRequestStatusSchema,
  addQuotationSchema,
  addPurchaseOrderSchema,
  markAsReceivedSchema,
};
