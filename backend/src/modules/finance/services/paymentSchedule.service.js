/**
 * Servicio de Programación de Pagos
 * Maneja la programación, aprobación y procesamiento de pagos
 */

import prisma from '../../../config/database.js';
import { AppError } from '../../../shared/utils/errors.js';

/**
 * Crear una programación de pago
 */
export async function createPaymentSchedule(data, userId) {
  const {
    transactionId,
    scheduledDate,
    priority = 'MEDIUM',
    notes,
    batchId,
    batchNumber,
  } = data;

  // Verificar que la transacción existe
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      budgetItem: true,
      payment: true,
    },
  });

  if (!transaction) {
    throw new AppError('Transacción no encontrada', 404);
  }

  // Verificar que la transacción está en estado CAUSADO
  if (transaction.status !== 'CAUSADO') {
    throw new AppError('Solo se pueden programar pagos para transacciones causadas', 400);
  }

  // Verificar que no tenga ya un pago procesado
  if (transaction.payment) {
    throw new AppError('Esta transacción ya tiene un pago asociado', 400);
  }

  // Verificar que no exista ya una programación activa
  const existingSchedule = await prisma.paymentSchedule.findFirst({
    where: {
      transactionId,
      status: {
        in: ['SCHEDULED', 'APPROVED', 'PROCESSING'],
      },
    },
  });

  if (existingSchedule) {
    throw new AppError('Ya existe una programación activa para esta transacción', 400);
  }

  // Crear la programación
  const schedule = await prisma.paymentSchedule.create({
    data: {
      transactionId,
      scheduledDate: new Date(scheduledDate),
      priority,
      status: 'SCHEDULED',
      requestedBy: userId,
      notes,
      batchId,
      batchNumber,
    },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
  });

  return schedule;
}

/**
 * Obtener programaciones con filtros
 */
export async function getPaymentSchedules(filters = {}) {
  const { status, priority, startDate, endDate, batchId } = filters;

  const where = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (batchId) {
    where.batchId = batchId;
  }

  if (startDate || endDate) {
    where.scheduledDate = {};
    if (startDate) where.scheduledDate.gte = new Date(startDate);
    if (endDate) where.scheduledDate.lte = new Date(endDate);
  }

  const schedules = await prisma.paymentSchedule.findMany({
    where,
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
    orderBy: [{ priority: 'asc' }, { scheduledDate: 'asc' }],
  });

  return schedules;
}

/**
 * Obtener una programación por ID
 */
export async function getPaymentScheduleById(id) {
  const schedule = await prisma.paymentSchedule.findUnique({
    where: { id },
    include: {
      transaction: {
        include: {
          budgetItem: true,
          payment: true,
        },
      },
    },
  });

  if (!schedule) {
    throw new AppError('Programación de pago no encontrada', 404);
  }

  return schedule;
}

/**
 * Aprobar una programación de pago
 */
export async function approvePaymentSchedule(id, userId) {
  const schedule = await prisma.paymentSchedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new AppError('Programación de pago no encontrada', 404);
  }

  if (schedule.status !== 'SCHEDULED') {
    throw new AppError('Solo se pueden aprobar programaciones en estado SCHEDULED', 400);
  }

  const updatedSchedule = await prisma.paymentSchedule.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
  });

  return updatedSchedule;
}

/**
 * Rechazar una programación de pago
 */
export async function rejectPaymentSchedule(id, reason) {
  const schedule = await prisma.paymentSchedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new AppError('Programación de pago no encontrada', 404);
  }

  if (schedule.status !== 'SCHEDULED') {
    throw new AppError('Solo se pueden rechazar programaciones en estado SCHEDULED', 400);
  }

  const updatedSchedule = await prisma.paymentSchedule.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectionReason: reason,
    },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
  });

  return updatedSchedule;
}

/**
 * Procesar pago de una programación
 */
export async function processPaymentSchedule(id, paymentData, userId) {
  const schedule = await prisma.paymentSchedule.findUnique({
    where: { id },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
  });

  if (!schedule) {
    throw new AppError('Programación de pago no encontrada', 404);
  }

  if (schedule.status !== 'APPROVED') {
    throw new AppError('Solo se pueden procesar programaciones aprobadas', 400);
  }

  // Verificar que la transacción sigue en estado CAUSADO
  if (schedule.transaction.status !== 'CAUSADO') {
    throw new AppError('La transacción ya no está en estado CAUSADO', 400);
  }

  // Iniciar transacción de base de datos
  const result = await prisma.$transaction(async (tx) => {
    // Actualizar estado de la programación
    const updatedSchedule = await tx.paymentSchedule.update({
      where: { id },
      data: {
        status: 'PROCESSING',
        processedBy: userId,
        processedAt: new Date(),
      },
    });

    // Crear el pago
    const payment = await tx.payment.create({
      data: {
        reference: paymentData.reference,
        amount: schedule.transaction.amount,
        paymentDate: new Date(paymentData.paymentDate),
        paymentMethod: paymentData.paymentMethod,
        bankAccountId: paymentData.bankAccountId,
        beneficiary: schedule.transaction.beneficiary,
        concept: schedule.transaction.concept,
        checkNumber: paymentData.checkNumber,
        notes: paymentData.notes,
        status: 'COMPLETED',
      },
    });

    // Actualizar la transacción a PAGADO
    const updatedTransaction = await tx.transaction.update({
      where: { id: schedule.transactionId },
      data: {
        status: 'PAGADO',
        paidAt: new Date(),
        paymentId: payment.id,
      },
    });

    // Actualizar saldo de cuenta bancaria
    await tx.bankAccount.update({
      where: { id: paymentData.bankAccountId },
      data: {
        balance: {
          decrement: schedule.transaction.amount,
        },
      },
    });

    // Marcar programación como PAID
    await tx.paymentSchedule.update({
      where: { id },
      data: {
        status: 'PAID',
      },
    });

    // Crear asiento contable
    const accountingEntry = await tx.accountingEntry.create({
      data: {
        reference: `PAG-${payment.reference}`,
        date: new Date(),
        description: `Pago: ${schedule.transaction.concept}`,
        type: 'PAGO',
        transactionId: schedule.transactionId,
        createdBy: userId,
        details: {
          create: [
            {
              accountCode: '5.1.1.01', // Gastos pagados (debe)
              accountName: 'Gastos Pagados',
              debit: schedule.transaction.amount,
              credit: 0,
            },
            {
              accountCode: '1.1.1.01', // Banco (haber)
              accountName: 'Banco',
              debit: 0,
              credit: schedule.transaction.amount,
            },
          ],
        },
      },
      include: {
        details: true,
      },
    });

    return {
      schedule: updatedSchedule,
      payment,
      transaction: updatedTransaction,
      accountingEntry,
    };
  });

  return result;
}

/**
 * Cancelar una programación de pago
 */
export async function cancelPaymentSchedule(id, reason) {
  const schedule = await prisma.paymentSchedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new AppError('Programación de pago no encontrada', 404);
  }

  if (!['SCHEDULED', 'APPROVED'].includes(schedule.status)) {
    throw new AppError('Solo se pueden cancelar programaciones en estado SCHEDULED o APPROVED', 400);
  }

  const updatedSchedule = await prisma.paymentSchedule.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      rejectionReason: reason,
    },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
  });

  return updatedSchedule;
}

/**
 * Actualizar fecha programada
 */
export async function updateScheduledDate(id, newDate) {
  const schedule = await prisma.paymentSchedule.findUnique({
    where: { id },
  });

  if (!schedule) {
    throw new AppError('Programación de pago no encontrada', 404);
  }

  if (!['SCHEDULED', 'APPROVED'].includes(schedule.status)) {
    throw new AppError('Solo se puede cambiar la fecha de programaciones en estado SCHEDULED o APPROVED', 400);
  }

  const updatedSchedule = await prisma.paymentSchedule.update({
    where: { id },
    data: {
      scheduledDate: new Date(newDate),
    },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
  });

  return updatedSchedule;
}

/**
 * Obtener estadísticas de programación de pagos
 */
export async function getPaymentScheduleStats(filters = {}) {
  const { startDate, endDate } = filters;

  const where = {};

  if (startDate || endDate) {
    where.scheduledDate = {};
    if (startDate) where.scheduledDate.gte = new Date(startDate);
    if (endDate) where.scheduledDate.lte = new Date(endDate);
  }

  const [
    total,
    scheduled,
    approved,
    processing,
    paid,
    rejected,
    cancelled,
    byPriority,
    totalAmount,
  ] = await Promise.all([
    prisma.paymentSchedule.count({ where }),
    prisma.paymentSchedule.count({ where: { ...where, status: 'SCHEDULED' } }),
    prisma.paymentSchedule.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.paymentSchedule.count({ where: { ...where, status: 'PROCESSING' } }),
    prisma.paymentSchedule.count({ where: { ...where, status: 'PAID' } }),
    prisma.paymentSchedule.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.paymentSchedule.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.paymentSchedule.groupBy({
      by: ['priority'],
      where,
      _count: true,
    }),
    prisma.paymentSchedule.findMany({
      where: {
        ...where,
        status: { in: ['SCHEDULED', 'APPROVED', 'PROCESSING'] },
      },
      include: {
        transaction: {
          select: {
            amount: true,
          },
        },
      },
    }).then(schedules => 
      schedules.reduce((sum, s) => sum + (s.transaction?.amount ? Number(s.transaction.amount) : 0), 0)
    ),
  ]);

  return {
    total,
    scheduled,
    approved,
    processing,
    paid,
    rejected,
    cancelled,
    byPriority: byPriority.reduce((acc, item) => {
      acc[item.priority] = item._count;
      return acc;
    }, {}),
  };
}

/**
 * Obtener calendario de pagos
 */
export async function getPaymentCalendar(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const schedules = await prisma.paymentSchedule.findMany({
    where: {
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ['SCHEDULED', 'APPROVED', 'PROCESSING'],
      },
    },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
    orderBy: { scheduledDate: 'asc' },
  });

  // Agrupar por día
  const calendar = {};
  schedules.forEach((schedule) => {
    const day = schedule.scheduledDate.getDate();
    if (!calendar[day]) {
      calendar[day] = [];
    }
    calendar[day].push(schedule);
  });

  return calendar;
}

/**
 * Crear lote de pagos
 */
export async function createPaymentBatch(scheduleIds, batchNumber, userId) {
  // Verificar que todas las programaciones existen y están aprobadas
  const schedules = await prisma.paymentSchedule.findMany({
    where: {
      id: { in: scheduleIds },
    },
  });

  if (schedules.length !== scheduleIds.length) {
    throw new AppError('Algunas programaciones no fueron encontradas', 404);
  }

  const notApproved = schedules.filter((s) => s.status !== 'APPROVED');
  if (notApproved.length > 0) {
    throw new AppError('Todas las programaciones deben estar aprobadas', 400);
  }

  // Generar ID de lote
  const batchId = `BATCH-${Date.now()}`;

  // Actualizar todas las programaciones con el lote
  await prisma.paymentSchedule.updateMany({
    where: {
      id: { in: scheduleIds },
    },
    data: {
      batchId,
      batchNumber,
    },
  });

  // Obtener las programaciones actualizadas
  const updatedSchedules = await prisma.paymentSchedule.findMany({
    where: {
      id: { in: scheduleIds },
    },
    include: {
      transaction: {
        include: {
          budgetItem: true,
        },
      },
    },
  });

  return {
    batchId,
    batchNumber,
    schedules: updatedSchedules,
    totalAmount: updatedSchedules.reduce((sum, s) => sum + Number(s.transaction.amount), 0),
  };
}
