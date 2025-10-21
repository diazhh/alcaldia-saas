/**
 * Tests unitarios para el servicio de cálculo de TCO
 */

import { jest } from '@jest/globals';
import { Decimal } from '@prisma/client/runtime/library';

// Mock de Prisma
const mockPrisma = {
  fleetVehicle: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  fuelControl: {
    aggregate: jest.fn(),
  },
  maintenance: {
    aggregate: jest.fn(),
  },
  fleetInsurance: {
    aggregate: jest.fn(),
  },
  tire: {
    aggregate: jest.fn(),
  },
  tripLog: {
    findMany: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const tcoService = await import(
  '../../../src/modules/fleet/services/tco.service.js'
);

describe('TCO Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateVehicleTCO', () => {
    it('debe calcular el TCO de un vehículo correctamente', async () => {
      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2020,
        acquisitionValue: new Decimal(50000),
        currentValue: new Decimal(40000),
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.fuelControl.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(5000) },
      });
      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: new Decimal(2000) },
      });
      mockPrisma.fleetInsurance.aggregate.mockResolvedValue({
        _sum: { premium: new Decimal(1500) },
      });
      mockPrisma.tire.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(800) },
      });
      mockPrisma.tripLog.findMany.mockResolvedValue([
        { distance: 5000 },
        { distance: 3000 },
        { distance: 2000 },
      ]);

      const result = await tcoService.calculateVehicleTCO('vehicle-1');

      expect(result.vehicleId).toBe('vehicle-1');
      expect(result.vehicle.code).toBe('VEH-001');
      expect(result.costs.fuel).toBe(5000);
      expect(result.costs.maintenance).toBe(2000);
      expect(result.costs.insurance).toBe(1500);
      expect(result.costs.tires).toBe(800);
      expect(result.usage.totalDistance).toBe(10000);
      expect(result.usage.costPerKm).toBeGreaterThan(0);
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(
        tcoService.calculateVehicleTCO('invalid-vehicle')
      ).rejects.toThrow('Vehículo no encontrado');
    });

    it('debe calcular correctamente con costos en cero', async () => {
      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2023,
        acquisitionValue: new Decimal(50000),
        currentValue: new Decimal(50000),
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.fuelControl.aggregate.mockResolvedValue({
        _sum: { cost: null },
      });
      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: null },
      });
      mockPrisma.fleetInsurance.aggregate.mockResolvedValue({
        _sum: { premium: null },
      });
      mockPrisma.tire.aggregate.mockResolvedValue({
        _sum: { cost: null },
      });
      mockPrisma.tripLog.findMany.mockResolvedValue([]);

      const result = await tcoService.calculateVehicleTCO('vehicle-1');

      expect(result.costs.fuel).toBe(0);
      expect(result.costs.maintenance).toBe(0);
      expect(result.costs.insurance).toBe(0);
      expect(result.costs.tires).toBe(0);
      expect(result.usage.totalDistance).toBe(0);
      expect(result.usage.costPerKm).toBe(0);
    });

    it('debe calcular el porcentaje de cada costo correctamente', async () => {
      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2020,
        acquisitionValue: new Decimal(50000),
        currentValue: new Decimal(40000),
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.fuelControl.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(5000) },
      });
      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: new Decimal(2000) },
      });
      mockPrisma.fleetInsurance.aggregate.mockResolvedValue({
        _sum: { premium: new Decimal(1000) },
      });
      mockPrisma.tire.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(500) },
      });
      mockPrisma.tripLog.findMany.mockResolvedValue([{ distance: 10000 }]);

      const result = await tcoService.calculateVehicleTCO('vehicle-1');

      expect(result.breakdown.fuelPercentage).toBeGreaterThan(0);
      expect(result.breakdown.maintenancePercentage).toBeGreaterThan(0);
      expect(result.breakdown.insurancePercentage).toBeGreaterThan(0);
      expect(result.breakdown.tiresPercentage).toBeGreaterThan(0);
      expect(result.breakdown.depreciationPercentage).toBeGreaterThan(0);

      // La suma de porcentajes debe ser aproximadamente 100%
      const totalPercentage =
        result.breakdown.fuelPercentage +
        result.breakdown.maintenancePercentage +
        result.breakdown.insurancePercentage +
        result.breakdown.tiresPercentage +
        result.breakdown.depreciationPercentage;

      expect(totalPercentage).toBeCloseTo(100, 0);
    });

    it('debe usar rango de fechas personalizado', async () => {
      const mockVehicle = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2020,
        acquisitionValue: new Decimal(50000),
        currentValue: new Decimal(40000),
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.fuelControl.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(1000) },
      });
      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: new Decimal(500) },
      });
      mockPrisma.fleetInsurance.aggregate.mockResolvedValue({
        _sum: { premium: new Decimal(300) },
      });
      mockPrisma.tire.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(200) },
      });
      mockPrisma.tripLog.findMany.mockResolvedValue([{ distance: 2000 }]);

      const result = await tcoService.calculateVehicleTCO('vehicle-1', {
        startDate: '2024-01-01',
        endDate: '2024-06-30',
      });

      expect(result.period.startDate).toEqual(new Date('2024-01-01'));
      expect(result.period.endDate).toEqual(new Date('2024-06-30'));
    });
  });

  describe('calculateFleetTCO', () => {
    it('debe calcular el TCO de toda la flota', async () => {
      const mockVehicles = [
        {
          id: 'vehicle-1',
          code: 'VEH-001',
          plate: 'ABC-123',
          brand: 'Toyota',
          model: 'Hilux',
          year: 2020,
          acquisitionValue: new Decimal(50000),
          currentValue: new Decimal(40000),
        },
        {
          id: 'vehicle-2',
          code: 'VEH-002',
          plate: 'XYZ-789',
          brand: 'Ford',
          model: 'Ranger',
          year: 2021,
          acquisitionValue: new Decimal(55000),
          currentValue: new Decimal(45000),
        },
      ];

      mockPrisma.fleetVehicle.findMany.mockResolvedValue(mockVehicles);
      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(mockVehicles[0])
        .mockResolvedValueOnce(mockVehicles[1]);

      // Mock para vehicle-1
      mockPrisma.fuelControl.aggregate
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(3000) } })
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(3500) } });

      mockPrisma.maintenance.aggregate
        .mockResolvedValueOnce({ _sum: { totalCost: new Decimal(1000) } })
        .mockResolvedValueOnce({ _sum: { totalCost: new Decimal(1200) } });

      mockPrisma.fleetInsurance.aggregate
        .mockResolvedValueOnce({ _sum: { premium: new Decimal(800) } })
        .mockResolvedValueOnce({ _sum: { premium: new Decimal(900) } });

      mockPrisma.tire.aggregate
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(400) } })
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(450) } });

      mockPrisma.tripLog.findMany
        .mockResolvedValueOnce([{ distance: 5000 }])
        .mockResolvedValueOnce([{ distance: 6000 }]);

      const result = await tcoService.calculateFleetTCO();

      expect(result.fleet.totalVehicles).toBe(2);
      expect(result.fleet.totalDistance).toBe(11000);
      expect(result.costs.total).toBeGreaterThan(0);
      expect(result.averageCostPerKm).toBeGreaterThan(0);
      expect(result.rankedVehicles).toHaveLength(2);
    });

    it('debe filtrar vehículos por tipo', async () => {
      mockPrisma.fleetVehicle.findMany.mockResolvedValue([]);

      await tcoService.calculateFleetTCO({ type: 'PICKUP' });

      expect(mockPrisma.fleetVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'PICKUP' }),
        })
      );
    });

    it('debe filtrar vehículos por estado', async () => {
      mockPrisma.fleetVehicle.findMany.mockResolvedValue([]);

      await tcoService.calculateFleetTCO({ status: 'OPERATIONAL' });

      expect(mockPrisma.fleetVehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'OPERATIONAL' }),
        })
      );
    });

    it('debe ordenar vehículos por costo total descendente', async () => {
      const mockVehicles = [
        {
          id: 'vehicle-1',
          code: 'VEH-001',
          plate: 'ABC-123',
          brand: 'Toyota',
          model: 'Hilux',
          year: 2020,
          acquisitionValue: new Decimal(50000),
          currentValue: new Decimal(40000),
        },
        {
          id: 'vehicle-2',
          code: 'VEH-002',
          plate: 'XYZ-789',
          brand: 'Ford',
          model: 'Ranger',
          year: 2021,
          acquisitionValue: new Decimal(55000),
          currentValue: new Decimal(45000),
        },
      ];

      mockPrisma.fleetVehicle.findMany.mockResolvedValue(mockVehicles);
      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(mockVehicles[0])
        .mockResolvedValueOnce(mockVehicles[1]);

      // Vehicle-1 con costos más bajos
      mockPrisma.fuelControl.aggregate
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(1000) } })
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(5000) } });

      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: new Decimal(500) },
      });
      mockPrisma.fleetInsurance.aggregate.mockResolvedValue({
        _sum: { premium: new Decimal(500) },
      });
      mockPrisma.tire.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(200) },
      });
      mockPrisma.tripLog.findMany.mockResolvedValue([{ distance: 5000 }]);

      const result = await tcoService.calculateFleetTCO();

      // El vehículo con mayor costo debe estar primero
      expect(result.rankedVehicles[0].rank).toBe(1);
      expect(result.rankedVehicles[0].totalCost).toBeGreaterThan(
        result.rankedVehicles[1].totalCost
      );
    });
  });

  describe('compareVehicleTCO', () => {
    it('debe comparar el TCO de múltiples vehículos', async () => {
      const mockVehicle1 = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2020,
        acquisitionValue: new Decimal(50000),
        currentValue: new Decimal(40000),
      };

      const mockVehicle2 = {
        id: 'vehicle-2',
        code: 'VEH-002',
        plate: 'XYZ-789',
        brand: 'Ford',
        model: 'Ranger',
        year: 2021,
        acquisitionValue: new Decimal(55000),
        currentValue: new Decimal(45000),
      };

      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(mockVehicle1)
        .mockResolvedValueOnce(mockVehicle2);

      mockPrisma.fuelControl.aggregate
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(2000) } })
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(3000) } });

      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: new Decimal(1000) },
      });
      mockPrisma.fleetInsurance.aggregate.mockResolvedValue({
        _sum: { premium: new Decimal(800) },
      });
      mockPrisma.tire.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(400) },
      });
      mockPrisma.tripLog.findMany.mockResolvedValue([{ distance: 5000 }]);

      const result = await tcoService.compareVehicleTCO(['vehicle-1', 'vehicle-2']);

      expect(result).toHaveLength(2);
      expect(result[0].vehicleId).toBeDefined();
      expect(result[0].costs.total).toBeGreaterThanOrEqual(result[1].costs.total);
    });

    it('debe ordenar los vehículos por costo total descendente', async () => {
      const mockVehicle1 = {
        id: 'vehicle-1',
        code: 'VEH-001',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2020,
        acquisitionValue: new Decimal(50000),
        currentValue: new Decimal(40000),
      };

      const mockVehicle2 = {
        id: 'vehicle-2',
        code: 'VEH-002',
        plate: 'XYZ-789',
        brand: 'Ford',
        model: 'Ranger',
        year: 2021,
        acquisitionValue: new Decimal(55000),
        currentValue: new Decimal(45000),
      };

      mockPrisma.fleetVehicle.findUnique
        .mockResolvedValueOnce(mockVehicle1)
        .mockResolvedValueOnce(mockVehicle2);

      // Vehicle-1 con costos más bajos
      mockPrisma.fuelControl.aggregate
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(1000) } })
        .mockResolvedValueOnce({ _sum: { cost: new Decimal(5000) } });

      mockPrisma.maintenance.aggregate.mockResolvedValue({
        _sum: { totalCost: new Decimal(500) },
      });
      mockPrisma.fleetInsurance.aggregate.mockResolvedValue({
        _sum: { premium: new Decimal(500) },
      });
      mockPrisma.tire.aggregate.mockResolvedValue({
        _sum: { cost: new Decimal(200) },
      });
      mockPrisma.tripLog.findMany.mockResolvedValue([{ distance: 5000 }]);

      const result = await tcoService.compareVehicleTCO(['vehicle-1', 'vehicle-2']);

      // El primer vehículo debe tener mayor costo que el segundo
      expect(result[0].costs.total).toBeGreaterThan(result[1].costs.total);
    });
  });
});
