import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de gestión de nómina
 */



/**
 * Obtener todas las nóminas
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>}
 */
async function getAllPayrolls(filters = {}) {
  const { year, month, status, page = 1, limit = 20 } = filters;
  
  const skip = (page - 1) * limit;
  const where = {};
  
  if (year) {
    where.year = parseInt(year);
  }
  
  if (month) {
    where.month = parseInt(month);
  }
  
  if (status) {
    where.status = status;
  }
  
  const [payrolls, total] = await Promise.all([
    prisma.payroll.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        _count: {
          select: {
            details: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { periodNumber: 'desc' },
      ],
    }),
    prisma.payroll.count({ where }),
  ]);
  
  return {
    data: payrolls,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtener una nómina por ID
 * @param {string} id - ID de la nómina
 * @returns {Promise<Object>}
 */
async function getPayrollById(id) {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      details: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeNumber: true,
              idNumber: true,
            },
          },
          concepts: {
            include: {
              concept: true,
            },
          },
        },
      },
    },
  });
  
  if (!payroll) {
    throw new AppError('Nómina no encontrada', 404);
  }
  
  return payroll;
}

/**
 * Crear una nueva nómina
 * @param {Object} data - Datos de la nómina
 * @returns {Promise<Object>}
 */
async function createPayroll(data) {
  // Verificar que no exista una nómina para el mismo período
  const existingPayroll = await prisma.payroll.findFirst({
    where: {
      year: data.year,
      month: data.month,
      period: data.period,
      periodNumber: data.periodNumber,
    },
  });
  
  if (existingPayroll) {
    throw new AppError('Ya existe una nómina para este período', 400);
  }
  
  // Generar referencia única
  const reference = `NOM-${data.year}-${String(data.month).padStart(2, '0')}-${data.period === 'BIWEEKLY' ? `Q${data.periodNumber}` : 'M'}`;
  
  const payrollData = {
    ...data,
    reference,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    paymentDate: new Date(data.paymentDate),
  };
  
  const payroll = await prisma.payroll.create({
    data: payrollData,
  });
  
  return payroll;
}

/**
 * Calcular nómina
 * @param {string} id - ID de la nómina
 * @returns {Promise<Object>}
 */
async function calculatePayroll(id) {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
  });
  
  if (!payroll) {
    throw new AppError('Nómina no encontrada', 404);
  }
  
  if (payroll.status !== 'DRAFT') {
    throw new AppError('Solo se pueden calcular nóminas en estado borrador', 400);
  }
  
  // Obtener empleados activos
  const employees = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      position: true,
    },
  });
  
  // Obtener conceptos de nómina activos
  const concepts = await prisma.payrollConcept.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
  });
  
  // Obtener asistencias del período
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: payroll.startDate,
        lte: payroll.endDate,
      },
    },
  });
  
  // Agrupar asistencias por empleado
  const attendanceByEmployee = {};
  attendances.forEach(att => {
    if (!attendanceByEmployee[att.employeeId]) {
      attendanceByEmployee[att.employeeId] = [];
    }
    attendanceByEmployee[att.employeeId].push(att);
  });
  
  // Calcular días del período
  const periodDays = Math.ceil((payroll.endDate - payroll.startDate) / (1000 * 60 * 60 * 24)) + 1;
  const workDays = payroll.period === 'BIWEEKLY' ? 15 : 30;
  
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;
  let totalEmployer = 0;
  
  // Procesar cada empleado
  for (const employee of employees) {
    const empAttendances = attendanceByEmployee[employee.id] || [];
    
    // Calcular días trabajados
    const workedDays = empAttendances.filter(a => 
      ['PRESENT', 'LATE', 'VACATION', 'LEAVE'].includes(a.status)
    ).length;
    
    const absentDays = empAttendances.filter(a => a.status === 'ABSENT').length;
    const vacationDays = empAttendances.filter(a => a.status === 'VACATION').length;
    
    // Crear detalle de nómina
    const payrollDetail = await prisma.payrollDetail.create({
      data: {
        payrollId: payroll.id,
        employeeId: employee.id,
        employeeNumber: employee.employeeNumber,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        position: employee.position.name,
        department: employee.departmentId || '',
        workedDays,
        absentDays,
        vacationDays,
        grossSalary: 0,
        totalDeductions: 0,
        netSalary: 0,
        employerCost: 0,
      },
    });
    
    let grossSalary = 0;
    let deductions = 0;
    let employerCost = 0;
    
    // Aplicar conceptos
    for (const concept of concepts) {
      let amount = 0;
      let baseAmount = employee.currentSalary;
      
      // Calcular monto según tipo de cálculo
      if (concept.calculationType === 'FIXED') {
        amount = concept.value || 0;
      } else if (concept.calculationType === 'PERCENTAGE') {
        const rate = (concept.value || 0) / 100;
        amount = baseAmount * rate;
      } else if (concept.calculationType === 'FORMULA') {
        // Aquí se implementaría la evaluación de fórmulas personalizadas
        // Por ahora, usar valor fijo
        amount = concept.value || 0;
      }
      
      // Ajustar por días trabajados si aplica
      if (workedDays < workDays && concept.code === 'SUEL-BASE') {
        amount = (amount / workDays) * workedDays;
      }
      
      // Crear concepto en el detalle
      await prisma.payrollDetailConcept.create({
        data: {
          payrollDetailId: payrollDetail.id,
          conceptId: concept.id,
          conceptCode: concept.code,
          conceptName: concept.name,
          conceptType: concept.type,
          baseAmount,
          rate: concept.calculationType === 'PERCENTAGE' ? concept.value : null,
          amount,
        },
      });
      
      // Acumular según tipo
      if (concept.type === 'ASSIGNMENT') {
        grossSalary += amount;
      } else if (concept.type === 'DEDUCTION') {
        deductions += amount;
      } else if (concept.type === 'EMPLOYER') {
        employerCost += amount;
      }
    }
    
    const netSalary = grossSalary - deductions;
    
    // Actualizar detalle
    await prisma.payrollDetail.update({
      where: { id: payrollDetail.id },
      data: {
        grossSalary,
        totalDeductions: deductions,
        netSalary,
        employerCost,
        status: 'CALCULATED',
      },
    });
    
    totalGross += grossSalary;
    totalDeductions += deductions;
    totalNet += netSalary;
    totalEmployer += employerCost;
  }
  
  // Actualizar totales de la nómina
  const updatedPayroll = await prisma.payroll.update({
    where: { id },
    data: {
      totalGross,
      totalDeductions,
      totalNet,
      totalEmployer,
      status: 'CALCULATED',
    },
    include: {
      details: {
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
      },
    },
  });
  
  return updatedPayroll;
}

/**
 * Aprobar nómina
 * @param {string} id - ID de la nómina
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<Object>}
 */
async function approvePayroll(id, userId) {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
  });
  
  if (!payroll) {
    throw new AppError('Nómina no encontrada', 404);
  }
  
  if (payroll.status !== 'CALCULATED') {
    throw new AppError('Solo se pueden aprobar nóminas calculadas', 400);
  }
  
  const updatedPayroll = await prisma.payroll.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    },
  });
  
  // Actualizar estado de los detalles
  await prisma.payrollDetail.updateMany({
    where: { payrollId: id },
    data: {
      status: 'APPROVED',
    },
  });
  
  return updatedPayroll;
}

/**
 * Exportar nómina a formato TXT bancario
 * @param {string} id - ID de la nómina
 * @returns {Promise<string>}
 */
async function exportPayroll(id) {
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      details: {
        include: {
          employee: true,
        },
        where: {
          status: { in: ['APPROVED', 'PAID'] },
        },
      },
    },
  });
  
  if (!payroll) {
    throw new AppError('Nómina no encontrada', 404);
  }
  
  if (payroll.status !== 'APPROVED' && payroll.status !== 'PAID') {
    throw new AppError('Solo se pueden exportar nóminas aprobadas', 400);
  }
  
  // Generar archivo TXT para banco
  // Formato: CEDULA|CUENTA|MONTO|NOMBRE
  let txtContent = '';
  
  payroll.details.forEach(detail => {
    const employee = detail.employee;
    const line = [
      employee.idNumber.replace(/\D/g, ''), // Solo números de cédula
      employee.bankAccount || '',
      detail.netSalary.toFixed(2),
      `${employee.firstName} ${employee.lastName}`.toUpperCase(),
    ].join('|');
    
    txtContent += line + '\n';
  });
  
  return txtContent;
}

export {
  getAllPayrolls,
  getPayrollById,
  createPayroll,
  calculatePayroll,
  approvePayroll,
  exportPayroll,
};
