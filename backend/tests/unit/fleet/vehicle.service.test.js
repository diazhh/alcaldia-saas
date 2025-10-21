/**
 * Tests unitarios para el servicio de gestión de vehículos
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  fleetVehicle: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const vehicleService = await import(
  '../../../src/modules/fleet/services/vehicle.service.js'
);

describe('Vehicle Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVehicles', () => {
    it('debe obtener todos los vehículos con paginación', async () => {
      const mockVehicles = [
        {
          id: 'vehicle-1',
          code: 'VEH-001',
          plate: 'ABC-123',
          brand: 'Toyota',
          model: 'Hilux',
          year: 2020,
          type: 'PICKUP',
          status: 'OPERATIONAL',
          _count: {
            tripLogs: 10,
            fuelControls: 15,
            maintenances: 5,
          },
        },
      ];

      mockPrisma.fleetVehicle.findMany.mockResolvedValue(mockVehicles);
      mockPrisma.fleetVehicle.count.mockResolvedValue(1);

      const result = await vehicleService.getAllVehicles({}, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
      expect(mockPrisma.fleetVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );
    });

    it('debe filtrar vehículos por estado', async () => {
      mockPrisma.fleetVehicle.findMany.mockResolvedValue([]);
      mockPrisma.fleetVehicle.count.mockResolvedValue(0);

      await vehicleService.getAllVehicles({ status: 'OPERATIONAL' });

      expect(mockPrisma.fleetVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPERATIONAL' }),
        })
      );
    });

    it('debe filtrar vehículos por tipo', async () => {
      mockPrisma.fleetVehicle.findMany.mockResolvedValue([]);
      mockPrisma.fleetVehicle.count.mockResolvedValue(0);

      await vehicleService.getAllVehicles({ type: 'PICKUP' });

      expect(mockPrisma.fleetVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'PICKUP' }),
        })
      );
    });

    it('debe filtrar vehículos por departamento', async () => {
      mockPrisma.fleetVehicle.findMany.mockResolvedValue([]);
      mockPrisma.fleetVehicle.count.mockResolvedValue(0);

      await vehicleService.getAllVehicles({ departmentId: 'dept-1' });

      expect(mockPrisma.fleetVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ departmentId: 'dept-1' }),
        })
      );
    });

    it('debe buscar vehículos por texto', async () => {
      mockPrisma.fleetVehicle.findMany.mockResolvedValue([]);
      mockPrisma.fleetVehicle.count.mockResolvedValue(0);

      await vehicleService.getAllVehicles({ search: 'Toyota' });

      expect(mockPrisma.fleetVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ brand: expect.any(Object) }),
            ]),
          }),
        })
      );
    });
  });

  describe('getVehicleById', () => {
    it('debe obtener un vehículo por ID', async () => {
      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        tripLogs: [],
        fuelControls: [],
        maintenances: [],
        insurances: [],
        tires: [],
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);

      const result = await vehicleService.getVehicleById('vehicle-1');

      expect(result).toEqual(mockVehicle);
      expect(mockPrisma.fleetVehicle.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'vehicle-1' },
          include: expect.any(Object),
        })
      );
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(vehicleService.getVehicleById('invalid-id')).rejects.toThrow(
        'Vehículo no encontrado'
      );
    });
  });

  describe('createVehicle', () => {
    it('debe crear un nuevo vehículo', async () => {
      const newVehicle = {
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2020,
        type: 'PICKUP',
        fuelType: 'DIESEL',
        acquisitionDate: '2020-01-15',
        currentMileage: 0,
        currentValue: new Decimal(50000),
      };

      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(null) // No existe código
        .mockResolvedValueOnce(null); // No existe placa

      mockPrisma.fleetVehicle.create.mockResolvedValue({
        id: 'vehicle-1',
        ...newVehicle,
        acquisitionDate: new Date(newVehicle.acquisitionDate),
      });

      const result = await vehicleService.createVehicle(newVehicle);

      expect(result.id).toBe('vehicle-1');
      expect(mockPrisma.fleetVehicle.create).toHaveBeenCalled();
    });

    it('debe lanzar error si el código ya existe', async () => {
      const newVehicle = {
        code: 'VEH-001',
        plate: 'ABC-123',
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValueOnce({
        id: 'existing-vehicle',
        code: 'VEH-001',
      });

      await expect(vehicleService.createVehicle(newVehicle)).rejects.toThrow(
        'Ya existe un vehículo con ese código'
      );
    });

    it('debe lanzar error si la placa ya existe', async () => {
      const newVehicle = {
        code: 'VEH-001',
        plate: 'ABC-123',
      };

      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(null) // No existe código
        .mockResolvedValueOnce({ id: 'existing-vehicle', plate: 'ABC-123' }); // Existe placa

      await expect(vehicleService.createVehicle(newVehicle)).rejects.toThrow(
        'Ya existe un vehículo con esa placa'
      );
    });
  });

  describe('updateVehicle', () => {
    it('debe actualizar un vehículo existente', async () => {
      const existingVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
      };

      const updateData = {
        brand: 'Ford',
        model: 'Ranger',
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(existingVehicle);
      mockPrisma.fleetVehicle.update.mockResolvedValue({
        ...existingVehicle,
        ...updateData,
      });

      const result = await vehicleService.updateVehicle('vehicle-1', updateData);

      expect(result.brand).toBe('Ford');
      expect(result.model).toBe('Ranger');
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(
        vehicleService.updateVehicle('invalid-id', { brand: 'Ford' })
      ).rejects.toThrow('Vehículo no encontrado');
    });

    it('debe lanzar error si el nuevo código ya existe', async () => {
      const existingVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
      };

      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(existingVehicle) // Vehículo a actualizar
        .mockResolvedValueOnce({ id: 'vehicle-2', code: 'VEH-002' }); // Código ya existe

      await expect(
        vehicleService.updateVehicle('vehicle-1', { code: 'VEH-002' })
      ).rejects.toThrow('Ya existe un vehículo con ese código');
    });

    it('debe lanzar error si la nueva placa ya existe', async () => {
      const existingVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
      };

      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(existingVehicle) // Vehículo a actualizar
        .mockResolvedValueOnce({ id: 'vehicle-2', plate: 'XYZ-789' }); // Placa ya existe

      await expect(
        vehicleService.updateVehicle('vehicle-1', { plate: 'XYZ-789' })
      ).rejects.toThrow('Ya existe un vehículo con esa placa');
    });
  });

  describe('deleteVehicle', () => {
    it('debe eliminar un vehículo existente', async () => {
      const existingVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(existingVehicle);
      mockPrisma.fleetVehicle.delete.mockResolvedValue(existingVehicle);

      const result = await vehicleService.deleteVehicle('vehicle-1');

      expect(result.message).toBe('Vehículo eliminado exitosamente');
      expect(mockPrisma.fleetVehicle.delete).toHaveBeenCalledWith({
        where: { id: 'vehicle-1' },
      });
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(vehicleService.deleteVehicle('invalid-id')).rejects.toThrow(
        'Vehículo no encontrado'
      );
    });
  });

  describe('getFleetStatistics', () => {
    it('debe obtener estadísticas de la flota', async () => {
      mockPrisma.fleetVehicle.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(40) // operational
        .mockResolvedValueOnce(5) // in repair
        .mockResolvedValueOnce(5); // out of service

      mockPrisma.fleetVehicle.groupBy
        .mockResolvedValueOnce([
          { type: 'PICKUP', _count: 20 },
          { type: 'SEDAN', _count: 15 },
        ])
        .mockResolvedValueOnce([
          { fuelType: 'DIESEL', _count: 30 },
          { fuelType: 'GASOLINE', _count: 20 },
        ]);

      mockPrisma.fleetVehicle.aggregate
        .mockResolvedValueOnce({ _avg: { currentMileage: 50000 } })
        .mockResolvedValueOnce({ _sum: { currentValue: new Decimal(2500000) } });

      const result = await vehicleService.getFleetStatistics();

      expect(result.total).toBe(50);
      expect(result.operational).toBe(40);
      expect(result.inRepair).toBe(5);
      expect(result.outOfService).toBe(5);
      expect(result.byType).toHaveLength(2);
      expect(result.byFuelType).toHaveLength(2);
      expect(result.averageMileage).toBe(50000);
    });
  });

  describe('updateMileage', () => {
    it('debe actualizar el kilometraje de un vehículo', async () => {
      const existingVehicle = {
        id: 'vehicle-1',
        currentMileage: 10000,
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(existingVehicle);
      mockPrisma.fleetVehicle.update.mockResolvedValue({
        ...existingVehicle,
        currentMileage: 15000,
      });

      const result = await vehicleService.updateMileage('vehicle-1', 15000);

      expect(result.currentMileage).toBe(15000);
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(
        vehicleService.updateMileage('invalid-id', 15000)
      ).rejects.toThrow('Vehículo no encontrado');
    });

    it('debe lanzar error si el nuevo kilometraje es menor al actual', async () => {
      const existingVehicle = {
        id: 'vehicle-1',
        currentMileage: 10000,
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(existingVehicle);

      await expect(
        vehicleService.updateMileage('vehicle-1', 5000)
      ).rejects.toThrow('El nuevo kilometraje no puede ser menor al actual');
    });
  });
});
