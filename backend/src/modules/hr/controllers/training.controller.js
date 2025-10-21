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
    res.json(successResponse(trainings, 'Capacitaciones obtenidas exitosamente'));
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
    res.json(successResponse(training, 'Capacitación obtenida exitosamente'));
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
    res.status(201).json(successResponse(training, 'Capacitación creada exitosamente'));
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
    res.status(201).json(successResponse(enrollment, 'Empleado inscrito exitosamente'));
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
    res.json(successResponse(trainings, 'Capacitaciones obtenidas exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { getAll, getById, create, enroll, getByEmployee };
