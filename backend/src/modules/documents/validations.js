/**
 * Validaciones para el módulo de Gestión Documental
 * Utiliza Zod para validar los datos de entrada
 */

import { z } from 'zod';

// ============================================
// VALIDACIONES DE CORRESPONDENCIA
// ============================================

/**
 * Schema para crear correspondencia de entrada
 */
const createIncomingCorrespondenceSchema = z.object({
  senderName: z.string().min(1, 'El nombre del remitente es requerido'),
  senderIdNumber: z.string().optional(),
  senderPhone: z.string().optional(),
  senderEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  senderAddress: z.string().optional(),
  subject: z.string().min(1, 'El asunto es requerido'),
  summary: z.string().optional(),
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  destinationDept: z.string().optional(),
  folios: z.number().int().positive().default(1),
  hasAttachments: z.boolean().default(false),
  attachmentsList: z.string().optional(),
  priority: z.enum(['NORMAL', 'URGENTE', 'MUY_URGENTE']).default('NORMAL'),
  receivedDate: z.string().datetime().optional(),
  responseDeadline: z.string().datetime().optional(),
  scannedFileUrl: z.string().url().optional().or(z.literal('')),
  envelopePhotoUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Schema para crear correspondencia de salida
 */
const createOutgoingCorrespondenceSchema = z.object({
  senderName: z.string().min(1, 'El nombre del remitente es requerido'),
  recipientName: z.string().min(1, 'El destinatario es requerido'),
  recipientAddress: z.string().optional(),
  subject: z.string().min(1, 'El asunto es requerido'),
  summary: z.string().optional(),
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  folios: z.number().int().positive().default(1),
  hasAttachments: z.boolean().default(false),
  attachmentsList: z.string().optional(),
  priority: z.enum(['NORMAL', 'URGENTE', 'MUY_URGENTE']).default('NORMAL'),
  sentDate: z.string().datetime().optional(),
  deliveryMethod: z.enum(['PERSONAL', 'CORREO_CERTIFICADO', 'EMAIL', 'COURIER', 'INTERNO']).optional(),
  trackingNumber: z.string().optional(),
  responseToRef: z.string().optional(),
  scannedFileUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Schema para actualizar correspondencia
 */
const updateCorrespondenceSchema = z.object({
  senderName: z.string().min(1).optional(),
  senderIdNumber: z.string().optional(),
  senderPhone: z.string().optional(),
  senderEmail: z.string().email().optional().or(z.literal('')),
  senderAddress: z.string().optional(),
  recipientName: z.string().optional(),
  recipientAddress: z.string().optional(),
  subject: z.string().min(1).optional(),
  summary: z.string().optional(),
  documentType: z.string().optional(),
  destinationDept: z.string().optional(),
  folios: z.number().int().positive().optional(),
  hasAttachments: z.boolean().optional(),
  attachmentsList: z.string().optional(),
  priority: z.enum(['NORMAL', 'URGENTE', 'MUY_URGENTE']).optional(),
  status: z.enum(['RECEIVED', 'IN_DISTRIBUTION', 'DELIVERED', 'IN_PROCESS', 'RESPONDED', 'ARCHIVED']).optional(),
  deliveryMethod: z.enum(['PERSONAL', 'CORREO_CERTIFICADO', 'EMAIL', 'COURIER', 'INTERNO']).optional(),
  trackingNumber: z.string().optional(),
  deliveredAt: z.string().datetime().optional(),
  receivedBy: z.string().optional(),
  scannedFileUrl: z.string().url().optional().or(z.literal('')),
  envelopePhotoUrl: z.string().url().optional().or(z.literal('')),
});

// ============================================
// VALIDACIONES DE MEMO INTERNO
// ============================================

/**
 * Schema para crear memo interno
 */
const createInternalMemoSchema = z.object({
  type: z.enum(['MEMORANDO', 'OFICIO', 'CIRCULAR', 'PROVIDENCIA']),
  fromDepartment: z.string().min(1, 'El departamento origen es requerido'),
  toDepartment: z.string().optional(),
  toDepartments: z.array(z.string()).optional(),
  subject: z.string().min(1, 'El asunto es requerido'),
  body: z.string().min(1, 'El cuerpo del documento es requerido'),
  documentUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Schema para actualizar memo interno
 */
const updateInternalMemoSchema = z.object({
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  documentUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DISTRIBUTED', 'ARCHIVED']).optional(),
  issuedDate: z.string().datetime().optional(),
});

// ============================================
// VALIDACIONES DE ORDENANZA
// ============================================

/**
 * Schema para crear ordenanza
 */
const createOrdinanceSchema = z.object({
  number: z.string().min(1, 'El número de ordenanza es requerido'),
  year: z.number().int().min(1900).max(2100),
  title: z.string().min(1, 'El título es requerido'),
  subject: z.string().min(1, 'La materia es requerida'),
  summary: z.string().optional(),
  fullText: z.string().min(1, 'El texto íntegro es requerido'),
  publicationDate: z.string().date(),
  gazetteName: z.string().optional(),
  gazetteNumber: z.string().optional(),
  gazetteDate: z.string().date().optional(),
  status: z.enum(['VIGENTE', 'REFORMADA', 'DEROGADA', 'SUSPENDIDA']).default('VIGENTE'),
  reformsId: z.string().uuid().optional(),
  relatedOrdinances: z.array(z.string().uuid()).optional(),
  regulations: z.array(z.string()).optional(),
  pdfUrl: z.string().url().optional().or(z.literal('')),
  councilPeriod: z.string().optional(),
  approvedBy: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * Schema para actualizar ordenanza
 */
const updateOrdinanceSchema = z.object({
  title: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  summary: z.string().optional(),
  fullText: z.string().min(1).optional(),
  status: z.enum(['VIGENTE', 'REFORMADA', 'DEROGADA', 'SUSPENDIDA']).optional(),
  reformedById: z.string().uuid().optional(),
  derogatedById: z.string().uuid().optional(),
  relatedOrdinances: z.array(z.string().uuid()).optional(),
  regulations: z.array(z.string()).optional(),
  pdfUrl: z.string().url().optional().or(z.literal('')),
  keywords: z.array(z.string()).optional(),
});

// ============================================
// VALIDACIONES DE ACTA DEL CONCEJO
// ============================================

/**
 * Schema para crear acta del concejo
 */
const createCouncilActSchema = z.object({
  actNumber: z.string().min(1, 'El número de acta es requerido'),
  sessionType: z.enum(['ORDINARIA', 'EXTRAORDINARIA']),
  sessionDate: z.string().datetime(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  location: z.string().min(1, 'La ubicación es requerida'),
  presentCouncilors: z.array(z.string()).min(1, 'Debe haber al menos un concejal presente'),
  absentCouncilors: z.array(z.string()).optional(),
  totalPresent: z.number().int().positive(),
  totalAbsent: z.number().int().min(0).default(0),
  agenda: z.array(z.string()).min(1, 'La orden del día es requerida'),
  pointsDiscussed: z.string().min(1, 'Los puntos tratados son requeridos'),
  motions: z.array(z.object({
    motion: z.string(),
    presentedBy: z.string(),
  })).optional(),
  votations: z.array(z.object({
    subject: z.string(),
    inFavor: z.number().int().min(0),
    against: z.number().int().min(0),
    abstentions: z.number().int().min(0),
    result: z.string(),
  })).optional(),
  agreements: z.array(z.string()).optional(),
  resolutions: z.array(z.string()).optional(),
  interventions: z.array(z.object({
    speaker: z.string(),
    content: z.string(),
  })).optional(),
  signedActUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Schema para actualizar acta del concejo
 */
const updateCouncilActSchema = z.object({
  pointsDiscussed: z.string().min(1).optional(),
  motions: z.array(z.object({
    motion: z.string(),
    presentedBy: z.string(),
  })).optional(),
  votations: z.array(z.object({
    subject: z.string(),
    inFavor: z.number().int().min(0),
    against: z.number().int().min(0),
    abstentions: z.number().int().min(0),
    result: z.string(),
  })).optional(),
  agreements: z.array(z.string()).optional(),
  resolutions: z.array(z.string()).optional(),
  interventions: z.array(z.object({
    speaker: z.string(),
    content: z.string(),
  })).optional(),
  signedActUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED']).optional(),
  approvedAt: z.string().datetime().optional(),
  approvedBy: z.array(z.string()).optional(),
});

// ============================================
// VALIDACIONES DE EXPEDIENTE DIGITAL
// ============================================

/**
 * Schema para crear expediente digital
 */
const createDigitalFileSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  type: z.enum(['PERMISO_CONSTRUCCION', 'LICITACION', 'RECLAMO', 'EXPROPIACION', 'SOLICITUD_SERVICIO', 'INVESTIGACION', 'RECURSO_JERARQUICO', 'OTRO']),
  subject: z.string().min(1, 'El asunto es requerido'),
  applicantName: z.string().min(1, 'El nombre del interesado es requerido'),
  applicantId: z.string().optional(),
  applicantContact: z.string().optional(),
  departmentId: z.string().uuid('ID de departamento inválido'),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
  nextStep: z.string().optional(),
  nextStepDate: z.string().datetime().optional(),
});

/**
 * Schema para actualizar expediente digital
 */
const updateDigitalFileSchema = z.object({
  title: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  applicantContact: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(['EN_TRAMITE', 'PARALIZADO', 'RESUELTO', 'ARCHIVADO', 'CERRADO']).optional(),
  notes: z.string().optional(),
  nextStep: z.string().optional(),
  nextStepDate: z.string().datetime().optional(),
  closedAt: z.string().datetime().optional(),
});

/**
 * Schema para agregar movimiento a expediente
 */
const addFileMovementSchema = z.object({
  fromDepartment: z.string().optional(),
  toDepartment: z.string(),
  movedBy: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export {
  // Correspondencia
  createIncomingCorrespondenceSchema,
  createOutgoingCorrespondenceSchema,
  updateCorrespondenceSchema,
  
  // Memo interno
  createInternalMemoSchema,
  updateInternalMemoSchema,
  
  // Ordenanza
  createOrdinanceSchema,
  updateOrdinanceSchema,
  
  // Acta del concejo
  createCouncilActSchema,
  updateCouncilActSchema,
  
  // Expediente digital
  createDigitalFileSchema,
  updateDigitalFileSchema,
  addFileMovementSchema,
};
