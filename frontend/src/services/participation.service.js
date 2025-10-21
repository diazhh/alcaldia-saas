import api from '@/lib/api';

/**
 * Participation API Service
 * Handles all API calls related to citizen participation
 */

// ==================== CITIZEN REPORTS (311) ====================

/**
 * Create a new citizen report
 */
export const createReport = async (data) => {
  const response = await api.post('/api/participation/reports', data);
  return response.data;
};

/**
 * Get report by ticket number (public)
 */
export const getReportByTicket = async (ticketNumber) => {
  const response = await api.get(`/api/participation/reports/ticket/${ticketNumber}`);
  return response.data;
};

/**
 * Get heatmap data (public)
 */
export const getHeatmapData = async (params = {}) => {
  const response = await api.get('/api/participation/reports/heatmap', { params });
  return response.data;
};

/**
 * Rate a report (public)
 */
export const rateReport = async (id, data) => {
  const response = await api.post(`/api/participation/reports/${id}/rate`, data);
  return response.data;
};

/**
 * Get report statistics (protected)
 */
export const getReportsStats = async (params = {}) => {
  const response = await api.get('/api/participation/reports/stats', { params });
  return response.data;
};

/**
 * Get report by ID (protected)
 */
export const getReport = async (id) => {
  const response = await api.get(`/api/participation/reports/${id}`);
  return response.data;
};

/**
 * List reports with filters (protected)
 */
export const listReports = async (params = {}) => {
  const response = await api.get('/api/participation/reports', { params });
  return response.data;
};

/**
 * Update report status (protected)
 */
export const updateReportStatus = async (id, data) => {
  const response = await api.patch(`/api/participation/reports/${id}/status`, data);
  return response.data;
};

/**
 * Assign report to department/user (protected)
 */
export const assignReport = async (id, data) => {
  const response = await api.patch(`/api/participation/reports/${id}/assign`, data);
  return response.data;
};

/**
 * Add comment to report (protected)
 */
export const addComment = async (id, data) => {
  const response = await api.post(`/api/participation/reports/${id}/comments`, data);
  return response.data;
};

/**
 * Delete report (protected)
 */
export const deleteReport = async (id) => {
  const response = await api.delete(`/api/participation/reports/${id}`);
  return response.data;
};

// ==================== PARTICIPATORY BUDGET ====================

/**
 * Create participatory budget (protected)
 */
export const createParticipatoryBudget = async (data) => {
  const response = await api.post('/api/participation/participatory-budgets', data);
  return response.data;
};

/**
 * Get participatory budget by ID
 */
export const getParticipatoryBudget = async (id) => {
  const response = await api.get(`/api/participation/participatory-budgets/${id}`);
  return response.data;
};

/**
 * List participatory budgets
 */
export const listParticipatoryBudgets = async (params = {}) => {
  const response = await api.get('/api/participation/participatory-budgets', { params });
  return response.data;
};

/**
 * Update participatory budget (protected)
 */
export const updateParticipatoryBudget = async (id, data) => {
  const response = await api.put(`/api/participation/participatory-budgets/${id}`, data);
  return response.data;
};

/**
 * Delete participatory budget (protected)
 */
export const deleteParticipatoryBudget = async (id) => {
  const response = await api.delete(`/api/participation/participatory-budgets/${id}`);
  return response.data;
};

/**
 * Get budget statistics
 */
export const getBudgetStats = async (id) => {
  const response = await api.get(`/api/participation/participatory-budgets/${id}/stats`);
  return response.data;
};

/**
 * Calculate winners (protected)
 */
export const calculateWinners = async (id) => {
  const response = await api.post(`/api/participation/participatory-budgets/${id}/calculate-winners`);
  return response.data;
};

/**
 * Create proposal
 */
export const createProposal = async (budgetId, data) => {
  const response = await api.post(`/api/participation/participatory-budgets/${budgetId}/proposals`, data);
  return response.data;
};

/**
 * Get proposal by ID
 */
export const getProposal = async (id) => {
  const response = await api.get(`/api/participation/proposals/${id}`);
  return response.data;
};

/**
 * List proposals for a budget
 */
export const listProposals = async (budgetId, params = {}) => {
  const response = await api.get(`/api/participation/participatory-budgets/${budgetId}/proposals`, { params });
  return response.data;
};

/**
 * Evaluate proposal (protected)
 */
export const evaluateProposal = async (id, data) => {
  const response = await api.post(`/api/participation/proposals/${id}/evaluate`, data);
  return response.data;
};

/**
 * Vote for proposal
 */
export const voteProposal = async (id, data) => {
  const response = await api.post(`/api/participation/proposals/${id}/vote`, data);
  return response.data;
};

// ==================== TRANSPARENCY PORTAL ====================

/**
 * List transparency documents
 */
export const listTransparencyDocuments = async (params = {}) => {
  const response = await api.get('/api/participation/transparency/documents', { params });
  return response.data;
};

/**
 * Get transparency document by ID
 */
export const getTransparencyDocument = async (id) => {
  const response = await api.get(`/api/participation/transparency/documents/${id}`);
  return response.data;
};

/**
 * Register document download
 */
export const registerDownload = async (id) => {
  const response = await api.post(`/api/participation/transparency/documents/${id}/download`);
  return response.data;
};

/**
 * Get documents by category
 */
export const getDocumentsByCategory = async (category, params = {}) => {
  const response = await api.get(`/api/participation/transparency/categories/${category}/documents`, { params });
  return response.data;
};

/**
 * Get most downloaded documents
 */
export const getMostDownloaded = async (params = {}) => {
  const response = await api.get('/api/participation/transparency/documents/most-downloaded', { params });
  return response.data;
};

/**
 * Get most viewed documents
 */
export const getMostViewed = async (params = {}) => {
  const response = await api.get('/api/participation/transparency/documents/most-viewed', { params });
  return response.data;
};

/**
 * Get transparency statistics
 */
export const getTransparencyStats = async () => {
  const response = await api.get('/api/participation/transparency/stats');
  return response.data;
};

/**
 * Search documents
 */
export const searchDocuments = async (params = {}) => {
  const response = await api.get('/api/participation/transparency/search', { params });
  return response.data;
};

/**
 * Get available years
 */
export const getAvailableYears = async () => {
  const response = await api.get('/api/participation/transparency/years');
  return response.data;
};

/**
 * Get categories with count
 */
export const getCategoriesWithCount = async () => {
  const response = await api.get('/api/participation/transparency/categories');
  return response.data;
};

/**
 * Publish document (protected)
 */
export const publishDocument = async (data) => {
  const response = await api.post('/api/participation/transparency/documents', data);
  return response.data;
};

/**
 * Update document (protected)
 */
export const updateDocument = async (id, data) => {
  const response = await api.put(`/api/participation/transparency/documents/${id}`, data);
  return response.data;
};

/**
 * Delete document (protected)
 */
export const deleteDocument = async (id) => {
  const response = await api.delete(`/api/participation/transparency/documents/${id}`);
  return response.data;
};
