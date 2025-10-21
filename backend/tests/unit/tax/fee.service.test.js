/**
 * Tests unitarios para el servicio de facturación de tasas
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  taxpayer: {
    findUnique: jest.fn(),
  },
  taxBill: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  property: {
    findMany: jest.fn(),
  },
};

// Mock del módulo de base de datos
jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const { default: feeService } = await import('../../../src/modules/tax/services/fee.service.js');

describe('Fee Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFeeBill', () => {
    it('debe crear una factura de tasa correctamente', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'J-12345678-9',
        businessName: 'Empresa Test',
        email: 'test@example.com',
      };

      const mockBill = {
        id: 'bill-1',
        billNumber: 'FB-2025-000001',
        taxpayerId: 'taxpayer-1',
        taxType: 'URBAN_CLEANING',
        concept: 'Tasa de Aseo Urbano',
        baseAmount: new Decimal(100),
        taxRate: new Decimal(0.05),
        taxAmount: new Decimal(5),
        totalAmount: new Decimal(105),
        balanceAmount: new Decimal(105),
        fiscalYear: 2025,
        status: 'PENDING',
        taxpayer: mockTaxpayer,
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);
      mockPrisma.taxBill.count.mockResolvedValue(0);
      mockPrisma.taxBill.create.mockResolvedValue(mockBill);

      const data = {
        taxpayerId: 'taxpayer-1',
        taxType: 'URBAN_CLEANING',
        concept: 'Tasa de Aseo Urbano',
        baseAmount: 100,
        taxRate: 0.05,
        fiscalYear: 2025,
        dueDate: '2025-12-31',
      };

      const result = await feeService.createFeeBill(data);

      expect(mockPrisma.taxpayer.findUnique).toHaveBeenCalledWith({
        where: { id: 'taxpayer-1' },
      });
      expect(mockPrisma.taxBill.create).toHaveBeenCalled();
      expect(result.billNumber).toBe('FB-2025-000001');
      expect(result.status).toBe('PENDING');
    });

    it('debe lanzar error si el contribuyente no existe', async () => {
      mockPrisma.taxpayer.findUnique.mockResolvedValue(null);

      const data = {
        taxpayerId: 'invalid-id',
        taxType: 'URBAN_CLEANING',
        concept: 'Test',
        baseAmount: 100,
        taxRate: 0.05,
        fiscalYear: 2025,
        dueDate: '2025-12-31',
      };

      await expect(feeService.createFeeBill(data)).rejects.toThrow('Contribuyente no encontrado');
    });

    it('debe calcular correctamente los montos', async () => {
      const mockTaxpayer = { id: 'taxpayer-1', taxId: 'J-12345678-9' };
      
      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);
      mockPrisma.taxBill.count.mockResolvedValue(0);
      mockPrisma.taxBill.create.mockImplementation((args) => {
        return Promise.resolve({
          ...args.data,
          id: 'bill-1',
          taxpayer: mockTaxpayer,
        });
      });

      const data = {
        taxpayerId: 'taxpayer-1',
        taxType: 'ADMINISTRATIVE',
        concept: 'Tasa Administrativa',
        baseAmount: 200,
        taxRate: 0.1,
        fiscalYear: 2025,
        dueDate: '2025-12-31',
      };

      await feeService.createFeeBill(data);

      const createCall = mockPrisma.taxBill.create.mock.calls[0][0];
      expect(createCall.data.baseAmount).toBe(200);
      expect(createCall.data.taxRate).toBe(0.1);
      // taxAmount = 200 * 0.1 = 20
      // totalAmount = 200 + 20 = 220
    });
  });

  describe('getFeeBills', () => {
    it('debe obtener facturas con filtros', async () => {
      const mockBills = [
        {
          id: 'bill-1',
          billNumber: 'FB-2025-000001',
          taxType: 'URBAN_CLEANING',
          status: 'PENDING',
          taxpayer: { id: 'taxpayer-1', taxId: 'J-12345678-9' },
        },
      ];

      mockPrisma.taxBill.findMany.mockResolvedValue(mockBills);
      mockPrisma.taxBill.count.mockResolvedValue(1);

      const result = await feeService.getFeeBills({
        taxType: 'URBAN_CLEANING',
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockBills);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('debe aplicar búsqueda por texto', async () => {
      mockPrisma.taxBill.findMany.mockResolvedValue([]);
      mockPrisma.taxBill.count.mockResolvedValue(0);

      await feeService.getFeeBills({ search: 'FB-2025' });

      const findManyCall = mockPrisma.taxBill.findMany.mock.calls[0][0];
      expect(findManyCall.where.OR).toBeDefined();
    });
  });

  describe('getFeeBillById', () => {
    it('debe obtener una factura por ID', async () => {
      const mockBill = {
        id: 'bill-1',
        billNumber: 'FB-2025-000001',
        taxpayer: { id: 'taxpayer-1' },
        payments: [],
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);

      const result = await feeService.getFeeBillById('bill-1');

      expect(result).toEqual(mockBill);
      expect(mockPrisma.taxBill.findUnique).toHaveBeenCalledWith({
        where: { id: 'bill-1' },
        include: {
          taxpayer: true,
          payments: { orderBy: { paymentDate: 'desc' } },
        },
      });
    });

    it('debe lanzar error si la factura no existe', async () => {
      mockPrisma.taxBill.findUnique.mockResolvedValue(null);

      await expect(feeService.getFeeBillById('invalid-id')).rejects.toThrow('Factura no encontrada');
    });
  });

  describe('updateFeeBill', () => {
    it('debe actualizar una factura correctamente', async () => {
      const mockBill = {
        id: 'bill-1',
        status: 'PENDING',
        baseAmount: new Decimal(100),
        taxRate: new Decimal(0.05),
        paidAmount: new Decimal(0),
        surcharges: new Decimal(0),
        discounts: new Decimal(0),
      };

      const mockUpdatedBill = {
        ...mockBill,
        baseAmount: new Decimal(150),
        notes: 'Actualizado',
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);
      mockPrisma.taxBill.update.mockResolvedValue(mockUpdatedBill);

      const result = await feeService.updateFeeBill('bill-1', {
        baseAmount: 150,
        notes: 'Actualizado',
      });

      expect(mockPrisma.taxBill.update).toHaveBeenCalled();
      expect(result.baseAmount).toEqual(new Decimal(150));
    });

    it('no debe permitir actualizar facturas pagadas', async () => {
      const mockBill = {
        id: 'bill-1',
        status: 'PAID',
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);

      await expect(
        feeService.updateFeeBill('bill-1', { baseAmount: 200 })
      ).rejects.toThrow('No se puede actualizar una factura pagada');
    });
  });

  describe('cancelFeeBill', () => {
    it('debe anular una factura correctamente', async () => {
      const mockBill = {
        id: 'bill-1',
        status: 'PENDING',
        notes: 'Nota original',
      };

      const mockCancelledBill = {
        ...mockBill,
        status: 'CANCELLED',
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);
      mockPrisma.taxBill.update.mockResolvedValue(mockCancelledBill);

      const result = await feeService.cancelFeeBill('bill-1', 'Error en monto');

      expect(mockPrisma.taxBill.update).toHaveBeenCalledWith({
        where: { id: 'bill-1' },
        data: {
          status: 'CANCELLED',
          notes: expect.stringContaining('Anulada: Error en monto'),
        },
        include: { taxpayer: true },
      });
      expect(result.status).toBe('CANCELLED');
    });

    it('no debe permitir anular facturas pagadas', async () => {
      const mockBill = {
        id: 'bill-1',
        status: 'PAID',
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);

      await expect(
        feeService.cancelFeeBill('bill-1', 'Razón')
      ).rejects.toThrow('No se puede anular una factura pagada');
    });
  });

  describe('getFeeStatistics', () => {
    it('debe calcular estadísticas correctamente', async () => {
      mockPrisma.taxBill.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(30)  // pending
        .mockResolvedValueOnce(60)  // paid
        .mockResolvedValueOnce(10); // overdue

      mockPrisma.taxBill.aggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 10000 } })
        .mockResolvedValueOnce({ _sum: { paidAmount: 6000 } })
        .mockResolvedValueOnce({ _sum: { balanceAmount: 4000 } });

      mockPrisma.taxBill.groupBy.mockResolvedValue([
        {
          taxType: 'URBAN_CLEANING',
          _count: 50,
          _sum: {
            totalAmount: 5000,
            paidAmount: 3000,
            balanceAmount: 2000,
          },
        },
      ]);

      const result = await feeService.getFeeStatistics({ fiscalYear: 2025 });

      expect(result.total.bills).toBe(100);
      expect(result.total.pending).toBe(30);
      expect(result.total.paid).toBe(60);
      expect(result.amounts.total).toBe(10000);
      expect(result.byType).toHaveLength(1);
    });
  });

  describe('generateUrbanCleaningBills', () => {
    it('debe generar facturas masivas para propiedades', async () => {
      const mockProperties = [
        {
          id: 'prop-1',
          taxpayerId: 'taxpayer-1',
          cadastralCode: 'CAT-001',
          address: 'Calle 1',
          propertyUse: 'RESIDENTIAL',
          buildingArea: new Decimal(100),
          landArea: new Decimal(200),
          taxpayer: { id: 'taxpayer-1', taxId: 'V-12345678' },
        },
        {
          id: 'prop-2',
          taxpayerId: 'taxpayer-2',
          cadastralCode: 'CAT-002',
          address: 'Calle 2',
          propertyUse: 'COMMERCIAL',
          buildingArea: new Decimal(150),
          landArea: new Decimal(250),
          taxpayer: { id: 'taxpayer-2', taxId: 'J-87654321-0' },
        },
      ];

      mockPrisma.property.findMany.mockResolvedValue(mockProperties);
      mockPrisma.taxpayer.findUnique.mockResolvedValue({ id: 'taxpayer-1' });
      mockPrisma.taxBill.count.mockResolvedValue(0);
      mockPrisma.taxBill.create.mockResolvedValue({
        id: 'bill-1',
        billNumber: 'FB-2025-000001',
      });

      const data = {
        fiscalYear: 2025,
        fiscalPeriod: 'Q1',
        dueDate: '2025-03-31',
        residentialRate: 0.05,
        commercialRate: 0.08,
      };

      const result = await feeService.generateUrbanCleaningBills(data);

      expect(result.success).toBe(2);
      expect(result.errors).toBe(0);
      expect(mockPrisma.taxBill.create).toHaveBeenCalledTimes(2);
    });
  });
});
