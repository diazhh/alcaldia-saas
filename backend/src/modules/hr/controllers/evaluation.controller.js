import { PrismaClient } from '@prisma/client';
import { successResponse } from '../../../shared/utils/response.js';

const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const evaluations = await prisma.performanceEvaluation.findMany({
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
      orderBy: { year: 'desc' },
    });
    return successResponse(res, evaluations, 'Evaluaciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getByEmployee(req, res, next) {
  try {
    const evaluations = await prisma.performanceEvaluation.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { year: 'desc' },
    });
    return successResponse(res, evaluations, 'Evaluaciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const finalScore = (
      parseFloat(req.body.objectivesScore) * 0.5 +
      parseFloat(req.body.competenciesScore) * 0.25 +
      parseFloat(req.body.attitudeScore) * 0.15 +
      parseFloat(req.body.disciplineScore) * 0.10
    );
    let rating = 'DEFICIENT';
    if (finalScore >= 4.5) rating = 'EXCELLENT';
    else if (finalScore >= 3.5) rating = 'VERY_GOOD';
    else if (finalScore >= 2.5) rating = 'GOOD';
    else if (finalScore >= 1.5) rating = 'REGULAR';
    
    const evaluation = await prisma.performanceEvaluation.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        finalScore,
        rating,
      },
    });
    return successResponse(res, evaluation, 'Evaluación creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const evaluation = await prisma.performanceEvaluation.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return successResponse(res, evaluation, 'Evaluación actualizada exitosamente');
  } catch (error) {
    next(error);
  }
}

async function acknowledge(req, res, next) {
  try {
    const evaluation = await prisma.performanceEvaluation.update({
      where: { id: req.params.id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        employeeComments: req.body.comments,
      },
    });
    return successResponse(res, evaluation, 'Evaluación reconocida exitosamente');
  } catch (error) {
    next(error);
  }
}

export { getAll, getByEmployee, create, update, acknowledge };
