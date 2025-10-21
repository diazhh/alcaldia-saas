/**
 * Controlador para Portal del Empleado
 */

import prisma from '../../../config/database.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Obtiene datos del portal del empleado actual
 * @route GET /api/hr/portal/my-data
 */
export async function getMyPortalData(req, res) {
  try {
    const userId = req.user.id;

    // Buscar empleado por userId
    const employee = await prisma.employee.findFirst({
      where: { userId },
      include: {
        position: true,
        department: true,
      }
    });

    if (!employee) {
      return errorResponse(res, 'No se encontró información de empleado', 404);
    }

    // Obtener últimos recibos de nómina (últimos 6)
    const recentPayrolls = await prisma.payroll.findMany({
      where: { employeeId: employee.id },
      orderBy: { paymentDate: 'desc' },
      take: 6,
      select: {
        id: true,
        reference: true,
        period: true,
        paymentDate: true,
        grossSalary: true,
        totalDeductions: true,
        netSalary: true,
      }
    });

    // Obtener solicitudes de vacaciones
    const vacationRequests = await prisma.vacationRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        requestedDays: true,
        status: true,
        reason: true,
        createdAt: true,
      }
    });

    // Calcular días de vacaciones disponibles
    const vacationBalance = await calculateVacationBalance(employee.id);

    // Obtener registros de asistencia reciente (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'desc' },
      take: 20,
      select: {
        id: true,
        date: true,
        checkIn: true,
        checkOut: true,
        hoursWorked: true,
        status: true,
        isLate: true,
      }
    });

    // Calcular asistencia del mes
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthAttendance = await prisma.attendance.count({
      where: {
        employeeId: employee.id,
        date: { gte: currentMonth },
        status: 'PRESENT'
      }
    });

    const totalWorkDays = getWorkDaysInMonth(new Date());
    const attendancePercentage = totalWorkDays > 0
      ? Math.round((monthAttendance / totalWorkDays) * 100)
      : 0;

    // Obtener último pago
    const lastPayroll = recentPayrolls[0] || null;

    // Contar solicitudes pendientes
    const pendingRequests = await prisma.vacationRequest.count({
      where: {
        employeeId: employee.id,
        status: 'PENDING'
      }
    }) + await prisma.leave.count({
      where: {
        employeeId: employee.id,
        status: 'PENDING'
      }
    });

    return successResponse(res, {
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position?.name,
        department: employee.department?.name,
      },
      summary: {
        vacationDays: vacationBalance.available,
        attendancePercentage,
        attendanceDays: `${monthAttendance} de ${totalWorkDays}`,
        lastPayment: lastPayroll ? {
          amount: Number(lastPayroll.netSalary),
          date: lastPayroll.paymentDate
        } : null,
        pendingRequests
      },
      recentPayrolls: recentPayrolls.map(p => ({
        ...p,
        grossSalary: Number(p.grossSalary),
        totalDeductions: Number(p.totalDeductions),
        netSalary: Number(p.netSalary),
      })),
      vacationRequests,
      vacationBalance,
      attendanceRecords: attendanceRecords.map(a => ({
        ...a,
        hoursWorked: Number(a.hoursWorked),
      })),
    });

  } catch (error) {
    console.error('Error al obtener datos del portal:', error);
    return errorResponse(res, 'Error al obtener información del portal', 500);
  }
}

/**
 * Calcula el balance de vacaciones del empleado
 */
async function calculateVacationBalance(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { hireDate: true }
  });

  if (!employee) return { available: 0, pending: 0, used: 0 };

  // Calcular años de antigüedad
  const yearsOfService = Math.floor(
    (new Date() - new Date(employee.hireDate)) / (1000 * 60 * 60 * 24 * 365)
  );

  // En Venezuela: 15 días base + 1 día por año (máx 15 adicionales)
  const baseDays = 15;
  const additionalDays = Math.min(yearsOfService, 15);
  const totalEntitled = baseDays + additionalDays;

  // Obtener días usados este año
  const currentYear = new Date().getFullYear();
  const usedDays = await prisma.vacationRequest.aggregate({
    where: {
      employeeId,
      status: 'APPROVED',
      startDate: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`)
      }
    },
    _sum: { requestedDays: true }
  });

  // Obtener días pendientes de aprobación
  const pendingDays = await prisma.vacationRequest.aggregate({
    where: {
      employeeId,
      status: 'PENDING',
      startDate: {
        gte: new Date(`${currentYear}-01-01`),
        lt: new Date(`${currentYear + 1}-01-01`)
      }
    },
    _sum: { requestedDays: true }
  });

  const used = usedDays._sum.requestedDays || 0;
  const pending = pendingDays._sum.requestedDays || 0;
  const available = totalEntitled - used - pending;

  return {
    available,
    pending,
    used,
    total: totalEntitled
  };
}

/**
 * Calcula días laborables en el mes actual
 */
function getWorkDaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let workDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(year, month, day).getDay();
    // Contar solo de lunes a viernes (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workDays++;
    }
  }

  return workDays;
}

/**
 * Descarga recibo de pago en PDF
 * @route GET /api/hr/portal/payroll/:id/download
 */
export async function downloadPayrollReceipt(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar empleado
    const employee = await prisma.employee.findFirst({
      where: { userId }
    });

    if (!employee) {
      return errorResponse(res, 'No se encontró información de empleado', 404);
    }

    // Buscar nómina
    const payroll = await prisma.payroll.findFirst({
      where: {
        id,
        employeeId: employee.id
      },
      include: {
        employee: {
          include: {
            position: true,
            department: true
          }
        }
      }
    });

    if (!payroll) {
      return errorResponse(res, 'Recibo de pago no encontrado', 404);
    }

    // TODO: Generar PDF del recibo
    // Por ahora retornar la información
    return successResponse(res, {
      message: 'Funcionalidad de PDF pendiente de implementar',
      payroll: {
        ...payroll,
        grossSalary: Number(payroll.grossSalary),
        totalDeductions: Number(payroll.totalDeductions),
        netSalary: Number(payroll.netSalary),
      }
    });

  } catch (error) {
    console.error('Error al descargar recibo:', error);
    return errorResponse(res, 'Error al descargar recibo de pago', 500);
  }
}
