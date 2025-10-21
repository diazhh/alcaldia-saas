import api from '@/services/api';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getTripLogs,
  createTripLog,
  finalizeTripLog,
  getFuelControls,
  createFuelControl,
  getMaintenances,
  createMaintenance,
  completeMaintenance,
  getVehicleTCO,
  getFleetStatistics,
} from '@/services/fleet.service';

// Mock the api module
jest.mock('@/services/api');

describe('Fleet Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Vehicle Operations', () => {
    it('fetches vehicles list', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', plate: 'ABC123' }],
          pagination: { total: 1 },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getVehicles({ page: 1, limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/fleet/vehicles', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches vehicle by id', async () => {
      const mockResponse = {
        data: { data: { id: '1', plate: 'ABC123' } },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getVehicleById('1');

      expect(api.get).toHaveBeenCalledWith('/fleet/vehicles/1');
      expect(result).toEqual(mockResponse.data.data);
    });

    it('creates a new vehicle', async () => {
      const vehicleData = { plate: 'ABC123', brand: 'Toyota', model: 'Corolla' };
      const mockResponse = { data: { data: { id: '1', ...vehicleData } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await createVehicle(vehicleData);

      expect(api.post).toHaveBeenCalledWith('/fleet/vehicles', vehicleData);
      expect(result).toEqual(mockResponse.data);
    });

    it('updates a vehicle', async () => {
      const vehicleData = { plate: 'ABC123' };
      const mockResponse = { data: { data: { id: '1', ...vehicleData } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await updateVehicle('1', vehicleData);

      expect(api.put).toHaveBeenCalledWith('/fleet/vehicles/1', vehicleData);
      expect(result).toEqual(mockResponse.data);
    });

    it('deletes a vehicle', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValue(mockResponse);

      const result = await deleteVehicle('1');

      expect(api.delete).toHaveBeenCalledWith('/fleet/vehicles/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Trip Log Operations', () => {
    it('fetches trip logs', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', vehicleId: '1' }],
          pagination: { total: 1 },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getTripLogs({ page: 1 });

      expect(api.get).toHaveBeenCalledWith('/fleet/trip-logs', {
        params: { page: 1 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('creates a trip log', async () => {
      const tripData = { vehicleId: '1', startKm: 10000 };
      const mockResponse = { data: { data: { id: '1', ...tripData } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await createTripLog(tripData);

      expect(api.post).toHaveBeenCalledWith('/fleet/trip-logs', tripData);
      expect(result).toEqual(mockResponse.data);
    });

    it('finalizes a trip log', async () => {
      const finalizeData = { endKm: 10500 };
      const mockResponse = { data: { data: { id: '1', status: 'COMPLETED' } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await finalizeTripLog('1', finalizeData);

      expect(api.put).toHaveBeenCalledWith('/fleet/trip-logs/1/finalize', finalizeData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Fuel Control Operations', () => {
    it('fetches fuel controls', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', liters: 50 }],
          pagination: { total: 1 },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getFuelControls();

      expect(api.get).toHaveBeenCalledWith('/fleet/fuel-controls', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('creates a fuel control', async () => {
      const fuelData = { vehicleId: '1', liters: 50 };
      const mockResponse = { data: { data: { id: '1', ...fuelData } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await createFuelControl(fuelData);

      expect(api.post).toHaveBeenCalledWith('/fleet/fuel-controls', fuelData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Maintenance Operations', () => {
    it('fetches maintenances', async () => {
      const mockResponse = {
        data: {
          data: [{ id: '1', type: 'PREVENTIVE' }],
          pagination: { total: 1 },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getMaintenances();

      expect(api.get).toHaveBeenCalledWith('/fleet/maintenances', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('creates a maintenance', async () => {
      const maintenanceData = { vehicleId: '1', type: 'PREVENTIVE' };
      const mockResponse = { data: { data: { id: '1', ...maintenanceData } } };
      api.post.mockResolvedValue(mockResponse);

      const result = await createMaintenance(maintenanceData);

      expect(api.post).toHaveBeenCalledWith('/fleet/maintenances', maintenanceData);
      expect(result).toEqual(mockResponse.data);
    });

    it('completes a maintenance', async () => {
      const completeData = { actualCost: 5000 };
      const mockResponse = { data: { data: { id: '1', status: 'COMPLETED' } } };
      api.put.mockResolvedValue(mockResponse);

      const result = await completeMaintenance('1', completeData);

      expect(api.put).toHaveBeenCalledWith('/fleet/maintenances/1/complete', completeData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Statistics and TCO', () => {
    it('fetches fleet statistics', async () => {
      const mockResponse = {
        data: {
          data: {
            total: 10,
            operational: 8,
            inMaintenance: 2,
          },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getFleetStatistics();

      expect(api.get).toHaveBeenCalledWith('/fleet/statistics');
      expect(result).toEqual(mockResponse.data.data);
    });

    it('fetches vehicle TCO', async () => {
      const mockResponse = {
        data: {
          data: {
            totalCost: 50000,
            costPerKm: 5.5,
          },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await getVehicleTCO('1', { period: 'year' });

      expect(api.get).toHaveBeenCalledWith('/fleet/tco/vehicle/1', {
        params: { period: 'year' },
      });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('Error Handling', () => {
    it('handles API errors for getVehicles', async () => {
      const error = new Error('Network error');
      api.get.mockRejectedValue(error);

      await expect(getVehicles()).rejects.toThrow('Network error');
    });

    it('handles API errors for createVehicle', async () => {
      const error = new Error('Validation error');
      api.post.mockRejectedValue(error);

      await expect(createVehicle({})).rejects.toThrow('Validation error');
    });
  });
});
