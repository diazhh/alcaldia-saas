/**
 * Servicio de Contabilidad
 * Maneja asientos contables automáticos siguiendo el Plan de Cuentas Nacional
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Plan de Cuentas simplificado (basado en normativa venezolana)
 */
const CHART_OF_ACCOUNTS = {
  // ACTIVOS
  BANCO: { code: '1.1.1.01', name: 'Bancos' },
  CUENTAS_POR_COBRAR: { code: '1.2.1.01', name: 'Cuentas por Cobrar' },
  
  // PASIVOS
  CUENTAS_POR_PAGAR: { code: '2.1.1.01', name: 'Cuentas por Pagar' },
  PRESUPUESTO_COMPROMETIDO: { code: '2.1.2.01', name: 'Presupuesto Comprometido' },
  
  // PATRIMONIO
  PATRIMONIO: { code: '3.1.1.01', name: 'Patrimonio Municipal' },
  
  // INGRESOS
  SITUADO: { code: '4.1.1.01', name: 'Situado Constitucional' },
  TRIBUTOS: { code: '4.1.2.01', name: 'Tributos Municipales' },
  OTROS_INGRESOS: { code: '4.1.9.01', name: 'Otros Ingresos' },
  
  // GASTOS
  GASTOS_PERSONAL: { code: '5.1.1.01', name: 'Gastos de Personal' },
  GASTOS_OPERACION: { code: '5.1.2.01', name: 'Gastos de Operación' },
  GASTOS_INVERSION: { code: '5.1.3.01', name: 'Gastos de Inversión' },
  
  // CUENTAS DE ORDEN
  PRESUPUESTO_APROBADO: { code: '8.1.1.01', name: 'Presupuesto Aprobado' },
  PRESUPUESTO_EJECUTADO: { code: '8.1.2.01', name: 'Presupuesto Ejecutado' },
};

/**
 * Genera número de asiento contable secuencial
 */
async function generateEntryNumber() {
  const year = new Date().getFullYear();
  const lastEntry = await prisma.accountingEntry.findFirst({
    where: {
      entryNumber: {
        startsWith: `AST-${year}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let sequence = 1;
  if (lastEntry) {
    const lastNumber = parseInt(lastEntry.entryNumber.split('-')[2]);
    sequence = lastNumber + 1;
  }

  return `AST-${year}-${sequence.toString().padStart(6, '0')}`;
}

/**
 * Crea un asiento contable
 * @param {Object} data - Datos del asiento
 * @param {string} data.description - Descripción del asiento
 * @param {Array} data.details - Detalles del asiento (debe/haber)
 * @param {string} data.createdBy - Usuario que crea el asiento
 * @param {string} data.transactionId - ID de transacción relacionada
 * @param {string} data.incomeId - ID de ingreso relacionado
 */
async function createAccountingEntry(data) {
  const { description, details, createdBy, transactionId, incomeId, reference } = data;

  // Validar que el asiento esté balanceado
  const totalDebit = details.reduce((sum, d) => sum + parseFloat(d.debit || 0), 0);
  const totalCredit = details.reduce((sum, d) => sum + parseFloat(d.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error('El asiento contable no está balanceado. Debe = Haber');
  }

  const entryNumber = await generateEntryNumber();

  const entry = await prisma.accountingEntry.create({
    data: {
      entryNumber,
      date: new Date(),
      description,
      reference,
      transactionId,
      incomeId,
      createdBy,
      details: {
        create: details.map(detail => ({
          accountCode: detail.accountCode,
          accountName: detail.accountName,
          debit: detail.debit || 0,
          credit: detail.credit || 0,
          description: detail.description,
        })),
      },
    },
    include: {
      details: true,
    },
  });

  return entry;
}

/**
 * Genera asiento contable para compromiso de gasto
 */
async function createCompromisoEntry(transaction, userId) {
  const details = [
    {
      accountCode: CHART_OF_ACCOUNTS.PRESUPUESTO_EJECUTADO.code,
      accountName: CHART_OF_ACCOUNTS.PRESUPUESTO_EJECUTADO.name,
      debit: transaction.amount,
      description: 'Compromiso de presupuesto',
    },
    {
      accountCode: CHART_OF_ACCOUNTS.PRESUPUESTO_COMPROMETIDO.code,
      accountName: CHART_OF_ACCOUNTS.PRESUPUESTO_COMPROMETIDO.name,
      credit: transaction.amount,
      description: 'Reserva presupuestaria',
    },
  ];

  return await createAccountingEntry({
    description: `Compromiso: ${transaction.concept}`,
    reference: transaction.reference,
    details,
    createdBy: userId,
    transactionId: transaction.id,
  });
}

/**
 * Genera asiento contable para causado de gasto
 */
async function createCausadoEntry(transaction, userId) {
  const details = [
    {
      accountCode: CHART_OF_ACCOUNTS.GASTOS_OPERACION.code,
      accountName: CHART_OF_ACCOUNTS.GASTOS_OPERACION.name,
      debit: transaction.amount,
      description: 'Gasto causado',
    },
    {
      accountCode: CHART_OF_ACCOUNTS.CUENTAS_POR_PAGAR.code,
      accountName: CHART_OF_ACCOUNTS.CUENTAS_POR_PAGAR.name,
      credit: transaction.amount,
      description: `Cuenta por pagar a ${transaction.beneficiary}`,
    },
  ];

  // Reversar el compromiso
  details.push({
    accountCode: CHART_OF_ACCOUNTS.PRESUPUESTO_COMPROMETIDO.code,
    accountName: CHART_OF_ACCOUNTS.PRESUPUESTO_COMPROMETIDO.name,
    debit: transaction.amount,
    description: 'Reversión de compromiso',
  });

  details.push({
    accountCode: CHART_OF_ACCOUNTS.PRESUPUESTO_EJECUTADO.code,
    accountName: CHART_OF_ACCOUNTS.PRESUPUESTO_EJECUTADO.name,
    credit: transaction.amount,
    description: 'Ajuste presupuestario',
  });

  return await createAccountingEntry({
    description: `Causado: ${transaction.concept}`,
    reference: transaction.reference,
    details,
    createdBy: userId,
    transactionId: transaction.id,
  });
}

/**
 * Genera asiento contable para pago
 */
async function createPagadoEntry(transaction, payment, userId) {
  const details = [
    {
      accountCode: CHART_OF_ACCOUNTS.CUENTAS_POR_PAGAR.code,
      accountName: CHART_OF_ACCOUNTS.CUENTAS_POR_PAGAR.name,
      debit: transaction.amount,
      description: 'Cancelación de cuenta por pagar',
    },
    {
      accountCode: CHART_OF_ACCOUNTS.BANCO.code,
      accountName: CHART_OF_ACCOUNTS.BANCO.name,
      credit: transaction.amount,
      description: `Pago mediante ${payment.paymentMethod}`,
    },
  ];

  return await createAccountingEntry({
    description: `Pago: ${transaction.concept}`,
    reference: payment.reference,
    details,
    createdBy: userId,
    transactionId: transaction.id,
  });
}

/**
 * Genera asiento contable para ingreso
 */
async function createIncomeEntry(income, userId) {
  let incomeAccount;
  
  switch (income.type) {
    case 'SITUADO':
      incomeAccount = CHART_OF_ACCOUNTS.SITUADO;
      break;
    case 'TRIBUTOS':
      incomeAccount = CHART_OF_ACCOUNTS.TRIBUTOS;
      break;
    default:
      incomeAccount = CHART_OF_ACCOUNTS.OTROS_INGRESOS;
  }

  const details = [
    {
      accountCode: CHART_OF_ACCOUNTS.BANCO.code,
      accountName: CHART_OF_ACCOUNTS.BANCO.name,
      debit: income.amount,
      description: `Ingreso en cuenta bancaria`,
    },
    {
      accountCode: incomeAccount.code,
      accountName: incomeAccount.name,
      credit: income.amount,
      description: income.concept,
    },
  ];

  return await createAccountingEntry({
    description: `Ingreso: ${income.concept}`,
    reference: income.reference,
    details,
    createdBy: userId,
    incomeId: income.id,
  });
}

/**
 * Obtiene el libro diario (todos los asientos)
 */
async function getGeneralJournal(filters = {}) {
  const { startDate, endDate, page = 1, limit = 50 } = filters;

  const where = {};
  
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [entries, total] = await Promise.all([
    prisma.accountingEntry.findMany({
      where,
      include: {
        details: true,
      },
      orderBy: {
        date: 'asc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.accountingEntry.count({ where }),
  ]);

  return {
    entries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene el libro mayor (movimientos por cuenta)
 */
async function getGeneralLedger(filters = {}) {
  const { accountCode, startDate, endDate } = filters;

  const where = {};
  
  if (accountCode) {
    where.accountCode = accountCode;
  }

  if (startDate || endDate) {
    where.entry = {};
    where.entry.date = {};
    if (startDate) where.entry.date.gte = new Date(startDate);
    if (endDate) where.entry.date.lte = new Date(endDate);
  }

  const details = await prisma.accountingEntryDetail.findMany({
    where,
    include: {
      entry: true,
    },
    orderBy: [
      { accountCode: 'asc' },
      { entry: { date: 'asc' } },
    ],
  });

  // Agrupar por cuenta
  const ledger = {};
  
  details.forEach(detail => {
    if (!ledger[detail.accountCode]) {
      ledger[detail.accountCode] = {
        accountCode: detail.accountCode,
        accountName: detail.accountName,
        movements: [],
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
      };
    }

    ledger[detail.accountCode].movements.push({
      date: detail.entry.date,
      entryNumber: detail.entry.entryNumber,
      description: detail.entry.description,
      debit: parseFloat(detail.debit),
      credit: parseFloat(detail.credit),
    });

    ledger[detail.accountCode].totalDebit += parseFloat(detail.debit);
    ledger[detail.accountCode].totalCredit += parseFloat(detail.credit);
  });

  // Calcular balances
  Object.values(ledger).forEach(account => {
    account.balance = account.totalDebit - account.totalCredit;
  });

  return Object.values(ledger);
}

/**
 * Obtiene el balance de comprobación
 */
async function getTrialBalance(date = new Date()) {
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
    if (!accounts[detail.accountCode]) {
      accounts[detail.accountCode] = {
        accountCode: detail.accountCode,
        accountName: detail.accountName,
        debit: 0,
        credit: 0,
        balance: 0,
      };
    }

    accounts[detail.accountCode].debit += parseFloat(detail.debit);
    accounts[detail.accountCode].credit += parseFloat(detail.credit);
  });

  // Calcular balances
  const trialBalance = Object.values(accounts).map(account => ({
    ...account,
    balance: account.debit - account.credit,
  }));

  // Calcular totales
  const totals = trialBalance.reduce(
    (acc, account) => ({
      debit: acc.debit + account.debit,
      credit: acc.credit + account.credit,
      balance: acc.balance + account.balance,
    }),
    { debit: 0, credit: 0, balance: 0 }
  );

  return {
    date,
    accounts: trialBalance,
    totals,
  };
}

export {
  CHART_OF_ACCOUNTS,
  createAccountingEntry,
  createCompromisoEntry,
  createCausadoEntry,
  createPagadoEntry,
  createIncomeEntry,
  getGeneralJournal,
  getGeneralLedger,
  getTrialBalance,
};
