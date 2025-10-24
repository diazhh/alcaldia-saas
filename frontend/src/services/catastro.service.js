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
  const response = await api.get('/catastro/properties', { params });
  const data = response.data.data || response.data;
  // Backend devuelve { properties: [], pagination: {} }
  return data.properties || data;
};

/**
 * Get property by ID
 */
export const getPropertyById = async (id) => {
  const response = await api.get(`/catastro/properties/${id}`);
  return response.data.data || response.data;
};

/**
 * Get property by cadastral code
 */
export const getPropertyByCadastralCode = async (code) => {
  const response = await api.get(`/catastro/properties/cadastral/${code}`);
  return response.data.data || response.data;
};

/**
 * Create new property
 */
export const createProperty = async (data) => {
  const response = await api.post('/catastro/properties', data);
  return response.data.data || response.data;
};

/**
 * Update property
 */
export const updateProperty = async (id, data) => {
  const response = await api.put(`/catastro/properties/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Delete property
 */
export const deleteProperty = async (id) => {
  const response = await api.delete(`/catastro/properties/${id}`);
  return response.data.data || response.data;
};

/**
 * Search properties by location
 */
export const searchPropertiesByLocation = async (params) => {
  const response = await api.get('/catastro/properties/search/location', { params });
  return response.data.data || response.data;
};

/**
 * Get property statistics
 */
export const getPropertyStats = async () => {
  const response = await api.get('/catastro/properties/stats');
  return response.data.data || response.data;
};

// ==================== PROPERTY OWNERS ====================

/**
 * Get property owners
 */
export const getPropertyOwners = async (propertyId) => {
  const response = await api.get(`/catastro/properties/${propertyId}/owners`);
  return response.data.data || response.data;
};

/**
 * Get current owner
 */
export const getCurrentOwner = async (propertyId) => {
  const response = await api.get(`/catastro/properties/${propertyId}/owners/current`);
  return response.data.data || response.data;
};

/**
 * Create property owner
 */
export const createPropertyOwner = async (propertyId, data) => {
  const response = await api.post(`/catastro/properties/${propertyId}/owners`, data);
  return response.data.data || response.data;
};

/**
 * Get properties by owner
 */
export const getPropertiesByOwner = async (taxpayerId) => {
  const response = await api.get(`/catastro/property-owners/taxpayer/${taxpayerId}`);
  return response.data.data || response.data;
};

// ==================== URBAN VARIABLES ====================

/**
 * Get all urban variables
 */
export const getUrbanVariables = async (params = {}) => {
  const response = await api.get('/catastro/urban-variables', { params });
  const data = response.data.data || response.data;
  // Backend devuelve array directo o { variables: [] }
  return Array.isArray(data) ? data : (data.variables || data);
};

/**
 * Get urban variable by ID
 */
export const getUrbanVariableById = async (id) => {
  const response = await api.get(`/catastro/urban-variables/${id}`);
  return response.data.data || response.data;
};

/**
 * Get urban variable by zone code
 */
export const getUrbanVariableByZoneCode = async (code) => {
  const response = await api.get(`/catastro/urban-variables/zone/${code}`);
  return response.data.data || response.data;
};

/**
 * Create urban variable
 */
export const createUrbanVariable = async (data) => {
  const response = await api.post('/catastro/urban-variables', data);
  return response.data.data || response.data;
};

/**
 * Update urban variable
 */
export const updateUrbanVariable = async (id, data) => {
  const response = await api.put(`/catastro/urban-variables/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Delete urban variable
 */
export const deleteUrbanVariable = async (id) => {
  const response = await api.delete(`/catastro/urban-variables/${id}`);
  return response.data.data || response.data;
};

/**
 * Check compliance with urban variables
 */
export const checkCompliance = async (zoneCode, data) => {
  const response = await api.post(`/catastro/urban-variables/zone/${zoneCode}/check-compliance`, data);
  return response.data.data || response.data;
};

/**
 * Get zone statistics
 */
export const getZoneStats = async () => {
  const response = await api.get('/catastro/urban-variables/stats');
  return response.data.data || response.data;
};

// ==================== CONSTRUCTION PERMITS ====================

/**
 * Get all construction permits
 */
export const getConstructionPermits = async (params = {}) => {
  const response = await api.get('/catastro/construction-permits', { params });
  const data = response.data.data || response.data;
  // Backend devuelve { permits: [], pagination: {} }
  return data.permits || data;
};

/**
 * Get permit by ID
 */
export const getPermitById = async (id) => {
  const response = await api.get(`/catastro/construction-permits/${id}`);
  return response.data.data || response.data;
};

/**
 * Get construction permit by ID (alias)
 */
export const getConstructionPermitById = async (id) => {
  const response = await api.get(`/catastro/construction-permits/${id}`);
  return response.data.data || response.data;
};

/**
 * Get permit by number
 */
export const getPermitByNumber = async (number) => {
  const response = await api.get(`/catastro/construction-permits/number/${number}`);
  return response.data.data || response.data;
};

/**
 * Create construction permit
 */
export const createConstructionPermit = async (data) => {
  const response = await api.post('/catastro/construction-permits', data);
  return response.data.data || response.data;
};

/**
 * Update construction permit
 */
export const updateConstructionPermit = async (id, data) => {
  const response = await api.put(`/catastro/construction-permits/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Review permit (technical review)
 */
export const reviewPermit = async (id, data) => {
  const response = await api.post(`/catastro/construction-permits/${id}/review`, data);
  return response.data.data || response.data;
};

/**
 * Approve or reject permit
 */
export const approveOrRejectPermit = async (id, data) => {
  const response = await api.post(`/catastro/construction-permits/${id}/approve-reject`, data);
  return response.data.data || response.data;
};

/**
 * Register payment
 */
export const registerPayment = async (id, data) => {
  const response = await api.post(`/catastro/construction-permits/${id}/payment`, data);
  return response.data.data || response.data;
};

/**
 * Start construction
 */
export const startConstruction = async (id) => {
  const response = await api.post(`/catastro/construction-permits/${id}/start`);
  return response.data.data || response.data;
};

/**
 * Complete construction
 */
export const completeConstruction = async (id) => {
  const response = await api.post(`/catastro/construction-permits/${id}/complete`);
  return response.data.data || response.data;
};

/**
 * Cancel permit
 */
export const cancelPermit = async (id, reason) => {
  const response = await api.post(`/catastro/construction-permits/${id}/cancel`, { reason });
  return response.data.data || response.data;
};

/**
 * Get permit statistics
 */
export const getPermitStats = async () => {
  const response = await api.get('/catastro/construction-permits/stats');
  return response.data.data || response.data;
};

// ==================== PERMIT INSPECTIONS ====================

/**
 * Get inspections by permit
 */
export const getInspectionsByPermit = async (permitId) => {
  const response = await api.get(`/catastro/construction-permits/${permitId}/inspections`);
  return response.data.data || response.data;
};

/**
 * Create inspection
 */
export const createInspection = async (permitId, data) => {
  const response = await api.post(`/catastro/construction-permits/${permitId}/inspections`, data);
  return response.data.data || response.data;
};

/**
 * Update inspection
 */
export const updateInspection = async (permitId, inspectionId, data) => {
  const response = await api.put(`/catastro/construction-permits/${permitId}/inspections/${inspectionId}`, data);
  return response.data.data || response.data;
};

// ==================== URBAN INSPECTIONS ====================

/**
 * Get all urban inspections
 */
export const getUrbanInspections = async (params = {}) => {
  const response = await api.get('/catastro/urban-inspections', { params });
  const data = response.data.data || response.data;
  // Backend devuelve { inspections: [], pagination: {} }
  return data.inspections || data;
};

/**
 * Get urban inspection by ID
 */
export const getUrbanInspectionById = async (id) => {
  const response = await api.get(`/catastro/urban-inspections/${id}`);
  return response.data.data || response.data;
};

/**
 * Create urban inspection
 */
export const createUrbanInspection = async (data) => {
  const response = await api.post('/catastro/urban-inspections', data);
  return response.data.data || response.data;
};

/**
 * Update urban inspection
 */
export const updateUrbanInspection = async (id, data) => {
  const response = await api.put(`/catastro/urban-inspections/${id}`, data);
  return response.data.data || response.data;
};

/**
 * Register notification
 */
export const registerNotification = async (id, data) => {
  const response = await api.post(`/catastro/urban-inspections/${id}/notification`, data);
  return response.data.data || response.data;
};

/**
 * Register sanction
 */
export const registerSanction = async (id, data) => {
  const response = await api.post(`/catastro/urban-inspections/${id}/sanction`, data);
  return response.data.data || response.data;
};

/**
 * Resolve inspection
 */
export const resolveInspection = async (id, data) => {
  const response = await api.post(`/catastro/urban-inspections/${id}/resolve`, data);
  return response.data.data || response.data;
};

/**
 * Get inspections by property
 */
export const getInspectionsByProperty = async (propertyId) => {
  const response = await api.get(`/catastro/urban-inspections/property/${propertyId}`);
  return response.data.data || response.data;
};

/**
 * Get urban inspection statistics
 */
export const getUrbanInspectionStats = async () => {
  const response = await api.get('/catastro/urban-inspections/stats');
  return response.data.data || response.data;
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
