/**
 * Tests unitarios para el servicio de propiedades (fichas catastrales)
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  property: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  taxpayer: {
    findUnique: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const propertyService = await import(
  '../../../src/modules/catastro/services/property.service.js'
);

describe('Property Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProperties', () => {
    it('debe obtener todas las propiedades con paginación', async () => {
      const mockProperties = [
        {
          id: 'prop-1',
          cadastralCode: 'CAT-001',
          address: 'Calle Principal #123',
          parish: 'Centro',
          propertyUse: 'RESIDENTIAL',
          taxpayer: {
            id: 'taxpayer-1',
            name: 'Juan Pérez',
            taxId: 'V-12345678',
          },
          owners: [
            {
              id: 'owner-1',
              ownerName: 'Juan Pérez',
              isCurrent: true,
            },
          ],
          _count: {
            photos: 3,
            constructionPermits: 1,
            urbanInspections: 0,
          },
        },
      ];

      mockPrisma.property.findMany.mockResolvedValue(mockProperties);
      mockPrisma.property.count.mockResolvedValue(1);

      const result = await propertyService.getAllProperties({ page: 1, limit: 10 });

      expect(result.properties).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.pages).toBe(1);
    });

    it('debe filtrar propiedades por uso', async () => {
      mockPrisma.property.findMany.mockResolvedValue([]);
      mockPrisma.property.count.mockResolvedValue(0);

      await propertyService.getAllProperties({ propertyUse: 'COMMERCIAL' });

      expect(mockPrisma.property.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ propertyUse: 'COMMERCIAL' }),
        })
      );
    });
  });

  describe('getPropertyById', () => {
    it('debe obtener una propiedad por ID', async () => {
      const mockProperty = {
        id: 'prop-1',
        cadastralCode: 'CAT-001',
        address: 'Calle Principal #123',
        taxpayer: { name: 'Juan Pérez' },
        owners: [],
        photos: [],
        constructionPermits: [],
        urbanInspections: [],
        taxBills: [],
      };

      mockPrisma.property.findUnique.mockResolvedValue(mockProperty);

      const result = await propertyService.getPropertyById('prop-1');

      expect(result.id).toBe('prop-1');
      expect(result.cadastralCode).toBe('CAT-001');
    });

    it('debe lanzar error si la propiedad no existe', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(propertyService.getPropertyById('invalid-id')).rejects.toThrow(
        'Propiedad no encontrada'
      );
    });
  });

  describe('createProperty', () => {
    it('debe crear una nueva propiedad', async () => {
      const propertyData = {
        taxpayerId: 'taxpayer-1',
        cadastralCode: 'CAT-002',
        address: 'Calle Nueva #456',
        parish: 'Norte',
        landArea: 250,
        propertyUse: 'RESIDENTIAL',
        propertyType: 'HOUSE',
        landValue: 50000,
        buildingValue: 30000,
        totalValue: 80000,
        taxRate: 0.5,
      };

      mockPrisma.property.findUnique.mockResolvedValue(null);
      mockPrisma.taxpayer.findUnique.mockResolvedValue({ id: 'taxpayer-1' });
      mockPrisma.property.create.mockResolvedValue({
        id: 'prop-2',
        ...propertyData,
        status: 'ACTIVE',
      });

      const result = await propertyService.createProperty(propertyData);

      expect(result.cadastralCode).toBe('CAT-002');
      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.property.create).toHaveBeenCalled();
    });

    it('debe lanzar error si el código catastral ya existe', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        propertyService.createProperty({ cadastralCode: 'CAT-001' })
      ).rejects.toThrow('El código catastral ya existe');
    });

    it('debe lanzar error si el contribuyente no existe', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);
      mockPrisma.taxpayer.findUnique.mockResolvedValue(null);

      await expect(
        propertyService.createProperty({
          taxpayerId: 'invalid',
          cadastralCode: 'CAT-003',
        })
      ).rejects.toThrow('Contribuyente no encontrado');
    });
  });

  describe('updateProperty', () => {
    it('debe actualizar una propiedad existente', async () => {
      const existingProperty = {
        id: 'prop-1',
        cadastralCode: 'CAT-001',
      };

      const updateData = {
        address: 'Nueva Dirección',
        landArea: 300,
      };

      mockPrisma.property.findUnique.mockResolvedValue(existingProperty);
      mockPrisma.property.update.mockResolvedValue({
        ...existingProperty,
        ...updateData,
      });

      const result = await propertyService.updateProperty('prop-1', updateData);

      expect(result.address).toBe('Nueva Dirección');
      expect(mockPrisma.property.update).toHaveBeenCalled();
    });

    it('debe lanzar error si la propiedad no existe', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(
        propertyService.updateProperty('invalid-id', {})
      ).rejects.toThrow('Propiedad no encontrada');
    });
  });

  describe('deleteProperty', () => {
    it('debe eliminar una propiedad', async () => {
      mockPrisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
      mockPrisma.property.delete.mockResolvedValue({ id: 'prop-1' });

      await propertyService.deleteProperty('prop-1');

      expect(mockPrisma.property.delete).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
      });
    });

    it('debe lanzar error si la propiedad no existe', async () => {
      mockPrisma.property.findUnique.mockResolvedValue(null);

      await expect(propertyService.deleteProperty('invalid-id')).rejects.toThrow(
        'Propiedad no encontrada'
      );
    });
  });

  describe('getPropertyStats', () => {
    it('debe obtener estadísticas de propiedades', async () => {
      mockPrisma.property.count.mockResolvedValue(100);
      mockPrisma.property.groupBy.mockResolvedValue([
        { propertyUse: 'RESIDENTIAL', _count: 60 },
        { propertyUse: 'COMMERCIAL', _count: 40 },
      ]);

      const result = await propertyService.getPropertyStats();

      expect(result.total).toBe(100);
      expect(result.byUse).toHaveLength(2);
    });
  });
});
