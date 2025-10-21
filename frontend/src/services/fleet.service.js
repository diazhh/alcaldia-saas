import api from '@/lib/api';

// Vehicles
export const getVehicles = async (params = {}) => {
  const response = await api.get('/fleet/vehicles', { params });
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await api.get(`/fleet/vehicles/${id}`);
  return response.data.data;
};

export const createVehicle = async (data) => {
  const response = await api.post('/fleet/vehicles', data);
  return response.data;
};

export const updateVehicle = async (id, data) => {
  const response = await api.put(`/fleet/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/fleet/vehicles/${id}`);
  return response.data;
};

export const getFleetStatistics = async () => {
  const response = await api.get('/fleet/vehicles/statistics');
  return response.data.data;
};

// Trip Logs
export const getTripLogs = async (params = {}) => {
  const response = await api.get('/fleet/trip-logs', { params });
  return response.data;
};

export const getTripLogById = async (id) => {
  const response = await api.get(`/fleet/trip-logs/${id}`);
  return response.data.data;
};

export const createTripLog = async (data) => {
  const response = await api.post('/fleet/trip-logs', data);
  return response.data;
};

export const updateTripLog = async (id, data) => {
  const response = await api.put(`/fleet/trip-logs/${id}`, data);
  return response.data;
};

export const finalizeTripLog = async (id, data) => {
  const response = await api.patch(`/fleet/trip-logs/${id}/finalize`, data);
  return response.data;
};

export const deleteTripLog = async (id) => {
  const response = await api.delete(`/fleet/trip-logs/${id}`);
  return response.data;
};

export const getTripStatistics = async (params = {}) => {
  const response = await api.get('/fleet/trip-logs/statistics', { params });
  return response.data.data;
};

// Fuel Controls
export const getFuelControls = async (params = {}) => {
  const response = await api.get('/fleet/fuel-controls', { params });
  return response.data;
};

export const getFuelControlById = async (id) => {
  const response = await api.get(`/fleet/fuel-controls/${id}`);
  return response.data.data;
};

export const createFuelControl = async (data) => {
  const response = await api.post('/fleet/fuel-controls', data);
  return response.data;
};

export const updateFuelControl = async (id, data) => {
  const response = await api.put(`/fleet/fuel-controls/${id}`, data);
  return response.data;
};

export const deleteFuelControl = async (id) => {
  const response = await api.delete(`/fleet/fuel-controls/${id}`);
  return response.data;
};

export const getFuelStatistics = async (params = {}) => {
  const response = await api.get('/fleet/fuel-controls/statistics', { params });
  return response.data.data;
};

export const getVehicleFuelEfficiency = async (vehicleId, months = 6) => {
  const response = await api.get(`/fleet/fuel-controls/efficiency/${vehicleId}`, {
    params: { months },
  });
  return response.data.data;
};

// Maintenances
export const getMaintenances = async (params = {}) => {
  const response = await api.get('/fleet/maintenances', { params });
  return response.data;
};

export const getMaintenanceById = async (id) => {
  const response = await api.get(`/fleet/maintenances/${id}`);
  return response.data.data;
};

export const createMaintenance = async (data) => {
  const response = await api.post('/fleet/maintenances', data);
  return response.data;
};

export const updateMaintenance = async (id, data) => {
  const response = await api.put(`/fleet/maintenances/${id}`, data);
  return response.data;
};

export const completeMaintenance = async (id, data) => {
  const response = await api.patch(`/fleet/maintenances/${id}/complete`, data);
  return response.data;
};

export const deleteMaintenance = async (id) => {
  const response = await api.delete(`/fleet/maintenances/${id}`);
  return response.data;
};

export const getUpcomingMaintenances = async (daysAhead = 7) => {
  const response = await api.get('/fleet/maintenances/upcoming', {
    params: { daysAhead },
  });
  return response.data.data;
};

export const getMaintenanceStatistics = async (params = {}) => {
  const response = await api.get('/fleet/maintenances/statistics', { params });
  return response.data.data;
};

// TCO
export const getVehicleTCO = async (vehicleId, params = {}) => {
  const response = await api.get(`/fleet/tco/vehicle/${vehicleId}`, { params });
  return response.data.data;
};

export const getFleetTCO = async (params = {}) => {
  const response = await api.get('/fleet/tco/fleet', { params });
  return response.data.data;
};

export const compareVehiclesTCO = async (vehicleIds, params = {}) => {
  const response = await api.post('/fleet/tco/compare', { vehicleIds, ...params });
  return response.data.data;
};
