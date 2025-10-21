import api from '@/lib/api';

// ==================== ASSETS ====================

/**
 * Get all assets with filters and pagination
 * @param {Object} params - Query parameters (page, limit, status, type, search, etc.)
 * @returns {Promise<Object>} Assets list with pagination
 */
export const getAssets = async (params = {}) => {
  const response = await api.get('/assets', { params });
  return response.data;
};

/**
 * Get asset by ID
 * @param {string} id - Asset ID
 * @returns {Promise<Object>} Asset details
 */
export const getAssetById = async (id) => {
  const response = await api.get(`/assets/${id}`);
  return response.data.data;
};

/**
 * Create new asset
 * @param {Object} data - Asset data
 * @returns {Promise<Object>} Created asset
 */
export const createAsset = async (data) => {
  const response = await api.post('/assets', data);
  return response.data;
};

/**
 * Update asset
 * @param {string} id - Asset ID
 * @param {Object} data - Updated asset data
 * @returns {Promise<Object>} Updated asset
 */
export const updateAsset = async (id, data) => {
  const response = await api.put(`/assets/${id}`, data);
  return response.data;
};

/**
 * Delete asset
 * @param {string} id - Asset ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteAsset = async (id) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};

/**
 * Get asset statistics
 * @returns {Promise<Object>} Asset statistics
 */
export const getAssetStats = async () => {
  const response = await api.get('/assets/stats');
  return response.data.data;
};

/**
 * Update all asset depreciations
 * @returns {Promise<Object>} Update result
 */
export const updateDepreciations = async () => {
  const response = await api.post('/assets/update-depreciations');
  return response.data;
};

// ==================== MOVEMENTS ====================

/**
 * Get all asset movements
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Movements list with pagination
 */
export const getMovements = async (params = {}) => {
  const response = await api.get('/assets/movements', { params });
  return response.data;
};

/**
 * Get movement by ID
 * @param {string} id - Movement ID
 * @returns {Promise<Object>} Movement details
 */
export const getMovementById = async (id) => {
  const response = await api.get(`/assets/movements/${id}`);
  return response.data.data;
};

/**
 * Get asset movement history
 * @param {string} assetId - Asset ID
 * @returns {Promise<Array>} Movement history
 */
export const getAssetMovementHistory = async (assetId) => {
  const response = await api.get(`/assets/${assetId}/movements`);
  return response.data.data;
};

/**
 * Create new movement
 * @param {Object} data - Movement data
 * @returns {Promise<Object>} Created movement
 */
export const createMovement = async (data) => {
  const response = await api.post('/assets/movements', data);
  return response.data;
};

/**
 * Approve movement
 * @param {string} id - Movement ID
 * @param {Object} data - Approval data
 * @returns {Promise<Object>} Approved movement
 */
export const approveMovement = async (id, data = {}) => {
  const response = await api.post(`/assets/movements/${id}/approve`, data);
  return response.data;
};

/**
 * Complete movement
 * @param {string} id - Movement ID
 * @param {Object} data - Completion data
 * @returns {Promise<Object>} Completed movement
 */
export const completeMovement = async (id, data = {}) => {
  const response = await api.post(`/assets/movements/${id}/complete`, data);
  return response.data;
};

/**
 * Reject movement
 * @param {string} id - Movement ID
 * @param {Object} data - Rejection data
 * @returns {Promise<Object>} Rejected movement
 */
export const rejectMovement = async (id, data) => {
  const response = await api.post(`/assets/movements/${id}/reject`, data);
  return response.data;
};

/**
 * Cancel movement
 * @param {string} id - Movement ID
 * @param {Object} data - Cancellation data
 * @returns {Promise<Object>} Cancelled movement
 */
export const cancelMovement = async (id, data) => {
  const response = await api.post(`/assets/movements/${id}/cancel`, data);
  return response.data;
};

// ==================== MAINTENANCES ====================

/**
 * Get all maintenances
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Maintenances list with pagination
 */
export const getMaintenances = async (params = {}) => {
  const response = await api.get('/assets/maintenances', { params });
  return response.data;
};

/**
 * Get maintenance by ID
 * @param {string} id - Maintenance ID
 * @returns {Promise<Object>} Maintenance details
 */
export const getMaintenanceById = async (id) => {
  const response = await api.get(`/assets/maintenances/${id}`);
  return response.data.data;
};

/**
 * Get asset maintenance history
 * @param {string} assetId - Asset ID
 * @returns {Promise<Array>} Maintenance history
 */
export const getAssetMaintenanceHistory = async (assetId) => {
  const response = await api.get(`/assets/${assetId}/maintenances`);
  return response.data.data;
};

/**
 * Create new maintenance
 * @param {Object} data - Maintenance data
 * @returns {Promise<Object>} Created maintenance
 */
export const createMaintenance = async (data) => {
  const response = await api.post('/assets/maintenances', data);
  return response.data;
};

/**
 * Update maintenance
 * @param {string} id - Maintenance ID
 * @param {Object} data - Updated maintenance data
 * @returns {Promise<Object>} Updated maintenance
 */
export const updateMaintenance = async (id, data) => {
  const response = await api.put(`/assets/maintenances/${id}`, data);
  return response.data;
};

/**
 * Start maintenance
 * @param {string} id - Maintenance ID
 * @returns {Promise<Object>} Started maintenance
 */
export const startMaintenance = async (id) => {
  const response = await api.post(`/assets/maintenances/${id}/start`);
  return response.data;
};

/**
 * Complete maintenance
 * @param {string} id - Maintenance ID
 * @param {Object} data - Completion data
 * @returns {Promise<Object>} Completed maintenance
 */
export const completeMaintenance = async (id, data) => {
  const response = await api.post(`/assets/maintenances/${id}/complete`, data);
  return response.data;
};

/**
 * Cancel maintenance
 * @param {string} id - Maintenance ID
 * @param {Object} data - Cancellation data
 * @returns {Promise<Object>} Cancelled maintenance
 */
export const cancelMaintenance = async (id, data) => {
  const response = await api.post(`/assets/maintenances/${id}/cancel`, data);
  return response.data;
};

/**
 * Delete maintenance
 * @param {string} id - Maintenance ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteMaintenance = async (id) => {
  const response = await api.delete(`/assets/maintenances/${id}`);
  return response.data;
};

/**
 * Get maintenance statistics
 * @returns {Promise<Object>} Maintenance statistics
 */
export const getMaintenanceStats = async () => {
  const response = await api.get('/assets/maintenances/stats');
  return response.data.data;
};

// ==================== INVENTORY ====================

/**
 * Get all inventory items
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Items list with pagination
 */
export const getInventoryItems = async (params = {}) => {
  const response = await api.get('/assets/inventory/items', { params });
  return response.data;
};

/**
 * Get inventory item by ID
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Item details
 */
export const getInventoryItemById = async (id) => {
  const response = await api.get(`/assets/inventory/items/${id}`);
  return response.data.data;
};

/**
 * Get low stock items
 * @returns {Promise<Array>} Low stock items
 */
export const getLowStockItems = async () => {
  const response = await api.get('/assets/inventory/items/low-stock');
  return response.data.data;
};

/**
 * Create new inventory item
 * @param {Object} data - Item data
 * @returns {Promise<Object>} Created item
 */
export const createInventoryItem = async (data) => {
  const response = await api.post('/assets/inventory/items', data);
  return response.data;
};

/**
 * Update inventory item
 * @param {string} id - Item ID
 * @param {Object} data - Updated item data
 * @returns {Promise<Object>} Updated item
 */
export const updateInventoryItem = async (id, data) => {
  const response = await api.put(`/assets/inventory/items/${id}`, data);
  return response.data;
};

/**
 * Delete (deactivate) inventory item
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteInventoryItem = async (id) => {
  const response = await api.delete(`/assets/inventory/items/${id}`);
  return response.data;
};

/**
 * Get inventory statistics
 * @returns {Promise<Object>} Inventory statistics
 */
export const getInventoryStats = async () => {
  const response = await api.get('/assets/inventory/stats');
  return response.data.data;
};

// ==================== INVENTORY ENTRIES ====================

/**
 * Get all inventory entries
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Entries list with pagination
 */
export const getInventoryEntries = async (params = {}) => {
  const response = await api.get('/assets/inventory/entries', { params });
  return response.data;
};

/**
 * Create new inventory entry
 * @param {Object} data - Entry data
 * @returns {Promise<Object>} Created entry
 */
export const createInventoryEntry = async (data) => {
  const response = await api.post('/assets/inventory/entries', data);
  return response.data;
};

// ==================== INVENTORY EXITS ====================

/**
 * Get all inventory exits
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Exits list with pagination
 */
export const getInventoryExits = async (params = {}) => {
  const response = await api.get('/assets/inventory/exits', { params });
  return response.data;
};

/**
 * Create new inventory exit
 * @param {Object} data - Exit data
 * @returns {Promise<Object>} Created exit
 */
export const createInventoryExit = async (data) => {
  const response = await api.post('/assets/inventory/exits', data);
  return response.data;
};

// ==================== PURCHASE REQUESTS ====================

/**
 * Get all purchase requests
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Requests list with pagination
 */
export const getPurchaseRequests = async (params = {}) => {
  const response = await api.get('/assets/purchase-requests', { params });
  return response.data;
};

/**
 * Get purchase request by ID
 * @param {string} id - Request ID
 * @returns {Promise<Object>} Request details
 */
export const getPurchaseRequestById = async (id) => {
  const response = await api.get(`/assets/purchase-requests/${id}`);
  return response.data.data;
};

/**
 * Create new purchase request
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Created request
 */
export const createPurchaseRequest = async (data) => {
  const response = await api.post('/assets/purchase-requests', data);
  return response.data;
};

/**
 * Update purchase request
 * @param {string} id - Request ID
 * @param {Object} data - Updated request data
 * @returns {Promise<Object>} Updated request
 */
export const updatePurchaseRequest = async (id, data) => {
  const response = await api.put(`/assets/purchase-requests/${id}`, data);
  return response.data;
};

/**
 * Approve by head
 * @param {string} id - Request ID
 * @param {Object} data - Approval data
 * @returns {Promise<Object>} Approved request
 */
export const approveByHead = async (id, data = {}) => {
  const response = await api.post(`/assets/purchase-requests/${id}/approve-head`, data);
  return response.data;
};

/**
 * Approve by budget
 * @param {string} id - Request ID
 * @param {Object} data - Approval data
 * @returns {Promise<Object>} Approved request
 */
export const approveByBudget = async (id, data = {}) => {
  const response = await api.post(`/assets/purchase-requests/${id}/approve-budget`, data);
  return response.data;
};

/**
 * Approve by purchasing
 * @param {string} id - Request ID
 * @param {Object} data - Approval data
 * @returns {Promise<Object>} Approved request
 */
export const approveByPurchasing = async (id, data = {}) => {
  const response = await api.post(`/assets/purchase-requests/${id}/approve-purchasing`, data);
  return response.data;
};

/**
 * Final approval
 * @param {string} id - Request ID
 * @param {Object} data - Approval data
 * @returns {Promise<Object>} Approved request
 */
export const approvePurchaseRequest = async (id, data = {}) => {
  const response = await api.post(`/assets/purchase-requests/${id}/approve`, data);
  return response.data;
};

/**
 * Reject purchase request
 * @param {string} id - Request ID
 * @param {Object} data - Rejection data
 * @returns {Promise<Object>} Rejected request
 */
export const rejectPurchaseRequest = async (id, data) => {
  const response = await api.post(`/assets/purchase-requests/${id}/reject`, data);
  return response.data;
};

/**
 * Cancel purchase request
 * @param {string} id - Request ID
 * @param {Object} data - Cancellation data
 * @returns {Promise<Object>} Cancelled request
 */
export const cancelPurchaseRequest = async (id, data) => {
  const response = await api.post(`/assets/purchase-requests/${id}/cancel`, data);
  return response.data;
};

/**
 * Add quotation to purchase request
 * @param {string} id - Request ID
 * @param {Object} data - Quotation data
 * @returns {Promise<Object>} Updated request
 */
export const addQuotation = async (id, data) => {
  const response = await api.post(`/assets/purchase-requests/${id}/quotation`, data);
  return response.data;
};

/**
 * Generate purchase order
 * @param {string} id - Request ID
 * @param {Object} data - Purchase order data
 * @returns {Promise<Object>} Updated request
 */
export const generatePurchaseOrder = async (id, data) => {
  const response = await api.post(`/assets/purchase-requests/${id}/purchase-order`, data);
  return response.data;
};

/**
 * Mark as received
 * @param {string} id - Request ID
 * @param {Object} data - Reception data
 * @returns {Promise<Object>} Updated request
 */
export const markAsReceived = async (id, data) => {
  const response = await api.post(`/assets/purchase-requests/${id}/receive`, data);
  return response.data;
};

/**
 * Get purchase request statistics
 * @returns {Promise<Object>} Request statistics
 */
export const getPurchaseRequestStats = async () => {
  const response = await api.get('/assets/purchase-requests/stats');
  return response.data.data;
};
