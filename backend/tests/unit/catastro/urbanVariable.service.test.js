/**
 * Tests unitarios para el servicio de variables urbanas
 */

import { jest } from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
  urbanVariable: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const urbanVariableService = await import(
  '../../../src/modules/catastro/services/urbanVariable.service.js'
);

describe('Urban Variable Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUrbanVariables', () => {
    it('debe obtener todas las variables urbanas', async () => {
      const mockVariables = [
        {
          id: 'var-1',
          zoneCode: 'R1',
          zoneName: 'Residencial 1',
          zoneType: 'RESIDENTIAL',
          frontSetback: 5,
          maxHeight: 12,
          isActive: true,
        },
      ];

      mockPrisma.urbanVariable.findMany.mockResolvedValue(mockVariables);

      const result = await urbanVariableService.getAllUrbanVariables();

      expect(result).toHaveLength(1);
      expect(result[0].zoneCode).toBe('R1');
    });

    it('debe filtrar por tipo de zona', async () => {
      mockPrisma.urbanVariable.findMany.mockResolvedValue([]);

      await urbanVariableService.getAllUrbanVariables({ zoneType: 'COMMERCIAL' });

      expect(mockPrisma.urbanVariable.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ zoneType: 'COMMERCIAL' }),
        })
      );
    });
  });

  describe('getUrbanVariableByZoneCode', () => {
    it('debe obtener variable por código de zona', async () => {
      const mockVariable = {
        id: 'var-1',
        zoneCode: 'R1',
        zoneName: 'Residencial 1',
        frontSetback: 5,
      };

      mockPrisma.urbanVariable.findUnique.mockResolvedValue(mockVariable);

      const result = await urbanVariableService.getUrbanVariableByZoneCode('R1');

      expect(result.zoneCode).toBe('R1');
    });

    it('debe lanzar error si la zona no existe', async () => {
      mockPrisma.urbanVariable.findUnique.mockResolvedValue(null);

      await expect(
        urbanVariableService.getUrbanVariableByZoneCode('INVALID')
      ).rejects.toThrow('Variable urbana no encontrada para esta zona');
    });
  });

  describe('createUrbanVariable', () => {
    it('debe crear una nueva variable urbana', async () => {
      const variableData = {
        zoneCode: 'R2',
        zoneName: 'Residencial 2',
        zoneType: 'RESIDENTIAL',
        frontSetback: 5,
        rearSetback: 3,
        maxHeight: 12,
        maxFloors: 3,
        allowedUses: JSON.stringify(['RESIDENTIAL']),
      };

      mockPrisma.urbanVariable.findUnique.mockResolvedValue(null);
      mockPrisma.urbanVariable.create.mockResolvedValue({
        id: 'var-2',
        ...variableData,
      });

      const result = await urbanVariableService.createUrbanVariable(variableData);

      expect(result.zoneCode).toBe('R2');
      expect(mockPrisma.urbanVariable.create).toHaveBeenCalled();
    });

    it('debe lanzar error si el código de zona ya existe', async () => {
      mockPrisma.urbanVariable.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        urbanVariableService.createUrbanVariable({ zoneCode: 'R1' })
      ).rejects.toThrow('El código de zona ya existe');
    });
  });

  describe('checkCompliance', () => {
    it('debe verificar cumplimiento de variables urbanas', async () => {
      const mockVariable = {
        id: 'var-1',
        zoneCode: 'R1',
        frontSetback: 5,
        rearSetback: 3,
        maxHeight: 12,
        maxFloors: 3,
        allowedUses: JSON.stringify(['RESIDENTIAL']),
      };

      mockPrisma.urbanVariable.findUnique.mockResolvedValue(mockVariable);

      const projectData = {
        frontSetback: 6,
        rearSetback: 4,
        height: 10,
        floors: 2,
        propertyUse: 'RESIDENTIAL',
      };

      const result = await urbanVariableService.checkCompliance('R1', projectData);

      expect(result.compliance.complies).toBe(true);
      expect(result.compliance.violations).toHaveLength(0);
    });

    it('debe detectar violaciones de retiros', async () => {
      const mockVariable = {
        id: 'var-1',
        zoneCode: 'R1',
        frontSetback: 5,
        rearSetback: 3,
        allowedUses: JSON.stringify(['RESIDENTIAL']),
      };

      mockPrisma.urbanVariable.findUnique.mockResolvedValue(mockVariable);

      const projectData = {
        frontSetback: 3, // Menor al requerido
        rearSetback: 2, // Menor al requerido
        propertyUse: 'RESIDENTIAL',
      };

      const result = await urbanVariableService.checkCompliance('R1', projectData);

      expect(result.compliance.complies).toBe(false);
      expect(result.compliance.violations.length).toBeGreaterThan(0);
    });

    it('debe detectar violación de altura', async () => {
      const mockVariable = {
        id: 'var-1',
        zoneCode: 'R1',
        maxHeight: 12,
        allowedUses: JSON.stringify(['RESIDENTIAL']),
      };

      mockPrisma.urbanVariable.findUnique.mockResolvedValue(mockVariable);

      const projectData = {
        height: 15, // Excede el máximo
        propertyUse: 'RESIDENTIAL',
      };

      const result = await urbanVariableService.checkCompliance('R1', projectData);

      expect(result.compliance.complies).toBe(false);
      expect(result.compliance.violations.some(v => v.includes('Altura excedida'))).toBe(true);
    });

    it('debe detectar uso no permitido', async () => {
      const mockVariable = {
        id: 'var-1',
        zoneCode: 'R1',
        allowedUses: JSON.stringify(['RESIDENTIAL']),
      };

      mockPrisma.urbanVariable.findUnique.mockResolvedValue(mockVariable);

      const projectData = {
        propertyUse: 'INDUSTRIAL', // No permitido
      };

      const result = await urbanVariableService.checkCompliance('R1', projectData);

      expect(result.compliance.complies).toBe(false);
      expect(result.compliance.violations.some(v => v.includes('Uso no permitido'))).toBe(true);
    });
  });

  describe('updateUrbanVariable', () => {
    it('debe actualizar una variable urbana', async () => {
      const existing = {
        id: 'var-1',
        zoneCode: 'R1',
      };

      mockPrisma.urbanVariable.findUnique.mockResolvedValue(existing);
      mockPrisma.urbanVariable.update.mockResolvedValue({
        ...existing,
        maxHeight: 15,
      });

      const result = await urbanVariableService.updateUrbanVariable('var-1', {
        maxHeight: 15,
      });

      expect(result.maxHeight).toBe(15);
    });
  });

  describe('deleteUrbanVariable', () => {
    it('debe eliminar una variable urbana', async () => {
      mockPrisma.urbanVariable.findUnique.mockResolvedValue({ id: 'var-1' });
      mockPrisma.urbanVariable.delete.mockResolvedValue({ id: 'var-1' });

      await urbanVariableService.deleteUrbanVariable('var-1');

      expect(mockPrisma.urbanVariable.delete).toHaveBeenCalledWith({
        where: { id: 'var-1' },
      });
    });
  });
});
