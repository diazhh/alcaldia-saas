import { PrismaClient } from '@prisma/client';
import { successResponse } from '../../../shared/utils/response.js';

const prisma = new PrismaClient();

async function getAll(req, res, next) {
  try {
    const trainings = await prisma.training.findMany({
      include: {
        _count: { select: { participants: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    return successResponse(res, trainings, 'Capacitaciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const training = await prisma.training.findUnique({
      where: { id: req.params.id },
      include: {
        participants: {
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true, employeeNumber: true },
            },
          },
        },
      },
    });
    return successResponse(res, training, 'Capacitación obtenida exitosamente');
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const training = await prisma.training.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
    });
    return successResponse(res, training, 'Capacitación creada exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function enroll(req, res, next) {
  try {
    const enrollment = await prisma.employeeTraining.create({
      data: {
        trainingId: req.params.id,
        employeeId: req.body.employeeId,
      },
    });
    return successResponse(res, enrollment, 'Empleado inscrito exitosamente', 201);
  } catch (error) {
    next(error);
  }
}

async function getByEmployee(req, res, next) {
  try {
    const trainings = await prisma.employeeTraining.findMany({
      where: { employeeId: req.params.employeeId },
      include: { training: true },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, trainings, 'Capacitaciones obtenidas exitosamente');
  } catch (error) {
    next(error);
  }
}

export { getAll, getById, create, enroll, getByEmployee };
