import express from 'express';
import * as projectController from './controllers/projectController.js';
import * as milestoneController from './controllers/milestoneController.js';
import * as expenseController from './controllers/expenseController.js';
import * as photoController from './controllers/photoController.js';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/auth.middleware.js';
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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.get(
  '/stats/general',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  projectController.getProjectStats
);

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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(createProjectSchema),
  projectController.createProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Actualizar un proyecto
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(updateProjectSchema),
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Eliminar un proyecto
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/:projectId/milestones',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/milestones/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(updateMilestoneSchema),
  milestoneController.updateMilestone
);

/**
 * @route   DELETE /api/milestones/:id
 * @desc    Eliminar un hito
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/milestones/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  milestoneController.deleteMilestone
);

/**
 * @route   POST /api/milestones/:id/complete
 * @desc    Marcar un hito como completado
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/milestones/:id/complete',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  milestoneController.completeMilestone
);

/**
 * @route   PATCH /api/milestones/:id/progress
 * @desc    Actualizar el progreso de un hito
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.patch(
  '/milestones/:id/progress',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.post(
  '/:projectId/expenses',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/expenses/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(updateExpenseSchema),
  expenseController.updateExpense
);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Eliminar un gasto
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/expenses/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR, EMPLEADO)
 */
router.post(
  '/:projectId/photos',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
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
 * @access  Private (ADMIN, DIRECTOR, COORDINADOR)
 */
router.put(
  '/photos/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  photoController.updatePhoto
);

/**
 * @route   DELETE /api/photos/:id
 * @desc    Eliminar una foto
 * @access  Private (ADMIN, DIRECTOR)
 */
router.delete(
  '/photos/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  photoController.deletePhoto
);

export default router;
