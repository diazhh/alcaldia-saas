/**
 * Tests unitarios para el servicio de pagos tributarios
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  taxpayer: {
    findUnique: jest.fn(),
  },
  taxBill: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  taxPayment: {
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const { default: paymentService } = await import('../../../src/modules/tax/services/payment.service.js');

describe('Payment Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDebtsByTaxId', () => {
    it('debe obtener deudas de un contribuyente', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'V-12345678',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        taxBills: [
          {
            id: 'bill-1',
            billNumber: 'FB-2025-000001',
            taxType: 'URBAN_CLEANING',
            concept: 'Aseo Urbano',
            totalAmount: new Decimal(100),
            paidAmount: new Decimal(0),
            balanceAmount: new Decimal(100),
            dueDate: new Date('2025-03-31'),
            status: 'PENDING',
            paymentCode: 'PAY-123',
          },
        ],
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);

      const result = await paymentService.getDebtsByTaxId('V-12345678');

      expect(result.taxpayer.taxId).toBe('V-12345678');
      expect(result.debts.total).toBe(100);
      expect(result.debts.count).toBe(1);
      expect(result.bills).toHaveLength(1);
    });

    it('debe lanzar error si el contribuyente no existe', async () => {
      mockPrisma.taxpayer.findUnique.mockResolvedValue(null);

      await expect(paymentService.getDebtsByTaxId('V-99999999')).rejects.toThrow(
        'Contribuyente no encontrado'
      );
    });

    it('debe calcular correctamente deuda vencida y corriente', async () => {
      const today = new Date();
      const pastDate = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 días atrás
      const futureDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 días adelante

      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'V-12345678',
        firstName: 'Juan',
        lastName: 'Pérez',
        taxBills: [
          {
            id: 'bill-1',
            balanceAmount: new Decimal(100),
            dueDate: pastDate, // Vencida
            status: 'OVERDUE',
          },
          {
            id: 'bill-2',
            balanceAmount: new Decimal(50),
            dueDate: futureDate, // Corriente
            status: 'PENDING',
          },
        ],
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);

      const result = await paymentService.getDebtsByTaxId('V-12345678');

      expect(result.debts.total).toBe(150);
      expect(result.debts.overdue).toBe(100);
      expect(result.debts.current).toBe(50);
    });
  });

  describe('generatePaymentSlip', () => {
    it('debe generar planilla de pago', async () => {
      const mockBills = [
        {
          id: 'bill-1',
          billNumber: 'FB-2025-000001',
          concept: 'Aseo Urbano',
          balanceAmount: new Decimal(100),
          taxpayerId: 'taxpayer-1',
          taxpayer: {
            taxId: 'V-12345678',
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan@example.com',
          },
        },
      ];

      mockPrisma.taxBill.findMany.mockResolvedValue(mockBills);

      const result = await paymentService.generatePaymentSlip({
        billIds: ['bill-1'],
      });

      expect(result.referenceCode).toMatch(/^REF-/);
      expect(result.totalAmount).toBe(100);
      expect(result.bills).toHaveLength(1);
      expect(result.paymentInstructions).toBeDefined();
    });

    it('debe lanzar error si no se proporcionan facturas', async () => {
      await expect(paymentService.generatePaymentSlip({ billIds: [] })).rejects.toThrow(
        'Debe seleccionar al menos una factura'
      );
    });

    it('debe lanzar error si las facturas son de diferentes contribuyentes', async () => {
      const mockBills = [
        {
          id: 'bill-1',
          taxpayerId: 'taxpayer-1',
          balanceAmount: new Decimal(100),
          taxpayer: { taxId: 'V-1' },
        },
        {
          id: 'bill-2',
          taxpayerId: 'taxpayer-2',
          balanceAmount: new Decimal(50),
          taxpayer: { taxId: 'V-2' },
        },
      ];

      mockPrisma.taxBill.findMany.mockResolvedValue(mockBills);

      await expect(
        paymentService.generatePaymentSlip({ billIds: ['bill-1', 'bill-2'] })
      ).rejects.toThrow('Todas las facturas deben pertenecer al mismo contribuyente');
    });
  });

  describe('registerPayment', () => {
    it('debe registrar un pago y aplicarlo a facturas', async () => {
      const mockTaxpayer = { id: 'taxpayer-1', taxId: 'V-12345678' };
      const mockBills = [
        {
          id: 'bill-1',
          balanceAmount: new Decimal(100),
          paidAmount: new Decimal(0),
          totalAmount: new Decimal(100),
          dueDate: new Date(),
        },
      ];

      const mockPayment = {
        id: 'payment-1',
        receiptNumber: 'REC-2025-000001',
        amount: new Decimal(100),
        taxpayerId: 'taxpayer-1',
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);
      mockPrisma.taxBill.findMany.mockResolvedValue(mockBills);
      mockPrisma.taxPayment.count.mockResolvedValue(0);

      // Mock de transacción
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          taxPayment: {
            create: jest.fn().mockResolvedValue(mockPayment),
          },
          taxBill: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      mockPrisma.taxPayment.findUnique.mockResolvedValue({
        ...mockPayment,
        taxpayer: mockTaxpayer,
        taxBill: mockBills[0],
      });

      const data = {
        taxpayerId: 'taxpayer-1',
        billIds: ['bill-1'],
        amount: 100,
        paymentMethod: 'TRANSFER',
        paymentDate: '2025-01-15',
        bankName: 'Banco Test',
        referenceNumber: '123456',
        registeredBy: 'user-1',
      };

      const result = await paymentService.registerPayment(data);

      expect(result.receiptNumber).toBe('REC-2025-000001');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('debe aplicar pago parcial a múltiples facturas', async () => {
      const mockTaxpayer = { id: 'taxpayer-1' };
      const mockBills = [
        {
          id: 'bill-1',
          balanceAmount: new Decimal(100),
          paidAmount: new Decimal(0),
          totalAmount: new Decimal(100),
          dueDate: new Date(),
        },
        {
          id: 'bill-2',
          balanceAmount: new Decimal(50),
          paidAmount: new Decimal(0),
          totalAmount: new Decimal(50),
          dueDate: new Date(),
        },
      ];

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);
      mockPrisma.taxBill.findMany.mockResolvedValue(mockBills);
      mockPrisma.taxPayment.count.mockResolvedValue(0);

      let billUpdates = [];

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          taxPayment: {
            create: jest.fn().mockResolvedValue({
              id: 'payment-1',
              receiptNumber: 'REC-2025-000001',
            }),
          },
          taxBill: {
            update: jest.fn().mockImplementation((args) => {
              billUpdates.push(args);
              return Promise.resolve({});
            }),
          },
        };
        return callback(tx);
      });

      mockPrisma.taxPayment.findUnique.mockResolvedValue({
        id: 'payment-1',
        taxpayer: mockTaxpayer,
      });

      const data = {
        taxpayerId: 'taxpayer-1',
        billIds: ['bill-1', 'bill-2'],
        amount: 120, // Paga completa bill-1 (100) y parcial bill-2 (20)
        paymentMethod: 'CASH',
        paymentDate: '2025-01-15',
        registeredBy: 'user-1',
      };

      await paymentService.registerPayment(data);

      expect(billUpdates).toHaveLength(2);
      // Primera factura debe quedar pagada completamente
      expect(billUpdates[0].data.status).toBe('PAID');
      // Segunda factura debe quedar parcialmente pagada
      expect(billUpdates[1].data.status).toBe('PARTIAL');
    });
  });

  describe('getReceipt', () => {
    it('debe obtener un recibo de pago', async () => {
      const mockPayment = {
        id: 'payment-1',
        receiptNumber: 'REC-2025-000001',
        amount: new Decimal(100),
        paymentDate: new Date('2025-01-15'),
        paymentMethod: 'TRANSFER',
        taxpayerId: 'taxpayer-1',
        createdAt: new Date('2025-01-15'),
        taxpayer: {
          taxId: 'V-12345678',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
        },
      };

      mockPrisma.taxPayment.findUnique.mockResolvedValue(mockPayment);
      mockPrisma.taxBill.findMany.mockResolvedValue([]);

      const result = await paymentService.getReceipt('REC-2025-000001');

      expect(result.receipt.receiptNumber).toBe('REC-2025-000001');
      expect(result.taxpayer.taxId).toBe('V-12345678');
    });

    it('debe lanzar error si el recibo no existe', async () => {
      mockPrisma.taxPayment.findUnique.mockResolvedValue(null);

      await expect(paymentService.getReceipt('REC-INVALID')).rejects.toThrow(
        'Recibo no encontrado'
      );
    });
  });

  describe('verifyPaymentCode', () => {
    it('debe verificar un código de pago válido', async () => {
      const mockBill = {
        id: 'bill-1',
        billNumber: 'FB-2025-000001',
        concept: 'Aseo Urbano',
        taxType: 'URBAN_CLEANING',
        totalAmount: new Decimal(100),
        paidAmount: new Decimal(0),
        balanceAmount: new Decimal(100),
        dueDate: new Date('2025-12-31'),
        status: 'PENDING',
        taxpayer: {
          taxId: 'V-12345678',
          firstName: 'Juan',
          lastName: 'Pérez',
        },
        payments: [],
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);

      const result = await paymentService.verifyPaymentCode('PAY-123-ABC');

      expect(result.valid).toBe(true);
      expect(result.bill.billNumber).toBe('FB-2025-000001');
    });

    it('debe lanzar error si el código no es válido', async () => {
      mockPrisma.taxBill.findUnique.mockResolvedValue(null);

      await expect(paymentService.verifyPaymentCode('INVALID')).rejects.toThrow(
        'Código de pago no válido'
      );
    });
  });

  describe('getPaymentHistory', () => {
    it('debe obtener historial de pagos', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          receiptNumber: 'REC-2025-000001',
          amount: new Decimal(100),
          paymentDate: new Date('2025-01-15'),
          taxBill: {
            billNumber: 'FB-2025-000001',
            concept: 'Aseo Urbano',
            taxType: 'URBAN_CLEANING',
          },
        },
      ];

      mockPrisma.taxPayment.findMany.mockResolvedValue(mockPayments);
      mockPrisma.taxPayment.count.mockResolvedValue(1);
      mockPrisma.taxPayment.aggregate.mockResolvedValue({
        _sum: { amount: 100 },
      });

      const result = await paymentService.getPaymentHistory('taxpayer-1', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.summary.totalPaid).toBe(100);
      expect(result.summary.totalPayments).toBe(1);
    });
  });
});
