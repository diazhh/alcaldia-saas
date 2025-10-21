/**
 * Rutas del módulo de Gestión Documental
 */

import express from 'express';
const router = express.Router();

import { authenticate, authorize } from '../../shared/middlewares/auth.middleware.js';
import * as correspondenceController from './controllers/correspondence.controller.js';
import * as internalMemoController from './controllers/internalMemo.controller.js';
import * as ordinanceController from './controllers/ordinance.controller.js';
import * as councilActController from './controllers/councilAct.controller.js';
import * as digitalFileController from './controllers/digitalFile.controller.js';
import * as documentController from './controllers/document.controller.js';
import * as signatureController from './controllers/signature.controller.js';
import * as workflowController from './controllers/workflow.controller.js';

// ============================================
// RUTAS DE CORRESPONDENCIA
// ============================================

// Estadísticas (debe ir antes de las rutas con parámetros)
router.get(
  '/correspondence/stats',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']),
  correspondenceController.getStats
);

// Rastreo público (sin autenticación para ciudadanos)
router.get(
  '/correspondence/track/:identifier',
  correspondenceController.track
);

// CRUD de correspondencia
router.post(
  '/correspondence/incoming',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']),
  correspondenceController.createIncoming
);

router.post(
  '/correspondence/outgoing',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']),
  correspondenceController.createOutgoing
);

router.get(
  '/correspondence',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']),
  correspondenceController.list
);

router.get(
  '/correspondence/reference/:reference',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']),
  correspondenceController.getByReference
);

router.get(
  '/correspondence/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']),
  correspondenceController.getById
);

router.put(
  '/correspondence/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']),
  correspondenceController.update
);

router.post(
  '/correspondence/:id/deliver',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']),
  correspondenceController.markAsDelivered
);

router.post(
  '/correspondence/:id/dispatch',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']),
  correspondenceController.markAsDispatched
);

router.post(
  '/correspondence/:id/archive',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  correspondenceController.archive
);

router.delete(
  '/correspondence/:id',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN']),
  correspondenceController.remove
);

// ============================================
// RUTAS DE MEMOS INTERNOS
// ============================================

router.get('/memos/stats', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), internalMemoController.getStats);
router.post('/memos', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR']), internalMemoController.create);
router.get('/memos', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']), internalMemoController.list);
router.get('/memos/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']), internalMemoController.getById);
router.put('/memos/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR']), internalMemoController.update);
router.post('/memos/:id/approve', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), internalMemoController.approve);
router.post('/memos/:id/distribute', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']), internalMemoController.distribute);
router.post('/memos/:id/archive', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), internalMemoController.archive);
router.delete('/memos/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), internalMemoController.remove);

// ============================================
// RUTAS DE ORDENANZAS
// ============================================

router.get('/ordinances/active', ordinanceController.getActive); // Público
router.post('/ordinances', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), ordinanceController.create);
router.get('/ordinances', ordinanceController.search); // Público
router.get('/ordinances/:id', ordinanceController.getById); // Público
router.put('/ordinances/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), ordinanceController.update);
router.delete('/ordinances/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), ordinanceController.remove);

// ============================================
// RUTAS DE ACTAS DEL CONCEJO
// ============================================

router.post('/council-acts', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), councilActController.create);
router.get('/council-acts', councilActController.list); // Público
router.get('/council-acts/:id', councilActController.getById); // Público
router.put('/council-acts/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), councilActController.update);
router.post('/council-acts/:id/approve', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), councilActController.approve);
router.post('/council-acts/:id/publish', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), councilActController.publish);
router.delete('/council-acts/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), councilActController.remove);

// ============================================
// RUTAS DE EXPEDIENTES DIGITALES
// ============================================

router.get('/files/stats', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), digitalFileController.getStats);
router.post('/files', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']), digitalFileController.create);
router.get('/files', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']), digitalFileController.list);
router.get('/files/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO']), digitalFileController.getById);
router.put('/files/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']), digitalFileController.update);
router.post('/files/:id/movements', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']), digitalFileController.addMovement);
router.post('/files/:id/close', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), digitalFileController.close);
router.post('/files/:id/archive', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), digitalFileController.archive);
router.delete('/files/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), digitalFileController.remove);

// ============================================
// RUTAS DE DOCUMENTOS Y BÚSQUEDA
// ============================================

router.get('/documents/stats', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), documentController.getStats);
router.get('/documents/search', authenticate, documentController.search);
router.post('/documents', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']), documentController.create);
router.get('/documents/:id', authenticate, documentController.getById);
router.put('/documents/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']), documentController.update);
router.post('/documents/:id/versions', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO']), documentController.createVersion);
router.get('/documents/:id/versions', authenticate, documentController.getVersions);
router.get('/documents/:id/versions/compare', authenticate, documentController.compareVersions);
router.post('/documents/:id/versions/restore', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), documentController.restoreVersion);
router.post('/documents/:id/archive', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), documentController.archive);
router.delete('/documents/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), documentController.remove);

// ============================================
// RUTAS DE FIRMAS ELECTRÓNICAS
// ============================================

router.get('/signatures/pending', authenticate, signatureController.getPending);
router.post('/signatures', authenticate, signatureController.create);
router.post('/signatures/request', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), signatureController.requestSignatures);
router.get('/signatures/:id', authenticate, signatureController.getById);
router.get('/signatures/:id/verify', signatureController.verify); // Público
router.get('/documents/:documentId/signatures', authenticate, signatureController.getDocumentSignatures);
router.post('/signatures/:id/reject', authenticate, signatureController.reject);
router.delete('/signatures/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), signatureController.remove);

// ============================================
// RUTAS DE WORKFLOWS
// ============================================

// Definiciones de Workflow
router.post('/workflows/definitions', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), workflowController.createDefinition);
router.get('/workflows/definitions', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), workflowController.listDefinitions);
router.get('/workflows/definitions/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'DIRECTOR']), workflowController.getDefinitionById);
router.put('/workflows/definitions/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), workflowController.updateDefinition);

// Instancias de Workflow
router.get('/workflows/steps/pending', authenticate, workflowController.getPendingSteps);
router.post('/workflows/instances', authenticate, workflowController.startInstance);
router.get('/workflows/instances', authenticate, workflowController.listInstances);
router.get('/workflows/instances/:id', authenticate, workflowController.getInstanceById);
router.post('/workflows/instances/:id/cancel', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), workflowController.cancelInstance);
router.post('/workflows/steps/:stepId/process', authenticate, workflowController.processStep);
router.post('/workflows/steps/:stepId/delegate', authenticate, workflowController.delegateStep);

export default router;
