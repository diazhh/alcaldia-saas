/**
 * Tests unitarios para el servicio de mantenimiento
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  maintenance: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  fleetVehicle: {
    findUnique: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const maintenanceService = await import(
  '../../../src/modules/fleet/services/maintenance.service.js'
);

describe('Maintenance Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMaintenances', () => {
    it('debe obtener todos los mantenimientos con paginación', async () => {
      const mockMaintenances = [
        {
          id: 'maint-1',
          vehicleId: 'vehicle-1',
          type: 'PREVENTIVE',
          status: 'SCHEDULED',
          vehicle: {
            id: 'vehicle-1',
            code: 'VEH-001',
            plate: 'ABC-123',
          },
        },
      ];

      mockPrisma.maintenance.findMany.mockResolvedValue(mockMaintenances);
      mockPrisma.maintenance.count.mockResolvedValue(1);

      const result = await maintenanceService.getAllMaintenances({}, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('debe filtrar mantenimientos por vehículo', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([]);
      mockPrisma.maintenance.count.mockResolvedValue(0);

      await maintenanceService.getAllMaintenances({ vehicleId: 'vehicle-1' });

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vehicleId: 'vehicle-1' }),
        })
      );
    });

    it('debe filtrar mantenimientos por tipo', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([]);
      mockPrisma.maintenance.count.mockResolvedValue(0);

      await maintenanceService.getAllMaintenances({ type: 'PREVENTIVE' });

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'PREVENTIVE' }),
        })
      );
    });

    it('debe filtrar mantenimientos por estado', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([]);
      mockPrisma.maintenance.count.mockResolvedValue(0);

      await maintenanceService.getAllMaintenances({ status: 'COMPLETED' });

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'COMPLETED' }),
        })
      );
    });

    it('debe filtrar mantenimientos por rango de fechas', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([]);
      mockPrisma.maintenance.count.mockResolvedValue(0);

      await maintenanceService.getAllMaintenances({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('getMaintenanceById', () => {
    it('debe obtener un mantenimiento por ID', async () => {
      const mockMaintenance = {
        id: 'maint-1',
        vehicleId: 'vehicle-1',
        type: 'PREVENTIVE',
        vehicle: { code: 'VEH-001' },
      };

      mockPrisma.maintenance.findUnique.mockResolvedValue(mockMaintenance);

      const result = await maintenanceService.getMaintenanceById('maint-1');

      expect(result).toEqual(mockMaintenance);
      expect(mockPrisma.maintenance.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'maint-1' },
        })
      );
    });

    it('debe lanzar error si el mantenimiento no existe', async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(null);

      await expect(
        maintenanceService.getMaintenanceById('invalid-id')
      ).rejects.toThrow('Mantenimiento no encontrado');
    });
  });

  describe('createMaintenance', () => {
    it('debe crear un nuevo mantenimiento', async () => {
      const newMaintenance = {
        vehicleId: 'vehicle-1',
        type: 'PREVENTIVE',
        status: 'SCHEDULED',
        description: 'Cambio de aceite',
        scheduledDate: '2024-01-15',
        laborCost: new Decimal(50),
        partsCost: new Decimal(30),
      };

      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.maintenance.create.mockResolvedValue({
        id: 'maint-1',
        ...newMaintenance,
        totalCost: new Decimal(80),
        scheduledDate: new Date(newMaintenance.scheduledDate),
        vehicle: mockVehicle,
      });

      const result = await maintenanceService.createMaintenance(newMaintenance);

      expect(result.id).toBe('maint-1');
      expect(mockPrisma.maintenance.create).toHaveBeenCalled();
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(
        maintenanceService.createMaintenance({
          vehicleId: 'invalid-vehicle',
          type: 'PREVENTIVE',
        })
      ).rejects.toThrow('Vehículo no encontrado');
    });

    it('debe calcular el costo total correctamente', async () => {
      const newMaintenance = {
        vehicleId: 'vehicle-1',
        type: 'CORRECTIVE',
        scheduledDate: '2024-01-15',
        laborCost: new Decimal(100),
        partsCost: new Decimal(200),
      };

      const mockVehicle = { id: 'vehicle-1' };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.maintenance.create.mockImplementation((args) => {
        expect(args.data.totalCost).toBe(300);
        return Promise.resolve({
          id: 'maint-1',
          ...args.data,
          vehicle: mockVehicle,
        });
      });

      await maintenanceService.createMaintenance(newMaintenance);
    });
  });

  describe('updateMaintenance', () => {
    it('debe actualizar un mantenimiento existente', async () => {
      const existingMaintenance = {
        id: 'maint-1',
        description: 'Cambio de aceite',
        laborCost: new Decimal(50),
        partsCost: new Decimal(30),
        totalCost: new Decimal(80),
      };

      const updateData = {
        description: 'Cambio de aceite y filtros',
      };

      mockPrisma.maintenance.findUnique.mockResolvedValue(existingMaintenance);
      mockPrisma.maintenance.update.mockResolvedValue({
        ...existingMaintenance,
        ...updateData,
      });

      const result = await maintenanceService.updateMaintenance('maint-1', updateData);

      expect(result.description).toBe('Cambio de aceite y filtros');
    });

    it('debe recalcular el costo total al actualizar costos parciales', async () => {
      const existingMaintenance = {
        id: 'maint-1',
        laborCost: new Decimal(50),
        partsCost: new Decimal(30),
        totalCost: new Decimal(80),
      };

      const updateData = {
        laborCost: new Decimal(100),
      };

      mockPrisma.maintenance.findUnique.mockResolvedValue(existingMaintenance);
      mockPrisma.maintenance.update.mockImplementation((args) => {
        expect(args.data.totalCost).toBe(130); // 100 + 30
        return Promise.resolve({
          ...existingMaintenance,
          ...args.data,
        });
      });

      await maintenanceService.updateMaintenance('maint-1', updateData);
    });

    it('debe lanzar error si el mantenimiento no existe', async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(null);

      await expect(
        maintenanceService.updateMaintenance('invalid-id', {})
      ).rejects.toThrow('Mantenimiento no encontrado');
    });
  });

  describe('deleteMaintenance', () => {
    it('debe eliminar un mantenimiento', async () => {
      const existingMaintenance = {
        id: 'maint-1',
      };

      mockPrisma.maintenance.findUnique.mockResolvedValue(existingMaintenance);
      mockPrisma.maintenance.delete.mockResolvedValue(existingMaintenance);

      const result = await maintenanceService.deleteMaintenance('maint-1');

      expect(result.message).toBe('Mantenimiento eliminado exitosamente');
      expect(mockPrisma.maintenance.delete).toHaveBeenCalledWith({
        where: { id: 'maint-1' },
      });
    });

    it('debe lanzar error si el mantenimiento no existe', async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(null);

      await expect(
        maintenanceService.deleteMaintenance('invalid-id')
      ).rejects.toThrow('Mantenimiento no encontrado');
    });
  });

  describe('completeMaintenance', () => {
    it('debe completar un mantenimiento correctamente', async () => {
      const existingMaintenance = {
        id: 'maint-1',
        vehicleId: 'vehicle-1',
        type: 'CORRECTIVE',
        status: 'IN_PROGRESS',
        vehicle: { currentMileage: 10000 },
      };

      const completeData = {
        workPerformed: 'Reparación de motor',
        partsUsed: 'Bujías, filtros',
        laborCost: new Decimal(200),
        partsCost: new Decimal(150),
        actualMileage: 10500,
      };

      mockPrisma.maintenance.findUnique.mockResolvedValue(existingMaintenance);
      mockPrisma.maintenance.update.mockResolvedValue({
        ...existingMaintenance,
        status: 'COMPLETED',
        completedDate: new Date(),
        totalCost: new Decimal(350),
        ...completeData,
      });

      const result = await maintenanceService.completeMaintenance('maint-1', completeData);

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.maintenance.update).toHaveBeenCalled();
    });

    it('debe crear próximo mantenimiento preventivo automáticamente', async () => {
      const existingMaintenance = {
        id: 'maint-1',
        vehicleId: 'vehicle-1',
        type: 'PREVENTIVE',
        status: 'IN_PROGRESS',
        createdBy: 'user-1',
        vehicle: { currentMileage: 10000 },
      };

      const completeData = {
        workPerformed: 'Mantenimiento preventivo',
        laborCost: new Decimal(100),
        partsCost: new Decimal(50),
        actualMileage: 10000,
      };

      mockPrisma.maintenance.findUnique.mockResolvedValue(existingMaintenance);
      mockPrisma.maintenance.update.mockResolvedValue({
        ...existingMaintenance,
        status: 'COMPLETED',
        nextMileage: 15000,
        nextDate: new Date(),
      });
      mockPrisma.maintenance.create.mockResolvedValue({});

      await maintenanceService.completeMaintenance('maint-1', completeData);

      expect(mockPrisma.maintenance.create).toHaveBeenCalled();
    });

    it('debe lanzar error si el mantenimiento no existe', async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(null);

      await expect(
        maintenanceService.completeMaintenance('invalid-id', {})
      ).rejects.toThrow('Mantenimiento no encontrado');
    });

    it('debe lanzar error si el mantenimiento ya fue completado', async () => {
      const existingMaintenance = {
        id: 'maint-1',
        status: 'COMPLETED',
      };

      mockPrisma.maintenance.findUnique.mockResolvedValue(existingMaintenance);

      await expect(
        maintenanceService.completeMaintenance('maint-1', {})
      ).rejects.toThrow('Este mantenimiento ya ha sido completado');
    });
  });

  describe('getUpcomingMaintenances', () => {
    it('debe obtener mantenimientos próximos y vencidos', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const mockMaintenances = [
        {
          id: 'maint-1',
          scheduledDate: yesterday,
          status: 'SCHEDULED',
          vehicle: { code: 'VEH-001' },
        },
        {
          id: 'maint-2',
          scheduledDate: tomorrow,
          status: 'SCHEDULED',
          vehicle: { code: 'VEH-002' },
        },
      ];

      mockPrisma.maintenance.findMany.mockResolvedValue(mockMaintenances);

      const result = await maintenanceService.getUpcomingMaintenances(7);

      expect(result.total).toBe(2);
      expect(result.overdue.length).toBeGreaterThan(0);
      expect(result.upcoming.length).toBeGreaterThan(0);
    });

    it('debe usar 7 días por defecto', async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([]);

      await maintenanceService.getUpcomingMaintenances();

      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SCHEDULED',
            scheduledDate: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('getMaintenanceStatistics', () => {
    it('debe obtener estadísticas de mantenimiento', async () => {
      mockPrisma.maintenance.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60) // preventive
        .mockResolvedValueOnce(40) // corrective
        .mockResolvedValueOnce(20) // scheduled
        .mockResolvedValueOnce(10) // in progress
        .mockResolvedValueOnce(70); // completed

      mockPrisma.maintenance.aggregate
        .mockResolvedValueOnce({ _sum: { totalCost: new Decimal(50000) } })
        .mockResolvedValueOnce({ _avg: { totalCost: new Decimal(714.29) } });

      const result = await maintenanceService.getMaintenanceStatistics();

      expect(result.total).toBe(100);
      expect(result.preventive).toBe(60);
      expect(result.corrective).toBe(40);
      expect(result.scheduled).toBe(20);
      expect(result.inProgress).toBe(10);
      expect(result.completed).toBe(70);
    });

    it('debe filtrar estadísticas por vehículo', async () => {
      mockPrisma.maintenance.count.mockResolvedValue(0);
      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: 0 },
        _avg: { totalCost: 0 },
      });

      await maintenanceService.getMaintenanceStatistics({ vehicleId: 'vehicle-1' });

      expect(mockPrisma.maintenance.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vehicleId: 'vehicle-1' }),
        })
      );
    });

    it('debe filtrar estadísticas por rango de fechas', async () => {
      mockPrisma.maintenance.count.mockResolvedValue(0);
      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: 0 },
        _avg: { totalCost: 0 },
      });

      await maintenanceService.getMaintenanceStatistics({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrisma.maintenance.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scheduledDate: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('getVehicleMaintenanceHistory', () => {
    it('debe obtener el historial de mantenimiento de un vehículo', async () => {
      const mockMaintenances = [
        {
          id: 'maint-1',
          vehicleId: 'vehicle-1',
          type: 'PREVENTIVE',
          scheduledDate: new Date('2024-01-15'),
        },
        {
          id: 'maint-2',
          vehicleId: 'vehicle-1',
          type: 'CORRECTIVE',
          scheduledDate: new Date('2024-01-10'),
        },
      ];

      mockPrisma.maintenance.findMany.mockResolvedValue(mockMaintenances);

      const result = await maintenanceService.getVehicleMaintenanceHistory('vehicle-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.maintenance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { vehicleId: 'vehicle-1' },
        })
      );
    });
  });
});
