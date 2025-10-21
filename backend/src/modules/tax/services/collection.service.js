/**
 * @fileoverview Servicio para gestión de cobranza tributaria
 * @module tax/services/collection
 */

import prisma from '../../../config/database.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Servicio para gestión de cobranza
 */
class CollectionService {
  /**
   * Identifica automáticamente contribuyentes morosos
   * @returns {Promise<Object>} Resultado de la identificación
   */
  async identifyDefaulters() {
    const today = new Date();

    // Buscar facturas vencidas no pagadas
    const overdueBills = await prisma.taxBill.findMany({
      where: {
        status: { in: ['PENDING', 'PARTIAL'] },
        dueDate: { lt: today },
      },
      include: {
        taxpayer: true,
      },
    });

    // Agrupar por contribuyente
    const defaultersByTaxpayer = {};

    for (const bill of overdueBills) {
      if (!defaultersByTaxpayer[bill.taxpayerId]) {
        defaultersByTaxpayer[bill.taxpayerId] = {
          taxpayer: bill.taxpayer,
          bills: [],
          totalDebt: new Decimal(0),
          oldestDebtDate: bill.dueDate,
        };
      }

      defaultersByTaxpayer[bill.taxpayerId].bills.push(bill);
      defaultersByTaxpayer[bill.taxpayerId].totalDebt = 
        defaultersByTaxpayer[bill.taxpayerId].totalDebt.add(new Decimal(bill.balanceAmount));

      if (new Date(bill.dueDate) < new Date(defaultersByTaxpayer[bill.taxpayerId].oldestDebtDate)) {
        defaultersByTaxpayer[bill.taxpayerId].oldestDebtDate = bill.dueDate;
      }
    }

    // Crear o actualizar registros de cobranza
    const collections = [];

    for (const taxpayerId in defaultersByTaxpayer) {
      const data = defaultersByTaxpayer[taxpayerId];
      const debtAge = Math.floor((today - new Date(data.oldestDebtDate)) / (1000 * 60 * 60 * 24));

      // Determinar prioridad según antigüedad
      let priority = 'LOW';
      let stage = 'REMINDER';

      if (debtAge > 180) {
        priority = 'URGENT';
        stage = 'LEGAL';
      } else if (debtAge > 90) {
        priority = 'HIGH';
        stage = 'FORMAL';
      } else if (debtAge > 30) {
        priority = 'MEDIUM';
        stage = 'NOTICE';
      }

      // Verificar si ya existe un registro de cobranza activo
      const existing = await prisma.debtCollection.findFirst({
        where: {
          taxpayerId,
          status: { in: ['ACTIVE', 'PAYMENT_PLAN'] },
        },
      });

      if (existing) {
        // Actualizar existente
        const updated = await prisma.debtCollection.update({
          where: { id: existing.id },
          data: {
            totalDebt: data.totalDebt.toNumber(),
            oldestDebtDate: data.oldestDebtDate,
            debtAge,
            priority,
            stage,
          },
        });
        collections.push(updated);
      } else {
        // Crear nuevo
        const created = await prisma.debtCollection.create({
          data: {
            taxpayerId,
            totalDebt: data.totalDebt.toNumber(),
            oldestDebtDate: data.oldestDebtDate,
            debtAge,
            priority,
            stage,
            status: 'ACTIVE',
          },
        });
        collections.push(created);
      }
    }

    return {
      identified: collections.length,
      collections,
    };
  }

  /**
   * Obtiene todos los casos de cobranza con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Lista de casos y total
   */
  async getCollections(filters = {}) {
    const {
      status,
      priority,
      stage,
      assignedTo,
      page = 1,
      limit = 10,
      search,
    } = filters;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (stage) {
      where.stage = stage;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // Búsqueda por RIF/CI o nombre del contribuyente
    if (search) {
      where.taxpayer = {
        OR: [
          { taxId: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const skip = (page - 1) * limit;

    const [collections, total] = await Promise.all([
      prisma.debtCollection.findMany({
        where,
        include: {
          taxpayer: {
            select: {
              id: true,
              taxId: true,
              firstName: true,
              lastName: true,
              businessName: true,
              email: true,
              phone: true,
            },
          },
          actions: {
            orderBy: { actionDate: 'desc' },
            take: 3,
          },
        },
        orderBy: [
          { priority: 'desc' },
          { debtAge: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.debtCollection.count({ where }),
    ]);

    return {
      data: collections,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene un caso de cobranza por ID
   * @param {string} id - ID del caso
   * @returns {Promise<Object>} Caso de cobranza
   */
  async getCollectionById(id) {
    const collection = await prisma.debtCollection.findUnique({
      where: { id },
      include: {
        taxpayer: {
          include: {
            taxBills: {
              where: {
                status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
              },
              orderBy: { dueDate: 'asc' },
            },
          },
        },
        actions: {
          orderBy: { actionDate: 'desc' },
        },
      },
    });

    if (!collection) {
      throw new Error('Caso de cobranza no encontrado');
    }

    return collection;
  }

  /**
   * Registra una acción de cobranza
   * @param {string} collectionId - ID del caso de cobranza
   * @param {Object} data - Datos de la acción
   * @returns {Promise<Object>} Acción registrada
   */
  async registerAction(collectionId, data) {
    const { actionType, description, result, nextActionDate, performedBy } = data;

    // Verificar que el caso existe
    const collection = await prisma.debtCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error('Caso de cobranza no encontrado');
    }

    // Crear la acción
    const action = await prisma.collectionAction.create({
      data: {
        debtCollectionId: collectionId,
        actionType,
        actionDate: new Date(),
        description,
        result,
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        performedBy,
      },
    });

    // Actualizar el caso de cobranza
    await prisma.debtCollection.update({
      where: { id: collectionId },
      data: {
        notificationsSent: { increment: 1 },
        lastNotificationDate: new Date(),
      },
    });

    return action;
  }

  /**
   * Envía notificaciones escalonadas a morosos
   * @param {Object} filters - Filtros para seleccionar casos
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendNotifications(filters = {}) {
    const { stage, priority } = filters;

    const where = {
      status: 'ACTIVE',
    };

    if (stage) {
      where.stage = stage;
    }

    if (priority) {
      where.priority = priority;
    }

    const collections = await prisma.debtCollection.findMany({
      where,
      include: {
        taxpayer: true,
      },
    });

    const notifications = [];

    for (const collection of collections) {
      // Determinar el tipo de notificación según la etapa
      let notificationType;
      let message;

      switch (collection.stage) {
        case 'REMINDER':
          notificationType = 'EMAIL';
          message = 'Recordatorio amigable de pago';
          break;
        case 'NOTICE':
          notificationType = 'SMS';
          message = 'Aviso de mora';
          break;
        case 'FORMAL':
          notificationType = 'LETTER';
          message = 'Intimación formal';
          break;
        case 'LEGAL':
          notificationType = 'LEGAL_NOTICE';
          message = 'Pre-aviso de medidas coactivas';
          break;
        default:
          notificationType = 'EMAIL';
          message = 'Notificación de deuda';
      }

      // Registrar la acción de notificación
      const action = await this.registerAction(collection.id, {
        actionType: notificationType,
        description: message,
        result: 'Notificación enviada',
        performedBy: 'SYSTEM',
      });

      notifications.push({
        collectionId: collection.id,
        taxpayerId: collection.taxpayerId,
        notificationType,
        message,
        actionId: action.id,
      });
    }

    return {
      sent: notifications.length,
      notifications,
    };
  }

  /**
   * Crea un convenio de pago
   * @param {string} collectionId - ID del caso de cobranza
   * @param {Object} data - Datos del convenio
   * @returns {Promise<Object>} Convenio creado
   */
  async createPaymentPlan(collectionId, data) {
    const { installments, firstPaymentDate, notes, createdBy } = data;

    const collection = await prisma.debtCollection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new Error('Caso de cobranza no encontrado');
    }

    // Actualizar el caso con el convenio
    const updated = await prisma.debtCollection.update({
      where: { id: collectionId },
      data: {
        hasPaymentPlan: true,
        paymentPlanDate: new Date(firstPaymentDate),
        installments,
        status: 'PAYMENT_PLAN',
        notes: `${collection.notes || ''}\nConvenio de pago: ${installments} cuotas. ${notes || ''}`,
      },
    });

    // Registrar la acción
    await this.registerAction(collectionId, {
      actionType: 'PAYMENT_PLAN',
      description: `Convenio de pago acordado: ${installments} cuotas`,
      result: 'Convenio aceptado por el contribuyente',
      nextActionDate: firstPaymentDate,
      performedBy: createdBy,
    });

    return updated;
  }

  /**
   * Calcula intereses moratorios
   * @param {string} billId - ID de la factura
   * @returns {Promise<Object>} Cálculo de intereses
   */
  async calculateLateInterest(billId) {
    const bill = await prisma.taxBill.findUnique({
      where: { id: billId },
    });

    if (!bill) {
      throw new Error('Factura no encontrada');
    }

    const today = new Date();
    const dueDate = new Date(bill.dueDate);

    if (today <= dueDate) {
      return {
        daysLate: 0,
        interestRate: 0,
        interestAmount: 0,
        totalWithInterest: bill.balanceAmount,
      };
    }

    const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    
    // Tasa de interés moratorio: 1.5% mensual (0.05% diario)
    const dailyRate = 0.0005;
    const interestRate = daysLate * dailyRate;
    const interestAmount = new Decimal(bill.balanceAmount).mul(new Decimal(interestRate));
    const totalWithInterest = new Decimal(bill.balanceAmount).add(interestAmount);

    return {
      billNumber: bill.billNumber,
      originalAmount: bill.balanceAmount,
      daysLate,
      interestRate: (interestRate * 100).toFixed(2) + '%',
      interestAmount: interestAmount.toNumber(),
      totalWithInterest: totalWithInterest.toNumber(),
    };
  }

  /**
   * Obtiene estadísticas de cobranza
   * @returns {Promise<Object>} Estadísticas
   */
  async getCollectionStatistics() {
    const [
      totalCases,
      activeCases,
      resolvedCases,
      paymentPlanCases,
      totalDebt,
      byPriority,
      byStage,
    ] = await Promise.all([
      prisma.debtCollection.count(),
      prisma.debtCollection.count({ where: { status: 'ACTIVE' } }),
      prisma.debtCollection.count({ where: { status: 'RESOLVED' } }),
      prisma.debtCollection.count({ where: { status: 'PAYMENT_PLAN' } }),
      prisma.debtCollection.aggregate({
        where: { status: { in: ['ACTIVE', 'PAYMENT_PLAN'] } },
        _sum: { totalDebt: true },
      }),
      prisma.debtCollection.groupBy({
        by: ['priority'],
        where: { status: { in: ['ACTIVE', 'PAYMENT_PLAN'] } },
        _count: true,
        _sum: { totalDebt: true },
      }),
      prisma.debtCollection.groupBy({
        by: ['stage'],
        where: { status: { in: ['ACTIVE', 'PAYMENT_PLAN'] } },
        _count: true,
        _sum: { totalDebt: true },
      }),
    ]);

    return {
      total: {
        cases: totalCases,
        active: activeCases,
        resolved: resolvedCases,
        paymentPlan: paymentPlanCases,
        totalDebt: totalDebt._sum.totalDebt || 0,
      },
      byPriority: byPriority.map(item => ({
        priority: item.priority,
        count: item._count,
        totalDebt: item._sum.totalDebt || 0,
      })),
      byStage: byStage.map(item => ({
        stage: item.stage,
        count: item._count,
        totalDebt: item._sum.totalDebt || 0,
      })),
    };
  }

  /**
   * Cierra un caso de cobranza
   * @param {string} id - ID del caso
   * @param {string} reason - Razón del cierre
   * @returns {Promise<Object>} Caso cerrado
   */
  async closeCollection(id, reason) {
    const collection = await prisma.debtCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      throw new Error('Caso de cobranza no encontrado');
    }

    const closed = await prisma.debtCollection.update({
      where: { id },
      data: {
        status: 'CLOSED',
        notes: `${collection.notes || ''}\nCerrado: ${reason}`,
      },
    });

    return closed;
  }
}

export default new CollectionService();
