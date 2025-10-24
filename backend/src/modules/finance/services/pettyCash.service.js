/**
 * Servicio de Cajas Chicas
 * Gestiona fondos especiales para gastos menores
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class PettyCashService {
  /**
   * Crear una caja chica
   */
  async createPettyCash(data, userId) {
    const { code, name, description, custodianId, departmentId, maxAmount } = data;

    const pettyCash = await prisma.pettyCash.create({
      data: {
        code,
        name,
        description,
        custodianId,
        departmentId,
        maxAmount,
        currentBalance: 0,
        status: 'ACTIVE',
      },
    });

    return pettyCash;
  }

  /**
   * Obtener todas las cajas chicas
   */
  async getAllPettyCashes(filters = {}) {
    const { status, custodianId, departmentId } = filters;

    const where = {};
    if (status) where.status = status;
    if (custodianId) where.custodianId = custodianId;
    if (departmentId) where.departmentId = departmentId;

    const pettyCashes = await prisma.pettyCash.findMany({
      where,
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 5,
        },
        reimbursements: {
          where: { status: 'PENDING' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pettyCashes;
  }

  /**
   * Obtener caja chica por ID
   */
  async getPettyCashById(id) {
    const pettyCash = await prisma.pettyCash.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
        reimbursements: {
          orderBy: { requestDate: 'desc' },
        },
      },
    });

    if (!pettyCash) {
      throw new Error('Caja chica no encontrada');
    }

    return pettyCash;
  }

  /**
   * Registrar gasto de caja chica
   */
  async registerExpense(data, userId) {
    const { pettyCashId, amount, concept, description, receipt, beneficiary, attachmentUrl } = data;

    // Verificar que la caja chica existe y está activa
    const pettyCash = await prisma.pettyCash.findUnique({
      where: { id: pettyCashId },
    });

    if (!pettyCash) {
      throw new Error('Caja chica no encontrada');
    }

    if (pettyCash.status !== 'ACTIVE') {
      throw new Error('La caja chica no está activa');
    }

    // Verificar que hay saldo suficiente
    if (Number(pettyCash.currentBalance) < amount) {
      throw new Error('Saldo insuficiente en la caja chica');
    }

    // Crear transacción y actualizar saldo en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la transacción
      const transaction = await tx.pettyCashTransaction.create({
        data: {
          pettyCashId,
          type: 'EXPENSE',
          amount,
          concept,
          description,
          receipt,
          beneficiary,
          attachmentUrl,
          registeredBy: userId,
        },
      });

      // Actualizar saldo de la caja chica
      const updatedPettyCash = await tx.pettyCash.update({
        where: { id: pettyCashId },
        data: {
          currentBalance: {
            decrement: amount,
          },
        },
      });

      return { transaction, pettyCash: updatedPettyCash };
    });

    return result;
  }

  /**
   * Solicitar reembolso de caja chica
   */
  async requestReimbursement(data, userId) {
    const { pettyCashId, amount, notes, attachmentUrl } = data;

    // Verificar que la caja chica existe
    const pettyCash = await prisma.pettyCash.findUnique({
      where: { id: pettyCashId },
    });

    if (!pettyCash) {
      throw new Error('Caja chica no encontrada');
    }

    // Verificar que el monto no excede el máximo
    const newBalance = Number(pettyCash.currentBalance) + amount;
    if (newBalance > Number(pettyCash.maxAmount)) {
      throw new Error(`El reembolso excede el monto máximo de la caja chica (${pettyCash.maxAmount})`);
    }

    const reimbursement = await prisma.pettyCashReimbursement.create({
      data: {
        pettyCashId,
        amount,
        notes,
        attachmentUrl,
        requestedBy: userId,
        status: 'PENDING',
      },
    });

    return reimbursement;
  }

  /**
   * Aprobar reembolso
   */
  async approveReimbursement(id, userId) {
    const reimbursement = await prisma.pettyCashReimbursement.findUnique({
      where: { id },
      include: { pettyCash: true },
    });

    if (!reimbursement) {
      throw new Error('Reembolso no encontrado');
    }

    if (reimbursement.status !== 'PENDING') {
      throw new Error('El reembolso ya fue procesado');
    }

    const updated = await prisma.pettyCashReimbursement.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedDate: new Date(),
      },
    });

    return updated;
  }

  /**
   * Procesar pago de reembolso
   */
  async processReimbursement(id, userId) {
    const reimbursement = await prisma.pettyCashReimbursement.findUnique({
      where: { id },
      include: { pettyCash: true },
    });

    if (!reimbursement) {
      throw new Error('Reembolso no encontrado');
    }

    if (reimbursement.status !== 'APPROVED') {
      throw new Error('El reembolso debe estar aprobado para procesarse');
    }

    // Procesar reembolso y actualizar saldo
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar reembolso
      const updatedReimbursement = await tx.pettyCashReimbursement.update({
        where: { id },
        data: {
          status: 'PAID',
          paidBy: userId,
          paidDate: new Date(),
        },
      });

      // Crear transacción de reembolso
      await tx.pettyCashTransaction.create({
        data: {
          pettyCashId: reimbursement.pettyCashId,
          type: 'REIMBURSEMENT',
          amount: reimbursement.amount,
          concept: 'Reembolso de caja chica',
          description: reimbursement.notes,
          registeredBy: userId,
        },
      });

      // Actualizar saldo de la caja chica
      const updatedPettyCash = await tx.pettyCash.update({
        where: { id: reimbursement.pettyCashId },
        data: {
          currentBalance: {
            increment: reimbursement.amount,
          },
        },
      });

      return { reimbursement: updatedReimbursement, pettyCash: updatedPettyCash };
    });

    return result;
  }

  /**
   * Rechazar reembolso
   */
  async rejectReimbursement(id, reason, userId) {
    const reimbursement = await prisma.pettyCashReimbursement.findUnique({
      where: { id },
    });

    if (!reimbursement) {
      throw new Error('Reembolso no encontrado');
    }

    if (reimbursement.status !== 'PENDING') {
      throw new Error('Solo se pueden rechazar reembolsos pendientes');
    }

    const updated = await prisma.pettyCashReimbursement.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        approvedBy: userId,
        approvedDate: new Date(),
      },
    });

    return updated;
  }

  /**
   * Obtener estadísticas de caja chica
   */
  async getPettyCashStats(id) {
    const pettyCash = await prisma.pettyCash.findUnique({
      where: { id },
      include: {
        transactions: true,
        reimbursements: true,
      },
    });

    if (!pettyCash) {
      throw new Error('Caja chica no encontrada');
    }

    const totalExpenses = pettyCash.transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalReimbursements = pettyCash.transactions
      .filter((t) => t.type === 'REIMBURSEMENT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingReimbursements = pettyCash.reimbursements
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      maxAmount: Number(pettyCash.maxAmount),
      currentBalance: Number(pettyCash.currentBalance),
      totalExpenses,
      totalReimbursements,
      pendingReimbursements,
      utilizationRate: (Number(pettyCash.currentBalance) / Number(pettyCash.maxAmount)) * 100,
      transactionCount: pettyCash.transactions.length,
    };
  }

  /**
   * Cerrar caja chica
   */
  async closePettyCash(id, userId) {
    const pettyCash = await prisma.pettyCash.findUnique({
      where: { id },
      include: {
        reimbursements: {
          where: { status: { in: ['PENDING', 'APPROVED'] } },
        },
      },
    });

    if (!pettyCash) {
      throw new Error('Caja chica no encontrada');
    }

    if (pettyCash.reimbursements.length > 0) {
      throw new Error('No se puede cerrar la caja chica con reembolsos pendientes');
    }

    const updated = await prisma.pettyCash.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Actualizar caja chica
   */
  async updatePettyCash(id, data, userId) {
    const updated = await prisma.pettyCash.update({
      where: { id },
      data,
    });

    return updated;
  }
}

export default new PettyCashService();
