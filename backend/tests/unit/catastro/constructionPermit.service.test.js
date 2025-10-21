/**
 * Tests unitarios para el servicio de permisos de construcción
 */

import { jest } from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
  constructionPermit: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  property: {
    findUnique: jest.fn(),
  },
  permitInspection: {
    findFirst: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const permitService = await import(
  '../../../src/modules/catastro/services/constructionPermit.service.js'
);

describe('Construction Permit Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPermits', () => {
    it('debe obtener todos los permisos con paginación', async () => {
      const mockPermits = [
        {
          id: 'permit-1',
          permitNumber: 'PC-2025-0001',
          status: 'SUBMITTED',
          property: {
            cadastralCode: 'CAT-001',
            address: 'Calle Principal #123',
          },
          _count: {
            inspections: 0,
          },
        },
      ];

      mockPrisma.constructionPermit.findMany.mockResolvedValue(mockPermits);
      mockPrisma.constructionPermit.count.mockResolvedValue(1);

      const result = await permitService.getAllPermits({ page: 1, limit: 10 });

      expect(result.permits).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('debe filtrar por estado', async () => {
      mockPrisma.constructionPermit.findMany.mockResolvedValue([]);
      mockPrisma.constructionPermit.count.mockResolvedValue(0);

      await permitService.getAllPermits({ status: 'APPROVED' });

      expect(mockPrisma.constructionPermit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'APPROVED' }),
        })
      );
    });
  });

  describe('getPermitById', () => {
    it('debe obtener un permiso por ID', async () => {
      const mockPermit = {
        id: 'permit-1',
        permitNumber: 'PC-2025-0001',
        property: {
          cadastralCode: 'CAT-001',
        },
        inspections: [],
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);

      const result = await permitService.getPermitById('permit-1');

      expect(result.permitNumber).toBe('PC-2025-0001');
    });

    it('debe lanzar error si el permiso no existe', async () => {
      mockPrisma.constructionPermit.findUnique.mockResolvedValue(null);

      await expect(permitService.getPermitById('invalid-id')).rejects.toThrow(
        'Permiso de construcción no encontrado'
      );
    });
  });

  describe('createPermit', () => {
    it('debe crear un nuevo permiso de construcción', async () => {
      const permitData = {
        propertyId: 'prop-1',
        applicantName: 'Juan Pérez',
        applicantId: 'V-12345678',
        permitType: 'NEW_CONSTRUCTION',
        projectDescription: 'Construcción de vivienda unifamiliar',
        constructionArea: 150,
        permitFee: 5000,
        totalFee: 5000,
        applicationDate: new Date(),
      };

      mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrisma.constructionPermit.count.mockResolvedValue(0);
      mockPrisma.constructionPermit.create.mockResolvedValue({
        id: 'permit-1',
        permitNumber: 'PC-2025-0001',
        ...permitData,
        status: 'SUBMITTED',
      });

      const result = await permitService.createPermit(permitData);

      expect(result.permitNumber).toBe('PC-2025-0001');
      expect(result.status).toBe('SUBMITTED');
      expect(mockPrisma.constructionPermit.create).toHaveBeenCalled();
    });

    it('debe lanzar error si la propiedad no existe', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        permitService.createPermit({ propertyId: 'invalid' })
      ).rejects.toThrow('Propiedad no encontrada');
    });
  });

  describe('reviewPermit', () => {
    it('debe revisar un permiso técnicamente', async () => {
      const mockPermit = {
        id: 'permit-1',
        status: 'SUBMITTED',
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        reviewerId: 'user-1',
        complianceCheck: true,
        status: 'UNDER_REVIEW',
      });

      const reviewData = {
        reviewerId: 'user-1',
        reviewNotes: 'Cumple con normativas',
        complianceCheck: true,
      };

      const result = await permitService.reviewPermit('permit-1', reviewData);

      expect(result.status).toBe('UNDER_REVIEW');
      expect(result.complianceCheck).toBe(true);
    });

    it('debe marcar como requiere correcciones si no cumple', async () => {
      const mockPermit = {
        id: 'permit-1',
        status: 'SUBMITTED',
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        complianceCheck: false,
        status: 'CORRECTIONS_REQUIRED',
      });

      const reviewData = {
        reviewerId: 'user-1',
        reviewNotes: 'Requiere ajustes en retiros',
        complianceCheck: false,
      };

      const result = await permitService.reviewPermit('permit-1', reviewData);

      expect(result.status).toBe('CORRECTIONS_REQUIRED');
    });

    it('debe lanzar error si el permiso no está en estado de revisión', async () => {
      mockPrisma.constructionPermit.findUnique.mockResolvedValue({
        id: 'permit-1',
        status: 'APPROVED',
        property: {},
      });

      await expect(
        permitService.reviewPermit('permit-1', {})
      ).rejects.toThrow('El permiso no está en estado de revisión');
    });
  });

  describe('approveOrRejectPermit', () => {
    it('debe aprobar un permiso', async () => {
      const mockPermit = {
        id: 'permit-1',
        status: 'UNDER_REVIEW',
        isPaid: true,
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        status: 'APPROVED',
        approvedBy: 'user-1',
      });

      const approvalData = {
        approved: true,
        approvedBy: 'user-1',
        approvalNotes: 'Aprobado',
      };

      const result = await permitService.approveOrRejectPermit('permit-1', approvalData);

      expect(result.status).toBe('APPROVED');
    });

    it('debe rechazar un permiso', async () => {
      const mockPermit = {
        id: 'permit-1',
        status: 'UNDER_REVIEW',
        isPaid: true,
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        status: 'REJECTED',
      });

      const approvalData = {
        approved: false,
        approvedBy: 'user-1',
        approvalNotes: 'No cumple con normativas',
      };

      const result = await permitService.approveOrRejectPermit('permit-1', approvalData);

      expect(result.status).toBe('REJECTED');
    });

    it('debe lanzar error si el permiso no está pagado', async () => {
      mockPrisma.constructionPermit.findUnique.mockResolvedValue({
        id: 'permit-1',
        status: 'UNDER_REVIEW',
        isPaid: false,
        property: {},
      });

      await expect(
        permitService.approveOrRejectPermit('permit-1', { approved: true })
      ).rejects.toThrow('El permiso debe estar pagado para ser aprobado');
    });
  });

  describe('registerPayment', () => {
    it('debe registrar el pago de un permiso', async () => {
      const mockPermit = {
        id: 'permit-1',
        isPaid: false,
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        isPaid: true,
        paymentReference: 'REF-123',
      });

      const paymentData = {
        paymentReference: 'REF-123',
      };

      const result = await permitService.registerPayment('permit-1', paymentData);

      expect(result.isPaid).toBe(true);
      expect(result.paymentReference).toBe('REF-123');
    });

    it('debe lanzar error si el permiso ya está pagado', async () => {
      mockPrisma.constructionPermit.findUnique.mockResolvedValue({
        id: 'permit-1',
        isPaid: true,
        property: {},
      });

      await expect(
        permitService.registerPayment('permit-1', {})
      ).rejects.toThrow('El permiso ya está pagado');
    });
  });

  describe('startConstruction', () => {
    it('debe iniciar la construcción', async () => {
      const mockPermit = {
        id: 'permit-1',
        status: 'APPROVED',
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        status: 'IN_CONSTRUCTION',
      });

      const result = await permitService.startConstruction('permit-1');

      expect(result.status).toBe('IN_CONSTRUCTION');
    });

    it('debe lanzar error si el permiso no está aprobado', async () => {
      mockPrisma.constructionPermit.findUnique.mockResolvedValue({
        id: 'permit-1',
        status: 'SUBMITTED',
        property: {},
      });

      await expect(permitService.startConstruction('permit-1')).rejects.toThrow(
        'El permiso debe estar aprobado para iniciar construcción'
      );
    });
  });

  describe('completeConstruction', () => {
    it('debe completar la construcción', async () => {
      const mockPermit = {
        id: 'permit-1',
        status: 'IN_CONSTRUCTION',
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.permitInspection.findFirst.mockResolvedValue({
        id: 'insp-1',
        inspectionType: 'FINAL',
        compliance: true,
        status: 'COMPLETED',
      });
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        status: 'COMPLETED',
      });

      const result = await permitService.completeConstruction('permit-1');

      expect(result.status).toBe('COMPLETED');
    });

    it('debe lanzar error si no hay inspección final aprobada', async () => {
      mockPrisma.constructionPermit.findUnique.mockResolvedValue({
        id: 'permit-1',
        status: 'IN_CONSTRUCTION',
        property: {},
      });
      mockPrisma.permitInspection.findFirst.mockResolvedValue(null);

      await expect(permitService.completeConstruction('permit-1')).rejects.toThrow(
        'Se requiere una inspección final aprobada'
      );
    });
  });

  describe('cancelPermit', () => {
    it('debe cancelar un permiso', async () => {
      const mockPermit = {
        id: 'permit-1',
        status: 'SUBMITTED',
        property: {},
      };

      mockPrisma.constructionPermit.findUnique.mockResolvedValue(mockPermit);
      mockPrisma.constructionPermit.update.mockResolvedValue({
        ...mockPermit,
        status: 'CANCELLED',
      });

      const result = await permitService.cancelPermit('permit-1', 'Solicitado por el cliente');

      expect(result.status).toBe('CANCELLED');
    });

    it('debe lanzar error si el permiso ya está completado', async () => {
      mockPrisma.constructionPermit.findUnique.mockResolvedValue({
        id: 'permit-1',
        status: 'COMPLETED',
        property: {},
      });

      await expect(
        permitService.cancelPermit('permit-1', 'Razón')
      ).rejects.toThrow('No se puede cancelar un permiso completado');
    });
  });
});
