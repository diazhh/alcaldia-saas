/**
 * Controlador de Estadísticas Tributarias
 * Proporciona datos agregados para el dashboard
 */

import prisma from '../../../config/database.js';

/**
 * Obtener estadísticas generales del módulo tributario
 */
export const getGeneralStatistics = async (req, res) => {
  try {
    // Obtener totales
    const totalTaxpayers = await prisma.taxpayer.count({
      where: { status: 'ACTIVE' }
    });

    // Recaudación total (facturas pagadas)
    const totalRevenue = await prisma.taxBill.aggregate({
      where: { status: 'PAID' },
      _sum: { paidAmount: true }
    });

    // Recaudación del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRevenue = await prisma.taxPayment.aggregate({
      where: {
        paymentDate: {
          gte: firstDayOfMonth
        }
      },
      _sum: { amount: true }
    });

    // Total de deuda pendiente
    const totalDebt = await prisma.taxBill.aggregate({
      where: {
        status: {
          in: ['PENDING', 'OVERDUE', 'PARTIAL']
        }
      },
      _sum: { balanceAmount: true }
    });

    // Solvencias emitidas este mes
    const solvenciesThisMonth = await prisma.solvency.count({
      where: {
        issueDate: {
          gte: firstDayOfMonth
        },
        status: 'ACTIVE'
      }
    });

    // Calcular tasa de morosidad
    const totalBills = await prisma.taxBill.aggregate({
      _sum: { totalAmount: true }
    });

    const defaultRate = totalBills._sum.totalAmount > 0
      ? ((totalDebt._sum.balanceAmount || 0) / totalBills._sum.totalAmount * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        activeTaxpayers: totalTaxpayers,
        totalRevenue: Number(totalRevenue._sum.paidAmount || 0),
        monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
        totalDebt: Number(totalDebt._sum.balanceAmount || 0),
        solvenciesIssued: solvenciesThisMonth,
        defaultRate: Number(defaultRate)
      }
    });
  } catch (error) {
    console.error('Error getting general statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas generales',
      error: error.message
    });
  }
};

/**
 * Obtener recaudación mensual (últimos 12 meses)
 */
export const getMonthlyCollection = async (req, res) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    // Obtener pagos agrupados por mes
    const payments = await prisma.taxPayment.groupBy({
      by: ['paymentDate'],
      where: {
        paymentDate: {
          gte: twelveMonthsAgo
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        paymentDate: 'asc'
      }
    });

    // Agrupar por mes
    const monthlyData = {};
    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          amount: 0
        };
      }

      monthlyData[monthKey].amount += Number(payment._sum.amount || 0);
    });

    // Convertir a array y formatear nombres de meses
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const collectionData = Object.values(monthlyData).map(item => {
      const [year, month] = item.month.split('-');
      return {
        month: monthNames[parseInt(month) - 1],
        year: parseInt(year),
        amount: item.amount
      };
    });

    res.json({
      success: true,
      data: collectionData
    });
  } catch (error) {
    console.error('Error getting monthly collection:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recaudación mensual',
      error: error.message
    });
  }
};

/**
 * Obtener distribución por tipo de impuesto
 */
export const getTaxTypeDistribution = async (req, res) => {
  try {
    // Obtener recaudación por tipo de impuesto
    const distribution = await prisma.taxBill.groupBy({
      by: ['taxType'],
      where: {
        status: 'PAID'
      },
      _sum: {
        paidAmount: true
      }
    });

    // Calcular total para porcentajes
    const total = distribution.reduce((sum, item) => sum + Number(item._sum.paidAmount || 0), 0);

    // Nombres legibles para tipos de impuesto
    const taxTypeNames = {
      BUSINESS_TAX: 'Patentes',
      PROPERTY_TAX: 'Inmuebles',
      VEHICLE_TAX: 'Vehículos',
      URBAN_CLEANING: 'Aseo Urbano',
      ADMINISTRATIVE: 'Tasas Administrativas',
      SPACE_USE: 'Uso de Espacios',
      CEMETERY: 'Cementerio',
      PUBLIC_EVENTS: 'Eventos Públicos',
      OTHER: 'Otros'
    };

    const taxTypeData = distribution.map(item => ({
      name: taxTypeNames[item.taxType] || item.taxType,
      type: item.taxType,
      amount: Number(item._sum.paidAmount || 0),
      value: total > 0 ? Number(((item._sum.paidAmount || 0) / total * 100).toFixed(1)) : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: taxTypeData
    });
  } catch (error) {
    console.error('Error getting tax type distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener distribución por tipo',
      error: error.message
    });
  }
};

/**
 * Obtener top contribuyentes del mes
 */
export const getTopContributors = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Obtener pagos del mes agrupados por contribuyente
    const topContributors = await prisma.taxPayment.groupBy({
      by: ['taxpayerId'],
      where: {
        paymentDate: {
          gte: firstDayOfMonth
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: limit
    });

    // Obtener información de los contribuyentes
    const contributorsWithInfo = await Promise.all(
      topContributors.map(async (item) => {
        const taxpayer = await prisma.taxpayer.findUnique({
          where: { id: item.taxpayerId },
          select: {
            id: true,
            taxId: true,
            taxpayerType: true,
            firstName: true,
            lastName: true,
            businessName: true
          }
        });

        return {
          taxpayerId: item.taxpayerId,
          taxId: taxpayer?.taxId,
          name: taxpayer?.taxpayerType === 'LEGAL'
            ? taxpayer?.businessName
            : `${taxpayer?.firstName} ${taxpayer?.lastName}`,
          amount: Number(item._sum.amount || 0)
        };
      })
    );

    res.json({
      success: true,
      data: contributorsWithInfo
    });
  } catch (error) {
    console.error('Error getting top contributors:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener top contribuyentes',
      error: error.message
    });
  }
};

/**
 * Obtener alertas importantes
 */
export const getAlerts = async (req, res) => {
  try {
    const now = new Date();
    const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    // Patentes que vencen pronto
    const expiringLicenses = await prisma.business.count({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: fifteenDaysFromNow
        },
        status: 'ACTIVE'
      }
    });

    // Morosos críticos (deudas mayores a 6 meses)
    const criticalDefaulters = await prisma.debtCollection.count({
      where: {
        status: 'ACTIVE',
        oldestDebtDate: {
          lte: sixMonthsAgo
        }
      }
    });

    // Solvencias pendientes (se podría implementar un estado pending)
    // Por ahora retornamos un valor de ejemplo
    const pendingSolvencies = 0;

    res.json({
      success: true,
      data: {
        expiringLicenses,
        criticalDefaulters,
        pendingSolvencies
      }
    });
  } catch (error) {
    console.error('Error getting alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
};

/**
 * Obtener todas las estadísticas del dashboard en una sola llamada
 */
export const getDashboardData = async (req, res) => {
  try {
    // Ejecutar todas las consultas en paralelo
    const [
      generalStats,
      monthlyCollection,
      taxTypeDistribution,
      topContributors,
      alerts
    ] = await Promise.all([
      // Estadísticas generales
      (async () => {
        const totalTaxpayers = await prisma.taxpayer.count({ where: { status: 'ACTIVE' } });
        const totalRevenue = await prisma.taxBill.aggregate({
          where: { status: 'PAID' },
          _sum: { paidAmount: true }
        });

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRevenue = await prisma.taxPayment.aggregate({
          where: { paymentDate: { gte: firstDayOfMonth } },
          _sum: { amount: true }
        });

        const totalDebt = await prisma.taxBill.aggregate({
          where: { status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
          _sum: { balanceAmount: true }
        });

        const solvenciesThisMonth = await prisma.solvency.count({
          where: { issueDate: { gte: firstDayOfMonth }, status: 'ACTIVE' }
        });

        const totalBills = await prisma.taxBill.aggregate({ _sum: { totalAmount: true } });
        const defaultRate = totalBills._sum.totalAmount > 0
          ? ((totalDebt._sum.balanceAmount || 0) / totalBills._sum.totalAmount * 100).toFixed(2)
          : 0;

        return {
          activeTaxpayers: totalTaxpayers,
          totalRevenue: Number(totalRevenue._sum.paidAmount || 0),
          monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
          totalDebt: Number(totalDebt._sum.balanceAmount || 0),
          solvenciesIssued: solvenciesThisMonth,
          defaultRate: Number(defaultRate)
        };
      })(),

      // Recaudación mensual (últimos 6 meses)
      (async () => {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

        const payments = await prisma.$queryRaw`
          SELECT
            TO_CHAR("paymentDate", 'YYYY-MM') as month,
            SUM(amount) as amount
          FROM "tax_payments"
          WHERE "paymentDate" >= ${sixMonthsAgo}
          GROUP BY TO_CHAR("paymentDate", 'YYYY-MM')
          ORDER BY month ASC
        `;

        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return payments.map(p => {
          const [year, month] = p.month.split('-');
          return {
            month: monthNames[parseInt(month) - 1],
            amount: Number(p.amount)
          };
        });
      })(),

      // Distribución por tipo
      (async () => {
        const distribution = await prisma.taxBill.groupBy({
          by: ['taxType'],
          where: { status: 'PAID' },
          _sum: { paidAmount: true }
        });

        const total = distribution.reduce((sum, item) => sum + Number(item._sum.paidAmount || 0), 0);
        const taxTypeNames = {
          BUSINESS_TAX: 'Patentes',
          PROPERTY_TAX: 'Inmuebles',
          VEHICLE_TAX: 'Vehículos',
          URBAN_CLEANING: 'Aseo Urbano',
          ADMINISTRATIVE: 'Tasas Administrativas',
          SPACE_USE: 'Uso de Espacios',
          CEMETERY: 'Cementerio',
          PUBLIC_EVENTS: 'Eventos Públicos',
          OTHER: 'Otros'
        };

        return distribution.map(item => ({
          name: taxTypeNames[item.taxType] || item.taxType,
          type: item.taxType,
          amount: Number(item._sum.paidAmount || 0),
          value: total > 0 ? Number(((item._sum.paidAmount || 0) / total * 100).toFixed(1)) : 0
        })).sort((a, b) => b.amount - a.amount);
      })(),

      // Top 5 contribuyentes
      (async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const topContributors = await prisma.taxPayment.groupBy({
          by: ['taxpayerId'],
          where: { paymentDate: { gte: firstDayOfMonth } },
          _sum: { amount: true },
          orderBy: { _sum: { amount: 'desc' } },
          take: 5
        });

        return await Promise.all(
          topContributors.map(async (item) => {
            const taxpayer = await prisma.taxpayer.findUnique({
              where: { id: item.taxpayerId },
              select: { id: true, taxId: true, taxpayerType: true, firstName: true, lastName: true, businessName: true }
            });

            return {
              taxpayerId: item.taxpayerId,
              taxId: taxpayer?.taxId,
              name: taxpayer?.taxpayerType === 'LEGAL'
                ? taxpayer?.businessName
                : `${taxpayer?.firstName} ${taxpayer?.lastName}`,
              amount: Number(item._sum.amount || 0)
            };
          })
        );
      })(),

      // Alertas
      (async () => {
        const now = new Date();
        const fifteenDaysFromNow = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const expiringLicenses = await prisma.business.count({
          where: {
            expiryDate: { gte: new Date(), lte: fifteenDaysFromNow },
            status: 'ACTIVE'
          }
        });

        const criticalDefaulters = await prisma.debtCollection.count({
          where: {
            status: 'ACTIVE',
            oldestDebtDate: { lte: sixMonthsAgo }
          }
        });

        return {
          expiringLicenses,
          criticalDefaulters,
          pendingSolvencies: 0
        };
      })()
    ]);

    res.json({
      success: true,
      data: {
        stats: generalStats,
        monthlyCollection,
        taxTypeDistribution,
        topContributors,
        alerts
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
};
