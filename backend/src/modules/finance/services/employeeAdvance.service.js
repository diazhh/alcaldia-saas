/**
 * Servicio de Anticipos a Empleados
 * Gestiona anticipos de sueldo y préstamos a empleados
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class EmployeeAdvanceService {
  /**
   * Solicitar anticipo
   */
  async requestAdvance(data, userId) {
    const { employeeId, amount, concept, description, installments } = data;

    const advance = await prisma.employeeAdvance.create({
      data: {
        employeeId,
        amount,
        remainingAmount: amount,
        concept,
        description,
        installments: installments || 1,
        requestedBy: userId,
        status: 'PENDING',
      },
    });

    return advance;
  }

  /**
   * Obtener todos los anticipos
   */
  async getAllAdvances(filters = {}) {
    const { employeeId, status } = filters;

    const where = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const advances = await prisma.employeeAdvance.findMany({
      where,
      orderBy: { requestDate: 'desc' },
    });

    return advances;
  }

  /**
   * Obtener anticipo por ID
   */
  async getAdvanceById(id) {
    const advance = await prisma.employeeAdvance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new Error('Anticipo no encontrado');
    }

    return advance;
  }

  /**
   * Aprobar anticipo
   */
  async approveAdvance(id, userId) {
    const advance = await prisma.employeeAdvance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new Error('Anticipo no encontrado');
    }

    if (advance.status !== 'PENDING') {
      throw new Error('El anticipo ya fue procesado');
    }

    const updated = await prisma.employeeAdvance.update({
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
   * Rechazar anticipo
   */
  async rejectAdvance(id, reason, userId) {
    const advance = await prisma.employeeAdvance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new Error('Anticipo no encontrado');
    }

    if (advance.status !== 'PENDING') {
      throw new Error('Solo se pueden rechazar anticipos pendientes');
    }

    const updated = await prisma.employeeAdvance.update({
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
   * Desembolsar anticipo
   */
  async disburseAdvance(id, userId) {
    const advance = await prisma.employeeAdvance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new Error('Anticipo no encontrado');
    }

    if (advance.status !== 'APPROVED') {
      throw new Error('El anticipo debe estar aprobado para desembolsarse');
    }

    const updated = await prisma.employeeAdvance.update({
      where: { id },
      data: {
        status: 'DISBURSED',
        disbursedDate: new Date(),
      },
    });

    return updated;
  }

  /**
   * Registrar descuento de cuota
   */
  async registerInstallmentPayment(id, userId) {
    const advance = await prisma.employeeAdvance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new Error('Anticipo no encontrado');
    }

    if (advance.status !== 'DISBURSED' && advance.status !== 'IN_PAYMENT') {
      throw new Error('El anticipo debe estar desembolsado para registrar descuentos');
    }

    const installmentAmount = Number(advance.amount) / advance.installments;
    const newRemainingAmount = Number(advance.remainingAmount) - installmentAmount;
    const newInstallmentsPaid = advance.installmentsPaid + 1;

    // Determinar nuevo estado
    let newStatus = 'IN_PAYMENT';
    if (newInstallmentsPaid >= advance.installments) {
      newStatus = 'PAID';
    }

    const updated = await prisma.employeeAdvance.update({
      where: { id },
      data: {
        remainingAmount: Math.max(0, newRemainingAmount),
        installmentsPaid: newInstallmentsPaid,
        status: newStatus,
      },
    });

    return updated;
  }

  /**
   * Cancelar anticipo
   */
  async cancelAdvance(id, userId) {
    const advance = await prisma.employeeAdvance.findUnique({
      where: { id },
    });

    if (!advance) {
      throw new Error('Anticipo no encontrado');
    }

    if (advance.status === 'PAID') {
      throw new Error('No se puede cancelar un anticipo ya pagado');
    }

    const updated = await prisma.employeeAdvance.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    return updated;
  }

  /**
   * Obtener estadísticas de anticipos
   */
  async getAdvanceStats(employeeId = null) {
    const where = employeeId ? { employeeId } : {};

    const advances = await prisma.employeeAdvance.findMany({
      where,
    });

    const stats = {
      total: advances.length,
      pending: advances.filter((a) => a.status === 'PENDING').length,
      approved: advances.filter((a) => a.status === 'APPROVED').length,
      disbursed: advances.filter((a) => a.status === 'DISBURSED').length,
      inPayment: advances.filter((a) => a.status === 'IN_PAYMENT').length,
      paid: advances.filter((a) => a.status === 'PAID').length,
      rejected: advances.filter((a) => a.status === 'REJECTED').length,
      totalAmount: advances.reduce((sum, a) => sum + Number(a.amount), 0),
      totalRemaining: advances
        .filter((a) => a.status === 'IN_PAYMENT' || a.status === 'DISBURSED')
        .reduce((sum, a) => sum + Number(a.remainingAmount), 0),
    };

    return stats;
  }

  /**
   * Obtener anticipos pendientes de descuento para un empleado
   */
  async getPendingInstallments(employeeId) {
    const advances = await prisma.employeeAdvance.findMany({
      where: {
        employeeId,
        status: { in: ['DISBURSED', 'IN_PAYMENT'] },
      },
      orderBy: { disbursedDate: 'asc' },
    });

    return advances.map((advance) => ({
      id: advance.id,
      concept: advance.concept,
      totalAmount: Number(advance.amount),
      remainingAmount: Number(advance.remainingAmount),
      installments: advance.installments,
      installmentsPaid: advance.installmentsPaid,
      installmentAmount: Number(advance.amount) / advance.installments,
      nextInstallment: advance.installmentsPaid + 1,
    }));
  }
}

export default new EmployeeAdvanceService();
