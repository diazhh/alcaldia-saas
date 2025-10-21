/**
 * Servicio para gestión de Presupuesto Participativo
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Genera número único para propuesta
 * @param {number} year - Año de la convocatoria
 * @returns {Promise<string>} Número de propuesta (PP-2025-001)
 */
async function generateProposalNumber(year) {
  const prefix = `PP-${year}-`;
  
  const lastProposal = await prisma.budgetProposal.findFirst({
    where: {
      proposalNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastProposal) {
    const lastNumber = parseInt(lastProposal.proposalNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// ============================================
// GESTIÓN DE CONVOCATORIAS
// ============================================

/**
 * Crea una nueva convocatoria de presupuesto participativo
 * @param {Object} data - Datos de la convocatoria
 * @param {string} userId - ID del usuario creador
 * @returns {Promise<Object>} Convocatoria creada
 */
export async function createParticipatoryBudget(data, userId) {
  // Validar que no exista convocatoria activa para el mismo año
  const existingBudget = await prisma.participatoryBudget.findFirst({
    where: {
      year: data.year,
      status: {
        in: ['ACTIVE', 'APPROVED']
      }
    }
  });
  
  if (existingBudget) {
    throw new AppError(`Ya existe una convocatoria activa para el año ${data.year}`, 400);
  }
  
  // Convertir arrays a JSON si es necesario
  const budgetData = {
    ...data,
    sectors: data.sectors ? JSON.stringify(data.sectors) : null,
    proposalStartDate: new Date(data.proposalStartDate),
    proposalEndDate: new Date(data.proposalEndDate),
    evaluationStartDate: new Date(data.evaluationStartDate),
    evaluationEndDate: new Date(data.evaluationEndDate),
    votingStartDate: new Date(data.votingStartDate),
    votingEndDate: new Date(data.votingEndDate)
  };
  
  const budget = await prisma.participatoryBudget.create({
    data: budgetData
  });
  
  return budget;
}

/**
 * Obtiene una convocatoria por ID
 * @param {string} id - ID de la convocatoria
 * @returns {Promise<Object>} Convocatoria encontrada
 */
export async function getParticipatoryBudgetById(id) {
  const budget = await prisma.participatoryBudget.findUnique({
    where: { id },
    include: {
      proposals: {
        include: {
          votes: true
        }
      }
    }
  });
  
  if (!budget) {
    throw new AppError('Convocatoria no encontrada', 404);
  }
  
  // Parsear JSON
  if (budget.sectors) {
    budget.sectors = JSON.parse(budget.sectors);
  }
  
  return budget;
}

/**
 * Lista convocatorias con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de convocatorias
 */
export async function listParticipatoryBudgets(filters = {}) {
  const { year, status, page = 1, limit = 10 } = filters;
  
  const where = {};
  if (year) where.year = parseInt(year);
  if (status) where.status = status;
  
  const skip = (page - 1) * limit;
  
  const [budgets, total] = await Promise.all([
    prisma.participatoryBudget.findMany({
      where,
      skip,
      take: limit,
      orderBy: { year: 'desc' },
      include: {
        _count: {
          select: { proposals: true }
        }
      }
    }),
    prisma.participatoryBudget.count({ where })
  ]);
  
  // Parsear JSON en cada item
  budgets.forEach(budget => {
    if (budget.sectors) {
      budget.sectors = JSON.parse(budget.sectors);
    }
  });
  
  return {
    data: budgets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Actualiza una convocatoria
 * @param {string} id - ID de la convocatoria
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Convocatoria actualizada
 */
export async function updateParticipatoryBudget(id, data) {
  await getParticipatoryBudgetById(id);
  
  const updateData = { ...data };
  
  // Convertir fechas si vienen como string
  ['proposalStartDate', 'proposalEndDate', 'evaluationStartDate', 
   'evaluationEndDate', 'votingStartDate', 'votingEndDate'].forEach(field => {
    if (updateData[field]) {
      updateData[field] = new Date(updateData[field]);
    }
  });
  
  // Convertir array a JSON
  if (updateData.sectors) {
    updateData.sectors = JSON.stringify(updateData.sectors);
  }
  
  const budget = await prisma.participatoryBudget.update({
    where: { id },
    data: updateData
  });
  
  if (budget.sectors) {
    budget.sectors = JSON.parse(budget.sectors);
  }
  
  return budget;
}

/**
 * Elimina una convocatoria
 * @param {string} id - ID de la convocatoria
 * @returns {Promise<void>}
 */
export async function deleteParticipatoryBudget(id) {
  const budget = await getParticipatoryBudgetById(id);
  
  // No permitir eliminar si tiene propuestas
  if (budget.proposals.length > 0) {
    throw new AppError('No se puede eliminar una convocatoria con propuestas', 400);
  }
  
  await prisma.participatoryBudget.delete({
    where: { id }
  });
}

// ============================================
// GESTIÓN DE PROPUESTAS
// ============================================

/**
 * Crea una nueva propuesta de proyecto
 * @param {Object} data - Datos de la propuesta
 * @returns {Promise<Object>} Propuesta creada
 */
export async function createProposal(data) {
  // Verificar que la convocatoria existe y está en período de recepción
  const budget = await getParticipatoryBudgetById(data.budgetId);
  
  const now = new Date();
  if (now < budget.proposalStartDate || now > budget.proposalEndDate) {
    throw new AppError('Fuera del período de recepción de propuestas', 400);
  }
  
  // Generar número de propuesta
  const proposalNumber = await generateProposalNumber(budget.year);
  
  const proposalData = {
    ...data,
    proposalNumber,
    supportDocuments: data.supportDocuments ? JSON.stringify(data.supportDocuments) : null,
    photos: data.photos ? JSON.stringify(data.photos) : null
  };
  
  const proposal = await prisma.budgetProposal.create({
    data: proposalData
  });
  
  // Parsear JSON
  if (proposal.supportDocuments) proposal.supportDocuments = JSON.parse(proposal.supportDocuments);
  if (proposal.photos) proposal.photos = JSON.parse(proposal.photos);
  
  return proposal;
}

/**
 * Obtiene una propuesta por ID
 * @param {string} id - ID de la propuesta
 * @returns {Promise<Object>} Propuesta encontrada
 */
export async function getProposalById(id) {
  const proposal = await prisma.budgetProposal.findUnique({
    where: { id },
    include: {
      budget: true,
      votes: true
    }
  });
  
  if (!proposal) {
    throw new AppError('Propuesta no encontrada', 404);
  }
  
  // Parsear JSON
  if (proposal.supportDocuments) proposal.supportDocuments = JSON.parse(proposal.supportDocuments);
  if (proposal.photos) proposal.photos = JSON.parse(proposal.photos);
  
  return proposal;
}

/**
 * Lista propuestas de una convocatoria
 * @param {string} budgetId - ID de la convocatoria
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Object>} Lista de propuestas
 */
export async function listProposals(budgetId, filters = {}) {
  const { status, sector, page = 1, limit = 10 } = filters;
  
  const where = { budgetId };
  if (status) where.status = status;
  if (sector) where.sector = sector;
  
  const skip = (page - 1) * limit;
  
  const [proposals, total] = await Promise.all([
    prisma.budgetProposal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { votesCount: 'desc' },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    }),
    prisma.budgetProposal.count({ where })
  ]);
  
  // Parsear JSON
  proposals.forEach(proposal => {
    if (proposal.supportDocuments) proposal.supportDocuments = JSON.parse(proposal.supportDocuments);
    if (proposal.photos) proposal.photos = JSON.parse(proposal.photos);
  });
  
  return {
    data: proposals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Evalúa técnicamente una propuesta
 * @param {string} id - ID de la propuesta
 * @param {Object} data - Datos de evaluación
 * @param {string} userId - ID del evaluador
 * @returns {Promise<Object>} Propuesta evaluada
 */
export async function evaluateProposal(id, data, userId) {
  const proposal = await getProposalById(id);
  
  // Verificar que está en período de evaluación
  const now = new Date();
  if (now < proposal.budget.evaluationStartDate || now > proposal.budget.evaluationEndDate) {
    throw new AppError('Fuera del período de evaluación técnica', 400);
  }
  
  const updatedProposal = await prisma.budgetProposal.update({
    where: { id },
    data: {
      isFeasible: data.isFeasible,
      technicalCost: data.technicalCost,
      technicalNotes: data.technicalNotes,
      status: data.status,
      evaluatedBy: userId,
      evaluatedAt: new Date()
    }
  });
  
  return updatedProposal;
}

/**
 * Vota por una propuesta
 * @param {string} proposalId - ID de la propuesta
 * @param {Object} data - Datos del voto
 * @returns {Promise<Object>} Voto registrado
 */
export async function voteProposal(proposalId, data) {
  const proposal = await getProposalById(proposalId);
  
  // Verificar que la propuesta está aprobada
  if (proposal.status !== 'APPROVED' && proposal.status !== 'IN_VOTING') {
    throw new AppError('Esta propuesta no está disponible para votación', 400);
  }
  
  // Verificar que está en período de votación
  const now = new Date();
  if (now < proposal.budget.votingStartDate || now > proposal.budget.votingEndDate) {
    throw new AppError('Fuera del período de votación', 400);
  }
  
  // Verificar si el ciudadano ya votó por esta propuesta
  const existingVote = await prisma.proposalVote.findUnique({
    where: {
      proposalId_voterIdNumber: {
        proposalId,
        voterIdNumber: data.voterIdNumber
      }
    }
  });
  
  if (existingVote) {
    throw new AppError('Ya ha votado por esta propuesta', 400);
  }
  
  // Si no permite votos múltiples, verificar que no haya votado por otra propuesta
  if (!proposal.budget.allowMultipleVotes) {
    const votesInBudget = await prisma.proposalVote.count({
      where: {
        voterIdNumber: data.voterIdNumber,
        proposal: {
          budgetId: proposal.budgetId
        }
      }
    });
    
    if (votesInBudget >= proposal.budget.maxVotesPerCitizen) {
      throw new AppError('Ya ha alcanzado el máximo de votos permitidos', 400);
    }
  }
  
  // Registrar voto y actualizar contador
  const [vote] = await prisma.$transaction([
    prisma.proposalVote.create({
      data: {
        proposalId,
        voterIdNumber: data.voterIdNumber,
        voterName: data.voterName,
        voterEmail: data.voterEmail,
        ipAddress: data.ipAddress
      }
    }),
    prisma.budgetProposal.update({
      where: { id: proposalId },
      data: {
        votesCount: {
          increment: 1
        },
        status: 'IN_VOTING'
      }
    })
  ]);
  
  return vote;
}

/**
 * Calcula ganadores de una convocatoria
 * @param {string} budgetId - ID de la convocatoria
 * @returns {Promise<Object>} Resultados
 */
export async function calculateWinners(budgetId) {
  const budget = await getParticipatoryBudgetById(budgetId);
  
  // Obtener propuestas aprobadas ordenadas por votos
  const proposals = await prisma.budgetProposal.findMany({
    where: {
      budgetId,
      status: {
        in: ['APPROVED', 'IN_VOTING']
      }
    },
    orderBy: {
      votesCount: 'desc'
    }
  });
  
  let remainingBudget = parseFloat(budget.totalBudget);
  const winners = [];
  let rank = 1;
  
  // Seleccionar ganadores hasta agotar presupuesto
  for (const proposal of proposals) {
    const cost = parseFloat(proposal.technicalCost || proposal.estimatedCost);
    
    if (cost <= remainingBudget) {
      winners.push({
        id: proposal.id,
        rank,
        cost
      });
      remainingBudget -= cost;
      rank++;
    }
  }
  
  // Actualizar propuestas ganadoras
  for (const winner of winners) {
    await prisma.budgetProposal.update({
      where: { id: winner.id },
      data: {
        isWinner: true,
        rank: winner.rank,
        status: 'WINNER'
      }
    });
  }
  
  // Actualizar presupuesto asignado
  const allocatedBudget = parseFloat(budget.totalBudget) - remainingBudget;
  await prisma.participatoryBudget.update({
    where: { id: budgetId },
    data: {
      allocatedBudget,
      resultsDate: new Date()
    }
  });
  
  return {
    totalProposals: proposals.length,
    winners: winners.length,
    allocatedBudget,
    remainingBudget
  };
}

/**
 * Obtiene estadísticas de una convocatoria
 * @param {string} budgetId - ID de la convocatoria
 * @returns {Promise<Object>} Estadísticas
 */
export async function getBudgetStats(budgetId) {
  const [
    totalProposals,
    proposalsByStatus,
    proposalsBySector,
    totalVotes,
    uniqueVoters
  ] = await Promise.all([
    prisma.budgetProposal.count({ where: { budgetId } }),
    
    prisma.budgetProposal.groupBy({
      by: ['status'],
      where: { budgetId },
      _count: true
    }),
    
    prisma.budgetProposal.groupBy({
      by: ['sector'],
      where: { budgetId },
      _count: true,
      _sum: {
        votesCount: true
      }
    }),
    
    prisma.proposalVote.count({
      where: {
        proposal: { budgetId }
      }
    }),
    
    prisma.proposalVote.groupBy({
      by: ['voterIdNumber'],
      where: {
        proposal: { budgetId }
      }
    })
  ]);
  
  return {
    totalProposals,
    byStatus: proposalsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {}),
    bySector: proposalsBySector.map(item => ({
      sector: item.sector,
      proposals: item._count,
      votes: item._sum.votesCount || 0
    })),
    totalVotes,
    uniqueVoters: uniqueVoters.length
  };
}
