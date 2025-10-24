import express from 'express';
import * as projectController from './controllers/projectController.js';
import * as milestoneController from './controllers/milestoneController.js';
import * as expenseController from './controllers/expenseController.js';
import * as photoController from './controllers/photoController.js';
import * as contractorController from './controllers/contractorController.js';
import * as contractController from './controllers/contractController.js';
import * as documentController from './controllers/documentController.js';
import * as progressReportController from './controllers/progressReportController.js';
import * as inspectionController from './controllers/inspectionController.js';
import * as changeOrderController from './controllers/changeOrderController.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize, requireAnyPermission } from '../../shared/middlewares/authorize.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createPhotoSchema,
} from './validations.js';
import { uploadProjectPhoto } from './config/multer.js';

const router = express.Router();

// ============================================
// RUTAS DE PROYECTOS
// ============================================

/**
 * @route   GET /api/projects/stats/general
 * @desc    Obtener estadísticas generales de proyectos
 * @access  Private (requires projects:read permission)
 */
router.get(
  '/stats/general',
  authenticate,
  authorize('projects', 'read'),
  projectController.getProjectStats
);

// ============================================
// RUTAS DE CONTRATISTAS (ANTES DE :id)
// ============================================

// Rutas específicas primero (antes de :id)
router.get('/contractors/stats', authenticate, authorize('projects', 'read'), contractorController.getContractorStats);
router.get('/contractors/rif/:rif', authenticate, authorize('projects', 'read'), contractorController.getContractorByRif);

// Rutas generales
router.get('/contractors', authenticate, contractorController.getContractors);
router.post('/contractors', authenticate, authorize('projects', 'create'), contractorController.createContractor);

// Rutas con :id al final
router.get('/contractors/:id', authenticate, contractorController.getContractorById);
router.put('/contractors/:id', authenticate, authorize('projects', 'update'), contractorController.updateContractor);
router.delete('/contractors/:id', authenticate, authorize('projects', 'delete'), contractorController.deleteContractor);
router.post('/contractors/:id/blacklist', authenticate, authorize('projects', 'manage'), contractorController.blacklistContractor);
router.post('/contractors/:id/remove-blacklist', authenticate, authorize('projects', 'manage'), contractorController.removeFromBlacklist);
router.post('/contractors/:id/update-rating', authenticate, authorize('projects', 'update'), contractorController.updateContractorRating);

// ============================================
// RUTAS DE CONTRATOS (ANTES DE :id)
// ============================================

// Rutas específicas primero
router.get('/contracts/stats', authenticate, authorize('projects', 'read'), contractController.getContractStats);
router.get('/contracts', authenticate, contractController.getContracts);
router.post('/contracts/:id/adjudicate', authenticate, authorize('projects', 'approve'), contractController.adjudicateContract);
router.post('/contracts/:id/payment', authenticate, authorize('projects', 'manage'), contractController.registerPayment);

// Rutas con :id al final
router.get('/contracts/:id', authenticate, contractController.getContractById);
router.put('/contracts/:id', authenticate, authorize('projects', 'update'), contractController.updateContract);
router.delete('/contracts/:id', authenticate, authorize('projects', 'delete'), contractController.deleteContract);

// ============================================
// RUTAS DE INSPECCIONES (ANTES DE :id)
// ============================================

// Rutas específicas primero
router.get('/inspections/stats', authenticate, authorize('projects', 'read'), inspectionController.getInspectionStats);
router.get('/inspections', authenticate, inspectionController.getInspections);
router.post('/inspections/:id/complete', authenticate, authorize('projects', 'approve'), inspectionController.completeInspection);

// Rutas con :id al final
router.get('/inspections/:id', authenticate, inspectionController.getInspectionById);
router.put('/inspections/:id', authenticate, authorize('projects', 'update'), inspectionController.updateInspection);
router.delete('/inspections/:id', authenticate, authorize('projects', 'delete'), inspectionController.deleteInspection);

// ============================================
// RUTAS DE ÓRDENES DE CAMBIO (ANTES DE :id)
// ============================================

// Rutas específicas primero
router.get('/change-orders/stats', authenticate, authorize('projects', 'read'), changeOrderController.getChangeOrderStats);
router.get('/change-orders', authenticate, changeOrderController.getChangeOrders);
router.post('/change-orders/:id/review', authenticate, authorize('projects', 'approve'), changeOrderController.reviewChangeOrder);
router.post('/change-orders/:id/approve', authenticate, authorize('projects', 'approve'), changeOrderController.approveChangeOrder);
router.post('/change-orders/:id/reject', authenticate, authorize('projects', 'reject'), changeOrderController.rejectChangeOrder);
router.post('/change-orders/:id/implement', authenticate, authorize('projects', 'manage'), changeOrderController.implementChangeOrder);

// Rutas con :id al final
router.get('/change-orders/:id', authenticate, changeOrderController.getChangeOrderById);
router.put('/change-orders/:id', authenticate, authorize('projects', 'update'), changeOrderController.updateChangeOrder);
router.delete('/change-orders/:id', authenticate, authorize('projects', 'delete'), changeOrderController.deleteChangeOrder);

/**
 * @route   GET /api/projects
 * @desc    Obtener todos los proyectos con filtros
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  projectController.getProjects
);

/**
 * @route   GET /api/projects/:id
 * @desc    Obtener un proyecto por ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  projectController.getProjectById
);

/**
 * @route   POST /api/projects
 * @desc    Crear un nuevo proyecto
 * @access  Private (projects:create)
 */
router.post(
  '/',
  authenticate,
  authorize('projects', 'create'),
  validate(createProjectSchema),
  projectController.createProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Actualizar un proyecto
 * @access  Private (projects:update)
 */
router.put(
  '/:id',
  authenticate,
  authorize('projects', 'update'),
  validate(updateProjectSchema),
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Eliminar un proyecto
 * @access  Private (projects:delete)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('projects', 'delete'),
  projectController.deleteProject
);

// ============================================
// RUTAS DE HITOS (MILESTONES)
// ============================================

/**
 * @route   GET /api/projects/:projectId/milestones
 * @desc    Obtener todos los hitos de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId/milestones',
  authenticate,
  milestoneController.getMilestonesByProject
);

/**
 * @route   POST /api/projects/:projectId/milestones
 * @desc    Crear un nuevo hito para un proyecto
 * @access  Private (projects:create)
 */
router.post(
  '/:projectId/milestones',
  authenticate,
  authorize('projects', 'create'),
  validate(createMilestoneSchema),
  milestoneController.createMilestone
);

/**
 * @route   GET /api/milestones/:id
 * @desc    Obtener un hito por ID
 * @access  Private
 */
router.get(
  '/milestones/:id',
  authenticate,
  milestoneController.getMilestoneById
);

/**
 * @route   PUT /api/milestones/:id
 * @desc    Actualizar un hito
 * @access  Private (projects:update)
 */
router.put(
  '/milestones/:id',
  authenticate,
  authorize('projects', 'update'),
  validate(updateMilestoneSchema),
  milestoneController.updateMilestone
);

/**
 * @route   DELETE /api/milestones/:id
 * @desc    Eliminar un hito
 * @access  Private (projects:delete)
 */
router.delete(
  '/milestones/:id',
  authenticate,
  authorize('projects', 'delete'),
  milestoneController.deleteMilestone
);

/**
 * @route   POST /api/milestones/:id/complete
 * @desc    Marcar un hito como completado
 * @access  Private (projects:approve)
 */
router.post(
  '/milestones/:id/complete',
  authenticate,
  authorize('projects', 'approve'),
  milestoneController.completeMilestone
);

/**
 * @route   PATCH /api/milestones/:id/progress
 * @desc    Actualizar el progreso de un hito
 * @access  Private (projects:update)
 */
router.patch(
  '/milestones/:id/progress',
  authenticate,
  authorize('projects', 'update'),
  milestoneController.updateMilestoneProgress
);

// ============================================
// RUTAS DE GASTOS (EXPENSES)
// ============================================

/**
 * @route   GET /api/projects/:projectId/expenses
 * @desc    Obtener todos los gastos de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId/expenses',
  authenticate,
  expenseController.getExpensesByProject
);

/**
 * @route   GET /api/projects/:projectId/expenses/stats
 * @desc    Obtener estadísticas de gastos de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId/expenses/stats',
  authenticate,
  expenseController.getExpenseStats
);

/**
 * @route   POST /api/projects/:projectId/expenses
 * @desc    Crear un nuevo gasto para un proyecto
 * @access  Private (expenses:create)
 */
router.post(
  '/:projectId/expenses',
  authenticate,
  authorize('expenses', 'create'),
  validate(createExpenseSchema),
  expenseController.createExpense
);

/**
 * @route   GET /api/expenses/:id
 * @desc    Obtener un gasto por ID
 * @access  Private
 */
router.get(
  '/expenses/:id',
  authenticate,
  expenseController.getExpenseById
);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Actualizar un gasto
 * @access  Private (expenses:update)
 */
router.put(
  '/expenses/:id',
  authenticate,
  authorize('expenses', 'update'),
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Eliminar un gasto
 * @access  Private (expenses:delete)
 */
router.delete(
  '/expenses/:id',
  authenticate,
  authorize('expenses', 'delete'),
  expenseController.deleteExpense
);

// ============================================
// RUTAS DE FOTOS
// ============================================

/**
 * @route   GET /api/projects/:projectId/photos
 * @desc    Obtener todas las fotos de un proyecto
 * @access  Private
 */
router.get(
  '/:projectId/photos',
  authenticate,
  photoController.getPhotosByProject
);

/**
 * @route   GET /api/projects/:projectId/photos/count
 * @desc    Obtener conteo de fotos por tipo
 * @access  Private
 */
router.get(
  '/:projectId/photos/count',
  authenticate,
  photoController.getPhotoCountByType
);

/**
 * @route   POST /api/projects/:projectId/photos
 * @desc    Subir una nueva foto para un proyecto
 * @access  Private (projects:update)
 */
router.post(
  '/:projectId/photos',
  authenticate,
  authorize('projects', 'update'),
  uploadProjectPhoto.single('photo'),
  photoController.createPhoto
);

/**
 * @route   GET /api/photos/:id
 * @desc    Obtener una foto por ID
 * @access  Private
 */
router.get(
  '/photos/:id',
  authenticate,
  photoController.getPhotoById
);

/**
 * @route   PUT /api/photos/:id
 * @desc    Actualizar los datos de una foto
 * @access  Private (projects:update)
 */
router.put(
  '/photos/:id',
  authenticate,
  authorize('projects', 'update'),
  photoController.updatePhoto
);

/**
 * @route   DELETE /api/photos/:id
 * @desc    Eliminar una foto
 * @access  Private (projects:delete)
 */
router.delete(
  '/photos/:id',
  authenticate,
  authorize('projects', 'delete'),
  photoController.deletePhoto
);

// Rutas de proyecto para contratos
router.get('/:projectId/contracts', authenticate, contractController.getContractsByProject);
router.post('/:projectId/contracts', authenticate, authorize('projects', 'create'), contractController.createContract);

// ============================================
// RUTAS DE DOCUMENTOS TÉCNICOS
// ============================================

router.get('/:projectId/documents', authenticate, documentController.getDocumentsByProject);
router.get('/:projectId/documents/count', authenticate, documentController.getDocumentCountByType);
router.post('/:projectId/documents', authenticate, authorize('documents', 'create'), documentController.createDocument);
router.get('/documents/:id', authenticate, documentController.getDocumentById);
router.put('/documents/:id', authenticate, authorize('documents', 'update'), documentController.updateDocument);
router.delete('/documents/:id', authenticate, authorize('documents', 'delete'), documentController.deleteDocument);

// ============================================
// RUTAS DE REPORTES DE AVANCE
// ============================================

router.get('/:projectId/progress-reports', authenticate, progressReportController.getReportsByProject);
router.get('/:projectId/progress-reports/latest', authenticate, progressReportController.getLatestReport);
router.get('/:projectId/progress-reports/stats', authenticate, progressReportController.getReportStats);
router.post('/:projectId/progress-reports', authenticate, authorize('projects', 'update'), progressReportController.createProgressReport);
router.get('/progress-reports/:id', authenticate, progressReportController.getReportById);
router.put('/progress-reports/:id', authenticate, authorize('projects', 'update'), progressReportController.updateProgressReport);
router.delete('/progress-reports/:id', authenticate, authorize('projects', 'delete'), progressReportController.deleteProgressReport);

// Rutas de proyecto para inspecciones
router.get('/:projectId/inspections', authenticate, inspectionController.getInspectionsByProject);
router.post('/:projectId/inspections', authenticate, authorize('projects', 'update'), inspectionController.createInspection);

// Rutas de proyecto para órdenes de cambio
router.get('/:projectId/change-orders', authenticate, changeOrderController.getChangeOrdersByProject);
router.post('/:projectId/change-orders', authenticate, authorize('projects', 'update'), changeOrderController.createChangeOrder);

export default router;
