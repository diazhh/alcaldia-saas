/**
 * Validaciones para el módulo de catastro
 */

import { z } from 'zod';

// ============================================
// VALIDACIONES PARA PROPIEDADES (FICHA CATASTRAL)
// ============================================

export const createPropertySchema = z.object({
  taxpayerId: z.string().uuid('ID de contribuyente inválido'),
  cadastralCode: z.string().min(1, 'Código catastral requerido'),
  
  // Ubicación
  address: z.string().min(1, 'Dirección requerida'),
  parish: z.string().min(1, 'Parroquia requerida'),
  sector: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  
  // Características físicas
  landArea: z.number().positive('Área de terreno debe ser positiva'),
  buildingArea: z.number().positive().optional(),
  floors: z.number().int().positive().optional(),
  rooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  parkingSpaces: z.number().int().nonnegative().optional(),
  
  // Uso y tipo
  propertyUse: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED', 'VACANT']),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'BUILDING', 'LAND', 'WAREHOUSE', 'OFFICE', 'LOCAL']),
  
  // Valoración
  landValue: z.number().nonnegative('Valor del terreno debe ser no negativo'),
  buildingValue: z.number().nonnegative('Valor de construcción debe ser no negativo'),
  totalValue: z.number().nonnegative('Valor total debe ser no negativo'),
  taxRate: z.number().min(0).max(100),
  
  // Año de construcción
  constructionYear: z.number().int().min(1800).max(new Date().getFullYear() + 5).optional(),
  
  // Linderos
  frontBoundary: z.string().optional(),
  rearBoundary: z.string().optional(),
  leftBoundary: z.string().optional(),
  rightBoundary: z.string().optional(),
  
  // Servicios
  hasWater: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasSewerage: z.boolean().optional(),
  hasGas: z.boolean().optional(),
  
  // Estado de conservación
  conservationState: z.enum(['EXCELLENT', 'GOOD', 'REGULAR', 'POOR', 'RUINOUS']).optional(),
  
  // Zonificación
  zoneCode: z.string().optional(),
  
  // Documentación
  deedNumber: z.string().optional(),
  deedDate: z.string().optional(),
  registryOffice: z.string().optional(),
  
  // Fotografía
  frontPhoto: z.string().url().optional(),
  
  // Exoneraciones
  isExempt: z.boolean().optional(),
  exemptionReason: z.string().optional(),
  exemptionExpiry: z.string().optional(),
  
  notes: z.string().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

// ============================================
// VALIDACIONES PARA PROPIETARIOS
// ============================================

export const createPropertyOwnerSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  ownerName: z.string().min(1, 'Nombre del propietario requerido'),
  ownerIdNumber: z.string().min(1, 'Cédula/RIF requerido'),
  ownerType: z.enum(['NATURAL', 'LEGAL']),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  deedNumber: z.string().optional(),
  deedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePropertyOwnerSchema = createPropertyOwnerSchema.partial();

// ============================================
// VALIDACIONES PARA FOTOS DE PROPIEDADES
// ============================================

export const createPropertyPhotoSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  url: z.string().url('URL inválida'),
  description: z.string().optional(),
  photoType: z.enum(['FRONT', 'REAR', 'INTERIOR', 'AERIAL', 'OTHER']),
});

// ============================================
// VALIDACIONES PARA VARIABLES URBANAS
// ============================================

export const createUrbanVariableSchema = z.object({
  zoneCode: z.string().min(1, 'Código de zona requerido'),
  zoneName: z.string().min(1, 'Nombre de zona requerido'),
  zoneType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED', 'PROTECTED', 'RURAL', 'PUBLIC']),
  
  // Retiros
  frontSetback: z.number().nonnegative().optional(),
  rearSetback: z.number().nonnegative().optional(),
  leftSetback: z.number().nonnegative().optional(),
  rightSetback: z.number().nonnegative().optional(),
  
  // Altura y densidad
  maxHeight: z.number().positive().optional(),
  maxFloors: z.number().int().positive().optional(),
  buildingDensity: z.number().min(0).max(100).optional(),
  maxCoverage: z.number().min(0).max(100).optional(),
  
  // Estacionamientos
  parkingRequired: z.boolean().optional(),
  parkingRatio: z.string().optional(),
  
  // Usos permitidos (JSON array)
  allowedUses: z.string(),
  
  // Normativa
  regulations: z.string().optional(),
  
  isActive: z.boolean().optional(),
});

export const updateUrbanVariableSchema = createUrbanVariableSchema.partial();

// ============================================
// VALIDACIONES PARA PERMISOS DE CONSTRUCCIÓN
// ============================================

export const createConstructionPermitSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  
  // Solicitante
  applicantName: z.string().min(1, 'Nombre del solicitante requerido'),
  applicantId: z.string().min(1, 'Cédula/RIF requerido'),
  applicantPhone: z.string().optional(),
  applicantEmail: z.string().email().optional(),
  
  // Tipo de permiso
  permitType: z.enum(['NEW_CONSTRUCTION', 'REMODELING', 'EXPANSION', 'DEMOLITION', 'REGULARIZATION', 'REPAIR', 'OTHER']),
  
  // Descripción del proyecto
  projectDescription: z.string().min(1, 'Descripción del proyecto requerida'),
  constructionArea: z.number().positive('Área de construcción debe ser positiva'),
  estimatedCost: z.number().nonnegative().optional(),
  
  // Documentos
  architecturalPlans: z.string().url().optional(),
  structuralPlans: z.string().url().optional(),
  electricalPlans: z.string().url().optional(),
  plumbingPlans: z.string().url().optional(),
  propertyDeed: z.string().url().optional(),
  otherDocuments: z.string().optional(),
  
  // Tasas
  reviewFee: z.number().nonnegative().optional(),
  permitFee: z.number().nonnegative('Tasa del permiso requerida'),
  totalFee: z.number().nonnegative('Total de tasas requerido'),
  
  applicationDate: z.string(),
  notes: z.string().optional(),
});

export const updateConstructionPermitSchema = z.object({
  // Revisión técnica
  reviewerId: z.string().uuid().optional(),
  reviewDate: z.string().optional(),
  reviewNotes: z.string().optional(),
  complianceCheck: z.boolean().optional(),
  
  // Aprobación
  approvedBy: z.string().uuid().optional(),
  approvalDate: z.string().optional(),
  approvalNotes: z.string().optional(),
  
  // Pago
  isPaid: z.boolean().optional(),
  paymentDate: z.string().optional(),
  paymentReference: z.string().optional(),
  
  // Fechas
  expiryDate: z.string().optional(),
  constructionStartDate: z.string().optional(),
  constructionEndDate: z.string().optional(),
  
  // Estado
  status: z.enum([
    'SUBMITTED',
    'UNDER_REVIEW',
    'CORRECTIONS_REQUIRED',
    'APPROVED',
    'REJECTED',
    'IN_CONSTRUCTION',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED'
  ]).optional(),
  
  notes: z.string().optional(),
});

// ============================================
// VALIDACIONES PARA INSPECCIONES DE PERMISOS
// ============================================

export const createPermitInspectionSchema = z.object({
  permitId: z.string().uuid('ID de permiso inválido'),
  inspectionDate: z.string(),
  inspectionType: z.enum(['FOUNDATION', 'STRUCTURE', 'MASONRY', 'INSTALLATIONS', 'FINISHES', 'FINAL', 'FOLLOW_UP']),
  inspectorId: z.string().uuid('ID de inspector inválido'),
  inspectorName: z.string().min(1, 'Nombre del inspector requerido'),
  
  findings: z.string().optional(),
  compliance: z.boolean().optional(),
  violations: z.string().optional(),
  recommendations: z.string().optional(),
  photos: z.string().optional(),
  
  requiresAction: z.boolean().optional(),
  actionRequired: z.string().optional(),
  actionDeadline: z.string().optional(),
  
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const updatePermitInspectionSchema = createPermitInspectionSchema.partial();

// ============================================
// VALIDACIONES PARA INSPECCIONES URBANAS
// ============================================

export const createUrbanInspectionSchema = z.object({
  propertyId: z.string().uuid().optional(),
  address: z.string().min(1, 'Dirección requerida'),
  
  inspectionType: z.enum([
    'ILLEGAL_CONSTRUCTION',
    'LAND_INVASION',
    'ZONING_VIOLATION',
    'ENVIRONMENTAL',
    'SAFETY',
    'GENERAL',
    'OTHER'
  ]),
  
  origin: z.enum(['COMPLAINT', 'ROUTINE', 'FOLLOW_UP', 'REQUEST']),
  complaintId: z.string().optional(),
  
  // Denunciante
  complainantName: z.string().optional(),
  complainantPhone: z.string().optional(),
  complainantEmail: z.string().email().optional(),
  
  scheduledDate: z.string().optional(),
  inspectionDate: z.string().optional(),
  
  inspectorId: z.string().uuid().optional(),
  inspectorName: z.string().optional(),
  
  description: z.string().min(1, 'Descripción requerida'),
  hasViolation: z.boolean().optional(),
  violationType: z.string().optional(),
  violationDetails: z.string().optional(),
  
  photos: z.string().optional(),
  
  status: z.enum([
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'NOTIFIED',
    'SANCTIONED',
    'RESOLVED',
    'CANCELLED'
  ]).optional(),
});

export const updateUrbanInspectionSchema = z.object({
  inspectionDate: z.string().optional(),
  inspectorId: z.string().uuid().optional(),
  inspectorName: z.string().optional(),
  
  description: z.string().optional(),
  hasViolation: z.boolean().optional(),
  violationType: z.string().optional(),
  violationDetails: z.string().optional(),
  
  photos: z.string().optional(),
  
  // Notificaciones
  notificationSent: z.boolean().optional(),
  notificationDate: z.string().optional(),
  notificationMethod: z.string().optional(),
  
  // Sanciones
  hasSanction: z.boolean().optional(),
  sanctionType: z.string().optional(),
  sanctionAmount: z.number().nonnegative().optional(),
  sanctionDetails: z.string().optional(),
  
  // Seguimiento
  requiresFollowUp: z.boolean().optional(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
  
  // Resolución
  resolutionDate: z.string().optional(),
  resolutionNotes: z.string().optional(),
  
  status: z.enum([
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'NOTIFIED',
    'SANCTIONED',
    'RESOLVED',
    'CANCELLED'
  ]).optional(),
});
