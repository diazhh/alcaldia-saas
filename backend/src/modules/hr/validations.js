/**
 * Validaciones para el módulo de Recursos Humanos
 * Usando Zod para validación de schemas
 */

import { z } from 'zod';

/**
 * Schema de validación para crear un cargo/posición
 */
const createPositionSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  level: z.string().min(1, 'El nivel es requerido'),
  category: z.string().min(1, 'La categoría es requerida'),
  baseSalary: z.number().positive('El salario base debe ser positivo'),
  salaryGrade: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
});

/**
 * Schema de validación para actualizar un cargo/posición
 */
const updatePositionSchema = createPositionSchema.partial();

/**
 * Schema de validación para crear un empleado
 */
const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  idNumber: z.string().min(1, 'La cédula es requerida'),
  rif: z.string().optional(),
  birthDate: z.string().datetime('Fecha de nacimiento inválida'),
  birthPlace: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'COMMON_LAW']),
  bloodType: z.string().optional(),
  phone: z.string().min(1, 'El teléfono es requerido'),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  personalEmail: z.string().email('Email personal inválido').optional(),
  address: z.string().optional(),
  photo: z.string().url('URL de foto inválida').optional(),
  positionId: z.string().uuid('ID de cargo inválido'),
  departmentId: z.string().uuid('ID de departamento inválido').optional(),
  hireDate: z.string().datetime('Fecha de ingreso inválida'),
  contractType: z.enum(['PERMANENT', 'TEMPORARY', 'INTERN', 'SEASONAL']),
  employmentType: z.enum(['EMPLOYEE', 'WORKER', 'HIGH_LEVEL', 'CONTRACT']),
  currentSalary: z.number().positive('El salario debe ser positivo'),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  supervisorId: z.string().uuid('ID de supervisor inválido').optional(),
  educationLevel: z.enum(['PRIMARY', 'SECONDARY', 'TECHNICAL', 'UNIVERSITY', 'POSTGRADUATE', 'MASTER', 'DOCTORATE']).optional(),
  degree: z.string().optional(),
  institution: z.string().optional(),
  graduationYear: z.number().int().min(1950).max(new Date().getFullYear()).optional(),
  userId: z.string().uuid('ID de usuario inválido').optional(),
});

/**
 * Schema de validación para actualizar un empleado
 */
const updateEmployeeSchema = createEmployeeSchema.partial();

/**
 * Schema de validación para registrar asistencia
 */
const createAttendanceSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
  date: z.string().datetime('Fecha inválida'),
  checkIn: z.string().datetime('Hora de entrada inválida').optional(),
  checkOut: z.string().datetime('Hora de salida inválida').optional(),
  type: z.enum(['REGULAR', 'OVERTIME', 'NIGHT_SHIFT', 'WEEKEND', 'HOLIDAY']).default('REGULAR'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'VACATION', 'LEAVE', 'SICK_LEAVE', 'JUSTIFIED']).default('PRESENT'),
  notes: z.string().optional(),
});

/**
 * Schema de validación para justificar asistencia
 */
const justifyAttendanceSchema = z.object({
  justification: z.string().min(1, 'La justificación es requerida'),
});

/**
 * Schema de validación para solicitud de vacaciones
 */
const createVacationRequestSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  requestedDays: z.number().int().positive('Los días solicitados deben ser positivos'),
  reason: z.string().optional(),
  contactPhone: z.string().optional(),
});

/**
 * Schema de validación para revisar solicitud de vacaciones
 */
const reviewVacationRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewComments: z.string().optional(),
});

/**
 * Schema de validación para crear permiso/licencia
 */
const createLeaveSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
  type: z.enum(['MEDICAL', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'STUDY', 'BEREAVEMENT', 'MARRIAGE', 'UNPAID', 'OTHER']),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  days: z.number().int().positive('Los días deben ser positivos'),
  reason: z.string().min(1, 'La razón es requerida'),
  isPaid: z.boolean().default(true),
  documentUrl: z.string().url('URL de documento inválida').optional(),
});

/**
 * Schema de validación para revisar permiso/licencia
 */
const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewComments: z.string().optional(),
});

/**
 * Schema de validación para crear nómina
 */
const createPayrollSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  period: z.enum(['BIWEEKLY', 'MONTHLY']),
  periodNumber: z.number().int().min(1).max(2),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  paymentDate: z.string().datetime('Fecha de pago inválida'),
  notes: z.string().optional(),
});

/**
 * Schema de validación para concepto de nómina
 */
const createPayrollConceptSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  type: z.enum(['ASSIGNMENT', 'DEDUCTION', 'EMPLOYER']),
  calculationType: z.enum(['FIXED', 'PERCENTAGE', 'FORMULA']),
  value: z.number().optional(),
  formula: z.string().optional(),
  isTaxable: z.boolean().default(true),
  affectsSSI: z.boolean().default(true),
  isEmployer: z.boolean().default(false),
  order: z.number().int().default(0),
});

/**
 * Schema de validación para actualizar concepto de nómina
 */
const updatePayrollConceptSchema = createPayrollConceptSchema.partial();

/**
 * Schema de validación para subir documento de empleado
 */
const uploadEmployeeDocumentSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
  type: z.enum(['ID_CARD', 'RIF', 'RESUME', 'DIPLOMA', 'CERTIFICATE', 'CONTRACT', 'MEDICAL_EXAM', 'BACKGROUND_CHECK', 'REFERENCE', 'OTHER']),
  name: z.string().min(1, 'El nombre del documento es requerido'),
  description: z.string().optional(),
  expiryDate: z.string().datetime('Fecha de vencimiento inválida').optional(),
});

/**
 * Schema de validación para crear evaluación de desempeño
 */
const createPerformanceEvaluationSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
  year: z.number().int().min(2020).max(2100),
  period: z.enum(['SEMESTER', 'ANNUAL']),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  evaluatorId: z.string().uuid('ID de evaluador inválido'),
  evaluatorName: z.string().min(1, 'El nombre del evaluador es requerido'),
  objectivesScore: z.number().min(1).max(5),
  competenciesScore: z.number().min(1).max(5),
  attitudeScore: z.number().min(1).max(5),
  disciplineScore: z.number().min(1).max(5),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  goals: z.string().optional(),
});

/**
 * Schema de validación para crear capacitación
 */
const createTrainingSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  institution: z.string().min(1, 'La institución es requerida'),
  instructor: z.string().optional(),
  type: z.enum(['INTERNAL', 'EXTERNAL', 'ONLINE', 'WORKSHOP', 'SEMINAR', 'CONFERENCE']),
  category: z.string().optional(),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  hours: z.number().int().positive('Las horas deben ser positivas'),
  location: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  cost: z.number().positive().optional(),
});

/**
 * Schema de validación para inscribir empleado en capacitación
 */
const enrollTrainingSchema = z.object({
  employeeId: z.string().uuid('ID de empleado inválido'),
});

export {
  createPositionSchema,
  updatePositionSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  createAttendanceSchema,
  justifyAttendanceSchema,
  createVacationRequestSchema,
  reviewVacationRequestSchema,
  createLeaveSchema,
  reviewLeaveSchema,
  createPayrollSchema,
  createPayrollConceptSchema,
  updatePayrollConceptSchema,
  uploadEmployeeDocumentSchema,
  createPerformanceEvaluationSchema,
  createTrainingSchema,
  enrollTrainingSchema,
};
