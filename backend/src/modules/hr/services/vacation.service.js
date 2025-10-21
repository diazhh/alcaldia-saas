import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de gestión de vacaciones
 */



/**
 * Obtener todas las solicitudes de vacaciones
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>}
 */
async function getAllVacationRequests(filters = {}) {
  const { status, employeeId, page = 1, limit = 50 } = filters;
  
  const skip = (page - 1) * limit;
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  const [requests, total] = await Promise.all([
    prisma.vacationRequest.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            position: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.vacationRequest.count({ where }),
  ]);
  
  return {
    data: requests,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener solicitudes de vacaciones de un empleado
 * @param {string} employeeId - ID del empleado
 * @returns {Promise<Array>}
 */
async function getVacationsByEmployee(employeeId) {
  const requests = await prisma.vacationRequest.findMany({
    where: { employeeId },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return requests;
}

/**
 * Calcular saldo de vacaciones de un empleado
 * @param {string} employeeId - ID del empleado
 * @returns {Promise<Object>}
 */
async function getVacationBalance(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Calcular años de antigüedad
  const hireDate = new Date(employee.hireDate);
  const today = new Date();
  const yearsOfService = Math.floor((today - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Calcular días según ley venezolana
  let daysPerYear = 15; // Base: 1 año
  if (yearsOfService >= 2) {
    daysPerYear = 16 + Math.min(yearsOfService - 2, 9); // Incremento hasta 25 días
  }
  
  // Obtener vacaciones del año actual
  const currentYear = today.getFullYear();
  const approvedVacations = await prisma.vacationRequest.findMany({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31),
      },
    },
  });
  
  const usedDays = approvedVacations.reduce((sum, vac) => sum + vac.requestedDays, 0);
  
  // Obtener vacaciones pendientes
  const pendingVacations = await prisma.vacationRequest.findMany({
    where: {
      employeeId,
      status: 'PENDING',
    },
  });
  
  const pendingDays = pendingVacations.reduce((sum, vac) => sum + vac.requestedDays, 0);
  
  return {
    yearsOfService,
    totalDays: daysPerYear,
    usedDays,
    pendingDays,
    availableDays: daysPerYear - usedDays - pendingDays,
    currentYear,
  };
}

/**
 * Crear solicitud de vacaciones
 * @param {Object} data - Datos de la solicitud
 * @returns {Promise<Object>}
 */
async function createVacationRequest(data) {
  // Verificar que el empleado exista
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Verificar saldo de vacaciones
  const balance = await getVacationBalance(data.employeeId);
  
  if (data.requestedDays > balance.availableDays) {
    throw new AppError(
      `No tiene suficientes días disponibles. Disponibles: ${balance.availableDays}, Solicitados: ${data.requestedDays}`,
      400
    );
  }
  
  // Verificar que no haya solapamiento con otras solicitudes aprobadas
  const overlapping = await prisma.vacationRequest.findFirst({
    where: {
      employeeId: data.employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        {
          AND: [
            { startDate: { lte: new Date(data.startDate) } },
            { endDate: { gte: new Date(data.startDate) } },
          ],
        },
        {
          AND: [
            { startDate: { lte: new Date(data.endDate) } },
            { endDate: { gte: new Date(data.endDate) } },
          ],
        },
      ],
    },
  });
  
  if (overlapping) {
    throw new AppError('Ya existe una solicitud de vacaciones en estas fechas', 400);
  }
  
  const requestData = {
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  };
  
  const request = await prisma.vacationRequest.create({
    data: requestData,
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
        },
      },
    },
  });
  
  return request;
}

/**
 * Revisar solicitud de vacaciones
 * @param {string} id - ID de la solicitud
 * @param {string} status - Nuevo estado (APPROVED/REJECTED)
 * @param {string} reviewerId - ID del revisor
 * @param {string} comments - Comentarios (opcional)
 * @returns {Promise<Object>}
 */
async function reviewVacationRequest(id, status, reviewerId, comments = null) {
  const request = await prisma.vacationRequest.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  });
  
  if (!request) {
    throw new AppError('Solicitud de vacaciones no encontrada', 404);
  }
  
  if (request.status !== 'PENDING') {
    throw new AppError('Esta solicitud ya fue revisada', 400);
  }
  
  // Si se aprueba, crear registros de asistencia para esos días
  if (status === 'APPROVED') {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    
    const attendanceRecords = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Solo días laborables (lunes a viernes)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        attendanceRecords.push({
          employeeId: request.employeeId,
          date: new Date(date),
          status: 'VACATION',
          type: 'REGULAR',
        });
      }
    }
    
    // Crear registros de asistencia en batch
    await prisma.attendance.createMany({
      data: attendanceRecords,
      skipDuplicates: true,
    });
  }
  
  const updatedRequest = await prisma.vacationRequest.update({
    where: { id },
    data: {
      status,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewComments: comments,
    },
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
        },
      },
    },
  });
  
  return updatedRequest;
}

export {
  getAllVacationRequests,
  getVacationsByEmployee,
  getVacationBalance,
  createVacationRequest,
  reviewVacationRequest,
};
