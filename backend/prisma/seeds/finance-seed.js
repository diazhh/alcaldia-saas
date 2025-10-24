import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFinance() {
  console.log('💰 Iniciando seed del módulo de finanzas...');

  const alcalde = await prisma.user.findUnique({ where: { email: 'alcalde@municipal.gob.ve' } });
  const dirFinanzas = await prisma.user.findUnique({ where: { email: 'dir.finanzas@municipal.gob.ve' } });
  const dirObras = await prisma.user.findUnique({ where: { email: 'dir.obras@municipal.gob.ve' } });
  const dirServicios = await prisma.user.findUnique({ where: { email: 'dir.servicios@municipal.gob.ve' } });

  if (!alcalde || !dirFinanzas) {
    console.log('⚠️  Usuarios no encontrados. Ejecuta primero el seed de organización.');
    return;
  }

  // Crear Presupuesto 2025
  console.log('📊 Verificando presupuesto 2025...');
  let budget2025 = await prisma.budget.findUnique({ where: { year: 2025 } });
  
  if (budget2025) {
    console.log('⚠️  Presupuesto 2025 ya existe, omitiendo creación de finanzas');
    return;
  }
  
  budget2025 = await prisma.budget.create({
    data: {
      year: 2025,
      totalAmount: 50000000.00,
      estimatedIncome: 50000000.00,
      status: 'ACTIVE',
      approvedBy: alcalde.id,
      approvedAt: new Date('2024-12-15'),
      notes: 'Presupuesto Municipal Ordinario 2025 - Aprobado por el Concejo Municipal'
    }
  });
  console.log('✅ Presupuesto 2025 creado');

  // Crear Partidas Presupuestarias
  console.log('📋 Creando 25 partidas presupuestarias...');
  const partidasData = [
    { code: '4.01.01.00.00', name: 'Personal Fijo', allocated: 15000000, category: 'Gastos Corrientes' },
    { code: '4.01.02.00.00', name: 'Personal Contratado', allocated: 3000000, category: 'Gastos Corrientes' },
    { code: '4.01.03.00.00', name: 'Prestaciones Sociales', allocated: 2000000, category: 'Gastos Corrientes' },
    { code: '4.02.01.00.00', name: 'Alimentos y Bebidas', allocated: 500000, category: 'Gastos Corrientes' },
    { code: '4.02.02.00.00', name: 'Vestido y Calzado', allocated: 300000, category: 'Gastos Corrientes' },
    { code: '4.02.03.00.00', name: 'Combustibles y Lubricantes', allocated: 2000000, category: 'Gastos Corrientes' },
    { code: '4.02.04.00.00', name: 'Materiales de Construcción', allocated: 3000000, category: 'Gastos Corrientes' },
    { code: '4.02.05.00.00', name: 'Materiales de Oficina', allocated: 800000, category: 'Gastos Corrientes' },
    { code: '4.02.06.00.00', name: 'Materiales de Limpieza', allocated: 400000, category: 'Gastos Corrientes' },
    { code: '4.02.99.00.00', name: 'Otros Materiales y Suministros', allocated: 500000, category: 'Gastos Corrientes' },
    { code: '4.03.01.00.00', name: 'Servicios Básicos', allocated: 2500000, category: 'Gastos Corrientes' },
    { code: '4.03.02.00.00', name: 'Servicios de Arrendamiento', allocated: 1000000, category: 'Gastos Corrientes' },
    { code: '4.03.03.00.00', name: 'Servicios Profesionales', allocated: 2000000, category: 'Gastos Corrientes' },
    { code: '4.03.04.00.00', name: 'Servicios de Capacitación', allocated: 500000, category: 'Gastos Corrientes' },
    { code: '4.03.05.00.00', name: 'Servicios de Mantenimiento', allocated: 2500000, category: 'Gastos Corrientes' },
    { code: '4.03.06.00.00', name: 'Servicios de Publicidad', allocated: 800000, category: 'Gastos Corrientes' },
    { code: '4.03.99.00.00', name: 'Otros Servicios', allocated: 700000, category: 'Gastos Corrientes' },
    { code: '4.04.01.00.00', name: 'Edificios y Locales', allocated: 2000000, category: 'Gastos de Capital' },
    { code: '4.04.02.00.00', name: 'Maquinaria y Equipo', allocated: 3000000, category: 'Gastos de Capital' },
    { code: '4.04.03.00.00', name: 'Mobiliario y Equipo de Oficina', allocated: 1000000, category: 'Gastos de Capital' },
    { code: '4.04.04.00.00', name: 'Equipos de Computación', allocated: 1000000, category: 'Gastos de Capital' },
    { code: '4.04.05.00.00', name: 'Vehículos', allocated: 500000, category: 'Gastos de Capital' },
    { code: '4.99.01.00.00', name: 'Reserva de Contingencia', allocated: 3000000, category: 'Asignaciones Especiales' },
    { code: '4.99.02.00.00', name: 'Imprevistos', allocated: 2000000, category: 'Asignaciones Especiales' }
  ];

  const budgetItems = {};
  for (const partida of partidasData) {
    const item = await prisma.budgetItem.create({
      data: {
        budgetId: budget2025.id,
        code: partida.code,
        name: partida.name,
        allocatedAmount: partida.allocated,
        availableAmount: partida.allocated,
        category: partida.category
      }
    });
    budgetItems[partida.code] = item;
  }
  console.log(`✅ ${Object.keys(budgetItems).length} partidas creadas`);

  // Crear Cuentas Bancarias
  console.log('🏦 Creando 4 cuentas bancarias...');
  const cuentaCorriente = await prisma.bankAccount.create({
    data: {
      bankName: 'Banco de Venezuela',
      accountNumber: '0102-0001-12-0000123456',
      accountType: 'CORRIENTE',
      currency: 'VES',
      balance: 8500000.00,
      description: 'Cuenta principal para operaciones generales',
      isActive: true
    }
  });

  const cuentaNomina = await prisma.bankAccount.create({
    data: {
      bankName: 'Banco Bicentenario',
      accountNumber: '0175-0002-34-0000789012',
      accountType: 'CORRIENTE',
      currency: 'VES',
      balance: 15000000.00,
      description: 'Cuenta exclusiva para pago de nómina',
      isActive: true
    }
  });

  await prisma.bankAccount.create({
    data: {
      bankName: 'Banco del Tesoro',
      accountNumber: '0163-0003-56-0000345678',
      accountType: 'ESPECIAL',
      currency: 'VES',
      balance: 5000000.00,
      description: 'Cuenta para financiamiento de proyectos especiales',
      isActive: true
    }
  });

  await prisma.bankAccount.create({
    data: {
      bankName: 'Banco Nacional de Crédito',
      accountNumber: '0191-0004-78-0000901234',
      accountType: 'CORRIENTE',
      currency: 'USD',
      balance: 50000.00,
      description: 'Cuenta en dólares para importaciones',
      isActive: true
    }
  });
  console.log('✅ 4 cuentas bancarias creadas');

  // Crear Ingresos
  console.log('💵 Creando 5 ingresos...');
  const ingresos = [
    { reference: 'ING-2025-00001', type: 'SITUADO', amount: 2500000, concept: 'Situado Constitucional - Enero 2025', source: 'Gobierno Nacional', incomeDate: new Date('2025-01-15') },
    { reference: 'ING-2025-00002', type: 'TRIBUTOS', amount: 650000, concept: 'Recaudación Impuestos Municipales - Enero', source: 'Dirección de Hacienda', incomeDate: new Date('2025-01-31') },
    { reference: 'ING-2025-00003', type: 'TASAS', amount: 150000, concept: 'Tasas Administrativas - Enero', source: 'Dirección de Hacienda', incomeDate: new Date('2025-01-31') },
    { reference: 'ING-2025-00004', type: 'SITUADO', amount: 2500000, concept: 'Situado Constitucional - Febrero 2025', source: 'Gobierno Nacional', incomeDate: new Date('2025-02-15') },
    { reference: 'ING-2025-00005', type: 'TRANSFERENCIA', amount: 1000000, concept: 'Transferencia FUS - Proyecto Vialidad', source: 'FCI', incomeDate: new Date('2025-02-20') }
  ];

  for (const ing of ingresos) {
    await prisma.income.create({ data: { ...ing, bankAccountId: cuentaCorriente.id, registeredBy: dirFinanzas.id } });
  }
  console.log('✅ 5 ingresos creados');

  // Crear Transacciones (Ciclo del Gasto)
  console.log('📝 Creando 15 transacciones...');
  
  // Transacciones PAGADAS (completadas)
  const transaccion1 = await prisma.transaction.create({
    data: {
      reference: 'TRX-2025-00001',
      type: 'GASTO',
      status: 'PAGADO',
      amount: 500000,
      budgetItemId: budgetItems['4.02.03.00.00'].id,
      concept: 'Compra de combustible para vehículos municipales',
      description: 'Gasolina y diesel para flota vehicular - Enero 2025',
      beneficiary: 'PDVSA Estación de Servicio',
      invoiceNumber: 'FAC-2025-001',
      committedAt: new Date('2025-01-10'),
      accruedAt: new Date('2025-01-15'),
      paidAt: new Date('2025-01-20'),
      createdBy: dirServicios?.id || dirFinanzas.id,
      approvedBy: dirFinanzas.id
    }
  });

  await prisma.payment.create({
    data: {
      reference: 'PAG-2025-00001',
      amount: 500000,
      paymentDate: new Date('2025-01-20'),
      paymentMethod: 'TRANSFERENCIA',
      bankAccountId: cuentaCorriente.id,
      beneficiary: 'PDVSA Estación de Servicio',
      beneficiaryAccount: '0102-0555-12-0000999888',
      beneficiaryBank: 'Banco de Venezuela',
      concept: 'Pago combustible enero',
      status: 'COMPLETED',
      createdBy: dirFinanzas.id
    }
  });

  await prisma.transaction.update({
    where: { id: transaccion1.id },
    data: { paymentId: (await prisma.payment.findFirst({ where: { reference: 'PAG-2025-00001' } })).id }
  });

  const transaccion2 = await prisma.transaction.create({
    data: {
      reference: 'TRX-2025-00002',
      type: 'GASTO',
      status: 'PAGADO',
      amount: 350000,
      budgetItemId: budgetItems['4.02.05.00.00'].id,
      concept: 'Materiales de oficina y papelería',
      description: 'Compra de resmas, tóner, carpetas y útiles de oficina',
      beneficiary: 'Papelería El Estudiante C.A.',
      invoiceNumber: 'FAC-2025-002',
      committedAt: new Date('2025-01-12'),
      accruedAt: new Date('2025-01-18'),
      paidAt: new Date('2025-01-25'),
      createdBy: dirFinanzas.id,
      approvedBy: dirFinanzas.id
    }
  });

  await prisma.payment.create({
    data: {
      reference: 'PAG-2025-00002',
      amount: 350000,
      paymentDate: new Date('2025-01-25'),
      paymentMethod: 'TRANSFERENCIA',
      bankAccountId: cuentaCorriente.id,
      beneficiary: 'Papelería El Estudiante C.A.',
      beneficiaryAccount: '0175-0222-34-0001112233',
      beneficiaryBank: 'Banco Bicentenario',
      concept: 'Pago materiales de oficina',
      status: 'COMPLETED',
      createdBy: dirFinanzas.id
    }
  });

  await prisma.transaction.update({
    where: { id: transaccion2.id },
    data: { paymentId: (await prisma.payment.findFirst({ where: { reference: 'PAG-2025-00002' } })).id }
  });

  // Transacciones CAUSADAS (pendientes de pago)
  const transaccion3 = await prisma.transaction.create({
    data: {
      reference: 'TRX-2025-00003',
      type: 'GASTO',
      status: 'CAUSADO',
      amount: 1200000,
      budgetItemId: budgetItems['4.03.05.00.00'].id,
      concept: 'Mantenimiento de infraestructura vial',
      description: 'Reparación de baches en Avenida Principal',
      beneficiary: 'Constructora Vialidad C.A.',
      invoiceNumber: 'FAC-2025-003',
      contractNumber: 'CONT-2025-001',
      committedAt: new Date('2025-02-01'),
      accruedAt: new Date('2025-02-15'),
      createdBy: dirObras?.id || dirFinanzas.id,
      approvedBy: dirFinanzas.id
    }
  });

  const transaccion4 = await prisma.transaction.create({
    data: {
      reference: 'TRX-2025-00004',
      type: 'GASTO',
      status: 'CAUSADO',
      amount: 850000,
      budgetItemId: budgetItems['4.03.01.00.00'].id,
      concept: 'Servicios básicos - Febrero 2025',
      description: 'Electricidad, agua y telecomunicaciones',
      beneficiary: 'CORPOELEC / Hidrocapital',
      invoiceNumber: 'FAC-2025-004',
      committedAt: new Date('2025-02-05'),
      accruedAt: new Date('2025-02-20'),
      createdBy: dirFinanzas.id,
      approvedBy: dirFinanzas.id
    }
  });

  const transaccion5 = await prisma.transaction.create({
    data: {
      reference: 'TRX-2025-00005',
      type: 'GASTO',
      status: 'CAUSADO',
      amount: 2500000,
      budgetItemId: budgetItems['4.04.02.00.00'].id,
      concept: 'Adquisición de maquinaria pesada',
      description: 'Compra de retroexcavadora para obras públicas',
      beneficiary: 'Maquinarias del Centro C.A.',
      invoiceNumber: 'FAC-2025-005',
      contractNumber: 'CONT-2025-002',
      committedAt: new Date('2025-02-10'),
      accruedAt: new Date('2025-02-25'),
      createdBy: dirObras?.id || dirFinanzas.id,
      approvedBy: alcalde.id
    }
  });

  // Transacciones COMPROMETIDAS (solo reserva presupuestaria)
  await prisma.transaction.create({
    data: {
      reference: 'TRX-2025-00006',
      type: 'GASTO',
      status: 'COMPROMISO',
      amount: 1500000,
      budgetItemId: budgetItems['4.04.01.00.00'].id,
      concept: 'Remodelación de edificio administrativo',
      description: 'Obras de remodelación y pintura del edificio sede',
      beneficiary: 'Construcciones Modernas C.A.',
      contractNumber: 'CONT-2025-003',
      committedAt: new Date('2025-03-01'),
      createdBy: dirObras?.id || dirFinanzas.id,
      approvedBy: dirFinanzas.id
    }
  });

  await prisma.transaction.create({
    data: {
      reference: 'TRX-2025-00007',
      type: 'GASTO',
      status: 'COMPROMISO',
      amount: 800000,
      budgetItemId: budgetItems['4.03.03.00.00'].id,
      concept: 'Servicios profesionales de consultoría',
      description: 'Asesoría legal y contable - Trimestre 1',
      beneficiary: 'Bufete Jurídico Asociados',
      contractNumber: 'CONT-2025-004',
      committedAt: new Date('2025-03-05'),
      createdBy: dirFinanzas.id,
      approvedBy: dirFinanzas.id
    }
  });

  console.log('✅ 7 transacciones creadas (2 pagadas, 3 causadas, 2 comprometidas)');

  // Actualizar disponibilidad presupuestaria
  await prisma.budgetItem.update({
    where: { id: budgetItems['4.02.03.00.00'].id },
    data: { availableAmount: { decrement: 500000 }, committedAmount: { increment: 500000 } }
  });
  await prisma.budgetItem.update({
    where: { id: budgetItems['4.02.05.00.00'].id },
    data: { availableAmount: { decrement: 350000 }, committedAmount: { increment: 350000 } }
  });
  await prisma.budgetItem.update({
    where: { id: budgetItems['4.03.05.00.00'].id },
    data: { availableAmount: { decrement: 1200000 }, committedAmount: { increment: 1200000 } }
  });
  await prisma.budgetItem.update({
    where: { id: budgetItems['4.03.01.00.00'].id },
    data: { availableAmount: { decrement: 850000 }, committedAmount: { increment: 850000 } }
  });
  await prisma.budgetItem.update({
    where: { id: budgetItems['4.04.02.00.00'].id },
    data: { availableAmount: { decrement: 2500000 }, committedAmount: { increment: 2500000 } }
  });
  await prisma.budgetItem.update({
    where: { id: budgetItems['4.04.01.00.00'].id },
    data: { availableAmount: { decrement: 1500000 }, committedAmount: { increment: 1500000 } }
  });
  await prisma.budgetItem.update({
    where: { id: budgetItems['4.03.03.00.00'].id },
    data: { availableAmount: { decrement: 800000 }, committedAmount: { increment: 800000 } }
  });

  // Crear Programaciones de Pago
  console.log('📅 Creando 5 programaciones de pago...');
  
  await prisma.paymentSchedule.create({
    data: {
      transactionId: transaccion3.id,
      scheduledDate: new Date('2025-03-01'),
      priority: 'HIGH',
      status: 'APPROVED',
      requestedBy: dirObras?.id || dirFinanzas.id,
      requestedAt: new Date('2025-02-15'),
      approvedBy: dirFinanzas.id,
      approvedAt: new Date('2025-02-16'),
      notes: 'Pago urgente para continuar obras viales'
    }
  });

  await prisma.paymentSchedule.create({
    data: {
      transactionId: transaccion4.id,
      scheduledDate: new Date('2025-02-28'),
      priority: 'CRITICAL',
      status: 'APPROVED',
      requestedBy: dirFinanzas.id,
      requestedAt: new Date('2025-02-20'),
      approvedBy: dirFinanzas.id,
      approvedAt: new Date('2025-02-20'),
      notes: 'Pago prioritario de servicios básicos'
    }
  });

  await prisma.paymentSchedule.create({
    data: {
      transactionId: transaccion5.id,
      scheduledDate: new Date('2025-03-10'),
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      requestedBy: dirObras?.id || dirFinanzas.id,
      requestedAt: new Date('2025-02-25'),
      notes: 'Pendiente de aprobación del alcalde'
    }
  });

  console.log('✅ 3 programaciones de pago creadas');

  // Crear Modificación Presupuestaria
  console.log('📝 Creando modificación presupuestaria...');
  
  await prisma.budgetModification.create({
    data: {
      budgetId: budget2025.id,
      type: 'TRASPASO',
      reference: 'MOD-2025-001',
      description: 'Traspaso de partida de Imprevistos a Mantenimiento',
      amount: 500000,
      fromBudgetItemId: budgetItems['4.99.02.00.00'].id,
      toBudgetItemId: budgetItems['4.03.05.00.00'].id,
      justification: 'Se requiere reforzar el presupuesto de mantenimiento debido al incremento de solicitudes de reparación vial',
      status: 'APPROVED',
      approvedBy: alcalde.id,
      approvedAt: new Date('2025-02-05'),
      notes: 'Aprobado en sesión ordinaria del Concejo Municipal'
    }
  });

  console.log('✅ 1 modificación presupuestaria creada');

  // Crear Conciliación Bancaria
  console.log('🏦 Creando conciliación bancaria...');
  
  const reconciliation = await prisma.bankReconciliation.create({
    data: {
      bankAccountId: cuentaCorriente.id,
      reconciliationDate: new Date('2025-01-31'),
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-01-31'),
      statementBalance: 8500000.00,
      bookBalance: 8500000.00,
      adjustedBalance: 8500000.00,
      totalDifference: 0,
      status: 'COMPLETED',
      reconciledBy: dirFinanzas.id,
      notes: 'Conciliación mensual enero 2025 - Sin diferencias'
    }
  });

  await prisma.reconciliationItem.create({
    data: {
      reconciliationId: reconciliation.id,
      type: 'MATCHED',
      date: new Date('2025-01-20'),
      reference: 'PAG-2025-00001',
      description: 'Pago combustible',
      amount: -500000,
      isReconciled: true,
      reconciledAt: new Date('2025-01-31')
    }
  });

  await prisma.reconciliationItem.create({
    data: {
      reconciliationId: reconciliation.id,
      type: 'MATCHED',
      date: new Date('2025-01-25'),
      reference: 'PAG-2025-00002',
      description: 'Pago materiales oficina',
      amount: -350000,
      isReconciled: true,
      reconciledAt: new Date('2025-01-31')
    }
  });

  console.log('✅ 1 conciliación bancaria creada con 2 partidas');

  console.log('\n🎉 Seed de finanzas completado exitosamente!');
  console.log('📊 Resumen:');
  console.log('   • Presupuesto: 50M Bs');
  console.log('   • Partidas: 24');
  console.log('   • Cuentas bancarias: 4');
  console.log('   • Ingresos: 6.8M Bs');
  console.log('   • Transacciones: 7 (2 pagadas, 3 causadas, 2 comprometidas)');
  console.log('   • Pagos: 2');
  console.log('   • Programaciones de pago: 3');
  console.log('   • Modificaciones presupuestarias: 1');
  console.log('   • Conciliaciones bancarias: 1');
}
