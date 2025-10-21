import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de control de asistencia
 */



/**
 * Obtener registros de asistencia con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>}
 */
async function getAllAttendance(filters = {}) {
  const {
    employeeId,
    startDate,
    endDate,
    status,
    page = 1,
    limit = 50,
  } = filters;
  
  const skip = (page - 1) * limit;
  
  const where = {};
  
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }
  
  const [attendances, total] = await Promise.all([
    prisma.attendance.findMany({
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
        date: 'desc',
      },
    }),
    prisma.attendance.count({ where }),
  ]);
  
  return {
    data: attendances,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener asistencia de un empleado
 * @param {string} employeeId - ID del empleado
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Array>}
 */
async function getAttendanceByEmployee(employeeId, filters = {}) {
  const { startDate, endDate, month, year } = filters;
  
  const where = { employeeId };
  
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    where.date = {
      gte: start,
      lte: end,
    };
  } else if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }
  
  const attendances = await prisma.attendance.findMany({
    where,
    orderBy: {
      date: 'desc',
    },
  });
  
  // Calcular estadísticas
  const stats = {
    totalDays: attendances.length,
    present: attendances.filter(a => a.status === 'PRESENT').length,
    absent: attendances.filter(a => a.status === 'ABSENT').length,
    late: attendances.filter(a => a.status === 'LATE').length,
    vacation: attendances.filter(a => a.status === 'VACATION').length,
    leave: attendances.filter(a => a.status === 'LEAVE').length,
    sickLeave: attendances.filter(a => a.status === 'SICK_LEAVE').length,
    totalLateMinutes: attendances.reduce((sum, a) => sum + a.lateMinutes, 0),
  };
  
  return {
    attendances,
    stats,
  };
}

/**
 * Registrar asistencia
 * @param {Object} data - Datos de asistencia
 * @returns {Promise<Object>}
 */
async function createAttendance(data) {
  // Verificar que el empleado exista
  const employee = await prisma.employee.findUnique({
    where: { id: data.employeeId },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  // Verificar que no exista registro para ese día
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId: data.employeeId,
        date: new Date(data.date),
      },
    },
  });
  
  if (existingAttendance) {
    throw new AppError('Ya existe un registro de asistencia para este día', 400);
  }
  
  // Calcular horas trabajadas si hay entrada y salida
  let workedHours = null;
  if (data.checkIn && data.checkOut) {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    workedHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convertir a horas
  }
  
  const attendanceData = {
    ...data,
    date: new Date(data.date),
    checkIn: data.checkIn ? new Date(data.checkIn) : null,
    checkOut: data.checkOut ? new Date(data.checkOut) : null,
    workedHours,
  };
  
  const attendance = await prisma.attendance.create({
    data: attendanceData,
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
  
  return attendance;
}

/**
 * Justificar una asistencia
 * @param {string} id - ID de la asistencia
 * @param {string} justification - Justificación
 * @param {string} userId - ID del usuario que justifica
 * @returns {Promise<Object>}
 */
async function justifyAttendance(id, justification, userId) {
  const attendance = await prisma.attendance.findUnique({
    where: { id },
  });
  
  if (!attendance) {
    throw new AppError('Registro de asistencia no encontrado', 404);
  }
  
  const updatedAttendance = await prisma.attendance.update({
    where: { id },
    data: {
      isJustified: true,
      justification,
      justifiedBy: userId,
      justifiedAt: new Date(),
      status: 'JUSTIFIED',
    },
  });
  
  return updatedAttendance;
}

/**
 * Generar reporte de asistencia
 * @param {Object} filters - Filtros para el reporte
 * @returns {Promise<Object>}
 */
async function generateAttendanceReport(filters = {}) {
  const { departmentId, startDate, endDate, month, year } = filters;
  
  const where = {};
  
  // Filtro de fechas
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    where.date = {
      gte: start,
      lte: end,
    };
  } else if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate);
    }
    if (endDate) {
      where.date.lte = new Date(endDate);
    }
  }
  
  // Filtro de departamento
  if (departmentId) {
    where.employee = {
      departmentId,
    };
  }
  
  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeNumber: true,
          departmentId: true,
          position: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  
  // Agrupar por empleado
  const byEmployee = {};
  
  attendances.forEach(att => {
    const empId = att.employeeId;
    if (!byEmployee[empId]) {
      byEmployee[empId] = {
        employee: att.employee,
        totalDays: 0,
        present: 0,
        absent: 0,
        late: 0,
        vacation: 0,
        leave: 0,
        sickLeave: 0,
        totalLateMinutes: 0,
      };
    }
    
    byEmployee[empId].totalDays++;
    byEmployee[empId][att.status.toLowerCase()]++;
    byEmployee[empId].totalLateMinutes += att.lateMinutes;
  });
  
  return {
    summary: {
      totalEmployees: Object.keys(byEmployee).length,
      totalRecords: attendances.length,
      period: filters.month && filters.year 
        ? `${filters.month}/${filters.year}`
        : `${startDate || 'Inicio'} - ${endDate || 'Fin'}`,
    },
    byEmployee: Object.values(byEmployee),
  };
}

export {
  getAllAttendance,
  getAttendanceByEmployee,
  createAttendance,
  justifyAttendance,
  generateAttendanceReport,
};
