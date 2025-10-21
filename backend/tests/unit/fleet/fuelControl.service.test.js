/**
 * Tests unitarios para el servicio de control de combustible
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  fuelControl: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  fleetVehicle: {
    findUnique: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const fuelControlService = await import(
  '../../../src/modules/fleet/services/fuelControl.service.js'
);

describe('FuelControl Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFuelControls', () => {
    it('debe obtener todos los registros de combustible con paginación', async () => {
      const mockFuelControls = [
        {
          id: 'fuel-1',
          vehicleId: 'vehicle-1',
          voucherNumber: 'VALE-001',
          loadedLiters: 50,
          cost: new Decimal(100),
          vehicle: {
            id: 'vehicle-1',
            code: 'VEH-001',
            plate: 'ABC-123',
          },
        },
      ];

      mockPrisma.fuelControl.findMany.mockResolvedValue(mockFuelControls);
      mockPrisma.fuelControl.count.mockResolvedValue(1);

      const result = await fuelControlService.getAllFuelControls({}, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('debe filtrar registros por vehículo', async () => {
      mockPrisma.fuelControl.findMany.mockResolvedValue([]);
      mockPrisma.fuelControl.count.mockResolvedValue(0);

      await fuelControlService.getAllFuelControls({ vehicleId: 'vehicle-1' });

      expect(mockPrisma.fuelControl.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vehicleId: 'vehicle-1' }),
        })
      );
    });

    it('debe filtrar registros por rango de fechas', async () => {
      mockPrisma.fuelControl.findMany.mockResolvedValue([]);
      mockPrisma.fuelControl.count.mockResolvedValue(0);

      await fuelControlService.getAllFuelControls({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrisma.fuelControl.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            loadDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('getFuelControlById', () => {
    it('debe obtener un registro de combustible por ID', async () => {
      const mockFuelControl = {
        id: 'fuel-1',
        vehicleId: 'vehicle-1',
        voucherNumber: 'VALE-001',
        vehicle: { code: 'VEH-001' },
      };

      mockPrisma.fuelControl.findUnique.mockResolvedValue(mockFuelControl);

      const result = await fuelControlService.getFuelControlById('fuel-1');

      expect(result).toEqual(mockFuelControl);
      expect(mockPrisma.fuelControl.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'fuel-1' },
        })
      );
    });

    it('debe lanzar error si el registro no existe', async () => {
      mockPrisma.fuelControl.findUnique.mockResolvedValue(null);

      await expect(
        fuelControlService.getFuelControlById('invalid-id')
      ).rejects.toThrow('Registro de combustible no encontrado');
    });
  });

  describe('createFuelControl', () => {
    it('debe crear un nuevo registro de combustible sin eficiencia', async () => {
      const newFuelControl = {
        vehicleId: 'vehicle-1',
        voucherNumber: 'VALE-001',
        loadedLiters: 50,
        cost: new Decimal(100),
        loadDate: '2024-01-15',
        mileageAtLoad: 0,
      };

      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.fuelControl.findUnique.mockResolvedValue(null);
      mockPrisma.fuelControl.create.mockResolvedValue({
        id: 'fuel-1',
        ...newFuelControl,
        efficiency: null,
        loadDate: new Date(newFuelControl.loadDate),
        vehicle: mockVehicle,
      });

      const result = await fuelControlService.createFuelControl(newFuelControl);

      expect(result.id).toBe('fuel-1');
      expect(mockPrisma.fuelControl.create).toHaveBeenCalled();
    });

    it('debe crear un registro con cálculo de eficiencia', async () => {
      const newFuelControl = {
        vehicleId: 'vehicle-1',
        voucherNumber: 'VALE-002',
        loadedLiters: 50,
        cost: new Decimal(100),
        loadDate: '2024-01-15',
        mileageAtLoad: 10500,
      };

      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
      };

      const lastFuelControl = {
        id: 'fuel-1',
        mileageAtLoad: 10000,
        loadedLiters: 50,
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.fuelControl.findUnique.mockResolvedValue(null); // No existe vale
      mockPrisma.fuelControl.findFirst.mockResolvedValue(lastFuelControl);
      mockPrisma.fuelControl.create.mockResolvedValue({
        id: 'fuel-2',
        ...newFuelControl,
        efficiency: 10, // (10500 - 10000) / 50 = 10 km/l
        loadDate: new Date(newFuelControl.loadDate),
        vehicle: mockVehicle,
      });

      const result = await fuelControlService.createFuelControl(newFuelControl);

      expect(result.id).toBe('fuel-2');
      expect(mockPrisma.fuelControl.findFirst).toHaveBeenCalled();
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(
        fuelControlService.createFuelControl({
          vehicleId: 'invalid-vehicle',
          voucherNumber: 'VALE-001',
        })
      ).rejects.toThrow('Vehículo no encontrado');
    });

    it('debe lanzar error si el número de vale ya existe', async () => {
      const mockVehicle = {
        id: 'vehicle-1',
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.fuelControl.findUnique.mockResolvedValue({
        id: 'fuel-1',
        voucherNumber: 'VALE-001',
      });

      await expect(
        fuelControlService.createFuelControl({
          vehicleId: 'vehicle-1',
          voucherNumber: 'VALE-001',
        })
      ).rejects.toThrow('Ya existe un registro con ese número de vale');
    });
  });

  describe('updateFuelControl', () => {
    it('debe actualizar un registro de combustible', async () => {
      const existingFuelControl = {
        id: 'fuel-1',
        voucherNumber: 'VALE-001',
        loadedLiters: 50,
      };

      const updateData = {
        loadedLiters: 60,
      };

      mockPrisma.fuelControl.findUnique.mockResolvedValue(existingFuelControl);
      mockPrisma.fuelControl.update.mockResolvedValue({
        ...existingFuelControl,
        ...updateData,
      });

      const result = await fuelControlService.updateFuelControl('fuel-1', updateData);

      expect(result.loadedLiters).toBe(60);
    });

    it('debe lanzar error si el registro no existe', async () => {
      mockPrisma.fuelControl.findUnique.mockResolvedValue(null);

      await expect(
        fuelControlService.updateFuelControl('invalid-id', {})
      ).rejects.toThrow('Registro de combustible no encontrado');
    });

    it('debe lanzar error si el nuevo número de vale ya existe', async () => {
      const existingFuelControl = {
        id: 'fuel-1',
        voucherNumber: 'VALE-001',
      };

      mockPrisma.fuelControl.findUnique
        .mockResolvedValueOnce(existingFuelControl) // Registro a actualizar
        .mockResolvedValueOnce({ id: 'fuel-2', voucherNumber: 'VALE-002' }); // Vale ya existe

      await expect(
        fuelControlService.updateFuelControl('fuel-1', { voucherNumber: 'VALE-002' })
      ).rejects.toThrow('Ya existe un registro con ese número de vale');
    });
  });

  describe('deleteFuelControl', () => {
    it('debe eliminar un registro de combustible', async () => {
      const existingFuelControl = {
        id: 'fuel-1',
      };

      mockPrisma.fuelControl.findUnique.mockResolvedValue(existingFuelControl);
      mockPrisma.fuelControl.delete.mockResolvedValue(existingFuelControl);

      const result = await fuelControlService.deleteFuelControl('fuel-1');

      expect(result.message).toBe('Registro de combustible eliminado exitosamente');
      expect(mockPrisma.fuelControl.delete).toHaveBeenCalledWith({
        where: { id: 'fuel-1' },
      });
    });

    it('debe lanzar error si el registro no existe', async () => {
      mockPrisma.fuelControl.findUnique.mockResolvedValue(null);

      await expect(
        fuelControlService.deleteFuelControl('invalid-id')
      ).rejects.toThrow('Registro de combustible no encontrado');
    });
  });

  describe('getFuelStatistics', () => {
    it('debe obtener estadísticas de combustible', async () => {
      mockPrisma.fuelControl.count.mockResolvedValue(100);
      mockPrisma.fuelControl.aggregate
        .mockResolvedValueOnce({ _sum: { loadedLiters: 5000 } })
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(10000) } })
        .mockResolvedValueOnce({ _avg: { efficiency: 12.5 } });

      mockPrisma.fuelControl.groupBy.mockResolvedValue([
        {
          vehicleId: 'vehicle-1',
          _sum: { loadedLiters: 2000, cost: new Decimal(4000) },
          _avg: { efficiency: 13 },
          _count: 40,
        },
        {
          vehicleId: 'vehicle-2',
          _sum: { loadedLiters: 3000, cost: new Decimal(6000) },
          _avg: { efficiency: 12 },
          _count: 60,
        },
      ]);

      const result = await fuelControlService.getFuelStatistics();

      expect(result.totalLoads).toBe(100);
      expect(result.totalLiters).toBe(5000);
      expect(result.averageEfficiency).toBe(12.5);
      expect(result.byVehicle).toHaveLength(2);
    });

    it('debe filtrar estadísticas por vehículo', async () => {
      mockPrisma.fuelControl.count.mockResolvedValue(0);
      mockPrisma.fuelControl.aggregate.mockResolvedValue({
        _sum: { loadedLiters: 0 },
        _avg: { efficiency: 0 },
      });
      mockPrisma.fuelControl.groupBy.mockResolvedValue([]);

      await fuelControlService.getFuelStatistics({ vehicleId: 'vehicle-1' });

      expect(mockPrisma.fuelControl.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vehicleId: 'vehicle-1' }),
        })
      );
    });

    it('debe filtrar estadísticas por rango de fechas', async () => {
      mockPrisma.fuelControl.count.mockResolvedValue(0);
      mockPrisma.fuelControl.aggregate.mockResolvedValue({
        _sum: { loadedLiters: 0 },
        _avg: { efficiency: 0 },
      });
      mockPrisma.fuelControl.groupBy.mockResolvedValue([]);

      await fuelControlService.getFuelStatistics({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrisma.fuelControl.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            loadDate: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('getVehicleFuelEfficiency', () => {
    it('debe obtener el rendimiento de combustible de un vehículo', async () => {
      const mockFuelControls = [
        { id: 'fuel-1', efficiency: new Decimal(12), loadDate: new Date() },
        { id: 'fuel-2', efficiency: new Decimal(13), loadDate: new Date() },
        { id: 'fuel-3', efficiency: new Decimal(11), loadDate: new Date() },
      ];

      mockPrisma.fuelControl.findMany.mockResolvedValue(mockFuelControls);

      const result = await fuelControlService.getVehicleFuelEfficiency('vehicle-1', 6);

      expect(result.vehicleId).toBe('vehicle-1');
      expect(result.averageEfficiency).toBe(12);
      expect(result.minEfficiency).toBe(11);
      expect(result.maxEfficiency).toBe(13);
      expect(result.records).toHaveLength(3);
    });

    it('debe retornar valores en cero si no hay registros', async () => {
      mockPrisma.fuelControl.findMany.mockResolvedValue([]);

      const result = await fuelControlService.getVehicleFuelEfficiency('vehicle-1', 6);

      expect(result.vehicleId).toBe('vehicle-1');
      expect(result.averageEfficiency).toBe(0);
      expect(result.minEfficiency).toBe(0);
      expect(result.maxEfficiency).toBe(0);
      expect(result.records).toHaveLength(0);
    });

    it('debe usar 6 meses por defecto', async () => {
      mockPrisma.fuelControl.findMany.mockResolvedValue([]);

      await fuelControlService.getVehicleFuelEfficiency('vehicle-1');

      expect(mockPrisma.fuelControl.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicleId: 'vehicle-1',
            loadDate: expect.any(Object),
          }),
        })
      );
    });
  });
});
