/**
 * Servicio de Workflow de Aprobaciones
 * Gestiona flujos de aprobación configurables
 */

import prisma from '../../../config/database.js';
import { NotFoundError, ValidationError } from '../../../shared/utils/errors.js';

/**
 * Crear definición de workflow
 */
async function createWorkflowDefinition(data, userId) {
  const workflow = await prisma.workflowDefinition.create({
    data: {
      name: data.name,
      description: data.description,
      documentType: data.documentType,
      steps: JSON.stringify(data.steps),
      alertDays: data.alertDays,
      createdBy: userId,
      isActive: true,
    },
  });
  
  if (workflow.steps) {
    workflow.steps = JSON.parse(workflow.steps);
  }
  
  return workflow;
}

/**
 * Obtener definición de workflow
 */
async function getWorkflowDefinitionById(id) {
  const workflow = await prisma.workflowDefinition.findUnique({
    where: { id },
  });
  
  if (!workflow) {
    throw new NotFoundError('Definición de workflow no encontrada');
  }
  
  if (workflow.steps) {
    workflow.steps = JSON.parse(workflow.steps);
  }
  
  return workflow;
}

/**
 * Listar definiciones de workflow
 */
async function listWorkflowDefinitions(filters = {}) {
  const { documentType, isActive } = filters;
  
  const where = {};
  if (documentType) where.documentType = documentType;
  if (isActive !== undefined) where.isActive = isActive;
  
  const workflows = await prisma.workflowDefinition.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return workflows.map(w => {
    if (w.steps) {
      w.steps = JSON.parse(w.steps);
    }
    return w;
  });
}

/**
 * Actualizar definición de workflow
 */
async function updateWorkflowDefinition(id, data) {
  await getWorkflowDefinitionById(id);
  
  const updateData = { ...data };
  if (data.steps) {
    updateData.steps = JSON.stringify(data.steps);
  }
  
  const updated = await prisma.workflowDefinition.update({
    where: { id },
    data: updateData,
  });
  
  if (updated.steps) {
    updated.steps = JSON.parse(updated.steps);
  }
  
  return updated;
}

/**
 * Iniciar instancia de workflow
 */
async function startWorkflowInstance(data, userId) {
  const definition = await getWorkflowDefinitionById(data.workflowDefId);
  
  // Crear instancia
  const instance = await prisma.workflowInstance.create({
    data: {
      workflowDefId: data.workflowDefId,
      documentId: data.documentId,
      title: data.title,
      description: data.description,
      initiatedBy: userId,
      status: 'IN_PROGRESS',
      currentStepIndex: 0,
    },
  });
  
  // Crear primer paso
  const firstStep = definition.steps[0];
  await prisma.workflowStep.create({
    data: {
      instanceId: instance.id,
      stepIndex: 0,
      stepName: firstStep.name,
      assignedTo: firstStep.assignedTo || userId,
      status: 'PENDING',
      dueDate: firstStep.dueDays 
        ? new Date(Date.now() + firstStep.dueDays * 24 * 60 * 60 * 1000)
        : null,
    },
  });
  
  return instance;
}

/**
 * Obtener instancia de workflow
 */
async function getWorkflowInstanceById(id) {
  const instance = await prisma.workflowInstance.findUnique({
    where: { id },
    include: {
      definition: true,
      document: {
        select: {
          id: true,
          documentNumber: true,
          title: true,
        },
      },
      steps: {
        orderBy: {
          stepIndex: 'asc',
        },
      },
    },
  });
  
  if (!instance) {
    throw new NotFoundError('Instancia de workflow no encontrada');
  }
  
  if (instance.definition.steps) {
    instance.definition.steps = JSON.parse(instance.definition.steps);
  }
  
  return instance;
}

/**
 * Listar instancias de workflow
 */
async function listWorkflowInstances(filters = {}) {
  const { status, initiatedBy, page = 1, limit = 20 } = filters;
  
  const where = {};
  if (status) where.status = status;
  if (initiatedBy) where.initiatedBy = initiatedBy;
  
  const skip = (page - 1) * limit;
  
  const [instances, total] = await Promise.all([
    prisma.workflowInstance.findMany({
      where,
      skip,
      take: limit,
      include: {
        definition: {
          select: {
            name: true,
            documentType: true,
          },
        },
        document: {
          select: {
            documentNumber: true,
            title: true,
          },
        },
        _count: {
          select: { steps: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.workflowInstance.count({ where }),
  ]);
  
  return {
    data: instances,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Procesar paso de workflow (aprobar/rechazar)
 */
async function processWorkflowStep(stepId, action, data, userId) {
  const step = await prisma.workflowStep.findUnique({
    where: { id: stepId },
    include: {
      instance: {
        include: {
          definition: true,
        },
      },
    },
  });
  
  if (!step) {
    throw new NotFoundError('Paso de workflow no encontrado');
  }
  
  if (step.assignedTo !== userId && !data.delegatedTo) {
    throw new ValidationError('No tiene permisos para procesar este paso');
  }
  
  // Actualizar paso actual
  await prisma.workflowStep.update({
    where: { id: stepId },
    data: {
      action,
      comments: data.comments,
      completedAt: new Date(),
      status: action === 'APPROVE' ? 'COMPLETED' : 'REJECTED',
    },
  });
  
  const definition = step.instance.definition;
  const steps = JSON.parse(definition.steps);
  
  if (action === 'APPROVE') {
    const nextStepIndex = step.stepIndex + 1;
    
    if (nextStepIndex < steps.length) {
      // Crear siguiente paso
      const nextStep = steps[nextStepIndex];
      await prisma.workflowStep.create({
        data: {
          instanceId: step.instanceId,
          stepIndex: nextStepIndex,
          stepName: nextStep.name,
          assignedTo: nextStep.assignedTo,
          status: 'PENDING',
          dueDate: nextStep.dueDays
            ? new Date(Date.now() + nextStep.dueDays * 24 * 60 * 60 * 1000)
            : null,
        },
      });
      
      // Actualizar índice actual
      await prisma.workflowInstance.update({
        where: { id: step.instanceId },
        data: {
          currentStepIndex: nextStepIndex,
        },
      });
    } else {
      // Workflow completado
      await prisma.workflowInstance.update({
        where: { id: step.instanceId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
      
      // Actualizar documento si existe
      if (step.instance.documentId) {
        await prisma.document.update({
          where: { id: step.instance.documentId },
          data: {
            status: 'APPROVED',
          },
        });
      }
    }
  } else if (action === 'REJECT') {
    // Rechazar workflow
    await prisma.workflowInstance.update({
      where: { id: step.instanceId },
      data: {
        status: 'REJECTED',
        completedAt: new Date(),
      },
    });
    
    // Actualizar documento si existe
    if (step.instance.documentId) {
      await prisma.document.update({
        where: { id: step.instance.documentId },
        data: {
          status: 'REJECTED',
        },
      });
    }
  }
  
  return step;
}

/**
 * Delegar paso de workflow
 */
async function delegateWorkflowStep(stepId, delegateToUserId, userId) {
  const step = await prisma.workflowStep.findUnique({
    where: { id: stepId },
  });
  
  if (!step) {
    throw new NotFoundError('Paso de workflow no encontrado');
  }
  
  if (step.assignedTo !== userId) {
    throw new ValidationError('No tiene permisos para delegar este paso');
  }
  
  const updated = await prisma.workflowStep.update({
    where: { id: stepId },
    data: {
      delegatedTo: delegateToUserId,
      delegatedAt: new Date(),
      assignedTo: delegateToUserId,
    },
  });
  
  return updated;
}

/**
 * Obtener pasos pendientes de un usuario
 */
async function getUserPendingSteps(userId) {
  const steps = await prisma.workflowStep.findMany({
    where: {
      assignedTo: userId,
      status: 'PENDING',
    },
    include: {
      instance: {
        include: {
          definition: {
            select: {
              name: true,
            },
          },
          document: {
            select: {
              documentNumber: true,
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  });
  
  return steps;
}

/**
 * Cancelar workflow
 */
async function cancelWorkflow(instanceId) {
  const instance = await getWorkflowInstanceById(instanceId);
  
  const updated = await prisma.workflowInstance.update({
    where: { id: instanceId },
    data: {
      status: 'CANCELLED',
      completedAt: new Date(),
    },
  });
  
  return updated;
}

export {
  createWorkflowDefinition,
  getWorkflowDefinitionById,
  listWorkflowDefinitions,
  updateWorkflowDefinition,
  startWorkflowInstance,
  getWorkflowInstanceById,
  listWorkflowInstances,
  processWorkflowStep,
  delegateWorkflowStep,
  getUserPendingSteps,
  cancelWorkflow,
};
