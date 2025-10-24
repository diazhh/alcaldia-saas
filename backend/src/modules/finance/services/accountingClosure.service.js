/**
 * Servicio de Cierre Contable
 * Gestiona el cierre mensual y anual de períodos contables
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class AccountingClosureService {
  /**
   * Verificar si un período está cerrado
   */
  async isPeriodClosed(year, month = null) {
    const where = { year };
    if (month !== null) {
      where.month = month;
    }

    const closure = await prisma.accountingClosure.findFirst({
      where,
    });

    return closure?.status === 'CLOSED';
  }

  /**
   * Validar pre-cierre
   */
  async validatePreClosure(year, month = null) {
    const errors = [];

    // Verificar que no haya transacciones sin procesar
    const pendingTransactions = await prisma.transaction.count({
      where: {
        status: 'COMPROMISO',
        createdAt: {
          gte: new Date(year, month ? month - 1 : 0, 1),
          lt: new Date(year, month ? month : 12, month ? 1 : 31),
        },
      },
    });

    if (pendingTransactions > 0) {
      errors.push(`Hay ${pendingTransactions} transacciones comprometidas sin causar`);
    }

    // Verificar conciliaciones bancarias
    const whereReconciliation = {
      status: { not: 'APPROVED' },
      periodStart: {
        gte: new Date(year, month ? month - 1 : 0, 1),
      },
      periodEnd: {
        lt: new Date(year, month ? month : 12, month ? 1 : 31),
      },
    };
    
    const unconciled = await prisma.bankReconciliation.count({
      where: whereReconciliation,
    });

    if (unconciled > 0) {
      errors.push(`Hay ${unconciled} conciliaciones bancarias sin aprobar`);
    }

    // Verificar balance de comprobación
    const entries = await prisma.accountingEntry.findMany({
      where: {
        date: {
          gte: new Date(year, month ? month - 1 : 0, 1),
          lt: new Date(year, month ? month : 12, month ? 1 : 31),
        },
      },
      include: {
        details: true,
      },
    });

    let totalDebit = 0;
    let totalCredit = 0;

    entries.forEach((entry) => {
      entry.details.forEach((detail) => {
        totalDebit += Number(detail.debit);
        totalCredit += Number(detail.credit);
      });
    });

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      errors.push(`El balance de comprobación no cuadra: Debe ${totalDebit} vs Haber ${totalCredit}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * Crear asientos de cierre
   */
  async createClosingEntries(year, month = null, userId) {
    const closingEntries = [];

    // Obtener cuentas de resultados (ingresos y gastos)
    const incomeAccounts = await prisma.accountingEntry.findMany({
      where: {
        date: {
          gte: new Date(year, month ? month - 1 : 0, 1),
          lt: new Date(year, month ? month : 12, month ? 1 : 31),
        },
      },
      include: {
        details: {
          where: {
            accountCode: {
              startsWith: '4', // Cuentas de ingresos
            },
          },
        },
      },
    });

    const expenseAccounts = await prisma.accountingEntry.findMany({
      where: {
        date: {
          gte: new Date(year, month ? month - 1 : 0, 1),
          lt: new Date(year, month ? month : 12, month ? 1 : 31),
        },
      },
      include: {
        details: {
          where: {
            accountCode: {
              startsWith: '5', // Cuentas de gastos
            },
          },
        },
      },
    });

    // Calcular totales
    let totalIncome = 0;
    let totalExpense = 0;

    incomeAccounts.forEach((entry) => {
      entry.details.forEach((detail) => {
        totalIncome += Number(detail.credit) - Number(detail.debit);
      });
    });

    expenseAccounts.forEach((entry) => {
      entry.details.forEach((detail) => {
        totalExpense += Number(detail.debit) - Number(detail.credit);
      });
    });

    const result = totalIncome - totalExpense;

    // Crear asiento de cierre de ingresos
    if (totalIncome > 0) {
      const incomeClosingEntry = await prisma.accountingEntry.create({
        data: {
          date: new Date(year, month ? month : 11, month ? new Date(year, month, 0).getDate() : 31),
          description: `Cierre de cuentas de ingresos ${month ? `mes ${month}` : `año ${year}`}`,
          type: 'CIERRE',
          createdBy: userId,
          details: {
            create: [
              {
                accountCode: '4.00.00.00.00', // Cuenta de ingresos
                accountName: 'Ingresos',
                debit: totalIncome,
                credit: 0,
              },
              {
                accountCode: '3.03.00.00.00', // Resultado del ejercicio
                accountName: 'Resultado del Ejercicio',
                debit: 0,
                credit: totalIncome,
              },
            ],
          },
        },
      });
      closingEntries.push(incomeClosingEntry);
    }

    // Crear asiento de cierre de gastos
    if (totalExpense > 0) {
      const expenseClosingEntry = await prisma.accountingEntry.create({
        data: {
          date: new Date(year, month ? month : 11, month ? new Date(year, month, 0).getDate() : 31),
          description: `Cierre de cuentas de gastos ${month ? `mes ${month}` : `año ${year}`}`,
          type: 'CIERRE',
          createdBy: userId,
          details: {
            create: [
              {
                accountCode: '3.03.00.00.00', // Resultado del ejercicio
                accountName: 'Resultado del Ejercicio',
                debit: totalExpense,
                credit: 0,
              },
              {
                accountCode: '5.00.00.00.00', // Cuenta de gastos
                accountName: 'Gastos',
                debit: 0,
                credit: totalExpense,
              },
            ],
          },
        },
      });
      closingEntries.push(expenseClosingEntry);
    }

    return {
      closingEntries,
      totalIncome,
      totalExpense,
      result,
    };
  }

  /**
   * Cerrar período mensual
   */
  async closeMonth(year, month, userId) {
    // Verificar que el mes no esté ya cerrado
    const isClosed = await this.isPeriodClosed(year, month);
    if (isClosed) {
      throw new Error('El período ya está cerrado');
    }

    // Validar pre-cierre
    const validation = await this.validatePreClosure(year, month);
    if (!validation.isValid) {
      throw new Error(`No se puede cerrar el período: ${validation.errors.join(', ')}`);
    }

    // Crear asientos de cierre
    const { closingEntries, totalIncome, totalExpense, result } = await this.createClosingEntries(
      year,
      month,
      userId
    );

    // Crear registro de cierre
    const closure = await prisma.accountingClosure.create({
      data: {
        year,
        month,
        type: 'MONTHLY',
        status: 'CLOSED',
        closedBy: userId,
        closedAt: new Date(),
        totalIncome,
        totalExpense,
        result,
        notes: `Cierre mensual ${month}/${year}`,
      },
    });

    return {
      closure,
      closingEntries,
      validation,
    };
  }

  /**
   * Cerrar período anual
   */
  async closeYear(year, userId) {
    // Verificar que el año no esté ya cerrado
    const isClosed = await this.isPeriodClosed(year);
    if (isClosed) {
      throw new Error('El año ya está cerrado');
    }

    // Verificar que todos los meses estén cerrados
    const monthsClosures = await prisma.accountingClosure.findMany({
      where: {
        year,
        type: 'MONTHLY',
      },
    });

    if (monthsClosures.length < 12) {
      throw new Error('Todos los meses deben estar cerrados antes de cerrar el año');
    }

    const unclosedMonths = monthsClosures.filter((c) => c.status !== 'CLOSED');
    if (unclosedMonths.length > 0) {
      throw new Error('Todos los meses deben estar cerrados antes de cerrar el año');
    }

    // Validar pre-cierre
    const validation = await this.validatePreClosure(year);
    if (!validation.isValid) {
      throw new Error(`No se puede cerrar el año: ${validation.errors.join(', ')}`);
    }

    // Crear asientos de cierre anual
    const { closingEntries, totalIncome, totalExpense, result } = await this.createClosingEntries(
      year,
      null,
      userId
    );

    // Cerrar presupuesto del año
    const budget = await prisma.budget.findFirst({
      where: { year },
    });

    if (budget && budget.status === 'ACTIVE') {
      await prisma.budget.update({
        where: { id: budget.id },
        data: { status: 'CLOSED' },
      });
    }

    // Crear registro de cierre anual
    const closure = await prisma.accountingClosure.create({
      data: {
        year,
        month: null,
        type: 'ANNUAL',
        status: 'CLOSED',
        closedBy: userId,
        closedAt: new Date(),
        totalIncome,
        totalExpense,
        result,
        notes: `Cierre anual ${year}`,
      },
    });

    return {
      closure,
      closingEntries,
      validation,
      budgetClosed: !!budget,
    };
  }

  /**
   * Reabrir período (solo para correcciones)
   */
  async reopenPeriod(closureId, reason, userId) {
    const closure = await prisma.accountingClosure.findUnique({
      where: { id: closureId },
    });

    if (!closure) {
      throw new Error('Cierre no encontrado');
    }

    if (closure.status !== 'CLOSED') {
      throw new Error('El período no está cerrado');
    }

    // Actualizar estado
    const updated = await prisma.accountingClosure.update({
      where: { id: closureId },
      data: {
        status: 'REOPENED',
        reopenedBy: userId,
        reopenedAt: new Date(),
        reopenReason: reason,
      },
    });

    return updated;
  }

  /**
   * Obtener cierres
   */
  async getClosures(filters = {}) {
    const { year, type, status } = filters;

    const where = {};
    if (year) where.year = parseInt(year);
    if (type) where.type = type;
    if (status) where.status = status;

    const closures = await prisma.accountingClosure.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return closures;
  }

  /**
   * Obtener cierre por ID
   */
  async getClosureById(id) {
    const closure = await prisma.accountingClosure.findUnique({
      where: { id },
    });

    if (!closure) {
      throw new Error('Cierre no encontrado');
    }

    return closure;
  }

  /**
   * Obtener estadísticas de cierre
   */
  async getClosureStats(year) {
    const closures = await prisma.accountingClosure.findMany({
      where: { year: parseInt(year) },
    });

    const monthsClosed = closures.filter((c) => c.type === 'MONTHLY' && c.status === 'CLOSED').length;
    const yearClosed = closures.some((c) => c.type === 'ANNUAL' && c.status === 'CLOSED');

    const totalIncome = closures.reduce((sum, c) => sum + Number(c.totalIncome || 0), 0);
    const totalExpense = closures.reduce((sum, c) => sum + Number(c.totalExpense || 0), 0);
    const totalResult = closures.reduce((sum, c) => sum + Number(c.result || 0), 0);

    return {
      monthsClosed,
      monthsPending: 12 - monthsClosed,
      yearClosed,
      totalIncome,
      totalExpense,
      totalResult,
      closures,
    };
  }
}

export default new AccountingClosureService();
