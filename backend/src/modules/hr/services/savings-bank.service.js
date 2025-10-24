import prisma from '../../../config/database.js';

/**
 * Servicio para gestión de Caja de Ahorro
 */
class SavingsBankService {
  /**
   * Crear cuenta de caja de ahorro para un empleado
   */
  async createSavingsAccount(data) {
    const { employeeId, employeeRate, employerRate } = data;

    // Verificar que el empleado existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new Error('Empleado no encontrado');
    }

    // Verificar que no tenga ya una cuenta
    const existing = await prisma.savingsBank.findUnique({
      where: { employeeId },
    });

    if (existing) {
      throw new Error('El empleado ya tiene una cuenta de caja de ahorro');
    }

    return await prisma.savingsBank.create({
      data: {
        employeeId,
        employeeRate,
        employerRate,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Obtener cuenta de caja de ahorro por empleado
   */
  async getSavingsAccountByEmployee(employeeId) {
    return await prisma.savingsBank.findUnique({
      where: { employeeId },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            currentSalary: true,
          },
        },
        contributions: {
          orderBy: { createdAt: 'desc' },
          take: 12, // Últimos 12 meses
        },
        loans: {
          where: {
            status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Listar todas las cuentas de caja de ahorro
   */
  async listSavingsAccounts(filters = {}) {
    const { isActive, search, page = 1, limit = 50 } = filters;

    const where = {};

    if (typeof isActive !== 'undefined') {
      where.isActive = isActive;
    }

    if (search) {
      where.employee = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { employeeNumber: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [accounts, total] = await Promise.all([
      prisma.savingsBank.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
              currentSalary: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.savingsBank.count({ where }),
    ]);

    return {
      accounts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Actualizar tasas de aporte
   */
  async updateRates(employeeId, data) {
    const { employeeRate, employerRate } = data;

    return await prisma.savingsBank.update({
      where: { employeeId },
      data: {
        employeeRate,
        employerRate,
      },
    });
  }

  /**
   * Registrar aporte mensual
   */
  async recordContribution(data) {
    const { savingsBankId, year, month, employeeAmount, employerAmount, payrollId } = data;

    const totalAmount = parseFloat(employeeAmount) + parseFloat(employerAmount);

    // Crear contribución
    const contribution = await prisma.savingsContribution.create({
      data: {
        savingsBankId,
        year,
        month,
        employeeAmount,
        employerAmount,
        totalAmount,
        payrollId,
      },
    });

    // Actualizar saldo de la cuenta
    await prisma.savingsBank.update({
      where: { id: savingsBankId },
      data: {
        totalBalance: { increment: totalAmount },
        availableBalance: { increment: totalAmount },
      },
    });

    return contribution;
  }

  /**
   * Solicitar préstamo
   */
  async requestLoan(data) {
    const { savingsBankId, type, amount, interestRate, installments, purpose } = data;

    // Obtener cuenta de ahorro
    const savingsBank = await prisma.savingsBank.findUnique({
      where: { id: savingsBankId },
    });

    if (!savingsBank) {
      throw new Error('Cuenta de caja de ahorro no encontrada');
    }

    // Verificar saldo disponible
    if (parseFloat(savingsBank.availableBalance) < parseFloat(amount) * 0.5) {
      throw new Error('Saldo insuficiente. Debe tener al menos el 50% del monto solicitado');
    }

    // Calcular cuota mensual
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const installmentAmount = 
      (parseFloat(amount) * monthlyRate * Math.pow(1 + monthlyRate, installments)) /
      (Math.pow(1 + monthlyRate, installments) - 1);

    // Generar número de préstamo
    const year = new Date().getFullYear();
    const count = await prisma.savingsLoan.count();
    const loanNumber = `PRES-${year}-${String(count + 1).padStart(4, '0')}`;

    return await prisma.savingsLoan.create({
      data: {
        savingsBankId,
        loanNumber,
        type,
        amount,
        interestRate,
        installments,
        installmentAmount,
        balance: amount,
        purpose,
        status: 'PENDING',
      },
    });
  }

  /**
   * Aprobar préstamo
   */
  async approveLoan(loanId, approvedBy) {
    const loan = await prisma.savingsLoan.findUnique({
      where: { id: loanId },
      include: { savingsBank: true },
    });

    if (!loan) {
      throw new Error('Préstamo no encontrado');
    }

    if (loan.status !== 'PENDING') {
      throw new Error('El préstamo no está pendiente de aprobación');
    }

    // Actualizar préstamo
    const updatedLoan = await prisma.savingsLoan.update({
      where: { id: loanId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedDate: new Date(),
        firstPaymentDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    // Reducir saldo disponible
    await prisma.savingsBank.update({
      where: { id: loan.savingsBankId },
      data: {
        availableBalance: { decrement: loan.amount },
      },
    });

    return updatedLoan;
  }

  /**
   * Rechazar préstamo
   */
  async rejectLoan(loanId) {
    return await prisma.savingsLoan.update({
      where: { id: loanId },
      data: { status: 'REJECTED' },
    });
  }

  /**
   * Registrar pago de cuota
   */
  async recordLoanPayment(loanId, amount) {
    const loan = await prisma.savingsLoan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new Error('Préstamo no encontrado');
    }

    const newBalance = parseFloat(loan.balance) - parseFloat(amount);
    const newPaidInstallments = loan.paidInstallments + 1;
    const newStatus = newBalance <= 0 ? 'PAID' : 'ACTIVE';

    return await prisma.savingsLoan.update({
      where: { id: loanId },
      data: {
        balance: Math.max(0, newBalance),
        paidInstallments: newPaidInstallments,
        status: newStatus,
      },
    });
  }

  /**
   * Obtener préstamos activos de un empleado
   */
  async getActiveLoans(employeeId) {
    return await prisma.savingsLoan.findMany({
      where: {
        savingsBank: { employeeId },
        status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Estadísticas de caja de ahorro
   */
  async getStatistics() {
    const [totalAccounts, activeAccounts, totalBalance, activeLoans, totalLoaned] = await Promise.all([
      prisma.savingsBank.count(),
      prisma.savingsBank.count({ where: { isActive: true } }),
      prisma.savingsBank.aggregate({
        _sum: { totalBalance: true },
      }),
      prisma.savingsLoan.count({
        where: { status: { in: ['APPROVED', 'ACTIVE'] } },
      }),
      prisma.savingsLoan.aggregate({
        where: { status: { in: ['APPROVED', 'ACTIVE'] } },
        _sum: { balance: true },
      }),
    ]);

    return {
      totalAccounts,
      activeAccounts,
      totalBalance: totalBalance._sum.totalBalance || 0,
      activeLoans,
      totalLoaned: totalLoaned._sum.balance || 0,
    };
  }
}

export default new SavingsBankService();
