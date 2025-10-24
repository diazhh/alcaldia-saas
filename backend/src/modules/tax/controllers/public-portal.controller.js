/**
 * Controlador del Portal Público Tributario
 * Permite consultas sin autenticación para ciudadanos
 */

import prisma from '../../../config/database.js';
import { z } from 'zod';

/**
 * Consulta deudas por RIF/CI (sin autenticación)
 */
export const consultDebts = async (req, res) => {
  try {
    const { taxId } = req.params;

    if (!taxId) {
      return res.status(400).json({
        success: false,
        message: 'RIF/CI es requerido',
      });
    }

    // Buscar contribuyente
    const taxpayer = await prisma.taxpayer.findUnique({
      where: { taxId },
      select: {
        id: true,
        taxId: true,
        taxpayerType: true,
        firstName: true,
        lastName: true,
        businessName: true,
        status: true,
      },
    });

    if (!taxpayer) {
      return res.status(404).json({
        success: false,
        message: 'Contribuyente no encontrado',
      });
    }

    if (taxpayer.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Contribuyente inactivo',
      });
    }

    // Buscar facturas pendientes
    const pendingBills = await prisma.taxBill.findMany({
      where: {
        taxpayerId: taxpayer.id,
        status: { in: ['PENDING', 'PARTIAL'] },
      },
      select: {
        id: true,
        billNumber: true,
        taxType: true,
        concept: true,
        fiscalYear: true,
        fiscalPeriod: true,
        totalAmount: true,
        paidAmount: true,
        balanceAmount: true,
        issueDate: true,
        dueDate: true,
        status: true,
        paymentCode: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const totalDebt = pendingBills.reduce(
      (sum, bill) => sum + Number(bill.balanceAmount),
      0
    );

    const taxpayerName = taxpayer.firstName
      ? `${taxpayer.firstName} ${taxpayer.lastName}`
      : taxpayer.businessName;

    res.json({
      success: true,
      data: {
        taxpayer: {
          taxId: taxpayer.taxId,
          name: taxpayerName,
          type: taxpayer.taxpayerType,
        },
        summary: {
          totalDebt,
          pendingBills: pendingBills.length,
          overdueBills: pendingBills.filter(
            (b) => new Date(b.dueDate) < new Date()
          ).length,
        },
        bills: pendingBills,
      },
    });
  } catch (error) {
    console.error('Error consulting debts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar deudas',
      error: error.message,
    });
  }
};

/**
 * Genera planilla de pago (sin autenticación)
 */
export const generatePaymentSlip = async (req, res) => {
  try {
    const schema = z.object({
      taxId: z.string(),
      billIds: z.array(z.string()).min(1),
    });

    const { taxId, billIds } = schema.parse(req.body);

    // Verificar contribuyente
    const taxpayer = await prisma.taxpayer.findUnique({
      where: { taxId },
    });

    if (!taxpayer) {
      return res.status(404).json({
        success: false,
        message: 'Contribuyente no encontrado',
      });
    }

    // Verificar facturas
    const bills = await prisma.taxBill.findMany({
      where: {
        id: { in: billIds },
        taxpayerId: taxpayer.id,
        status: { in: ['PENDING', 'PARTIAL'] },
      },
    });

    if (bills.length !== billIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Algunas facturas no son válidas',
      });
    }

    const totalAmount = bills.reduce(
      (sum, bill) => sum + Number(bill.balanceAmount),
      0
    );

    // Generar código de pago único
    const paymentCode = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Actualizar facturas con código de pago
    await Promise.all(
      bills.map((bill) =>
        prisma.taxBill.update({
          where: { id: bill.id },
          data: { paymentCode },
        })
      )
    );

    const taxpayerName = taxpayer.firstName
      ? `${taxpayer.firstName} ${taxpayer.lastName}`
      : taxpayer.businessName;

    res.json({
      success: true,
      data: {
        paymentSlip: {
          code: paymentCode,
          taxpayer: {
            taxId: taxpayer.taxId,
            name: taxpayerName,
          },
          bills: bills.map((b) => ({
            billNumber: b.billNumber,
            concept: b.concept,
            amount: Number(b.balanceAmount),
          })),
          totalAmount,
          generatedAt: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        },
      },
    });
  } catch (error) {
    console.error('Error generating payment slip:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar planilla de pago',
      error: error.message,
    });
  }
};

/**
 * Verifica solvencia por código QR (sin autenticación)
 */
export const verifySolvency = async (req, res) => {
  try {
    const { qrCode } = req.params;

    if (!qrCode) {
      return res.status(400).json({
        success: false,
        message: 'Código QR es requerido',
      });
    }

    const solvency = await prisma.solvency.findUnique({
      where: { qrCode },
      include: {
        taxpayer: {
          select: {
            taxId: true,
            firstName: true,
            lastName: true,
            businessName: true,
            taxpayerType: true,
          },
        },
      },
    });

    if (!solvency) {
      return res.status(404).json({
        success: false,
        message: 'Solvencia no encontrada',
        valid: false,
      });
    }

    const isExpired = new Date(solvency.expiryDate) < new Date();
    const isRevoked = solvency.status === 'REVOKED';
    const isValid = solvency.status === 'ACTIVE' && !isExpired;

    const taxpayerName = solvency.taxpayer.firstName
      ? `${solvency.taxpayer.firstName} ${solvency.taxpayer.lastName}`
      : solvency.taxpayer.businessName;

    res.json({
      success: true,
      data: {
        valid: isValid,
        solvency: {
          solvencyNumber: solvency.solvencyNumber,
          taxpayer: {
            taxId: solvency.taxpayer.taxId,
            name: taxpayerName,
            type: solvency.taxpayer.taxpayerType,
          },
          type: solvency.solvencyType,
          issueDate: solvency.issueDate,
          expiryDate: solvency.expiryDate,
          status: solvency.status,
          isExpired,
          isRevoked,
        },
      },
    });
  } catch (error) {
    console.error('Error verifying solvency:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar solvencia',
      error: error.message,
    });
  }
};

/**
 * Consulta estado de pago por código de referencia (sin autenticación)
 */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentCode } = req.params;

    if (!paymentCode) {
      return res.status(400).json({
        success: false,
        message: 'Código de pago es requerido',
      });
    }

    // Buscar por código de pago en facturas
    const bills = await prisma.taxBill.findMany({
      where: { paymentCode },
      include: {
        taxpayer: {
          select: {
            taxId: true,
            firstName: true,
            lastName: true,
            businessName: true,
          },
        },
        payments: {
          select: {
            receiptNumber: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
            status: true,
          },
        },
      },
    });

    if (bills.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Código de pago no encontrado',
      });
    }

    const totalAmount = bills.reduce(
      (sum, bill) => sum + Number(bill.totalAmount),
      0
    );
    const paidAmount = bills.reduce(
      (sum, bill) => sum + Number(bill.paidAmount),
      0
    );
    const isPaid = bills.every((bill) => bill.status === 'PAID');

    const taxpayer = bills[0].taxpayer;
    const taxpayerName = taxpayer.firstName
      ? `${taxpayer.firstName} ${taxpayer.lastName}`
      : taxpayer.businessName;

    res.json({
      success: true,
      data: {
        paymentCode,
        taxpayer: {
          taxId: taxpayer.taxId,
          name: taxpayerName,
        },
        status: isPaid ? 'PAID' : 'PENDING',
        totalAmount,
        paidAmount,
        balanceAmount: totalAmount - paidAmount,
        bills: bills.map((b) => ({
          billNumber: b.billNumber,
          concept: b.concept,
          amount: Number(b.totalAmount),
          status: b.status,
        })),
        payments: bills.flatMap((b) => b.payments),
      },
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar estado de pago',
      error: error.message,
    });
  }
};

/**
 * Obtiene información de tasas y tarifas vigentes (sin autenticación)
 */
export const getTaxRates = async (req, res) => {
  try {
    // Información pública de tasas vigentes
    const taxRates = {
      propertyTax: {
        name: 'Impuesto sobre Inmuebles Urbanos',
        rates: {
          residential: '0.5% del valor catastral',
          commercial: '1.0% del valor catastral',
          industrial: '1.2% del valor catastral',
        },
        exemptions: [
          'Adultos mayores (mayores de 65 años)',
          'Personas con discapacidad',
          'Inmuebles de uso educativo o religioso',
        ],
      },
      businessTax: {
        name: 'Impuesto sobre Actividades Económicas',
        rates: {
          small: '1.0% - 1.5% de ingresos brutos',
          medium: '1.5% - 2.0% de ingresos brutos',
          large: '2.0% - 2.5% de ingresos brutos',
        },
        minimumTax: 'Según ordenanza municipal vigente',
      },
      vehicleTax: {
        name: 'Impuesto sobre Vehículos',
        rates: {
          cars: '1.5% del valor fiscal',
          motorcycles: '1.0% del valor fiscal',
          trucks: '2.0% del valor fiscal',
        },
      },
      fees: {
        urbanCleaning: 'Bs. 50.00 mensual (residencial)',
        administrativeFees: 'Según trámite solicitado',
        solvency: 'Bs. 100.00',
      },
    };

    res.json({
      success: true,
      data: taxRates,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error('Error getting tax rates:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tarifas',
      error: error.message,
    });
  }
};

export default {
  consultDebts,
  generatePaymentSlip,
  verifySolvency,
  checkPaymentStatus,
  getTaxRates,
};
