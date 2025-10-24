import prisma from '../../../config/database.js';

/**
 * Servicio para generación de reportes de RRHH
 */
class HRReportsService {
  /**
   * Reporte de cumpleaños del mes
   */
  async getBirthdaysReport(month, year) {
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const employees = await prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        email: true,
        phone: true,
        position: true,
        departmentId: true,
      },
    });

    // Filtrar por mes de cumpleaños
    const birthdays = employees
      .filter(emp => {
        const birthMonth = new Date(emp.birthDate).getMonth() + 1;
        return birthMonth === currentMonth;
      })
      .map(emp => ({
        ...emp,
        birthDay: new Date(emp.birthDate).getDate(),
        age: currentYear - new Date(emp.birthDate).getFullYear(),
      }))
      .sort((a, b) => a.birthDay - b.birthDay);

    return {
      month: currentMonth,
      year: currentYear,
      total: birthdays.length,
      birthdays,
    };
  }

  /**
   * Reporte de antigüedad de empleados
   */
  async getSeniorityReport() {
    const employees = await prisma.employee.findMany({
      where: {
        status: { in: ['ACTIVE', 'ON_LEAVE'] },
      },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        hireDate: true,
        position: true,
        departmentId: true,
        currentSalary: true,
      },
      orderBy: { hireDate: 'asc' },
    });

    const today = new Date();
    const employeesWithSeniority = employees.map(emp => {
      const years = today.getFullYear() - new Date(emp.hireDate).getFullYear();
      const months = today.getMonth() - new Date(emp.hireDate).getMonth();
      const totalMonths = years * 12 + months;

      return {
        ...emp,
        yearsOfService: years,
        monthsOfService: months < 0 ? 12 + months : months,
        totalMonths,
      };
    });

    // Agrupar por rangos de antigüedad
    const ranges = {
      '0-1': employeesWithSeniority.filter(e => e.yearsOfService < 1).length,
      '1-3': employeesWithSeniority.filter(e => e.yearsOfService >= 1 && e.yearsOfService < 3).length,
      '3-5': employeesWithSeniority.filter(e => e.yearsOfService >= 3 && e.yearsOfService < 5).length,
      '5-10': employeesWithSeniority.filter(e => e.yearsOfService >= 5 && e.yearsOfService < 10).length,
      '10+': employeesWithSeniority.filter(e => e.yearsOfService >= 10).length,
    };

    return {
      total: employeesWithSeniority.length,
      ranges,
      employees: employeesWithSeniority,
    };
  }

  /**
   * Reporte de rotación de personal
   */
  async getTurnoverReport(year) {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const [hires, terminations, avgEmployees] = await Promise.all([
      prisma.employee.count({
        where: {
          hireDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.employee.count({
        where: {
          status: 'TERMINATED',
          terminationDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.employee.count({
        where: {
          status: { in: ['ACTIVE', 'ON_LEAVE', 'SUSPENDED'] },
        },
      }),
    ]);

    const turnoverRate = avgEmployees > 0 ? (terminations / avgEmployees) * 100 : 0;

    // Obtener detalles de terminaciones
    const terminatedEmployees = await prisma.employee.findMany({
      where: {
        status: 'TERMINATED',
        terminationDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        hireDate: true,
        terminationDate: true,
        terminationReason: true,
        position: true,
      },
    });

    return {
      year: currentYear,
      hires,
      terminations,
      avgEmployees,
      turnoverRate: parseFloat(turnoverRate.toFixed(2)),
      terminatedEmployees,
    };
  }

  /**
   * Reporte de ausentismo
   */
  async getAbsenteeismReport(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const absences = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        status: { in: ['ABSENT', 'LATE', 'SICK_LEAVE'] },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            position: true,
            departmentId: true,
          },
        },
      },
    });

    // Agrupar por empleado
    const byEmployee = absences.reduce((acc, absence) => {
      const key = absence.employeeId;
      if (!acc[key]) {
        acc[key] = {
          employee: absence.employee,
          absences: 0,
          lates: 0,
          sickLeaves: 0,
          totalDays: 0,
        };
      }

      if (absence.status === 'ABSENT') acc[key].absences++;
      if (absence.status === 'LATE') acc[key].lates++;
      if (absence.status === 'SICK_LEAVE') acc[key].sickLeaves++;
      acc[key].totalDays++;

      return acc;
    }, {});

    const totalEmployees = await prisma.employee.count({
      where: { status: 'ACTIVE' },
    });

    const workDays = this.calculateWorkDays(start, end);
    const absenteeismRate = totalEmployees > 0 && workDays > 0
      ? (absences.length / (totalEmployees * workDays)) * 100
      : 0;

    return {
      period: { start, end },
      workDays,
      totalAbsences: absences.length,
      totalEmployees,
      absenteeismRate: parseFloat(absenteeismRate.toFixed(2)),
      byEmployee: Object.values(byEmployee),
    };
  }

  /**
   * Reporte de costo de personal
   */
  async getPayrollCostReport(year) {
    const currentYear = year || new Date().getFullYear();

    const payrolls = await prisma.payroll.findMany({
      where: {
        year: currentYear,
        status: { in: ['APPROVED', 'PAID', 'CLOSED'] },
      },
      select: {
        id: true,
        month: true,
        period: true,
        totalGross: true,
        totalDeductions: true,
        totalNet: true,
        totalEmployer: true,
      },
      orderBy: { month: 'asc' },
    });

    const byMonth = payrolls.reduce((acc, payroll) => {
      if (!acc[payroll.month]) {
        acc[payroll.month] = {
          month: payroll.month,
          gross: 0,
          deductions: 0,
          net: 0,
          employer: 0,
          total: 0,
        };
      }

      acc[payroll.month].gross += parseFloat(payroll.totalGross);
      acc[payroll.month].deductions += parseFloat(payroll.totalDeductions);
      acc[payroll.month].net += parseFloat(payroll.totalNet);
      acc[payroll.month].employer += parseFloat(payroll.totalEmployer);
      acc[payroll.month].total += parseFloat(payroll.totalGross) + parseFloat(payroll.totalEmployer);

      return acc;
    }, {});

    const totals = Object.values(byMonth).reduce(
      (acc, month) => ({
        gross: acc.gross + month.gross,
        deductions: acc.deductions + month.deductions,
        net: acc.net + month.net,
        employer: acc.employer + month.employer,
        total: acc.total + month.total,
      }),
      { gross: 0, deductions: 0, net: 0, employer: 0, total: 0 }
    );

    return {
      year: currentYear,
      byMonth: Object.values(byMonth),
      totals,
    };
  }

  /**
   * Proyección de jubilaciones
   */
  async getRetirementProjection(years = 5) {
    const today = new Date();
    const retirementAge = 60; // Edad de jubilación

    const employees = await prisma.employee.findMany({
      where: {
        status: { in: ['ACTIVE', 'ON_LEAVE'] },
      },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        hireDate: true,
        position: true,
        departmentId: true,
        currentSalary: true,
      },
    });

    const projections = [];

    for (let i = 0; i < years; i++) {
      const targetYear = today.getFullYear() + i;
      const retiringEmployees = employees.filter(emp => {
        const birthYear = new Date(emp.birthDate).getFullYear();
        const ageInTargetYear = targetYear - birthYear;
        return ageInTargetYear >= retirementAge && ageInTargetYear < retirementAge + 1;
      });

      projections.push({
        year: targetYear,
        count: retiringEmployees.length,
        employees: retiringEmployees.map(emp => ({
          ...emp,
          ageAtRetirement: targetYear - new Date(emp.birthDate).getFullYear(),
          yearsOfService: targetYear - new Date(emp.hireDate).getFullYear(),
        })),
      });
    }

    return {
      retirementAge,
      projectionYears: years,
      projections,
      totalProjected: projections.reduce((sum, p) => sum + p.count, 0),
    };
  }

  /**
   * Certificado de trabajo
   */
  async generateWorkCertificate(employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        position: true,
      },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    const today = new Date();
    const yearsOfService = today.getFullYear() - new Date(employee.hireDate).getFullYear();

    return {
      employee: {
        fullName: `${employee.firstName} ${employee.lastName}`,
        idNumber: employee.idNumber,
        employeeNumber: employee.employeeNumber,
        position: employee.position.name,
        hireDate: employee.hireDate,
        yearsOfService,
        status: employee.status,
      },
      issueDate: today,
      certificateNumber: `CERT-${today.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    };
  }

  /**
   * Constancia de ingresos
   */
  async generateIncomeStatement(employeeId, months = 3) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        position: true,
      },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    // Obtener últimas nóminas
    const payrollDetails = await prisma.payrollDetail.findMany({
      where: {
        employeeId,
        payroll: {
          status: { in: ['APPROVED', 'PAID', 'CLOSED'] },
        },
      },
      include: {
        payroll: true,
        concepts: {
          include: {
            concept: true,
          },
        },
      },
      orderBy: {
        payroll: {
          paymentDate: 'desc',
        },
      },
      take: months,
    });

    const incomes = payrollDetails.map(detail => ({
      period: `${detail.payroll.month}/${detail.payroll.year}`,
      gross: detail.grossPay,
      deductions: detail.totalDeductions,
      net: detail.netPay,
      paymentDate: detail.payroll.paymentDate,
    }));

    const averageIncome = incomes.length > 0
      ? incomes.reduce((sum, inc) => sum + parseFloat(inc.net), 0) / incomes.length
      : 0;

    return {
      employee: {
        fullName: `${employee.firstName} ${employee.lastName}`,
        idNumber: employee.idNumber,
        employeeNumber: employee.employeeNumber,
        position: employee.position.name,
        currentSalary: employee.currentSalary,
      },
      incomes,
      averageIncome,
      issueDate: new Date(),
    };
  }

  /**
   * Calcular días laborables entre dos fechas
   */
  calculateWorkDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // No es domingo ni sábado
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }
}

export default new HRReportsService();
