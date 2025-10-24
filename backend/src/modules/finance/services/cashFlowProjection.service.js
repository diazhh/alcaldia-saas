/**
 * Servicio de Proyección de Flujo de Caja
 * Gestiona proyecciones de ingresos y egresos futuros
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class CashFlowProjectionService {
  /**
   * Crear una proyección de flujo de caja
   */
  async createProjection(data, userId) {
    const {
      year,
      month,
      weekNumber,
      projectedIncome,
      projectedExpense,
      scenario = 'REALISTIC',
      notes,
      assumptions,
    } = data;

    const projectedBalance = projectedIncome - projectedExpense;
    const hasDeficit = projectedBalance < 0;
    const deficitAmount = hasDeficit ? Math.abs(projectedBalance) : null;

    const projection = await prisma.cashFlowProjection.create({
      data: {
        year,
        month,
        weekNumber,
        projectedIncome,
        projectedExpense,
        projectedBalance,
        scenario,
        notes,
        assumptions,
        hasDeficit,
        deficitAmount,
        requiresAction: hasDeficit,
        createdBy: userId,
      },
    });

    return projection;
  }

  /**
   * Generar proyección automática basada en datos históricos
   */
  async generateAutoProjection(year, month, scenario = 'REALISTIC', userId) {
    // Obtener datos históricos de los últimos 3 meses
    const historicalMonths = [];
    for (let i = 1; i <= 3; i++) {
      let histMonth = month - i;
      let histYear = year;
      if (histMonth <= 0) {
        histMonth += 12;
        histYear -= 1;
      }
      historicalMonths.push({ year: histYear, month: histMonth });
    }

    // Calcular ingresos históricos promedio
    const historicalIncomes = await Promise.all(
      historicalMonths.map(({ year, month }) =>
        prisma.income.aggregate({
          where: {
            incomeDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          _sum: { amount: true },
        })
      )
    );

    const avgIncome =
      historicalIncomes.reduce((sum, inc) => sum + (Number(inc._sum.amount) || 0), 0) / 3;

    // Calcular gastos históricos promedio
    const historicalExpenses = await Promise.all(
      historicalMonths.map(({ year, month }) =>
        prisma.transaction.aggregate({
          where: {
            type: 'GASTO',
            status: { in: ['CAUSADO', 'PAGADO'] },
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          _sum: { amount: true },
        })
      )
    );

    const avgExpense =
      historicalExpenses.reduce((sum, exp) => sum + (Number(exp._sum.amount) || 0), 0) / 3;

    // Ajustar según escenario
    let projectedIncome = avgIncome;
    let projectedExpense = avgExpense;

    if (scenario === 'OPTIMISTIC') {
      projectedIncome *= 1.1; // +10% ingresos
      projectedExpense *= 0.95; // -5% gastos
    } else if (scenario === 'PESSIMISTIC') {
      projectedIncome *= 0.9; // -10% ingresos
      projectedExpense *= 1.1; // +10% gastos
    }

    const projectedBalance = projectedIncome - projectedExpense;
    const hasDeficit = projectedBalance < 0;

    const projection = await prisma.cashFlowProjection.create({
      data: {
        year,
        month,
        projectedIncome,
        projectedExpense,
        projectedBalance,
        scenario,
        hasDeficit,
        deficitAmount: hasDeficit ? Math.abs(projectedBalance) : null,
        requiresAction: hasDeficit,
        assumptions: `Proyección automática basada en promedio de últimos 3 meses. Escenario: ${scenario}`,
        createdBy: userId,
      },
    });

    return projection;
  }

  /**
   * Actualizar proyección con valores reales
   */
  async updateWithActuals(id, userId) {
    const projection = await prisma.cashFlowProjection.findUnique({
      where: { id },
    });

    if (!projection) {
      throw new Error('Proyección no encontrada');
    }

    const { year, month } = projection;

    // Calcular ingresos reales del mes
    const actualIncomeData = await prisma.income.aggregate({
      where: {
        incomeDate: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: { amount: true },
    });

    const actualIncome = Number(actualIncomeData._sum.amount) || 0;

    // Calcular gastos reales del mes
    const actualExpenseData = await prisma.transaction.aggregate({
      where: {
        type: 'GASTO',
        status: { in: ['CAUSADO', 'PAGADO'] },
        createdAt: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
      _sum: { amount: true },
    });

    const actualExpense = Number(actualExpenseData._sum.amount) || 0;
    const actualBalance = actualIncome - actualExpense;

    // Calcular variaciones
    const incomeVariance = actualIncome - Number(projection.projectedIncome);
    const expenseVariance = actualExpense - Number(projection.projectedExpense);
    const balanceVariance = actualBalance - Number(projection.projectedBalance);

    const updated = await prisma.cashFlowProjection.update({
      where: { id },
      data: {
        actualIncome,
        actualExpense,
        actualBalance,
        incomeVariance,
        expenseVariance,
        balanceVariance,
        updatedBy: userId,
      },
    });

    return updated;
  }

  /**
   * Obtener proyecciones por período
   */
  async getProjections(filters = {}) {
    const { year, month, scenario, hasDeficit } = filters;

    const where = {};
    if (year) where.year = year;
    if (month) where.month = month;
    if (scenario) where.scenario = scenario;
    if (hasDeficit !== undefined) where.hasDeficit = hasDeficit;

    const projections = await prisma.cashFlowProjection.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return projections;
  }

  /**
   * Obtener proyección por ID
   */
  async getProjectionById(id) {
    const projection = await prisma.cashFlowProjection.findUnique({
      where: { id },
    });

    if (!projection) {
      throw new Error('Proyección no encontrada');
    }

    return projection;
  }

  /**
   * Obtener proyecciones de un año completo
   */
  async getYearProjections(year, scenario = 'REALISTIC') {
    const projections = await prisma.cashFlowProjection.findMany({
      where: { year, scenario },
      orderBy: { month: 'asc' },
    });

    // Si no hay proyecciones para todos los meses, retornar array con nulls
    const monthlyProjections = Array(12).fill(null);
    projections.forEach((proj) => {
      monthlyProjections[proj.month - 1] = proj;
    });

    return monthlyProjections;
  }

  /**
   * Obtener comparación de escenarios
   */
  async getScenarioComparison(year, month) {
    const scenarios = await prisma.cashFlowProjection.findMany({
      where: { year, month },
      orderBy: { scenario: 'asc' },
    });

    return {
      optimistic: scenarios.find((s) => s.scenario === 'OPTIMISTIC') || null,
      realistic: scenarios.find((s) => s.scenario === 'REALISTIC') || null,
      pessimistic: scenarios.find((s) => s.scenario === 'PESSIMISTIC') || null,
    };
  }

  /**
   * Obtener estadísticas de proyecciones
   */
  async getProjectionStats(year) {
    const projections = await prisma.cashFlowProjection.findMany({
      where: { year, scenario: 'REALISTIC' },
    });

    const totalProjectedIncome = projections.reduce(
      (sum, p) => sum + Number(p.projectedIncome),
      0
    );
    const totalProjectedExpense = projections.reduce(
      (sum, p) => sum + Number(p.projectedExpense),
      0
    );
    const totalActualIncome = projections.reduce(
      (sum, p) => sum + (Number(p.actualIncome) || 0),
      0
    );
    const totalActualExpense = projections.reduce(
      (sum, p) => sum + (Number(p.actualExpense) || 0),
      0
    );

    const monthsWithDeficit = projections.filter((p) => p.hasDeficit).length;
    const monthsWithActuals = projections.filter((p) => p.actualIncome !== null).length;

    return {
      totalProjectedIncome,
      totalProjectedExpense,
      totalProjectedBalance: totalProjectedIncome - totalProjectedExpense,
      totalActualIncome,
      totalActualExpense,
      totalActualBalance: totalActualIncome - totalActualExpense,
      monthsWithDeficit,
      monthsWithActuals,
      totalMonths: projections.length,
      accuracy:
        monthsWithActuals > 0
          ? ((totalActualIncome / totalProjectedIncome) * 100).toFixed(2)
          : null,
    };
  }

  /**
   * Actualizar proyección
   */
  async updateProjection(id, data, userId) {
    const projection = await prisma.cashFlowProjection.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });

    return projection;
  }

  /**
   * Eliminar proyección
   */
  async deleteProjection(id) {
    await prisma.cashFlowProjection.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Generar proyecciones para todo un año
   */
  async generateYearProjections(year, scenario = 'REALISTIC', userId) {
    const projections = [];

    for (let month = 1; month <= 12; month++) {
      try {
        const projection = await this.generateAutoProjection(year, month, scenario, userId);
        projections.push(projection);
      } catch (error) {
        console.error(`Error generando proyección para ${year}-${month}:`, error);
      }
    }

    return projections;
  }

  /**
   * Obtener alertas de déficit
   */
  async getDeficitAlerts(year) {
    const alerts = await prisma.cashFlowProjection.findMany({
      where: {
        year,
        hasDeficit: true,
        scenario: 'REALISTIC',
      },
      orderBy: { month: 'asc' },
    });

    return alerts.map((alert) => ({
      id: alert.id,
      month: alert.month,
      year: alert.year,
      deficitAmount: alert.deficitAmount,
      projectedIncome: alert.projectedIncome,
      projectedExpense: alert.projectedExpense,
      requiresAction: alert.requiresAction,
      notes: alert.notes,
    }));
  }
}

export default new CashFlowProjectionService();
