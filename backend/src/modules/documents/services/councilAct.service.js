/**
 * Servicio de Actas del Concejo Municipal
 * Gestiona las actas de sesiones del concejo
 */

import prisma from '../../../config/database.js';
import { NotFoundError } from '../../../shared/utils/errors.js';

/**
 * Parsear campos JSON de acta
 */
function parseCouncilAct(act) {
  if (act.presentCouncilors) {
    act.presentCouncilors = JSON.parse(act.presentCouncilors);
  }
  if (act.absentCouncilors) {
    act.absentCouncilors = JSON.parse(act.absentCouncilors);
  }
  if (act.agenda) {
    act.agenda = JSON.parse(act.agenda);
  }
  if (act.motions) {
    act.motions = JSON.parse(act.motions);
  }
  if (act.votations) {
    act.votations = JSON.parse(act.votations);
  }
  if (act.agreements) {
    act.agreements = JSON.parse(act.agreements);
  }
  if (act.resolutions) {
    act.resolutions = JSON.parse(act.resolutions);
  }
  if (act.interventions) {
    act.interventions = JSON.parse(act.interventions);
  }
  if (act.approvedBy) {
    act.approvedBy = JSON.parse(act.approvedBy);
  }
  return act;
}

/**
 * Crear acta del concejo
 */
async function createCouncilAct(data, userId) {
  const actData = {
    actNumber: data.actNumber,
    sessionType: data.sessionType,
    sessionDate: new Date(data.sessionDate),
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location,
    presentCouncilors: JSON.stringify(data.presentCouncilors),
    absentCouncilors: data.absentCouncilors ? JSON.stringify(data.absentCouncilors) : null,
    totalPresent: data.totalPresent,
    totalAbsent: data.totalAbsent || 0,
    agenda: JSON.stringify(data.agenda),
    pointsDiscussed: data.pointsDiscussed,
    motions: data.motions ? JSON.stringify(data.motions) : null,
    votations: data.votations ? JSON.stringify(data.votations) : null,
    agreements: data.agreements ? JSON.stringify(data.agreements) : null,
    resolutions: data.resolutions ? JSON.stringify(data.resolutions) : null,
    interventions: data.interventions ? JSON.stringify(data.interventions) : null,
    signedActUrl: data.signedActUrl,
    registeredBy: userId,
    status: 'DRAFT',
  };
  
  const act = await prisma.councilAct.create({
    data: actData,
  });
  
  return parseCouncilAct(act);
}

/**
 * Obtener acta por ID
 */
async function getCouncilActById(id) {
  const act = await prisma.councilAct.findUnique({
    where: { id },
  });
  
  if (!act) {
    throw new NotFoundError('Acta del concejo no encontrada');
  }
  
  return parseCouncilAct(act);
}

/**
 * Listar actas del concejo
 */
async function listCouncilActs(filters = {}) {
  const {
    sessionType,
    status,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;
  
  const where = {};
  
  if (sessionType) where.sessionType = sessionType;
  if (status) where.status = status;
  
  if (search) {
    where.OR = [
      { actNumber: { contains: search, mode: 'insensitive' } },
      { pointsDiscussed: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (startDate || endDate) {
    where.sessionDate = {};
    if (startDate) where.sessionDate.gte = new Date(startDate);
    if (endDate) where.sessionDate.lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [acts, total] = await Promise.all([
    prisma.councilAct.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        sessionDate: 'desc',
      },
    }),
    prisma.councilAct.count({ where }),
  ]);
  
  return {
    data: acts.map(parseCouncilAct),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Actualizar acta del concejo
 */
async function updateCouncilAct(id, data) {
  await getCouncilActById(id);
  
  const updateData = { ...data };
  if (data.motions) updateData.motions = JSON.stringify(data.motions);
  if (data.votations) updateData.votations = JSON.stringify(data.votations);
  if (data.agreements) updateData.agreements = JSON.stringify(data.agreements);
  if (data.resolutions) updateData.resolutions = JSON.stringify(data.resolutions);
  if (data.interventions) updateData.interventions = JSON.stringify(data.interventions);
  if (data.approvedBy) updateData.approvedBy = JSON.stringify(data.approvedBy);
  if (data.approvedAt) updateData.approvedAt = new Date(data.approvedAt);
  
  const updated = await prisma.councilAct.update({
    where: { id },
    data: updateData,
  });
  
  return parseCouncilAct(updated);
}

/**
 * Aprobar acta
 */
async function approveAct(id, approvedBy) {
  await getCouncilActById(id);
  
  const updated = await prisma.councilAct.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: JSON.stringify(approvedBy),
    },
  });
  
  return parseCouncilAct(updated);
}

/**
 * Publicar acta
 */
async function publishAct(id) {
  await getCouncilActById(id);
  
  const updated = await prisma.councilAct.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
    },
  });
  
  return parseCouncilAct(updated);
}

/**
 * Eliminar acta
 */
async function deleteCouncilAct(id) {
  await getCouncilActById(id);
  
  await prisma.councilAct.delete({
    where: { id },
  });
}

export {
  createCouncilAct,
  getCouncilActById,
  listCouncilActs,
  updateCouncilAct,
  approveAct,
  publishAct,
  deleteCouncilAct,
};
