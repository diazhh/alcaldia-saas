/**
 * Servicio de Estados Financieros
 * Genera Balance General, Estado de Resultados y otros reportes financieros
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Genera el Balance General (Estado de Situación Financiera)
 * Activos = Pasivos + Patrimonio
 */
async function generateBalanceSheet(date = new Date()) {
  // Obtener todos los movimientos contables hasta la fecha
  const details = await prisma.accountingEntryDetail.findMany({
    where: {
      entry: {
        date: {
          lte: date,
        },
      },
    },
    include: {
      entry: true,
    },
  });

  // Agrupar por cuenta
  const accounts = {};
  
  details.forEach(detail => {
    const accountPrefix = detail.accountCode.charAt(0);
    
    if (!accounts[detail.accountCode]) {
      accounts[detail.accountCode] = {
        code: detail.accountCode,
        name: detail.accountName,
        debit: 0,
        credit: 0,
        balance: 0,
        type: getAccountType(accountPrefix),
      };
    }

    accounts[detail.accountCode].debit += parseFloat(detail.debit);
    accounts[detail.accountCode].credit += parseFloat(detail.credit);
  });

  // Calcular balances
  Object.values(accounts).forEach(account => {
    // Para activos y gastos: balance = debe - haber
    // Para pasivos, patrimonio e ingresos: balance = haber - debe
    if (account.type === 'ACTIVO' || account.type === 'GASTO') {
      account.balance = account.debit - account.credit;
    } else {
      account.balance = account.credit - account.debit;
    }
  });

  // Clasificar cuentas
  const activos = Object.values(accounts).filter(a => a.type === 'ACTIVO');
  const pasivos = Object.values(accounts).filter(a => a.type === 'PASIVO');
  const patrimonio = Object.values(accounts).filter(a => a.type === 'PATRIMONIO');

  // Calcular totales
  const totalActivos = activos.reduce((sum, a) => sum + a.balance, 0);
  const totalPasivos = pasivos.reduce((sum, a) => sum + a.balance, 0);
  const totalPatrimonio = patrimonio.reduce((sum, a) => sum + a.balance, 0);

  return {
    date,
    activos: {
      accounts: activos,
      total: totalActivos,
    },
    pasivos: {
      accounts: pasivos,
      total: totalPasivos,
    },
    patrimonio: {
      accounts: patrimonio,
      total: totalPatrimonio,
    },
    totalPasivosPatrimonio: totalPasivos + totalPatrimonio,
    balanced: Math.abs(totalActivos - (totalPasivos + totalPatrimonio)) < 0.01,
  };
}

/**
 * Genera el Estado de Resultados (Ingresos - Gastos)
 */
async function generateIncomeStatement(startDate, endDate = new Date()) {
  const details = await prisma.accountingEntryDetail.findMany({
    where: {
      entry: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      entry: true,
    },
  });

  // Agrupar por cuenta
  const accounts = {};
  
  details.forEach(detail => {
    const accountPrefix = detail.accountCode.charAt(0);
    
    // Solo procesar cuentas de ingresos (4) y gastos (5)
    if (accountPrefix !== '4' && accountPrefix !== '5') {
      return;
    }

    if (!accounts[detail.accountCode]) {
      accounts[detail.accountCode] = {
        code: detail.accountCode,
        name: detail.accountName,
        debit: 0,
        credit: 0,
        balance: 0,
        type: getAccountType(accountPrefix),
      };
    }

    accounts[detail.accountCode].debit += parseFloat(detail.debit);
    accounts[detail.accountCode].credit += parseFloat(detail.credit);
  });

  // Calcular balances
  Object.values(accounts).forEach(account => {
    if (account.type === 'INGRESO') {
      account.balance = account.credit - account.debit;
    } else if (account.type === 'GASTO') {
      account.balance = account.debit - account.credit;
    }
  });

  // Clasificar cuentas
  const ingresos = Object.values(accounts).filter(a => a.type === 'INGRESO');
  const gastos = Object.values(accounts).filter(a => a.type === 'GASTO');

  // Calcular totales
  const totalIngresos = ingresos.reduce((sum, a) => sum + a.balance, 0);
  const totalGastos = gastos.reduce((sum, a) => sum + a.balance, 0);
  const resultadoNeto = totalIngresos - totalGastos;

  return {
    period: {
      startDate,
      endDate,
    },
    ingresos: {
      accounts: ingresos,
      total: totalIngresos,
    },
    gastos: {
      accounts: gastos,
      total: totalGastos,
    },
    resultadoNeto,
    type: resultadoNeto >= 0 ? 'SUPERAVIT' : 'DEFICIT',
  };
}

/**
 * Genera el Estado de Flujo de Efectivo
 */
async function generateCashFlowStatement(startDate, endDate = new Date()) {
  // Obtener movimientos de cuentas bancarias
  const bankMovements = await prisma.accountingEntryDetail.findMany({
    where: {
      accountCode: {
        startsWith: '1.1.1', // Cuentas de bancos
      },
      entry: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      entry: true,
    },
    orderBy: {
      entry: {
        date: 'asc',
      },
    },
  });

  // Calcular saldo inicial
  const previousMovements = await prisma.accountingEntryDetail.findMany({
    where: {
      accountCode: {
        startsWith: '1.1.1',
      },
      entry: {
        date: {
          lt: startDate,
        },
      },
    },
  });

  const saldoInicial = previousMovements.reduce(
    (sum, m) => sum + parseFloat(m.debit) - parseFloat(m.credit),
    0
  );

  // Clasificar movimientos
  const ingresos = [];
  const egresos = [];

  bankMovements.forEach(movement => {
    const amount = parseFloat(movement.debit) - parseFloat(movement.credit);
    
    if (amount > 0) {
      ingresos.push({
        date: movement.entry.date,
        description: movement.entry.description,
        amount: amount,
      });
    } else if (amount < 0) {
      egresos.push({
        date: movement.entry.date,
        description: movement.entry.description,
        amount: Math.abs(amount),
      });
    }
  });

  const totalIngresos = ingresos.reduce((sum, i) => sum + i.amount, 0);
  const totalEgresos = egresos.reduce((sum, e) => sum + e.amount, 0);
  const saldoFinal = saldoInicial + totalIngresos - totalEgresos;

  return {
    period: {
      startDate,
      endDate,
    },
    saldoInicial,
    ingresos: {
      movements: ingresos,
      total: totalIngresos,
    },
    egresos: {
      movements: egresos,
      total: totalEgresos,
    },
    flujoNeto: totalIngresos - totalEgresos,
    saldoFinal,
  };
}

/**
 * Genera análisis de ejecución presupuestaria
 */
async function generateBudgetExecutionAnalysis(year) {
  const budget = await prisma.budget.findUnique({
    where: { year },
    include: {
      items: {
        include: {
          transactions: true,
        },
      },
    },
  });

  if (!budget) {
    throw new Error(`No se encontró presupuesto para el año ${year}`);
  }

  const analysis = budget.items.map(item => {
    const executed = parseFloat(item.paidAmount);
    const allocated = parseFloat(item.allocatedAmount);
    const available = parseFloat(item.availableAmount);
    const committed = parseFloat(item.committedAmount);
    const accrued = parseFloat(item.accruedAmount);

    return {
      code: item.code,
      name: item.name,
      allocated,
      committed,
      accrued,
      paid: executed,
      available,
      executionRate: allocated > 0 ? (executed / allocated) * 100 : 0,
      commitmentRate: allocated > 0 ? (committed / allocated) * 100 : 0,
    };
  });

  // Calcular totales
  const totals = analysis.reduce(
    (acc, item) => ({
      allocated: acc.allocated + item.allocated,
      committed: acc.committed + item.committed,
      accrued: acc.accrued + item.accrued,
      paid: acc.paid + item.paid,
      available: acc.available + item.available,
    }),
    { allocated: 0, committed: 0, accrued: 0, paid: 0, available: 0 }
  );

  totals.executionRate = totals.allocated > 0 ? (totals.paid / totals.allocated) * 100 : 0;
  totals.commitmentRate = totals.allocated > 0 ? (totals.committed / totals.allocated) * 100 : 0;

  return {
    year,
    budget: {
      id: budget.id,
      status: budget.status,
      totalAmount: parseFloat(budget.totalAmount),
    },
    items: analysis,
    totals,
  };
}

/**
 * Determina el tipo de cuenta según el prefijo
 */
function getAccountType(prefix) {
  switch (prefix) {
    case '1':
      return 'ACTIVO';
    case '2':
      return 'PASIVO';
    case '3':
      return 'PATRIMONIO';
    case '4':
      return 'INGRESO';
    case '5':
      return 'GASTO';
    case '6':
      return 'COSTO';
    case '7':
      return 'RESULTADO';
    case '8':
    case '9':
      return 'ORDEN';
    default:
      return 'OTRO';
  }
}

export {
  generateBalanceSheet,
  generateIncomeStatement,
  generateCashFlowStatement,
  generateBudgetExecutionAnalysis,
};
