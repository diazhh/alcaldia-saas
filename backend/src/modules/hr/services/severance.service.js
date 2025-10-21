import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Servicio de gestión de prestaciones sociales
 */



/**
 * Obtener prestaciones sociales de un empleado
 * @param {string} employeeId - ID del empleado
 * @returns {Promise<Object>}
 */
async function getSeveranceByEmployee(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  const severancePayments = await prisma.severancePayment.findMany({
    where: { employeeId },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ],
  });
  
  // Calcular totales
  const totalAmount = severancePayments.reduce((sum, sp) => sum + parseFloat(sp.amount), 0);
  const totalInterest = severancePayments.reduce((sum, sp) => sum + parseFloat(sp.interest), 0);
  const grandTotal = severancePayments.reduce((sum, sp) => sum + parseFloat(sp.totalAmount), 0);
  
  return {
    employee: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNumber: employee.employeeNumber,
      hireDate: employee.hireDate,
    },
    payments: severancePayments,
    summary: {
      totalAmount,
      totalInterest,
      grandTotal,
      paymentsCount: severancePayments.length,
    },
  };
}

/**
 * Calcular prestaciones sociales mensuales para todos los empleados activos
 * @param {number} year - Año
 * @param {number} month - Mes
 * @returns {Promise<Object>}
 */
async function calculateMonthlySeverance(year, month) {
  // Obtener empleados activos
  const employees = await prisma.employee.findMany({
    where: {
      status: 'ACTIVE',
      hireDate: {
        lt: new Date(year, month, 1), // Contratados antes del mes actual
      },
    },
  });
  
  const results = [];
  
  for (const employee of employees) {
    // Calcular años de servicio
    const hireDate = new Date(employee.hireDate);
    const currentDate = new Date(year, month - 1, 1);
    const yearsOfService = (currentDate - hireDate) / (365.25 * 24 * 60 * 60 * 1000);
    
    // Calcular días según ley venezolana
    // Primer año: 5 días por mes
    // Después del primer año: 2 días adicionales por mes
    let daysAccrued = 5; // Base
    if (yearsOfService > 1) {
      daysAccrued = 5 + 2; // 7 días por mes después del primer año
    }
    
    // Calcular monto
    const dailySalary = parseFloat(employee.currentSalary) / 30;
    const amount = dailySalary * daysAccrued;
    
    // Calcular intereses (tasa anual según ley, ejemplo 12%)
    const interestRate = 0.12 / 12; // Mensual
    const previousBalance = await getPreviousBalance(employee.id, year, month);
    const interest = previousBalance * interestRate;
    
    const totalAmount = amount + interest;
    
    // Verificar si ya existe el registro
    const existing = await prisma.severancePayment.findUnique({
      where: {
        employeeId_year_month_type: {
          employeeId: employee.id,
          year,
          month,
          type: 'MONTHLY',
        },
      },
    });
    
    if (!existing) {
      const severancePayment = await prisma.severancePayment.create({
        data: {
          employeeId: employee.id,
          year,
          month,
          baseSalary: employee.currentSalary,
          daysAccrued,
          amount,
          interest,
          totalAmount,
          type: 'MONTHLY',
        },
      });
      
      results.push(severancePayment);
    }
  }
  
  return {
    year,
    month,
    processedEmployees: results.length,
    totalAmount: results.reduce((sum, sp) => sum + parseFloat(sp.totalAmount), 0),
  };
}

/**
 * Obtener balance anterior de prestaciones
 * @param {string} employeeId - ID del empleado
 * @param {number} year - Año actual
 * @param {number} month - Mes actual
 * @returns {Promise<number>}
 */
async function getPreviousBalance(employeeId, year, month) {
  const payments = await prisma.severancePayment.findMany({
    where: {
      employeeId,
      OR: [
        { year: { lt: year } },
        {
          AND: [
            { year: year },
            { month: { lt: month } },
          ],
        },
      ],
      type: { in: ['MONTHLY', 'ADVANCE'] },
    },
  });
  
  const total = payments.reduce((sum, sp) => {
    if (sp.type === 'MONTHLY') {
      return sum + parseFloat(sp.totalAmount);
    } else if (sp.type === 'ADVANCE') {
      return sum - parseFloat(sp.amount); // Restar anticipos
    }
    return sum;
  }, 0);
  
  return total;
}

/**
 * Liquidar prestaciones sociales de un empleado
 * @param {string} employeeId - ID del empleado
 * @returns {Promise<Object>}
 */
async function liquidateSeverance(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });
  
  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }
  
  if (employee.status === 'ACTIVE') {
    throw new AppError('No se puede liquidar prestaciones de un empleado activo', 400);
  }
  
  // Calcular balance total
  const currentDate = new Date();
  const balance = await getPreviousBalance(
    employeeId,
    currentDate.getFullYear(),
    currentDate.getMonth() + 1
  );
  
  // Calcular días adicionales desde último pago hasta fecha de terminación
  const terminationDate = employee.terminationDate || new Date();
  const lastPayment = await prisma.severancePayment.findFirst({
    where: {
      employeeId,
      type: 'MONTHLY',
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ],
  });
  
  let additionalAmount = 0;
  if (lastPayment) {
    const lastPaymentDate = new Date(lastPayment.year, lastPayment.month - 1, 1);
    const daysSinceLastPayment = Math.floor(
      (terminationDate - lastPaymentDate) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastPayment > 0) {
      const dailySalary = parseFloat(employee.currentSalary) / 30;
      const daysPerMonth = 7; // Después del primer año
      additionalAmount = (dailySalary * daysPerMonth * daysSinceLastPayment) / 30;
    }
  }
  
  const totalLiquidation = balance + additionalAmount;
  
  // Crear registro de liquidación
  const liquidation = await prisma.severancePayment.create({
    data: {
      employeeId,
      year: terminationDate.getFullYear(),
      month: terminationDate.getMonth() + 1,
      baseSalary: employee.currentSalary,
      daysAccrued: 0,
      amount: totalLiquidation,
      interest: 0,
      totalAmount: totalLiquidation,
      type: 'SETTLEMENT',
      notes: `Liquidación final - Fecha de egreso: ${terminationDate.toISOString().split('T')[0]}`,
    },
  });
  
  return {
    employee: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNumber: employee.employeeNumber,
    },
    liquidation,
    previousBalance: balance,
    additionalAmount,
    totalLiquidation,
  };
}

export {
  getSeveranceByEmployee,
  calculateMonthlySeverance,
  liquidateSeverance,
};
