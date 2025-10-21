/**
 * Rutas del módulo de Recursos Humanos
 */

import express from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';

// Controllers
import * as positionController from './controllers/position.controller.js';
import * as employeeController from './controllers/employee.controller.js';
import * as attendanceController from './controllers/attendance.controller.js';
import * as vacationController from './controllers/vacation.controller.js';
import * as leaveController from './controllers/leave.controller.js';
import * as payrollController from './controllers/payroll.controller.js';
import * as payrollConceptController from './controllers/payroll-concept.controller.js';
import * as documentController from './controllers/document.controller.js';
import * as evaluationController from './controllers/evaluation.controller.js';
import * as trainingController from './controllers/training.controller.js';
import * as severanceController from './controllers/severance.controller.js';
import * as attendanceStatsController from './controllers/attendance-stats.controller.js';

// Validations
import {
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
} from './validations.js';

const router = express.Router();

// ============================================
// RUTAS DE CARGOS/POSICIONES
// ============================================

/**
 * @route   GET /api/hr/positions
 * @desc    Listar todos los cargos
 * @access  Private
 */
router.get('/positions', authenticate, positionController.getAll);

/**
 * @route   GET /api/hr/positions/:id
 * @desc    Obtener un cargo por ID
 * @access  Private
 */
router.get('/positions/:id', authenticate, positionController.getById);

/**
 * @route   POST /api/hr/positions
 * @desc    Crear un nuevo cargo
 * @access  Private (Admin/Director)
 */
router.post(
  '/positions',
  authenticate,
  validate(createPositionSchema),
  positionController.create
);

/**
 * @route   PUT /api/hr/positions/:id
 * @desc    Actualizar un cargo
 * @access  Private (Admin/Director)
 */
router.put(
  '/positions/:id',
  authenticate,
  validate(updatePositionSchema),
  positionController.update
);

/**
 * @route   DELETE /api/hr/positions/:id
 * @desc    Eliminar un cargo
 * @access  Private (Admin)
 */
router.delete('/positions/:id', authenticate, positionController.delete);

// ============================================
// RUTAS DE EMPLEADOS
// ============================================

/**
 * @route   GET /api/hr/employees
 * @desc    Listar todos los empleados
 * @access  Private
 */
router.get('/employees', authenticate, employeeController.getAll);

/**
 * @route   GET /api/hr/employees/stats
 * @desc    Obtener estadísticas de empleados
 * @access  Private
 */
router.get('/employees/stats', authenticate, employeeController.getStats);

/**
 * @route   GET /api/hr/employees/:id
 * @desc    Obtener un empleado por ID
 * @access  Private
 */
router.get('/employees/:id', authenticate, employeeController.getById);

/**
 * @route   GET /api/hr/employees/:id/full
 * @desc    Obtener expediente completo de un empleado
 * @access  Private
 */
router.get('/employees/:id/full', authenticate, employeeController.getFullProfile);

/**
 * @route   POST /api/hr/employees
 * @desc    Crear un nuevo empleado
 * @access  Private (Admin/Director RRHH)
 */
router.post(
  '/employees',
  authenticate,
  validate(createEmployeeSchema),
  employeeController.create
);

/**
 * @route   PUT /api/hr/employees/:id
 * @desc    Actualizar un empleado
 * @access  Private (Admin/Director RRHH)
 */
router.put(
  '/employees/:id',
  authenticate,
  validate(updateEmployeeSchema),
  employeeController.update
);

/**
 * @route   PATCH /api/hr/employees/:id/status
 * @desc    Cambiar estado de un empleado
 * @access  Private (Admin/Director RRHH)
 */
router.patch('/employees/:id/status', authenticate, employeeController.updateStatus);

/**
 * @route   DELETE /api/hr/employees/:id
 * @desc    Eliminar un empleado (soft delete)
 * @access  Private (Admin)
 */
router.delete('/employees/:id', authenticate, employeeController.delete);

// ============================================
// RUTAS DE ASISTENCIA
// ============================================

/**
 * @route   GET /api/hr/attendance
 * @desc    Listar registros de asistencia
 * @access  Private
 */
router.get('/attendance', authenticate, attendanceController.getAll);

/**
 * @route   GET /api/hr/attendance/employee/:employeeId
 * @desc    Obtener asistencia de un empleado
 * @access  Private
 */
router.get('/attendance/employee/:employeeId', authenticate, attendanceController.getByEmployee);

/**
 * @route   POST /api/hr/attendance
 * @desc    Registrar asistencia
 * @access  Private
 */
router.post(
  '/attendance',
  authenticate,
  validate(createAttendanceSchema),
  attendanceController.create
);

/**
 * @route   POST /api/hr/attendance/:id/justify
 * @desc    Justificar una asistencia
 * @access  Private
 */
router.post(
  '/attendance/:id/justify',
  authenticate,
  validate(justifyAttendanceSchema),
  attendanceController.justify
);

/**
 * @route   GET /api/hr/attendance/report
 * @desc    Generar reporte de asistencia
 * @access  Private
 */
router.get('/attendance/report', authenticate, attendanceController.generateReport);

/**
 * @route   GET /api/hr/attendance/stats
 * @desc    Obtener estadísticas y registros de asistencia
 * @access  Private
 */
router.get('/attendance/stats', authenticate, attendanceStatsController.getAttendanceStats);

/**
 * @route   POST /api/hr/attendance/record
 * @desc    Registrar asistencia manual
 * @access  Private
 */
router.post('/attendance/record', authenticate, attendanceStatsController.recordAttendance);

// ============================================
// RUTAS DE VACACIONES
// ============================================

/**
 * @route   GET /api/hr/vacations
 * @desc    Listar solicitudes de vacaciones
 * @access  Private
 */
router.get('/vacations', authenticate, vacationController.getAll);

/**
 * @route   GET /api/hr/vacations/employee/:employeeId
 * @desc    Obtener vacaciones de un empleado
 * @access  Private
 */
router.get('/vacations/employee/:employeeId', authenticate, vacationController.getByEmployee);

/**
 * @route   GET /api/hr/vacations/employee/:employeeId/balance
 * @desc    Obtener saldo de vacaciones de un empleado
 * @access  Private
 */
router.get('/vacations/employee/:employeeId/balance', authenticate, vacationController.getBalance);

/**
 * @route   POST /api/hr/vacations
 * @desc    Crear solicitud de vacaciones
 * @access  Private
 */
router.post(
  '/vacations',
  authenticate,
  validate(createVacationRequestSchema),
  vacationController.create
);

/**
 * @route   PATCH /api/hr/vacations/:id/review
 * @desc    Revisar solicitud de vacaciones
 * @access  Private (Supervisor/Director)
 */
router.patch(
  '/vacations/:id/review',
  authenticate,
  validate(reviewVacationRequestSchema),
  vacationController.review
);

// ============================================
// RUTAS DE PERMISOS Y LICENCIAS
// ============================================

/**
 * @route   GET /api/hr/leaves
 * @desc    Listar permisos y licencias
 * @access  Private
 */
router.get('/leaves', authenticate, leaveController.getAll);

/**
 * @route   GET /api/hr/leaves/employee/:employeeId
 * @desc    Obtener permisos de un empleado
 * @access  Private
 */
router.get('/leaves/employee/:employeeId', authenticate, leaveController.getByEmployee);

/**
 * @route   POST /api/hr/leaves
 * @desc    Crear solicitud de permiso
 * @access  Private
 */
router.post(
  '/leaves',
  authenticate,
  validate(createLeaveSchema),
  leaveController.create
);

/**
 * @route   PATCH /api/hr/leaves/:id/review
 * @desc    Revisar solicitud de permiso
 * @access  Private (Supervisor/Director)
 */
router.patch(
  '/leaves/:id/review',
  authenticate,
  validate(reviewLeaveSchema),
  leaveController.review
);

// ============================================
// RUTAS DE NÓMINA
// ============================================

/**
 * @route   GET /api/hr/payrolls
 * @desc    Listar nóminas
 * @access  Private
 */
router.get('/payrolls', authenticate, payrollController.getAll);

/**
 * @route   GET /api/hr/payrolls/:id
 * @desc    Obtener una nómina por ID
 * @access  Private
 */
router.get('/payrolls/:id', authenticate, payrollController.getById);

/**
 * @route   POST /api/hr/payrolls
 * @desc    Crear una nueva nómina
 * @access  Private (Admin/Director RRHH)
 */
router.post(
  '/payrolls',
  authenticate,
  validate(createPayrollSchema),
  payrollController.create
);

/**
 * @route   POST /api/hr/payrolls/:id/calculate
 * @desc    Calcular nómina
 * @access  Private (Admin/Director RRHH)
 */
router.post('/payrolls/:id/calculate', authenticate, payrollController.calculate);

/**
 * @route   PATCH /api/hr/payrolls/:id/approve
 * @desc    Aprobar nómina
 * @access  Private (Admin/Director)
 */
router.patch('/payrolls/:id/approve', authenticate, payrollController.approve);

/**
 * @route   GET /api/hr/payrolls/:id/export
 * @desc    Exportar nómina (TXT bancario)
 * @access  Private (Admin/Director RRHH)
 */
router.get('/payrolls/:id/export', authenticate, payrollController.exportPayroll);

// ============================================
// RUTAS DE CONCEPTOS DE NÓMINA
// ============================================

/**
 * @route   GET /api/hr/payroll-concepts
 * @desc    Listar conceptos de nómina
 * @access  Private
 */
router.get('/payroll-concepts', authenticate, payrollConceptController.getAll);

/**
 * @route   POST /api/hr/payroll-concepts
 * @desc    Crear concepto de nómina
 * @access  Private (Admin/Director RRHH)
 */
router.post(
  '/payroll-concepts',
  authenticate,
  validate(createPayrollConceptSchema),
  payrollConceptController.create
);

/**
 * @route   PUT /api/hr/payroll-concepts/:id
 * @desc    Actualizar concepto de nómina
 * @access  Private (Admin/Director RRHH)
 */
router.put(
  '/payroll-concepts/:id',
  authenticate,
  validate(updatePayrollConceptSchema),
  payrollConceptController.update
);

/**
 * @route   DELETE /api/hr/payroll-concepts/:id
 * @desc    Eliminar concepto de nómina
 * @access  Private (Admin)
 */
router.delete('/payroll-concepts/:id', authenticate, payrollConceptController.delete);

// ============================================
// RUTAS DE DOCUMENTOS
// ============================================

/**
 * @route   GET /api/hr/documents/employee/:employeeId
 * @desc    Obtener documentos de un empleado
 * @access  Private
 */
router.get('/documents/employee/:employeeId', authenticate, documentController.getByEmployee);

/**
 * @route   POST /api/hr/documents
 * @desc    Subir documento de empleado
 * @access  Private
 */
router.post(
  '/documents',
  authenticate,
  validate(uploadEmployeeDocumentSchema),
  documentController.upload
);

/**
 * @route   DELETE /api/hr/documents/:id
 * @desc    Eliminar documento
 * @access  Private
 */
router.delete('/documents/:id', authenticate, documentController.delete);

// ============================================
// RUTAS DE EVALUACIONES DE DESEMPEÑO
// ============================================

/**
 * @route   GET /api/hr/evaluations
 * @desc    Listar evaluaciones
 * @access  Private
 */
router.get('/evaluations', authenticate, evaluationController.getAll);

/**
 * @route   GET /api/hr/evaluations/employee/:employeeId
 * @desc    Obtener evaluaciones de un empleado
 * @access  Private
 */
router.get('/evaluations/employee/:employeeId', authenticate, evaluationController.getByEmployee);

/**
 * @route   POST /api/hr/evaluations
 * @desc    Crear evaluación de desempeño
 * @access  Private (Supervisor/Director)
 */
router.post(
  '/evaluations',
  authenticate,
  validate(createPerformanceEvaluationSchema),
  evaluationController.create
);

/**
 * @route   PUT /api/hr/evaluations/:id
 * @desc    Actualizar evaluación
 * @access  Private (Supervisor/Director)
 */
router.put('/evaluations/:id', authenticate, evaluationController.update);

/**
 * @route   PATCH /api/hr/evaluations/:id/acknowledge
 * @desc    Empleado reconoce evaluación
 * @access  Private
 */
router.patch('/evaluations/:id/acknowledge', authenticate, evaluationController.acknowledge);

// ============================================
// RUTAS DE CAPACITACIONES
// ============================================

/**
 * @route   GET /api/hr/trainings
 * @desc    Listar capacitaciones
 * @access  Private
 */
router.get('/trainings', authenticate, trainingController.getAll);

/**
 * @route   GET /api/hr/trainings/:id
 * @desc    Obtener una capacitación por ID
 * @access  Private
 */
router.get('/trainings/:id', authenticate, trainingController.getById);

/**
 * @route   POST /api/hr/trainings
 * @desc    Crear capacitación
 * @access  Private (Admin/Director RRHH)
 */
router.post(
  '/trainings',
  authenticate,
  validate(createTrainingSchema),
  trainingController.create
);

/**
 * @route   POST /api/hr/trainings/:id/enroll
 * @desc    Inscribir empleado en capacitación
 * @access  Private
 */
router.post(
  '/trainings/:id/enroll',
  authenticate,
  validate(enrollTrainingSchema),
  trainingController.enroll
);

/**
 * @route   GET /api/hr/trainings/employee/:employeeId
 * @desc    Obtener capacitaciones de un empleado
 * @access  Private
 */
router.get('/trainings/employee/:employeeId', authenticate, trainingController.getByEmployee);

// ============================================
// RUTAS DE PRESTACIONES SOCIALES
// ============================================

/**
 * @route   GET /api/hr/severance/employee/:employeeId
 * @desc    Obtener prestaciones sociales de un empleado
 * @access  Private
 */
router.get('/severance/employee/:employeeId', authenticate, severanceController.getByEmployee);

/**
 * @route   POST /api/hr/severance/calculate
 * @desc    Calcular prestaciones sociales mensuales
 * @access  Private (Admin/Director RRHH)
 */
router.post('/severance/calculate', authenticate, severanceController.calculateMonthly);

/**
 * @route   POST /api/hr/severance/liquidate/:employeeId
 * @desc    Liquidar prestaciones sociales
 * @access  Private (Admin/Director RRHH)
 */
router.post('/severance/liquidate/:employeeId', authenticate, severanceController.liquidate);

export default router;

// ============================================
// RUTAS DEL PORTAL DEL EMPLEADO
// ============================================

import * as portalController from './controllers/portal.controller.js';

/**
 * @route   GET /api/hr/portal/my-data
 * @desc    Obtener datos del portal del empleado actual
 * @access  Private (Empleado)
 */
router.get('/portal/my-data', authenticate, portalController.getMyPortalData);

/**
 * @route   GET /api/hr/portal/payroll/:id/download
 * @desc    Descargar recibo de pago
 * @access  Private (Empleado)
 */
router.get('/portal/payroll/:id/download', authenticate, portalController.downloadPayrollReceipt);
