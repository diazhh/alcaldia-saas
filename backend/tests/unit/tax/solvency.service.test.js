/**
 * Tests unitarios para el servicio de solvencias
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  taxpayer: {
    findUnique: jest.fn(),
  },
  solvency: {
    count: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const { default: solvencyService } = await import('../../../src/modules/tax/services/solvency.service.js');

describe('Solvency Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkSolvency', () => {
    it('debe verificar que un contribuyente está solvente', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'V-12345678',
        firstName: 'Juan',
        lastName: 'Pérez',
        status: 'ACTIVE',
        taxBills: [], // Sin deudas
        businesses: [],
        properties: [],
        vehicles: [],
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);

      const result = await solvencyService.checkSolvency('taxpayer-1', 'GENERAL');

      expect(result.isSolvente).toBe(true);
      expect(result.canIssueSolvency).toBe(true);
      expect(result.pendingDebts).toHaveLength(0);
      expect(result.restrictions).toHaveLength(0);
    });

    it('debe detectar deudas pendientes', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'V-12345678',
        firstName: 'Juan',
        lastName: 'Pérez',
        status: 'ACTIVE',
        taxBills: [
          {
            id: 'bill-1',
            billNumber: 'FB-2025-000001',
            concept: 'Aseo Urbano',
            balanceAmount: new Decimal(100),
            dueDate: new Date('2025-03-31'),
            status: 'PENDING',
            taxType: 'URBAN_CLEANING',
          },
        ],
        businesses: [],
        properties: [],
        vehicles: [],
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);

      const result = await solvencyService.checkSolvency('taxpayer-1', 'GENERAL');

      expect(result.isSolvente).toBe(false);
      expect(result.canIssueSolvency).toBe(false);
      expect(result.pendingDebts).toHaveLength(1);
      expect(result.restrictions).toContain('Tiene deudas tributarias pendientes');
    });

    it('debe verificar solvencia por tipo específico', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'J-12345678-9',
        businessName: 'Empresa Test',
        taxBills: [
          {
            id: 'bill-1',
            taxType: 'PROPERTY_TAX',
            balanceAmount: new Decimal(100),
            status: 'PENDING',
          },
        ],
        businesses: [],
        properties: [],
        vehicles: [],
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);

      // Verificar solvencia de negocio (no tiene deudas de BUSINESS_TAX)
      const result = await solvencyService.checkSolvency('taxpayer-1', 'BUSINESS');

      expect(result.isSolvente).toBe(true);
      expect(result.canIssueSolvency).toBe(true);
    });
  });

  describe('generateSolvency', () => {
    it('debe generar una solvencia si está solvente', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'V-12345678',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        taxBills: [],
        businesses: [],
        properties: [],
        vehicles: [],
      };

      const mockSolvency = {
        id: 'solvency-1',
        solvencyNumber: 'SOL-2025-000001',
        taxpayerId: 'taxpayer-1',
        solvencyType: 'GENERAL',
        qrCode: 'ABC123DEF456',
        status: 'ACTIVE',
        taxpayer: mockTaxpayer,
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);
      mockPrisma.solvency.count.mockResolvedValue(0);
      mockPrisma.solvency.create.mockResolvedValue(mockSolvency);

      const data = {
        taxpayerId: 'taxpayer-1',
        solvencyType: 'GENERAL',
        validityDays: 90,
        issuedBy: 'user-1',
      };

      const result = await solvencyService.generateSolvency(data);

      expect(result.solvencyNumber).toBe('SOL-2025-000001');
      expect(result.status).toBe('ACTIVE');
      expect(result.qrCode).toBeDefined();
    });

    it('debe lanzar error si tiene deudas pendientes', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'V-12345678',
        taxBills: [
          {
            id: 'bill-1',
            status: 'PENDING',
            balanceAmount: new Decimal(100),
            taxType: 'URBAN_CLEANING',
          },
        ],
        businesses: [],
        properties: [],
        vehicles: [],
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);

      const data = {
        taxpayerId: 'taxpayer-1',
        solvencyType: 'GENERAL',
        issuedBy: 'user-1',
      };

      await expect(solvencyService.generateSolvency(data)).rejects.toThrow(
        'No se puede emitir solvencia'
      );
    });

    it('debe generar código QR único', async () => {
      const mockTaxpayer = {
        id: 'taxpayer-1',
        taxId: 'V-12345678',
        taxBills: [],
        businesses: [],
        properties: [],
        vehicles: [],
      };

      mockPrisma.taxpayer.findUnique.mockResolvedValue(mockTaxpayer);
      mockPrisma.solvency.count.mockResolvedValue(0);

      let createdSolvency = null;
      mockPrisma.solvency.create.mockImplementation((args) => {
        createdSolvency = args.data;
        return Promise.resolve({
          ...args.data,
          id: 'solvency-1',
          taxpayer: mockTaxpayer,
        });
      });

      const data = {
        taxpayerId: 'taxpayer-1',
        solvencyType: 'GENERAL',
        issuedBy: 'user-1',
      };

      await solvencyService.generateSolvency(data);

      expect(createdSolvency.qrCode).toBeDefined();
      expect(createdSolvency.qrCode).toHaveLength(32);
      expect(createdSolvency.qrCode).toMatch(/^[A-F0-9]+$/);
    });
  });

  describe('getSolvencyById', () => {
    it('debe obtener una solvencia por ID', async () => {
      const mockSolvency = {
        id: 'solvency-1',
        solvencyNumber: 'SOL-2025-000001',
        status: 'ACTIVE',
        expiryDate: new Date('2025-12-31'),
        taxpayer: { id: 'taxpayer-1' },
      };

      mockPrisma.solvency.findUnique.mockResolvedValue(mockSolvency);

      const result = await solvencyService.getSolvencyById('solvency-1');

      expect(result.solvencyNumber).toBe('SOL-2025-000001');
    });

    it('debe actualizar estado a EXPIRED si está vencida', async () => {
      const pastDate = new Date('2020-01-01');
      const mockSolvency = {
        id: 'solvency-1',
        solvencyNumber: 'SOL-2020-000001',
        status: 'ACTIVE',
        expiryDate: pastDate,
        taxpayer: { id: 'taxpayer-1' },
      };

      mockPrisma.solvency.findUnique.mockResolvedValue(mockSolvency);
      mockPrisma.solvency.update.mockResolvedValue({
        ...mockSolvency,
        status: 'EXPIRED',
      });

      const result = await solvencyService.getSolvencyById('solvency-1');

      expect(mockPrisma.solvency.update).toHaveBeenCalledWith({
        where: { id: 'solvency-1' },
        data: { status: 'EXPIRED' },
      });
      expect(result.status).toBe('EXPIRED');
    });
  });

  describe('verifySolvencyByQR', () => {
    it('debe verificar una solvencia válida', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const mockSolvency = {
        id: 'solvency-1',
        solvencyNumber: 'SOL-2025-000001',
        solvencyType: 'GENERAL',
        issueDate: new Date(),
        expiryDate: futureDate,
        status: 'ACTIVE',
        taxpayer: {
          taxId: 'V-12345678',
          firstName: 'Juan',
          lastName: 'Pérez',
        },
      };

      mockPrisma.solvency.findUnique.mockResolvedValue(mockSolvency);

      const result = await solvencyService.verifySolvencyByQR('ABC123DEF456');

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Solvencia válida');
      expect(result.solvency.solvencyNumber).toBe('SOL-2025-000001');
    });

    it('debe detectar solvencia vencida', async () => {
      const pastDate = new Date('2020-01-01');
      const mockSolvency = {
        id: 'solvency-1',
        solvencyNumber: 'SOL-2020-000001',
        issueDate: new Date('2020-01-01'),
        expiryDate: pastDate,
        status: 'ACTIVE',
        taxpayer: { taxId: 'V-12345678' },
      };

      mockPrisma.solvency.findUnique.mockResolvedValue(mockSolvency);
      mockPrisma.solvency.update.mockResolvedValue({});

      const result = await solvencyService.verifySolvencyByQR('ABC123');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Solvencia vencida');
    });

    it('debe detectar solvencia revocada', async () => {
      const mockSolvency = {
        id: 'solvency-1',
        solvencyNumber: 'SOL-2025-000001',
        status: 'REVOKED',
        expiryDate: new Date('2025-12-31'),
      };

      mockPrisma.solvency.findUnique.mockResolvedValue(mockSolvency);

      const result = await solvencyService.verifySolvencyByQR('ABC123');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Solvencia revocada');
    });

    it('debe retornar inválido si el código no existe', async () => {
      mockPrisma.solvency.findUnique.mockResolvedValue(null);

      const result = await solvencyService.verifySolvencyByQR('INVALID');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Código QR no válido');
    });
  });

  describe('revokeSolvency', () => {
    it('debe revocar una solvencia activa', async () => {
      const mockSolvency = {
        id: 'solvency-1',
        status: 'ACTIVE',
        notes: '',
      };

      mockPrisma.solvency.findUnique.mockResolvedValue(mockSolvency);
      mockPrisma.solvency.update.mockResolvedValue({
        ...mockSolvency,
        status: 'REVOKED',
        taxpayer: { id: 'taxpayer-1' },
      });

      const result = await solvencyService.revokeSolvency('solvency-1', 'Deuda detectada');

      expect(result.status).toBe('REVOKED');
      expect(mockPrisma.solvency.update).toHaveBeenCalledWith({
        where: { id: 'solvency-1' },
        data: {
          status: 'REVOKED',
          notes: expect.stringContaining('Revocada: Deuda detectada'),
        },
        include: { taxpayer: true },
      });
    });

    it('no debe permitir revocar solvencias no activas', async () => {
      const mockSolvency = {
        id: 'solvency-1',
        status: 'EXPIRED',
      };

      mockPrisma.solvency.findUnique.mockResolvedValue(mockSolvency);

      await expect(
        solvencyService.revokeSolvency('solvency-1', 'Razón')
      ).rejects.toThrow('Solo se pueden revocar solvencias activas');
    });
  });

  describe('getSolvencyStatistics', () => {
    it('debe calcular estadísticas de solvencias', async () => {
      mockPrisma.solvency.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(70)  // active
        .mockResolvedValueOnce(20)  // expired
        .mockResolvedValueOnce(10); // revoked

      mockPrisma.solvency.groupBy.mockResolvedValue([
        {
          solvencyType: 'GENERAL',
          _count: 50,
        },
        {
          solvencyType: 'BUSINESS',
          _count: 30,
        },
      ]);

      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await solvencyService.getSolvencyStatistics({ year: 2025 });

      expect(result.total.solvencies).toBe(100);
      expect(result.total.active).toBe(70);
      expect(result.byType).toHaveLength(2);
    });
  });

  describe('getExpiringsSolvencies', () => {
    it('debe obtener solvencias próximas a vencer', async () => {
      const today = new Date();
      const soonDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 días

      const mockSolvencies = [
        {
          id: 'solvency-1',
          solvencyNumber: 'SOL-2025-000001',
          expiryDate: soonDate,
          status: 'ACTIVE',
          taxpayer: {
            taxId: 'V-12345678',
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan@example.com',
          },
        },
      ];

      mockPrisma.solvency.findMany.mockResolvedValue(mockSolvencies);

      const result = await solvencyService.getExpiringsSolvencies(30);

      expect(result).toHaveLength(1);
      expect(result[0].daysUntilExpiry).toBeGreaterThan(0);
      expect(result[0].daysUntilExpiry).toBeLessThanOrEqual(30);
    });
  });
});
