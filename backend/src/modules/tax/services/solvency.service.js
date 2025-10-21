/**
 * @fileoverview Servicio para gestión de solvencias municipales
 * @module tax/services/solvency
 */

import prisma from '../../../config/database.js';
import crypto from 'crypto';

/**
 * Servicio para gestión de solvencias
 */
class SolvencyService {
  /**
   * Genera un código QR único para la solvencia
   * @param {string} solvencyNumber - Número de solvencia
   * @returns {string} Código QR
   */
  generateQRCode(solvencyNumber) {
    const data = `${solvencyNumber}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32).toUpperCase();
  }

  /**
   * Verifica si un contribuyente está solvente
   * @param {string} taxpayerId - ID del contribuyente
   * @param {string} solvencyType - Tipo de solvencia
   * @returns {Promise<Object>} Estado de solvencia
   */
  async checkSolvency(taxpayerId, solvencyType = 'GENERAL') {
    const taxpayer = await prisma.taxpayer.findUnique({
      where: { id: taxpayerId },
      include: {
        taxBills: {
          where: {
            status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
          },
        },
        businesses: true,
        properties: true,
        vehicles: true,
      },
    });

    if (!taxpayer) {
      throw new Error('Contribuyente no encontrado');
    }

    let isSolvente = true;
    let pendingDebts = [];
    let restrictions = [];

    // Verificar según el tipo de solvencia
    switch (solvencyType) {
      case 'GENERAL':
        // Verificar todas las deudas
        if (taxpayer.taxBills.length > 0) {
          isSolvente = false;
          pendingDebts = taxpayer.taxBills.map(bill => ({
            billNumber: bill.billNumber,
            concept: bill.concept,
            amount: bill.balanceAmount,
            dueDate: bill.dueDate,
          }));
          restrictions.push('Tiene deudas tributarias pendientes');
        }
        break;

      case 'BUSINESS':
        // Verificar solo deudas de actividades económicas
        const businessDebts = taxpayer.taxBills.filter(
          bill => bill.taxType === 'BUSINESS_TAX'
        );
        if (businessDebts.length > 0) {
          isSolvente = false;
          pendingDebts = businessDebts.map(bill => ({
            billNumber: bill.billNumber,
            concept: bill.concept,
            amount: bill.balanceAmount,
            dueDate: bill.dueDate,
          }));
          restrictions.push('Tiene deudas de patente comercial pendientes');
        }
        break;

      case 'PROPERTY':
        // Verificar solo deudas inmobiliarias
        const propertyDebts = taxpayer.taxBills.filter(
          bill => bill.taxType === 'PROPERTY_TAX'
        );
        if (propertyDebts.length > 0) {
          isSolvente = false;
          pendingDebts = propertyDebts.map(bill => ({
            billNumber: bill.billNumber,
            concept: bill.concept,
            amount: bill.balanceAmount,
            dueDate: bill.dueDate,
          }));
          restrictions.push('Tiene deudas de impuesto inmobiliario pendientes');
        }
        break;

      case 'VEHICLE':
        // Verificar solo deudas de vehículos
        const vehicleDebts = taxpayer.taxBills.filter(
          bill => bill.taxType === 'VEHICLE_TAX'
        );
        if (vehicleDebts.length > 0) {
          isSolvente = false;
          pendingDebts = vehicleDebts.map(bill => ({
            billNumber: bill.billNumber,
            concept: bill.concept,
            amount: bill.balanceAmount,
            dueDate: bill.dueDate,
          }));
          restrictions.push('Tiene deudas de impuesto vehicular pendientes');
        }
        break;
    }

    return {
      isSolvente,
      taxpayer: {
        taxId: taxpayer.taxId,
        name: taxpayer.businessName || `${taxpayer.firstName} ${taxpayer.lastName}`,
        status: taxpayer.status,
      },
      pendingDebts,
      restrictions,
      canIssueSolvency: isSolvente,
    };
  }

  /**
   * Genera una solvencia municipal
   * @param {Object} data - Datos de la solvencia
   * @returns {Promise<Object>} Solvencia generada
   */
  async generateSolvency(data) {
    const { taxpayerId, solvencyType, validityDays = 90, issuedBy } = data;

    // Verificar solvencia del contribuyente
    const check = await this.checkSolvency(taxpayerId, solvencyType);

    if (!check.isSolvente) {
      throw new Error(
        `No se puede emitir solvencia. Restricciones: ${check.restrictions.join(', ')}`
      );
    }

    // Generar número de solvencia único
    const year = new Date().getFullYear();
    const count = await prisma.solvency.count({
      where: {
        solvencyNumber: {
          startsWith: `SOL-${year}-`,
        },
      },
    });
    const solvencyNumber = `SOL-${year}-${String(count + 1).padStart(6, '0')}`;

    // Generar código QR
    const qrCode = this.generateQRCode(solvencyNumber);

    // Calcular fecha de vencimiento
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityDays);

    // Crear la solvencia
    const solvency = await prisma.solvency.create({
      data: {
        solvencyNumber,
        taxpayerId,
        solvencyType,
        issueDate,
        expiryDate,
        qrCode,
        status: 'ACTIVE',
        issuedBy,
      },
      include: {
        taxpayer: {
          select: {
            taxId: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    return solvency;
  }

  /**
   * Obtiene todas las solvencias con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Lista de solvencias y total
   */
  async getSolvencies(filters = {}) {
    const {
      taxpayerId,
      solvencyType,
      status,
      page = 1,
      limit = 10,
      search,
    } = filters;

    const where = {};

    if (taxpayerId) {
      where.taxpayerId = taxpayerId;
    }

    if (solvencyType) {
      where.solvencyType = solvencyType;
    }

    if (status) {
      where.status = status;
    }

    // Búsqueda por número de solvencia
    if (search) {
      where.solvencyNumber = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const skip = (page - 1) * limit;

    const [solvencies, total] = await Promise.all([
      prisma.solvency.findMany({
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
      prisma.solvency.count({ where }),
    ]);

    return {
      data: solvencies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene una solvencia por ID
   * @param {string} id - ID de la solvencia
   * @returns {Promise<Object>} Solvencia encontrada
   */
  async getSolvencyById(id) {
    const solvency = await prisma.solvency.findUnique({
      where: { id },
      include: {
        taxpayer: true,
      },
    });

    if (!solvency) {
      throw new Error('Solvencia no encontrada');
    }

    // Verificar si está vencida
    const now = new Date();
    if (solvency.status === 'ACTIVE' && new Date(solvency.expiryDate) < now) {
      // Actualizar estado a vencida
      await prisma.solvency.update({
        where: { id },
        data: { status: 'EXPIRED' },
      });
      solvency.status = 'EXPIRED';
    }

    return solvency;
  }

  /**
   * Obtiene una solvencia por número
   * @param {string} solvencyNumber - Número de solvencia
   * @returns {Promise<Object>} Solvencia encontrada
   */
  async getSolvencyByNumber(solvencyNumber) {
    const solvency = await prisma.solvency.findUnique({
      where: { solvencyNumber },
      include: {
        taxpayer: true,
      },
    });

    if (!solvency) {
      throw new Error('Solvencia no encontrada');
    }

    // Verificar si está vencida
    const now = new Date();
    if (solvency.status === 'ACTIVE' && new Date(solvency.expiryDate) < now) {
      await prisma.solvency.update({
        where: { id: solvency.id },
        data: { status: 'EXPIRED' },
      });
      solvency.status = 'EXPIRED';
    }

    return solvency;
  }

  /**
   * Verifica una solvencia por código QR
   * @param {string} qrCode - Código QR
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verifySolvencyByQR(qrCode) {
    const solvency = await prisma.solvency.findUnique({
      where: { qrCode },
      include: {
        taxpayer: {
          select: {
            taxId: true,
            firstName: true,
            lastName: true,
            businessName: true,
          },
        },
      },
    });

    if (!solvency) {
      return {
        valid: false,
        message: 'Código QR no válido',
      };
    }

    const now = new Date();
    const isExpired = new Date(solvency.expiryDate) < now;
    const isRevoked = solvency.status === 'REVOKED';

    if (isExpired) {
      await prisma.solvency.update({
        where: { id: solvency.id },
        data: { status: 'EXPIRED' },
      });

      return {
        valid: false,
        message: 'Solvencia vencida',
        solvency: {
          solvencyNumber: solvency.solvencyNumber,
          issueDate: solvency.issueDate,
          expiryDate: solvency.expiryDate,
          status: 'EXPIRED',
        },
      };
    }

    if (isRevoked) {
      return {
        valid: false,
        message: 'Solvencia revocada',
        solvency: {
          solvencyNumber: solvency.solvencyNumber,
          issueDate: solvency.issueDate,
          expiryDate: solvency.expiryDate,
          status: 'REVOKED',
        },
      };
    }

    return {
      valid: true,
      message: 'Solvencia válida',
      solvency: {
        solvencyNumber: solvency.solvencyNumber,
        solvencyType: solvency.solvencyType,
        issueDate: solvency.issueDate,
        expiryDate: solvency.expiryDate,
        status: solvency.status,
        taxpayer: {
          taxId: solvency.taxpayer.taxId,
          name: solvency.taxpayer.businessName || 
                `${solvency.taxpayer.firstName} ${solvency.taxpayer.lastName}`,
        },
      },
    };
  }

  /**
   * Revoca una solvencia
   * @param {string} id - ID de la solvencia
   * @param {string} reason - Razón de la revocación
   * @returns {Promise<Object>} Solvencia revocada
   */
  async revokeSolvency(id, reason) {
    const solvency = await prisma.solvency.findUnique({
      where: { id },
    });

    if (!solvency) {
      throw new Error('Solvencia no encontrada');
    }

    if (solvency.status !== 'ACTIVE') {
      throw new Error('Solo se pueden revocar solvencias activas');
    }

    const revoked = await prisma.solvency.update({
      where: { id },
      data: {
        status: 'REVOKED',
        notes: `${solvency.notes || ''}\nRevocada: ${reason}`,
      },
      include: {
        taxpayer: true,
      },
    });

    return revoked;
  }

  /**
   * Obtiene estadísticas de solvencias
   * @param {Object} filters - Filtros para estadísticas
   * @returns {Promise<Object>} Estadísticas
   */
  async getSolvencyStatistics(filters = {}) {
    const { year } = filters;

    const where = {};

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      where.issueDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [
      totalSolvencies,
      activeSolvencies,
      expiredSolvencies,
      revokedSolvencies,
      byType,
    ] = await Promise.all([
      prisma.solvency.count({ where }),
      prisma.solvency.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.solvency.count({ where: { ...where, status: 'EXPIRED' } }),
      prisma.solvency.count({ where: { ...where, status: 'REVOKED' } }),
      prisma.solvency.groupBy({
        by: ['solvencyType'],
        where,
        _count: true,
      }),
    ]);

    // Solvencias por mes (si se especifica año)
    let byMonth = [];
    if (year) {
      const monthlyData = await prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM issue_date) as month,
          COUNT(*) as count
        FROM solvencies
        WHERE EXTRACT(YEAR FROM issue_date) = ${parseInt(year)}
        GROUP BY EXTRACT(MONTH FROM issue_date)
        ORDER BY month
      `;
      byMonth = monthlyData;
    }

    return {
      total: {
        solvencies: totalSolvencies,
        active: activeSolvencies,
        expired: expiredSolvencies,
        revoked: revokedSolvencies,
      },
      byType: byType.map(item => ({
        solvencyType: item.solvencyType,
        count: item._count,
      })),
      byMonth,
    };
  }

  /**
   * Obtiene solvencias próximas a vencer
   * @param {number} days - Días de anticipación
   * @returns {Promise<Array>} Solvencias próximas a vencer
   */
  async getExpiringsSolvencies(days = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const solvencies = await prisma.solvency.findMany({
      where: {
        status: 'ACTIVE',
        expiryDate: {
          gte: today,
          lte: futureDate,
        },
      },
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
      },
      orderBy: { expiryDate: 'asc' },
    });

    return solvencies.map(solvency => {
      const daysUntilExpiry = Math.ceil(
        (new Date(solvency.expiryDate) - today) / (1000 * 60 * 60 * 24)
      );

      return {
        ...solvency,
        daysUntilExpiry,
      };
    });
  }
}

export default new SolvencyService();
