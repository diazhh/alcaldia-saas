/**
 * @fileoverview Servicio para portal de autopago tributario
 * @module tax/services/payment
 */

import prisma from '../../../config/database.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Servicio para gestión de pagos tributarios
 */
class PaymentService {
  /**
   * Consulta deudas de un contribuyente por RIF/CI
   * @param {string} taxId - RIF o CI del contribuyente
   * @returns {Promise<Object>} Información de deudas
   */
  async getDebtsByTaxId(taxId) {
    // Buscar contribuyente
    const taxpayer = await prisma.taxpayer.findUnique({
      where: { taxId },
      include: {
        taxBills: {
          where: {
            status: {
              in: ['PENDING', 'PARTIAL', 'OVERDUE'],
            },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!taxpayer) {
      throw new Error('Contribuyente no encontrado');
    }

    // Calcular totales
    const totalDebt = taxpayer.taxBills.reduce(
      (sum, bill) => sum.add(new Decimal(bill.balanceAmount)),
      new Decimal(0)
    );

    const overdueDebt = taxpayer.taxBills
      .filter(bill => new Date(bill.dueDate) < new Date())
      .reduce(
        (sum, bill) => sum.add(new Decimal(bill.balanceAmount)),
        new Decimal(0)
      );

    return {
      taxpayer: {
        id: taxpayer.id,
        taxId: taxpayer.taxId,
        name: taxpayer.businessName || `${taxpayer.firstName} ${taxpayer.lastName}`,
        email: taxpayer.email,
        phone: taxpayer.phone,
        status: taxpayer.status,
      },
      debts: {
        total: totalDebt.toNumber(),
        overdue: overdueDebt.toNumber(),
        current: totalDebt.sub(overdueDebt).toNumber(),
        count: taxpayer.taxBills.length,
      },
      bills: taxpayer.taxBills.map(bill => ({
        id: bill.id,
        billNumber: bill.billNumber,
        taxType: bill.taxType,
        concept: bill.concept,
        totalAmount: bill.totalAmount,
        paidAmount: bill.paidAmount,
        balanceAmount: bill.balanceAmount,
        issueDate: bill.issueDate,
        dueDate: bill.dueDate,
        status: bill.status,
        isOverdue: new Date(bill.dueDate) < new Date(),
        paymentCode: bill.paymentCode,
      })),
    };
  }

  /**
   * Genera planilla de pago con código de referencia
   * @param {Object} data - Datos para generar planilla
   * @returns {Promise<Object>} Planilla de pago
   */
  async generatePaymentSlip(data) {
    const { billIds } = data;

    if (!billIds || billIds.length === 0) {
      throw new Error('Debe seleccionar al menos una factura');
    }

    // Obtener facturas
    const bills = await prisma.taxBill.findMany({
      where: {
        id: { in: billIds },
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      },
      include: {
        taxpayer: true,
      },
    });

    if (bills.length === 0) {
      throw new Error('No se encontraron facturas válidas para pago');
    }

    // Verificar que todas las facturas son del mismo contribuyente
    const taxpayerIds = [...new Set(bills.map(b => b.taxpayerId))];
    if (taxpayerIds.length > 1) {
      throw new Error('Todas las facturas deben pertenecer al mismo contribuyente');
    }

    // Calcular total a pagar
    const totalAmount = bills.reduce(
      (sum, bill) => sum.add(new Decimal(bill.balanceAmount)),
      new Decimal(0)
    );

    // Generar código de referencia único
    const referenceCode = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const slip = {
      referenceCode,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      taxpayer: {
        taxId: bills[0].taxpayer.taxId,
        name: bills[0].taxpayer.businessName || `${bills[0].taxpayer.firstName} ${bills[0].taxpayer.lastName}`,
        email: bills[0].taxpayer.email,
        phone: bills[0].taxpayer.phone,
      },
      bills: bills.map(bill => ({
        billNumber: bill.billNumber,
        concept: bill.concept,
        amount: bill.balanceAmount,
      })),
      totalAmount: totalAmount.toNumber(),
      paymentInstructions: {
        methods: [
          'Transferencia bancaria',
          'Pago móvil',
          'Punto de venta en taquillas municipales',
        ],
        bankAccounts: [
          {
            bank: 'Banco Municipal',
            accountNumber: '0000-0000-0000-0000',
            accountType: 'Corriente',
            rif: 'G-00000000-0',
          },
        ],
      },
    };

    return slip;
  }

  /**
   * Registra un pago tributario
   * @param {Object} data - Datos del pago
   * @returns {Promise<Object>} Pago registrado
   */
  async registerPayment(data) {
    const {
      taxpayerId,
      billIds,
      amount,
      paymentMethod,
      paymentDate,
      bankName,
      referenceNumber,
      registeredBy,
      notes,
    } = data;

    // Verificar contribuyente
    const taxpayer = await prisma.taxpayer.findUnique({
      where: { id: taxpayerId },
    });

    if (!taxpayer) {
      throw new Error('Contribuyente no encontrado');
    }

    // Obtener facturas
    const bills = await prisma.taxBill.findMany({
      where: {
        id: { in: billIds },
        taxpayerId,
        status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
      },
      orderBy: { dueDate: 'asc' },
    });

    if (bills.length === 0) {
      throw new Error('No se encontraron facturas válidas para aplicar el pago');
    }

    // Generar número de recibo
    const year = new Date().getFullYear();
    const count = await prisma.taxPayment.count({
      where: {
        receiptNumber: {
          startsWith: `REC-${year}-`,
        },
      },
    });
    const receiptNumber = `REC-${year}-${String(count + 1).padStart(6, '0')}`;

    // Iniciar transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el pago
      const payment = await tx.taxPayment.create({
        data: {
          receiptNumber,
          taxpayerId,
          amount,
          paymentMethod,
          paymentDate: new Date(paymentDate),
          bankName,
          referenceNumber,
          registeredBy,
          notes,
          status: 'COMPLETED',
        },
      });

      // Aplicar el pago a las facturas
      let remainingAmount = new Decimal(amount);

      for (const bill of bills) {
        if (remainingAmount.lte(0)) break;

        const billBalance = new Decimal(bill.balanceAmount);
        const paymentToApply = remainingAmount.gte(billBalance) ? billBalance : remainingAmount;

        const newPaidAmount = new Decimal(bill.paidAmount).add(paymentToApply);
        const newBalanceAmount = new Decimal(bill.totalAmount).sub(newPaidAmount);

        // Actualizar factura
        await tx.taxBill.update({
          where: { id: bill.id },
          data: {
            paidAmount: newPaidAmount,
            balanceAmount: newBalanceAmount,
            status: newBalanceAmount.lte(0) ? 'PAID' : 'PARTIAL',
          },
        });

        remainingAmount = remainingAmount.sub(paymentToApply);
      }

      return payment;
    });

    // Obtener el pago completo con relaciones
    const fullPayment = await prisma.taxPayment.findUnique({
      where: { id: result.id },
      include: {
        taxpayer: true,
        taxBill: true,
      },
    });

    return fullPayment;
  }

  /**
   * Obtiene el recibo de un pago
   * @param {string} receiptNumber - Número de recibo
   * @returns {Promise<Object>} Recibo de pago
   */
  async getReceipt(receiptNumber) {
    const payment = await prisma.taxPayment.findUnique({
      where: { receiptNumber },
      include: {
        taxpayer: true,
        taxBill: true,
      },
    });

    if (!payment) {
      throw new Error('Recibo no encontrado');
    }

    // Obtener todas las facturas afectadas por este pago
    const affectedBills = await prisma.taxBill.findMany({
      where: {
        taxpayerId: payment.taxpayerId,
        updatedAt: {
          gte: new Date(payment.createdAt.getTime() - 1000), // 1 segundo antes
          lte: new Date(payment.createdAt.getTime() + 1000), // 1 segundo después
        },
      },
    });

    return {
      receipt: {
        receiptNumber: payment.receiptNumber,
        paymentDate: payment.paymentDate,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        bankName: payment.bankName,
        referenceNumber: payment.referenceNumber,
        status: payment.status,
      },
      taxpayer: {
        taxId: payment.taxpayer.taxId,
        name: payment.taxpayer.businessName || `${payment.taxpayer.firstName} ${payment.taxpayer.lastName}`,
        email: payment.taxpayer.email,
        phone: payment.taxpayer.phone,
      },
      bills: affectedBills.map(bill => ({
        billNumber: bill.billNumber,
        concept: bill.concept,
        totalAmount: bill.totalAmount,
        paidAmount: bill.paidAmount,
        balanceAmount: bill.balanceAmount,
        status: bill.status,
      })),
      issuedAt: payment.createdAt,
    };
  }

  /**
   * Obtiene historial de pagos de un contribuyente
   * @param {string} taxpayerId - ID del contribuyente
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Object>} Historial de pagos
   */
  async getPaymentHistory(taxpayerId, filters = {}) {
    const { page = 1, limit = 10, startDate, endDate } = filters;

    const where = { taxpayerId };

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.taxPayment.findMany({
        where,
        include: {
          taxBill: {
            select: {
              billNumber: true,
              concept: true,
              taxType: true,
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.taxPayment.count({ where }),
    ]);

    const totalPaid = await prisma.taxPayment.aggregate({
      where,
      _sum: { amount: true },
    });

    return {
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalPaid: totalPaid._sum.amount || 0,
        totalPayments: total,
      },
    };
  }

  /**
   * Verifica el estado de un código de pago
   * @param {string} paymentCode - Código de pago
   * @returns {Promise<Object>} Estado del código de pago
   */
  async verifyPaymentCode(paymentCode) {
    const bill = await prisma.taxBill.findUnique({
      where: { paymentCode },
      include: {
        taxpayer: {
          select: {
            taxId: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!bill) {
      throw new Error('Código de pago no válido');
    }

    return {
      valid: true,
      bill: {
        billNumber: bill.billNumber,
        concept: bill.concept,
        taxType: bill.taxType,
        totalAmount: bill.totalAmount,
        paidAmount: bill.paidAmount,
        balanceAmount: bill.balanceAmount,
        issueDate: bill.issueDate,
        dueDate: bill.dueDate,
        status: bill.status,
        isOverdue: new Date(bill.dueDate) < new Date(),
      },
      taxpayer: bill.taxpayer,
      recentPayments: bill.payments,
    };
  }
}

export default new PaymentService();
