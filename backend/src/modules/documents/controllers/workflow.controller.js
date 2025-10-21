/**
 * Controlador de Workflows
 */

import * as workflowService from '../services/workflow.service.js';
import { successResponse } from '../../../shared/utils/response.js';

// Definiciones de Workflow
async function createDefinition(req, res, next) {
  try {
    const definition = await workflowService.createWorkflowDefinition(req.body, req.user.id);
    res.status(201).json(successResponse(definition, 'Workflow creado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getDefinitionById(req, res, next) {
  try {
    const definition = await workflowService.getWorkflowDefinitionById(req.params.id);
    res.json(successResponse(definition));
  } catch (error) {
    next(error);
  }
}

async function listDefinitions(req, res, next) {
  try {
    const filters = {
      documentType: req.query.documentType,
      isActive: req.query.isActive === 'true',
    };
    const definitions = await workflowService.listWorkflowDefinitions(filters);
    res.json(successResponse(definitions));
  } catch (error) {
    next(error);
  }
}

async function updateDefinition(req, res, next) {
  try {
    const definition = await workflowService.updateWorkflowDefinition(req.params.id, req.body);
    res.json(successResponse(definition, 'Workflow actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
}

// Instancias de Workflow
async function startInstance(req, res, next) {
  try {
    const instance = await workflowService.startWorkflowInstance(req.body, req.user.id);
    res.status(201).json(successResponse(instance, 'Workflow iniciado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getInstanceById(req, res, next) {
  try {
    const instance = await workflowService.getWorkflowInstanceById(req.params.id);
    res.json(successResponse(instance));
  } catch (error) {
    next(error);
  }
}

async function listInstances(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      initiatedBy: req.query.initiatedBy,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await workflowService.listWorkflowInstances(filters);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

async function processStep(req, res, next) {
  try {
    const { action, ...data } = req.body;
    const step = await workflowService.processWorkflowStep(
      req.params.stepId,
      action,
      data,
      req.user.id
    );
    res.json(successResponse(step, 'Paso procesado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function delegateStep(req, res, next) {
  try {
    const { delegateToUserId } = req.body;
    const step = await workflowService.delegateWorkflowStep(
      req.params.stepId,
      delegateToUserId,
      req.user.id
    );
    res.json(successResponse(step, 'Paso delegado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getPendingSteps(req, res, next) {
  try {
    const steps = await workflowService.getUserPendingSteps(req.user.id);
    res.json(successResponse(steps));
  } catch (error) {
    next(error);
  }
}

async function cancelInstance(req, res, next) {
  try {
    const instance = await workflowService.cancelWorkflow(req.params.id);
    res.json(successResponse(instance, 'Workflow cancelado exitosamente'));
  } catch (error) {
    next(error);
  }
}

export {
  createDefinition,
  getDefinitionById,
  listDefinitions,
  updateDefinition,
  startInstance,
  getInstanceById,
  listInstances,
  processStep,
  delegateStep,
  getPendingSteps,
  cancelInstance,
};
