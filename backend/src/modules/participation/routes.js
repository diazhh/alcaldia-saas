/**
 * Rutas del módulo de Participación Ciudadana
 */

import express from 'express';
import { authenticate, authorize } from '../../shared/middlewares/auth.middleware.js';
import { validate } from '../../shared/middlewares/validation.middleware.js';

// Controladores
import * as reportsController from './controllers/reports.controller.js';
import * as budgetController from './controllers/participatory-budget.controller.js';
import * as transparencyController from './controllers/transparency.controller.js';

// Validaciones
import * as validations from './validations.js';

const router = express.Router();

// ============================================
// REPORTES CIUDADANOS (311)
// ============================================

// Rutas públicas (sin autenticación)
router.post(
  '/reports',
  validate(validations.createReportSchema),
  reportsController.createReport
);

router.get(
  '/reports/ticket/:ticketNumber',
  reportsController.getReportByTicket
);

router.get(
  '/reports/heatmap',
  reportsController.getHeatmapData
);

router.post(
  '/reports/:id/rate',
  validate(validations.rateReportSchema),
  reportsController.rateReport
);

// Rutas protegidas (requieren autenticación)
router.get(
  '/reports/stats',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  reportsController.getReportsStats
);

router.get(
  '/reports/:id',
  authenticate,
  reportsController.getReport
);

router.get(
  '/reports',
  authenticate,
  reportsController.listReports
);

router.patch(
  '/reports/:id/status',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO'),
  validate(validations.updateReportStatusSchema),
  reportsController.updateReportStatus
);

router.patch(
  '/reports/:id/assign',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(validations.assignReportSchema),
  reportsController.assignReport
);

router.post(
  '/reports/:id/comments',
  authenticate,
  validate(validations.addCommentSchema),
  reportsController.addComment
);

router.delete(
  '/reports/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  reportsController.deleteReport
);

// ============================================
// PRESUPUESTO PARTICIPATIVO
// ============================================

// Convocatorias - Rutas protegidas
router.post(
  '/participatory-budgets',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(validations.createParticipatoryBudgetSchema),
  budgetController.createParticipatoryBudget
);

router.get(
  '/participatory-budgets/:id',
  budgetController.getParticipatoryBudget
);

router.get(
  '/participatory-budgets',
  budgetController.listParticipatoryBudgets
);

router.put(
  '/participatory-budgets/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(validations.updateParticipatoryBudgetSchema),
  budgetController.updateParticipatoryBudget
);

router.delete(
  '/participatory-budgets/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  budgetController.deleteParticipatoryBudget
);

router.get(
  '/participatory-budgets/:id/stats',
  budgetController.getBudgetStats
);

router.post(
  '/participatory-budgets/:id/calculate-winners',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  budgetController.calculateWinners
);

// Propuestas - Rutas públicas para crear y ver
router.post(
  '/participatory-budgets/:budgetId/proposals',
  validate(validations.createProposalSchema),
  budgetController.createProposal
);

router.get(
  '/proposals/:id',
  budgetController.getProposal
);

router.get(
  '/participatory-budgets/:budgetId/proposals',
  budgetController.listProposals
);

// Evaluación técnica - Requiere autenticación
router.post(
  '/proposals/:id/evaluate',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR'),
  validate(validations.evaluateProposalSchema),
  budgetController.evaluateProposal
);

// Votación - Público
router.post(
  '/proposals/:id/vote',
  validate(validations.voteProposalSchema),
  budgetController.voteProposal
);

// ============================================
// PORTAL DE TRANSPARENCIA
// ============================================

// Rutas públicas (consulta)
router.get(
  '/transparency/documents',
  transparencyController.listDocuments
);

router.get(
  '/transparency/documents/:id',
  transparencyController.getDocument
);

router.post(
  '/transparency/documents/:id/download',
  transparencyController.registerDownload
);

router.get(
  '/transparency/categories/:category/documents',
  transparencyController.getDocumentsByCategory
);

router.get(
  '/transparency/documents/most-downloaded',
  transparencyController.getMostDownloaded
);

router.get(
  '/transparency/documents/most-viewed',
  transparencyController.getMostViewed
);

router.get(
  '/transparency/stats',
  transparencyController.getTransparencyStats
);

router.get(
  '/transparency/search',
  transparencyController.searchDocuments
);

router.get(
  '/transparency/years',
  transparencyController.getAvailableYears
);

router.get(
  '/transparency/categories',
  transparencyController.getCategoriesWithCount
);

// Rutas protegidas (administración)
router.post(
  '/transparency/documents',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(validations.createTransparencyDocumentSchema),
  transparencyController.publishDocument
);

router.put(
  '/transparency/documents/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'DIRECTOR'),
  validate(validations.updateTransparencyDocumentSchema),
  transparencyController.updateDocument
);

router.delete(
  '/transparency/documents/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  transparencyController.deleteDocument
);

export default router;
