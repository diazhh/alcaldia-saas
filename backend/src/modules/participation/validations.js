/**
 * Validaciones para el módulo de Participación Ciudadana
 * Utiliza Zod para validación de datos
 */

import { z } from 'zod';

// ============================================
// VALIDACIONES PARA REPORTES CIUDADANOS (311)
// ============================================

/**
 * Schema para crear un reporte ciudadano
 */
export const createReportSchema = z.object({
  type: z.enum([
    'POTHOLE',
    'STREET_LIGHT',
    'GARBAGE',
    'WATER_LEAK',
    'FALLEN_TREE',
    'TRAFFIC_LIGHT',
    'SEWER',
    'PEST',
    'NOISE',
    'DEAD_ANIMAL',
    'ROAD_SIGN',
    'SIDEWALK',
    'PARK_MAINTENANCE',
    'OTHER'
  ]),
  customType: z.string().optional(),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(5, 'La ubicación debe tener al menos 5 caracteres'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  sector: z.string().optional(),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email('Email inválido').optional(),
  reporterPhone: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  isPublic: z.boolean().default(true)
});

/**
 * Schema para actualizar estado de reporte
 */
export const updateReportStatusSchema = z.object({
  status: z.enum([
    'RECEIVED',
    'IN_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
    'REJECTED'
  ]),
  resolutionNotes: z.string().optional()
});

/**
 * Schema para asignar reporte
 */
export const assignReportSchema = z.object({
  departmentId: z.string().uuid('ID de departamento inválido').optional(),
  assignedTo: z.string().uuid('ID de usuario inválido').optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
});

/**
 * Schema para calificar servicio
 */
export const rateReportSchema = z.object({
  rating: z.number().int().min(1).max(5),
  ratingComment: z.string().optional()
});

/**
 * Schema para agregar comentario
 */
export const addCommentSchema = z.object({
  comment: z.string().min(1, 'El comentario no puede estar vacío'),
  isInternal: z.boolean().default(false)
});

/**
 * Schema para filtros de búsqueda de reportes
 */
export const searchReportsSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  sector: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10')
});

// ============================================
// VALIDACIONES PARA PRESUPUESTO PARTICIPATIVO
// ============================================

/**
 * Schema para crear convocatoria de presupuesto participativo
 */
export const createParticipatoryBudgetSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  year: z.number().int().min(2020).max(2100),
  totalBudget: z.number().positive('El presupuesto debe ser positivo'),
  proposalStartDate: z.string().datetime(),
  proposalEndDate: z.string().datetime(),
  evaluationStartDate: z.string().datetime(),
  evaluationEndDate: z.string().datetime(),
  votingStartDate: z.string().datetime(),
  votingEndDate: z.string().datetime(),
  allowMultipleVotes: z.boolean().default(false),
  maxVotesPerCitizen: z.number().int().min(1).default(1),
  requiresRegistration: z.boolean().default(true),
  rules: z.string().optional(),
  sectors: z.array(z.string()).optional()
});

/**
 * Schema para actualizar convocatoria
 */
export const updateParticipatoryBudgetSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  totalBudget: z.number().positive().optional(),
  proposalStartDate: z.string().datetime().optional(),
  proposalEndDate: z.string().datetime().optional(),
  evaluationStartDate: z.string().datetime().optional(),
  evaluationEndDate: z.string().datetime().optional(),
  votingStartDate: z.string().datetime().optional(),
  votingEndDate: z.string().datetime().optional(),
  allowMultipleVotes: z.boolean().optional(),
  maxVotesPerCitizen: z.number().int().min(1).optional(),
  requiresRegistration: z.boolean().optional(),
  rules: z.string().optional(),
  sectors: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'CLOSED']).optional()
});

/**
 * Schema para crear propuesta de proyecto
 */
export const createProposalSchema = z.object({
  budgetId: z.string().uuid('ID de convocatoria inválido'),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(50, 'La descripción debe tener al menos 50 caracteres'),
  objectives: z.string().min(20, 'Los objetivos deben tener al menos 20 caracteres'),
  beneficiaries: z.number().int().positive().optional(),
  location: z.string().min(5),
  sector: z.string().min(2),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  estimatedCost: z.number().positive('El costo estimado debe ser positivo'),
  proposerName: z.string().min(3),
  proposerEmail: z.string().email('Email inválido'),
  proposerPhone: z.string().min(7),
  organizationName: z.string().optional()
});

/**
 * Schema para evaluación técnica de propuesta
 */
export const evaluateProposalSchema = z.object({
  isFeasible: z.boolean(),
  technicalCost: z.number().positive().optional(),
  technicalNotes: z.string().min(10, 'Las observaciones deben tener al menos 10 caracteres'),
  status: z.enum(['APPROVED', 'REJECTED'])
});

/**
 * Schema para votar por propuesta
 */
export const voteProposalSchema = z.object({
  voterIdNumber: z.string().min(6, 'Cédula inválida'),
  voterName: z.string().optional(),
  voterEmail: z.string().email('Email inválido').optional()
});

// ============================================
// VALIDACIONES PARA PORTAL DE TRANSPARENCIA
// ============================================

/**
 * Schema para publicar documento de transparencia
 */
export const createTransparencyDocumentSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().optional(),
  category: z.enum([
    'BUDGET',
    'BUDGET_EXECUTION',
    'PAYROLL',
    'CONTRACTS',
    'ORDINANCES',
    'COUNCIL_MINUTES',
    'ASSETS',
    'ANNUAL_PLAN',
    'FINANCIAL_STATEMENTS',
    'DECLARATIONS',
    'PROJECTS',
    'REPORTS',
    'OTHER'
  ]),
  subcategory: z.string().optional(),
  fileUrl: z.string().url('URL de archivo inválida'),
  fileName: z.string().min(1),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * Schema para actualizar documento de transparencia
 */
export const updateTransparencyDocumentSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().optional(),
  category: z.enum([
    'BUDGET',
    'BUDGET_EXECUTION',
    'PAYROLL',
    'CONTRACTS',
    'ORDINANCES',
    'COUNCIL_MINUTES',
    'ASSETS',
    'ANNUAL_PLAN',
    'FINANCIAL_STATEMENTS',
    'DECLARATIONS',
    'PROJECTS',
    'REPORTS',
    'OTHER'
  ]).optional(),
  subcategory: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

/**
 * Schema para filtros de búsqueda de documentos
 */
export const searchDocumentsSchema = z.object({
  category: z.string().optional(),
  year: z.string().regex(/^\d+$/).transform(Number).optional(),
  month: z.string().regex(/^\d+$/).transform(Number).optional(),
  quarter: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10')
});
