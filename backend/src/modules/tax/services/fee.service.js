/**
 * @fileoverview Servicio para gestión de facturación de tasas municipales
 * @module tax/services/fee
 */

import prisma from '../../../config/database.js';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Servicio para gestión de tasas municipales
 */
class FeeService {
  /**
   * Crea una factura de tasa municipal
   * @param {Object} data - Datos de la factura
   * @returns {Promise<Object>} Factura creada
   */
  async createFeeBill(data) {
    const {
      taxpayerId,
      taxType,
      concept,
      baseAmount,
      taxRate,
      fiscalYear,
      fiscalPeriod,
      dueDate,
      notes,
    } = data;

    // Verificar que el contribuyente existe
    const taxpayer = await prisma.taxpayer.findUnique({
      where: { id: taxpayerId },
    });

    if (!taxpayer) {
      throw new Error('Contribuyente no encontrado');
    }

    // Calcular montos
    const taxAmount = new Decimal(baseAmount).mul(new Decimal(taxRate));
    const totalAmount = new Decimal(baseAmount).add(taxAmount);

    // Generar número de factura único
    const year = new Date().getFullYear();
    const count = await prisma.taxBill.count({
      where: {
        billNumber: {
          startsWith: `FB-${year}-`,
        },
      },
    });
    const billNumber = `FB-${year}-${String(count + 1).padStart(6, '0')}`;

    // Generar código de pago único
    const paymentCode = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Crear la factura
    const bill = await prisma.taxBill.create({
      data: {
        billNumber,
        taxpayerId,
        taxType,
        concept,
        baseAmount,
        taxRate,
        taxAmount,
        totalAmount,
        balanceAmount: totalAmount,
        fiscalYear,
        fiscalPeriod,
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        paymentCode,
        status: 'PENDING',
        notes,
      },
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
      },
    });

    return bill;
  }

  /**
   * Obtiene todas las facturas de tasas con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Lista de facturas y total
   */
  async getFeeBills(filters = {}) {
    const {
      taxpayerId,
      taxType,
      status,
      fiscalYear,
      page = 1,
      limit = 10,
      search,
    } = filters;

    const where = {};

    if (taxpayerId) {
      where.taxpayerId = taxpayerId;
    }

    if (taxType) {
      where.taxType = taxType;
    }

    if (status) {
      where.status = status;
    }

    if (fiscalYear) {
      where.fiscalYear = parseInt(fiscalYear);
    }

    // Búsqueda por número de factura o concepto
    if (search) {
      where.OR = [
        { billNumber: { contains: search, mode: 'insensitive' } },
        { concept: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      prisma.taxBill.findMany({
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.taxBill.count({ where }),
    ]);

    return {
      data: bills,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene una factura por ID
   * @param {string} id - ID de la factura
   * @returns {Promise<Object>} Factura encontrada
   */
  async getFeeBillById(id) {
    const bill = await prisma.taxBill.findUnique({
      where: { id },
      include: {
        taxpayer: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!bill) {
      throw new Error('Factura no encontrada');
    }

    return bill;
  }

  /**
   * Obtiene una factura por número de factura
   * @param {string} billNumber - Número de factura
   * @returns {Promise<Object>} Factura encontrada
   */
  async getFeeBillByNumber(billNumber) {
    const bill = await prisma.taxBill.findUnique({
      where: { billNumber },
      include: {
        taxpayer: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!bill) {
      throw new Error('Factura no encontrada');
    }

    return bill;
  }

  /**
   * Actualiza una factura de tasa
   * @param {string} id - ID de la factura
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Factura actualizada
   */
  async updateFeeBill(id, data) {
    const bill = await prisma.taxBill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new Error('Factura no encontrada');
    }

    // No permitir actualizar facturas pagadas
    if (bill.status === 'PAID') {
      throw new Error('No se puede actualizar una factura pagada');
    }

    const {
      baseAmount,
      taxRate,
      dueDate,
      notes,
      surcharges,
      discounts,
    } = data;

    // Recalcular montos si se actualizan
    let updateData = { ...data };

    if (baseAmount !== undefined || taxRate !== undefined) {
      const newBaseAmount = baseAmount !== undefined ? new Decimal(baseAmount) : new Decimal(bill.baseAmount);
      const newTaxRate = taxRate !== undefined ? new Decimal(taxRate) : new Decimal(bill.taxRate);
      const taxAmount = newBaseAmount.mul(newTaxRate);
      const newSurcharges = surcharges !== undefined ? new Decimal(surcharges) : new Decimal(bill.surcharges);
      const newDiscounts = discounts !== undefined ? new Decimal(discounts) : new Decimal(bill.discounts);
      const totalAmount = newBaseAmount.add(taxAmount).add(newSurcharges).sub(newDiscounts);
      const paidAmount = new Decimal(bill.paidAmount);
      const balanceAmount = totalAmount.sub(paidAmount);

      updateData = {
        ...updateData,
        taxAmount,
        totalAmount,
        balanceAmount,
      };
    }

    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    const updatedBill = await prisma.taxBill.update({
      where: { id },
      data: updateData,
      include: {
        taxpayer: true,
      },
    });

    return updatedBill;
  }

  /**
   * Anula una factura de tasa
   * @param {string} id - ID de la factura
   * @param {string} reason - Razón de anulación
   * @returns {Promise<Object>} Factura anulada
   */
  async cancelFeeBill(id, reason) {
    const bill = await prisma.taxBill.findUnique({
      where: { id },
    });

    if (!bill) {
      throw new Error('Factura no encontrada');
    }

    if (bill.status === 'PAID') {
      throw new Error('No se puede anular una factura pagada');
    }

    const cancelledBill = await prisma.taxBill.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: `${bill.notes || ''}\nAnulada: ${reason}`,
      },
      include: {
        taxpayer: true,
      },
    });

    return cancelledBill;
  }

  /**
   * Genera facturas masivas de tasa de aseo urbano
   * @param {Object} data - Datos para generación masiva
   * @returns {Promise<Object>} Resultado de la generación
   */
  async generateUrbanCleaningBills(data) {
    const {
      fiscalYear,
      fiscalPeriod,
      dueDate,
      residentialRate,
      commercialRate,
    } = data;

    // Obtener todas las propiedades activas
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        taxpayer: true,
      },
    });

    const bills = [];
    const errors = [];

    for (const property of properties) {
      try {
        // Determinar la tasa según el uso
        const taxRate = property.propertyUse === 'RESIDENTIAL' 
          ? new Decimal(residentialRate) 
          : new Decimal(commercialRate);

        // Base imponible según área construida
        const baseAmount = new Decimal(property.buildingArea || property.landArea).mul(new Decimal('0.5'));

        const bill = await this.createFeeBill({
          taxpayerId: property.taxpayerId,
          taxType: 'URBAN_CLEANING',
          concept: `Tasa de Aseo Urbano - ${fiscalPeriod} ${fiscalYear} - ${property.address}`,
          baseAmount: baseAmount.toNumber(),
          taxRate: taxRate.toNumber(),
          fiscalYear,
          fiscalPeriod,
          dueDate,
          notes: `Generada automáticamente para propiedad ${property.cadastralCode}`,
        });

        bills.push(bill);
      } catch (error) {
        errors.push({
          propertyId: property.id,
          cadastralCode: property.cadastralCode,
          error: error.message,
        });
      }
    }

    return {
      success: bills.length,
      errors: errors.length,
      bills,
      errorDetails: errors,
    };
  }

  /**
   * Obtiene estadísticas de facturación de tasas
   * @param {Object} filters - Filtros para estadísticas
   * @returns {Promise<Object>} Estadísticas
   */
  async getFeeStatistics(filters = {}) {
    const { fiscalYear, taxType } = filters;

    const where = {};

    if (fiscalYear) {
      where.fiscalYear = parseInt(fiscalYear);
    }

    if (taxType) {
      where.taxType = taxType;
    }

    const [
      totalBills,
      pendingBills,
      paidBills,
      overdueBills,
      totalAmount,
      paidAmount,
      pendingAmount,
    ] = await Promise.all([
      prisma.taxBill.count({ where }),
      prisma.taxBill.count({ where: { ...where, status: 'PENDING' } }),
      prisma.taxBill.count({ where: { ...where, status: 'PAID' } }),
      prisma.taxBill.count({ where: { ...where, status: 'OVERDUE' } }),
      prisma.taxBill.aggregate({
        where,
        _sum: { totalAmount: true },
      }),
      prisma.taxBill.aggregate({
        where,
        _sum: { paidAmount: true },
      }),
      prisma.taxBill.aggregate({
        where,
        _sum: { balanceAmount: true },
      }),
    ]);

    // Estadísticas por tipo de tasa
    const byType = await prisma.taxBill.groupBy({
      by: ['taxType'],
      where,
      _count: true,
      _sum: {
        totalAmount: true,
        paidAmount: true,
        balanceAmount: true,
      },
    });

    return {
      total: {
        bills: totalBills,
        pending: pendingBills,
        paid: paidBills,
        overdue: overdueBills,
      },
      amounts: {
        total: totalAmount._sum.totalAmount || 0,
        paid: paidAmount._sum.paidAmount || 0,
        pending: pendingAmount._sum.balanceAmount || 0,
      },
      byType: byType.map(item => ({
        taxType: item.taxType,
        count: item._count,
        totalAmount: item._sum.totalAmount || 0,
        paidAmount: item._sum.paidAmount || 0,
        pendingAmount: item._sum.balanceAmount || 0,
      })),
    };
  }
}

export default new FeeService();
