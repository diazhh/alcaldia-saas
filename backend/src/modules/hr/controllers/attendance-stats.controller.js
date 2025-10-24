/**
 * Controlador para Estadísticas de Asistencia
 */

import prisma from '../../../config/database.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Obtiene estadísticas y registros de asistencia
 * @route GET /api/hr/attendance/stats
 */
export async function getAttendanceStats(req, res) {
  try {
    const { startDate, endDate, status, departmentId, search } = req.query;

    // Construir filtros
    const where = {};

    // Filtro por fecha
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    } else {
      // Por defecto, último mes
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      where.date = { gte: oneMonthAgo };
    }

    // Filtro por estado
    if (status) {
      where.status = status;
    }

    // Filtro por departamento
    if (departmentId) {
      where.employee = {
        departmentId
      };
    }

    // Obtener registros de asistencia con información del empleado
    let attendanceRecords = await prisma.attendance.findMany({
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
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      take: 100
    });

    // Filtro por búsqueda de empleado
    if (search) {
      const searchLower = search.toLowerCase();
      attendanceRecords = attendanceRecords.filter(record => {
        const fullName = `${record.employee.firstName} ${record.employee.lastName}`.toLowerCase();
        const employeeNumber = record.employee.employeeNumber.toLowerCase();
        return fullName.includes(searchLower) || employeeNumber.includes(searchLower);
      });
    }

    // Calcular estadísticas del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      _count: true
    });

    // Contar total de empleados activos
    const totalEmployees = await prisma.employee.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Procesar stats del día
    const statsMap = {
      present: 0,
      absent: 0,
      late: 0,
      justified: 0
    };

    todayStats.forEach(stat => {
      const status = stat.status.toLowerCase();
      if (statsMap.hasOwnProperty(status)) {
        statsMap[status] = stat._count;
      }
    });

    // Contar retardos del día
    const lateCount = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        lateMinutes: {
          gt: 0
        }
      }
    });

    statsMap.late = lateCount;

    // Estadísticas adicionales del período filtrado
    const periodStats = await prisma.attendance.aggregate({
      where,
      _avg: {
        workedHours: true
      },
      _sum: {
        workedHours: true
      },
      _count: true
    });

    // Formatear registros
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      employee: {
        id: record.employee.id,
        firstName: record.employee.firstName,
        lastName: record.employee.lastName,
        employeeNumber: record.employee.employeeNumber,
        position: record.employee.position?.name,
        departmentId: record.employee.departmentId
      },
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      hoursWorked: Number(record.workedHours || 0),
      status: record.status,
      isLate: record.lateMinutes > 0,
      lateMinutes: record.lateMinutes || 0,
      notes: record.notes
    }));

    return successResponse(res, {
      stats: {
        totalEmployees,
        present: statsMap.present,
        absent: statsMap.absent,
        late: statsMap.late,
        justified: statsMap.justified,
        attendanceRate: totalEmployees > 0
          ? Math.round((statsMap.present / totalEmployees) * 100)
          : 0
      },
      periodStats: {
        totalRecords: periodStats._count,
        averageHoursWorked: Number(periodStats._avg.workedHours || 0).toFixed(2),
        totalHoursWorked: Number(periodStats._sum.workedHours || 0).toFixed(2)
      },
      records: formattedRecords,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        status: status || null,
        departmentId: departmentId || null
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de asistencia:', error);
    return errorResponse(res, 'Error al obtener estadísticas de asistencia', 500);
  }
}

/**
 * Registrar asistencia manual
 * @route POST /api/hr/attendance/record
 */
export async function recordAttendance(req, res) {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    // Validar que el empleado existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return errorResponse(res, 'Empleado no encontrado', 404);
    }

    // Verificar si ya existe un registro para ese día
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: new Date(date)
      }
    });

    if (existingRecord) {
      return errorResponse(res, 'Ya existe un registro de asistencia para este día', 400);
    }

    // Calcular horas trabajadas si hay entrada y salida
    let workedHours = 0;
    let lateMinutes = 0;

    if (checkIn && checkOut) {
      const checkInTime = new Date(`${date}T${checkIn}`);
      const checkOutTime = new Date(`${date}T${checkOut}`);
      workedHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Horas

      // Verificar si llegó tarde (después de las 8:00)
      const scheduledStart = new Date(`${date}T08:00:00`);
      if (checkInTime > scheduledStart) {
        lateMinutes = Math.round((checkInTime - scheduledStart) / (1000 * 60));
      }
    }

    // Crear registro
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        checkIn,
        checkOut,
        workedHours,
        status: status || 'PRESENT',
        lateMinutes,
        notes
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      }
    });

    return successResponse(res, attendance, 201);

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    return errorResponse(res, 'Error al registrar asistencia', 500);
  }
}
