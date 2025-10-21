/**
 * Tests unitarios para el servicio de bitácora de viajes
 */

import { jest } from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
  tripLog: {
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
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const tripLogService = await import(
  '../../../src/modules/fleet/services/tripLog.service.js'
);

describe('TripLog Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTripLogs', () => {
    it('debe obtener todos los registros de viaje con paginación', async () => {
      const mockTripLogs = [
        {
          id: 'trip-1',
          vehicleId: 'vehicle-1',
          driverName: 'Juan Pérez',
          destination: 'Centro',
          departureDate: new Date('2024-01-15'),
          vehicle: {
            id: 'vehicle-1',
            code: 'VEH-001',
            plate: 'ABC-123',
          },
        },
      ];

      mockPrisma.tripLog.findMany.mockResolvedValue(mockTripLogs);
      mockPrisma.tripLog.count.mockResolvedValue(1);

      const result = await tripLogService.getAllTripLogs({}, 1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('debe filtrar viajes por vehículo', async () => {
      mockPrisma.tripLog.findMany.mockResolvedValue([]);
      mockPrisma.tripLog.count.mockResolvedValue(0);

      await tripLogService.getAllTripLogs({ vehicleId: 'vehicle-1' });

      expect(mockPrisma.tripLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vehicleId: 'vehicle-1' }),
        })
      );
    });

    it('debe filtrar viajes por conductor', async () => {
      mockPrisma.tripLog.findMany.mockResolvedValue([]);
      mockPrisma.tripLog.count.mockResolvedValue(0);

      await tripLogService.getAllTripLogs({ driverName: 'Juan' });

      expect(mockPrisma.tripLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            driverName: expect.objectContaining({ contains: 'Juan' }),
          }),
        })
      );
    });

    it('debe filtrar viajes por rango de fechas', async () => {
      mockPrisma.tripLog.findMany.mockResolvedValue([]);
      mockPrisma.tripLog.count.mockResolvedValue(0);

      await tripLogService.getAllTripLogs({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrisma.tripLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departureDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });
  });

  describe('getTripLogById', () => {
    it('debe obtener un registro de viaje por ID', async () => {
      const mockTripLog = {
        id: 'trip-1',
        vehicleId: 'vehicle-1',
        driverName: 'Juan Pérez',
        vehicle: { code: 'VEH-001' },
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(mockTripLog);

      const result = await tripLogService.getTripLogById('trip-1');

      expect(result).toEqual(mockTripLog);
      expect(mockPrisma.tripLog.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'trip-1' },
        })
      );
    });

    it('debe lanzar error si el viaje no existe', async () => {
      mockPrisma.tripLog.findUnique.mockResolvedValue(null);

      await expect(tripLogService.getTripLogById('invalid-id')).rejects.toThrow(
        'Registro de viaje no encontrado'
      );
    });
  });

  describe('createTripLog', () => {
    it('debe crear un nuevo registro de viaje', async () => {
      const newTripLog = {
        vehicleId: 'vehicle-1',
        driverName: 'Juan Pérez',
        destination: 'Centro',
        purpose: 'Reunión',
        departureDate: '2024-01-15',
        startMileage: 10000,
      };

      const mockVehicle = {
        id: 'vehicle-1',
        currentMileage: 10000,
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);
      mockPrisma.tripLog.create.mockResolvedValue({
        id: 'trip-1',
        ...newTripLog,
        departureDate: new Date(newTripLog.departureDate),
        vehicle: mockVehicle,
      });

      const result = await tripLogService.createTripLog(newTripLog);

      expect(result.id).toBe('trip-1');
      expect(mockPrisma.tripLog.create).toHaveBeenCalled();
    });

    it('debe lanzar error si el vehículo no existe', async () => {
      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(null);

      await expect(
        tripLogService.createTripLog({
          vehicleId: 'invalid-vehicle',
          startMileage: 10000,
        })
      ).rejects.toThrow('Vehículo no encontrado');
    });

    it('debe lanzar error si el kilometraje inicial es menor al actual del vehículo', async () => {
      const mockVehicle = {
        id: 'vehicle-1',
        currentMileage: 10000,
      };

      mockPrisma.fleetVehicle.findUnique.mockResolvedValue(mockVehicle);

      await expect(
        tripLogService.createTripLog({
          vehicleId: 'vehicle-1',
          startMileage: 5000,
        })
      ).rejects.toThrow(
        'El kilometraje inicial no puede ser menor al kilometraje actual del vehículo'
      );
    });
  });

  describe('updateTripLog', () => {
    it('debe actualizar un registro de viaje', async () => {
      const existingTripLog = {
        id: 'trip-1',
        vehicleId: 'vehicle-1',
        startMileage: 10000,
        distance: null,
        vehicle: { currentMileage: 10000 },
      };

      const updateData = {
        destination: 'Nueva ubicación',
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);
      mockPrisma.tripLog.update.mockResolvedValue({
        ...existingTripLog,
        ...updateData,
      });

      const result = await tripLogService.updateTripLog('trip-1', updateData);

      expect(result.destination).toBe('Nueva ubicación');
    });

    it('debe calcular la distancia al actualizar el kilometraje final', async () => {
      const existingTripLog = {
        id: 'trip-1',
        vehicleId: 'vehicle-1',
        startMileage: 10000,
        distance: null,
        vehicle: { currentMileage: 10000 },
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);
      mockPrisma.fleetVehicle.update.mockResolvedValue({});
      mockPrisma.tripLog.update.mockResolvedValue({
        ...existingTripLog,
        endMileage: 10500,
        distance: 500,
      });

      const result = await tripLogService.updateTripLog('trip-1', {
        endMileage: 10500,
      });

      expect(mockPrisma.fleetVehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { currentMileage: 10500 },
        })
      );
    });

    it('debe lanzar error si el kilometraje final es menor al inicial', async () => {
      const existingTripLog = {
        id: 'trip-1',
        startMileage: 10000,
        vehicle: { currentMileage: 10000 },
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);

      await expect(
        tripLogService.updateTripLog('trip-1', { endMileage: 9000 })
      ).rejects.toThrow('El kilometraje final no puede ser menor al inicial');
    });

    it('debe lanzar error si el viaje no existe', async () => {
      mockPrisma.tripLog.findUnique.mockResolvedValue(null);

      await expect(
        tripLogService.updateTripLog('invalid-id', {})
      ).rejects.toThrow('Registro de viaje no encontrado');
    });
  });

  describe('deleteTripLog', () => {
    it('debe eliminar un registro de viaje', async () => {
      const existingTripLog = {
        id: 'trip-1',
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);
      mockPrisma.tripLog.delete.mockResolvedValue(existingTripLog);

      const result = await tripLogService.deleteTripLog('trip-1');

      expect(result.message).toBe('Registro de viaje eliminado exitosamente');
      expect(mockPrisma.tripLog.delete).toHaveBeenCalledWith({
        where: { id: 'trip-1' },
      });
    });

    it('debe lanzar error si el viaje no existe', async () => {
      mockPrisma.tripLog.findUnique.mockResolvedValue(null);

      await expect(tripLogService.deleteTripLog('invalid-id')).rejects.toThrow(
        'Registro de viaje no encontrado'
      );
    });
  });

  describe('finalizeTripLog', () => {
    it('debe finalizar un viaje correctamente', async () => {
      const existingTripLog = {
        id: 'trip-1',
        vehicleId: 'vehicle-1',
        startMileage: 10000,
        returnDate: null,
        vehicle: { currentMileage: 10000 },
      };

      const finalizeData = {
        endMileage: 10500,
        returnDate: '2024-01-15',
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);
      mockPrisma.$transaction.mockResolvedValue([
        {
          ...existingTripLog,
          endMileage: 10500,
          distance: 500,
          returnDate: new Date(finalizeData.returnDate),
        },
      ]);

      const result = await tripLogService.finalizeTripLog('trip-1', finalizeData);

      expect(result.endMileage).toBe(10500);
      expect(result.distance).toBe(500);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('debe lanzar error si el viaje no existe', async () => {
      mockPrisma.tripLog.findUnique.mockResolvedValue(null);

      await expect(
        tripLogService.finalizeTripLog('invalid-id', { endMileage: 10500 })
      ).rejects.toThrow('Registro de viaje no encontrado');
    });

    it('debe lanzar error si el viaje ya fue finalizado', async () => {
      const existingTripLog = {
        id: 'trip-1',
        returnDate: new Date(),
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);

      await expect(
        tripLogService.finalizeTripLog('trip-1', { endMileage: 10500 })
      ).rejects.toThrow('Este viaje ya ha sido finalizado');
    });

    it('debe lanzar error si no se proporciona kilometraje final', async () => {
      const existingTripLog = {
        id: 'trip-1',
        returnDate: null,
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);

      await expect(tripLogService.finalizeTripLog('trip-1', {})).rejects.toThrow(
        'El kilometraje final es requerido'
      );
    });

    it('debe lanzar error si el kilometraje final es menor al inicial', async () => {
      const existingTripLog = {
        id: 'trip-1',
        startMileage: 10000,
        returnDate: null,
      };

      mockPrisma.tripLog.findUnique.mockResolvedValue(existingTripLog);

      await expect(
        tripLogService.finalizeTripLog('trip-1', { endMileage: 9000 })
      ).rejects.toThrow('El kilometraje final no puede ser menor al inicial');
    });
  });

  describe('getTripStatistics', () => {
    it('debe obtener estadísticas de viajes', async () => {
      mockPrisma.tripLog.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // completed
        .mockResolvedValueOnce(20); // in progress

      mockPrisma.tripLog.aggregate.mockResolvedValue({
        _sum: { distance: 50000 },
      });

      const result = await tripLogService.getTripStatistics();

      expect(result.total).toBe(100);
      expect(result.completed).toBe(80);
      expect(result.inProgress).toBe(20);
      expect(result.totalDistance).toBe(50000);
    });

    it('debe filtrar estadísticas por vehículo', async () => {
      mockPrisma.tripLog.count.mockResolvedValue(0);
      mockPrisma.tripLog.aggregate.mockResolvedValue({ _sum: { distance: 0 } });

      await tripLogService.getTripStatistics({ vehicleId: 'vehicle-1' });

      expect(mockPrisma.tripLog.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ vehicleId: 'vehicle-1' }),
        })
      );
    });

    it('debe filtrar estadísticas por rango de fechas', async () => {
      mockPrisma.tripLog.count.mockResolvedValue(0);
      mockPrisma.tripLog.aggregate.mockResolvedValue({ _sum: { distance: 0 } });

      await tripLogService.getTripStatistics({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrisma.tripLog.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departureDate: expect.any(Object),
          }),
        })
      );
    });
  });
});
