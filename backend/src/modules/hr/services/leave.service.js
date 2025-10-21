import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de gestión de permisos y licencias
 */



/**
 * Obtener todos los permisos
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>}
 */
async function getAllLeaves(filters = {}) {
  const { status, type, employeeId, page = 1, limit = 50 } = filters;
  
  const skip = (page - 1) * limit;
  const where = {};
  
  if (status) {
    where.status = status;
  }
  
  if (type) {
    where.type = type;
  }
  
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
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
    prisma.leave.count({ where }),
  ]);
  
  return {
    data: leaves,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener permisos de un empleado
 * @param {string} employeeId - ID del empleado
 * @returns {Promise<Array>}
 */
async function getLeavesByEmployee(employeeId) {
  const leaves = await prisma.leave.findMany({
    where: { employeeId },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return leaves;
}

/**
 * Crear solicitud de permiso
 * @param {Object} data - Datos del permiso
 * @returns {Promise<Object>}
 */
async function createLeave(data) {
  // Verificar que el empleado exista
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Verificar que no haya solapamiento con otros permisos aprobados
  const overlapping = await prisma.leave.findFirst({
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
    throw new AppError('Ya existe un permiso en estas fechas', 400);
  }
  
  const leaveData = {
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
  };
  
  const leave = await prisma.leave.create({
    data: leaveData,
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
  
  return leave;
}

/**
 * Revisar solicitud de permiso
 * @param {string} id - ID del permiso
 * @param {string} status - Nuevo estado (APPROVED/REJECTED)
 * @param {string} reviewerId - ID del revisor
 * @param {string} comments - Comentarios (opcional)
 * @returns {Promise<Object>}
 */
async function reviewLeave(id, status, reviewerId, comments = null) {
  const leave = await prisma.leave.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  });
  
  if (!leave) {
    throw new AppError('Solicitud de permiso no encontrada', 404);
  }
  
  if (leave.status !== 'PENDING') {
    throw new AppError('Esta solicitud ya fue revisada', 400);
  }
  
  // Si se aprueba, crear registros de asistencia para esos días
  if (status === 'APPROVED') {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    
    // Determinar el estado de asistencia según el tipo de permiso
    let attendanceStatus = 'LEAVE';
    if (leave.type === 'MEDICAL') {
      attendanceStatus = 'SICK_LEAVE';
    }
    
    const attendanceRecords = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Solo días laborables (lunes a viernes)
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        attendanceRecords.push({
          employeeId: leave.employeeId,
          date: new Date(date),
          status: attendanceStatus,
          type: 'REGULAR',
          notes: `${leave.type} - ${leave.reason}`,
        });
      }
    }
    
    // Crear registros de asistencia en batch
    await prisma.attendance.createMany({
      data: attendanceRecords,
      skipDuplicates: true,
    });
  }
  
  const updatedLeave = await prisma.leave.update({
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
  
  return updatedLeave;
}

export {
  getAllLeaves,
  getLeavesByEmployee,
  createLeave,
  reviewLeave,
};
