/**
 * Tests unitarios para el servicio de cobranza
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  taxBill: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  debtCollection: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  collectionAction: {
    create: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const { default: collectionService } = await import('../../../src/modules/tax/services/collection.service.js');

describe('Collection Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('identifyDefaulters', () => {
    it('debe identificar contribuyentes morosos', async () => {
      const today = new Date();
      const pastDate = new Date(today.getTime() - 40 * 24 * 60 * 60 * 1000); // 40 días atrás

      const mockOverdueBills = [
        {
          id: 'bill-1',
          taxpayerId: 'taxpayer-1',
          balanceAmount: new Decimal(100),
          dueDate: pastDate,
          taxpayer: {
            id: 'taxpayer-1',
            taxId: 'V-12345678',
            firstName: 'Juan',
            lastName: 'Pérez',
          },
        },
      ];

      mockPrisma.taxBill.findMany.mockResolvedValue(mockOverdueBills);
      mockPrisma.debtCollection.findFirst.mockResolvedValue(null);
      mockPrisma.debtCollection.create.mockResolvedValue({
        id: 'collection-1',
        taxpayerId: 'taxpayer-1',
        totalDebt: 100,
        priority: 'MEDIUM',
        stage: 'NOTICE',
      });

      const result = await collectionService.identifyDefaulters();

      expect(result.identified).toBe(1);
      expect(mockPrisma.debtCollection.create).toHaveBeenCalled();
    });

    it('debe clasificar correctamente por antigüedad', async () => {
      const today = new Date();
      const veryOldDate = new Date(today.getTime() - 200 * 24 * 60 * 60 * 1000); // 200 días

      const mockOverdueBills = [
        {
          id: 'bill-1',
          taxpayerId: 'taxpayer-1',
          balanceAmount: new Decimal(500),
          dueDate: veryOldDate,
          taxpayer: {
            id: 'taxpayer-1',
            taxId: 'V-12345678',
          },
        },
      ];

      mockPrisma.taxBill.findMany.mockResolvedValue(mockOverdueBills);
      mockPrisma.debtCollection.findFirst.mockResolvedValue(null);

      let createdCollection = null;
      mockPrisma.debtCollection.create.mockImplementation((args) => {
        createdCollection = args.data;
        return Promise.resolve({ id: 'collection-1', ...args.data });
      });

      await collectionService.identifyDefaulters();

      // Más de 180 días debe ser URGENT y LEGAL
      expect(createdCollection.priority).toBe('URGENT');
      expect(createdCollection.stage).toBe('LEGAL');
    });

    it('debe actualizar casos existentes', async () => {
      const today = new Date();
      const pastDate = new Date(today.getTime() - 50 * 24 * 60 * 60 * 1000);

      const mockOverdueBills = [
        {
          id: 'bill-1',
          taxpayerId: 'taxpayer-1',
          balanceAmount: new Decimal(150),
          dueDate: pastDate,
          taxpayer: { id: 'taxpayer-1' },
        },
      ];

      const existingCollection = {
        id: 'collection-1',
        taxpayerId: 'taxpayer-1',
        totalDebt: 100,
      };

      mockPrisma.taxBill.findMany.mockResolvedValue(mockOverdueBills);
      mockPrisma.debtCollection.findFirst.mockResolvedValue(existingCollection);
      mockPrisma.debtCollection.update.mockResolvedValue({
        ...existingCollection,
        totalDebt: 150,
      });

      await collectionService.identifyDefaulters();

      expect(mockPrisma.debtCollection.update).toHaveBeenCalled();
      expect(mockPrisma.debtCollection.create).not.toHaveBeenCalled();
    });
  });

  describe('getCollections', () => {
    it('debe obtener casos de cobranza con filtros', async () => {
      const mockCollections = [
        {
          id: 'collection-1',
          taxpayerId: 'taxpayer-1',
          totalDebt: 100,
          priority: 'HIGH',
          stage: 'FORMAL',
          taxpayer: {
            id: 'taxpayer-1',
            taxId: 'V-12345678',
            firstName: 'Juan',
            lastName: 'Pérez',
          },
          actions: [],
        },
      ];

      mockPrisma.debtCollection.findMany.mockResolvedValue(mockCollections);
      mockPrisma.debtCollection.count.mockResolvedValue(1);

      const result = await collectionService.getCollections({
        priority: 'HIGH',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('registerAction', () => {
    it('debe registrar una acción de cobranza', async () => {
      const mockCollection = {
        id: 'collection-1',
        taxpayerId: 'taxpayer-1',
        notificationsSent: 0,
      };

      const mockAction = {
        id: 'action-1',
        debtCollectionId: 'collection-1',
        actionType: 'PHONE_CALL',
        description: 'Llamada realizada',
        performedBy: 'user-1',
      };

      mockPrisma.debtCollection.findUnique.mockResolvedValue(mockCollection);
      mockPrisma.collectionAction.create.mockResolvedValue(mockAction);
      mockPrisma.debtCollection.update.mockResolvedValue({
        ...mockCollection,
        notificationsSent: 1,
      });

      const data = {
        actionType: 'PHONE_CALL',
        description: 'Llamada realizada',
        result: 'Contribuyente comprometido a pagar',
        performedBy: 'user-1',
      };

      const result = await collectionService.registerAction('collection-1', data);

      expect(result.actionType).toBe('PHONE_CALL');
      expect(mockPrisma.debtCollection.update).toHaveBeenCalledWith({
        where: { id: 'collection-1' },
        data: {
          notificationsSent: { increment: 1 },
          lastNotificationDate: expect.any(Date),
        },
      });
    });
  });

  describe('calculateLateInterest', () => {
    it('debe calcular intereses moratorios correctamente', async () => {
      const today = new Date();
      const dueDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 días atrás

      const mockBill = {
        id: 'bill-1',
        billNumber: 'FB-2025-000001',
        balanceAmount: new Decimal(1000),
        dueDate,
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);

      const result = await collectionService.calculateLateInterest('bill-1');

      expect(result.daysLate).toBe(30);
      // 30 días * 0.05% diario = 1.5%
      expect(result.interestRate).toBe('1.50%');
      // 1000 * 1.5% = 15
      expect(result.interestAmount).toBe(15);
      expect(result.totalWithInterest).toBe(1015);
    });

    it('debe retornar cero interés si no está vencida', async () => {
      const today = new Date();
      const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const mockBill = {
        id: 'bill-1',
        balanceAmount: new Decimal(1000),
        dueDate: futureDate,
      };

      mockPrisma.taxBill.findUnique.mockResolvedValue(mockBill);

      const result = await collectionService.calculateLateInterest('bill-1');

      expect(result.daysLate).toBe(0);
      expect(result.interestAmount).toBe(0);
    });
  });

  describe('createPaymentPlan', () => {
    it('debe crear un convenio de pago', async () => {
      const mockCollection = {
        id: 'collection-1',
        taxpayerId: 'taxpayer-1',
        totalDebt: 1000,
        notes: '',
      };

      mockPrisma.debtCollection.findUnique.mockResolvedValue(mockCollection);
      mockPrisma.debtCollection.update.mockResolvedValue({
        ...mockCollection,
        hasPaymentPlan: true,
        installments: 6,
        status: 'PAYMENT_PLAN',
      });
      mockPrisma.collectionAction.create.mockResolvedValue({});

      const data = {
        installments: 6,
        firstPaymentDate: '2025-02-01',
        notes: 'Convenio acordado',
        createdBy: 'user-1',
      };

      const result = await collectionService.createPaymentPlan('collection-1', data);

      expect(result.hasPaymentPlan).toBe(true);
      expect(result.installments).toBe(6);
      expect(result.status).toBe('PAYMENT_PLAN');
    });
  });

  describe('sendNotifications', () => {
    it('debe enviar notificaciones según la etapa', async () => {
      const mockCollections = [
        {
          id: 'collection-1',
          taxpayerId: 'taxpayer-1',
          stage: 'REMINDER',
          taxpayer: { id: 'taxpayer-1', email: 'test@example.com' },
        },
        {
          id: 'collection-2',
          taxpayerId: 'taxpayer-2',
          stage: 'LEGAL',
          taxpayer: { id: 'taxpayer-2', email: 'test2@example.com' },
        },
      ];

      mockPrisma.debtCollection.findMany.mockResolvedValue(mockCollections);
      mockPrisma.debtCollection.findUnique
        .mockResolvedValueOnce(mockCollections[0])
        .mockResolvedValueOnce(mockCollections[1]);
      mockPrisma.collectionAction.create.mockResolvedValue({});
      mockPrisma.debtCollection.update.mockResolvedValue({});

      const result = await collectionService.sendNotifications({});

      expect(result.sent).toBe(2);
      expect(result.notifications[0].notificationType).toBe('EMAIL');
      expect(result.notifications[1].notificationType).toBe('LEGAL_NOTICE');
    });
  });

  describe('getCollectionStatistics', () => {
    it('debe calcular estadísticas de cobranza', async () => {
      mockPrisma.debtCollection.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60)  // active
        .mockResolvedValueOnce(30)  // resolved
        .mockResolvedValueOnce(10); // payment plan

      mockPrisma.debtCollection.aggregate.mockResolvedValue({
        _sum: { totalDebt: 50000 },
      });

      mockPrisma.debtCollection.groupBy
        .mockResolvedValueOnce([
          {
            priority: 'HIGH',
            _count: 20,
            _sum: { totalDebt: 15000 },
          },
        ])
        .mockResolvedValueOnce([
          {
            stage: 'FORMAL',
            _count: 25,
            _sum: { totalDebt: 20000 },
          },
        ]);

      const result = await collectionService.getCollectionStatistics();

      expect(result.total.cases).toBe(100);
      expect(result.total.active).toBe(60);
      expect(result.total.totalDebt).toBe(50000);
      expect(result.byPriority).toHaveLength(1);
      expect(result.byStage).toHaveLength(1);
    });
  });

  describe('closeCollection', () => {
    it('debe cerrar un caso de cobranza', async () => {
      const mockCollection = {
        id: 'collection-1',
        status: 'ACTIVE',
        notes: 'Notas previas',
      };

      mockPrisma.debtCollection.findUnique.mockResolvedValue(mockCollection);
      mockPrisma.debtCollection.update.mockResolvedValue({
        ...mockCollection,
        status: 'CLOSED',
      });

      const result = await collectionService.closeCollection('collection-1', 'Deuda pagada');

      expect(result.status).toBe('CLOSED');
      expect(mockPrisma.debtCollection.update).toHaveBeenCalledWith({
        where: { id: 'collection-1' },
        data: {
          status: 'CLOSED',
          notes: expect.stringContaining('Cerrado: Deuda pagada'),
        },
      });
    });
  });
});
