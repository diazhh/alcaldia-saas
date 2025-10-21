import api from '@/lib/api';

/**
 * Catastro API Service
 * Handles all API calls related to cadastral management
 */

// ==================== PROPERTIES ====================

/**
 * Get all properties with pagination and filters
 */
export const getProperties = async (params = {}) => {
  const response = await api.get('/api/catastro/properties', { params });
  return response.data;
};

/**
 * Get property by ID
 */
export const getPropertyById = async (id) => {
  const response = await api.get(`/api/catastro/properties/${id}`);
  return response.data;
};

/**
 * Get property by cadastral code
 */
export const getPropertyByCadastralCode = async (code) => {
  const response = await api.get(`/api/catastro/properties/cadastral/${code}`);
  return response.data;
};

/**
 * Create new property
 */
export const createProperty = async (data) => {
  const response = await api.post('/api/catastro/properties', data);
  return response.data;
};

/**
 * Update property
 */
export const updateProperty = async (id, data) => {
  const response = await api.put(`/api/catastro/properties/${id}`, data);
  return response.data;
};

/**
 * Delete property
 */
export const deleteProperty = async (id) => {
  const response = await api.delete(`/api/catastro/properties/${id}`);
  return response.data;
};

/**
 * Search properties by location
 */
export const searchPropertiesByLocation = async (params) => {
  const response = await api.get('/api/catastro/properties/search/location', { params });
  return response.data;
};

/**
 * Get property statistics
 */
export const getPropertyStats = async () => {
  const response = await api.get('/api/catastro/properties/stats');
  return response.data;
};

// ==================== PROPERTY OWNERS ====================

/**
 * Get property owners
 */
export const getPropertyOwners = async (propertyId) => {
  const response = await api.get(`/api/catastro/properties/${propertyId}/owners`);
  return response.data;
};

/**
 * Get current owner
 */
export const getCurrentOwner = async (propertyId) => {
  const response = await api.get(`/api/catastro/properties/${propertyId}/owners/current`);
  return response.data;
};

/**
 * Create property owner
 */
export const createPropertyOwner = async (propertyId, data) => {
  const response = await api.post(`/api/catastro/properties/${propertyId}/owners`, data);
  return response.data;
};

/**
 * Get properties by owner
 */
export const getPropertiesByOwner = async (taxpayerId) => {
  const response = await api.get(`/api/catastro/property-owners/taxpayer/${taxpayerId}`);
  return response.data;
};

// ==================== URBAN VARIABLES ====================

/**
 * Get all urban variables
 */
export const getUrbanVariables = async (params = {}) => {
  const response = await api.get('/api/catastro/urban-variables', { params });
  return response.data;
};

/**
 * Get urban variable by ID
 */
export const getUrbanVariableById = async (id) => {
  const response = await api.get(`/api/catastro/urban-variables/${id}`);
  return response.data;
};

/**
 * Get urban variable by zone code
 */
export const getUrbanVariableByZoneCode = async (code) => {
  const response = await api.get(`/api/catastro/urban-variables/zone/${code}`);
  return response.data;
};

/**
 * Create urban variable
 */
export const createUrbanVariable = async (data) => {
  const response = await api.post('/api/catastro/urban-variables', data);
  return response.data;
};

/**
 * Update urban variable
 */
export const updateUrbanVariable = async (id, data) => {
  const response = await api.put(`/api/catastro/urban-variables/${id}`, data);
  return response.data;
};

/**
 * Delete urban variable
 */
export const deleteUrbanVariable = async (id) => {
  const response = await api.delete(`/api/catastro/urban-variables/${id}`);
  return response.data;
};

/**
 * Check compliance with urban variables
 */
export const checkCompliance = async (zoneCode, data) => {
  const response = await api.post(`/api/catastro/urban-variables/zone/${zoneCode}/check-compliance`, data);
  return response.data;
};

/**
 * Get zone statistics
 */
export const getZoneStats = async () => {
  const response = await api.get('/api/catastro/urban-variables/stats');
  return response.data;
};

// ==================== CONSTRUCTION PERMITS ====================

/**
 * Get all construction permits
 */
export const getConstructionPermits = async (params = {}) => {
  const response = await api.get('/api/catastro/construction-permits', { params });
  return response.data;
};

/**
 * Get permit by ID
 */
export const getPermitById = async (id) => {
  const response = await api.get(`/api/catastro/construction-permits/${id}`);
  return response.data;
};

/**
 * Get permit by number
 */
export const getPermitByNumber = async (number) => {
  const response = await api.get(`/api/catastro/construction-permits/number/${number}`);
  return response.data;
};

/**
 * Create construction permit
 */
export const createConstructionPermit = async (data) => {
  const response = await api.post('/api/catastro/construction-permits', data);
  return response.data;
};

/**
 * Update construction permit
 */
export const updateConstructionPermit = async (id, data) => {
  const response = await api.put(`/api/catastro/construction-permits/${id}`, data);
  return response.data;
};

/**
 * Review permit (technical review)
 */
export const reviewPermit = async (id, data) => {
  const response = await api.post(`/api/catastro/construction-permits/${id}/review`, data);
  return response.data;
};

/**
 * Approve or reject permit
 */
export const approveOrRejectPermit = async (id, data) => {
  const response = await api.post(`/api/catastro/construction-permits/${id}/approve-reject`, data);
  return response.data;
};

/**
 * Register payment
 */
export const registerPayment = async (id, data) => {
  const response = await api.post(`/api/catastro/construction-permits/${id}/payment`, data);
  return response.data;
};

/**
 * Start construction
 */
export const startConstruction = async (id) => {
  const response = await api.post(`/api/catastro/construction-permits/${id}/start`);
  return response.data;
};

/**
 * Complete construction
 */
export const completeConstruction = async (id) => {
  const response = await api.post(`/api/catastro/construction-permits/${id}/complete`);
  return response.data;
};

/**
 * Cancel permit
 */
export const cancelPermit = async (id, reason) => {
  const response = await api.post(`/api/catastro/construction-permits/${id}/cancel`, { reason });
  return response.data;
};

/**
 * Get permit statistics
 */
export const getPermitStats = async () => {
  const response = await api.get('/api/catastro/construction-permits/stats');
  return response.data;
};

// ==================== PERMIT INSPECTIONS ====================

/**
 * Get inspections by permit
 */
export const getInspectionsByPermit = async (permitId) => {
  const response = await api.get(`/api/catastro/construction-permits/${permitId}/inspections`);
  return response.data;
};

/**
 * Create inspection
 */
export const createInspection = async (permitId, data) => {
  const response = await api.post(`/api/catastro/construction-permits/${permitId}/inspections`, data);
  return response.data;
};

/**
 * Update inspection
 */
export const updateInspection = async (permitId, inspectionId, data) => {
  const response = await api.put(`/api/catastro/construction-permits/${permitId}/inspections/${inspectionId}`, data);
  return response.data;
};

// ==================== URBAN INSPECTIONS ====================

/**
 * Get all urban inspections
 */
export const getUrbanInspections = async (params = {}) => {
  const response = await api.get('/api/catastro/urban-inspections', { params });
  return response.data;
};

/**
 * Get urban inspection by ID
 */
export const getUrbanInspectionById = async (id) => {
  const response = await api.get(`/api/catastro/urban-inspections/${id}`);
  return response.data;
};

/**
 * Create urban inspection
 */
export const createUrbanInspection = async (data) => {
  const response = await api.post('/api/catastro/urban-inspections', data);
  return response.data;
};

/**
 * Update urban inspection
 */
export const updateUrbanInspection = async (id, data) => {
  const response = await api.put(`/api/catastro/urban-inspections/${id}`, data);
  return response.data;
};

/**
 * Register notification
 */
export const registerNotification = async (id, data) => {
  const response = await api.post(`/api/catastro/urban-inspections/${id}/notification`, data);
  return response.data;
};

/**
 * Register sanction
 */
export const registerSanction = async (id, data) => {
  const response = await api.post(`/api/catastro/urban-inspections/${id}/sanction`, data);
  return response.data;
};

/**
 * Resolve inspection
 */
export const resolveInspection = async (id, data) => {
  const response = await api.post(`/api/catastro/urban-inspections/${id}/resolve`, data);
  return response.data;
};

/**
 * Get inspections by property
 */
export const getInspectionsByProperty = async (propertyId) => {
  const response = await api.get(`/api/catastro/urban-inspections/property/${propertyId}`);
  return response.data;
};

/**
 * Get urban inspection statistics
 */
export const getUrbanInspectionStats = async () => {
  const response = await api.get('/api/catastro/urban-inspections/stats');
  return response.data;
};

export default {
  // Properties
  getProperties,
  getPropertyById,
  getPropertyByCadastralCode,
  createProperty,
  updateProperty,
  deleteProperty,
  searchPropertiesByLocation,
  getPropertyStats,
  
  // Property Owners
  getPropertyOwners,
  getCurrentOwner,
  createPropertyOwner,
  getPropertiesByOwner,
  
  // Urban Variables
  getUrbanVariables,
  getUrbanVariableById,
  getUrbanVariableByZoneCode,
  createUrbanVariable,
  updateUrbanVariable,
  deleteUrbanVariable,
  checkCompliance,
  getZoneStats,
  
  // Construction Permits
  getConstructionPermits,
  getPermitById,
  getPermitByNumber,
  createConstructionPermit,
  updateConstructionPermit,
  reviewPermit,
  approveOrRejectPermit,
  registerPayment,
  startConstruction,
  completeConstruction,
  cancelPermit,
  getPermitStats,
  
  // Permit Inspections
  getInspectionsByPermit,
  createInspection,
  updateInspection,
  
  // Urban Inspections
  getUrbanInspections,
  getUrbanInspectionById,
  createUrbanInspection,
  updateUrbanInspection,
  registerNotification,
  registerSanction,
  resolveInspection,
  getInspectionsByProperty,
  getUrbanInspectionStats,
};
