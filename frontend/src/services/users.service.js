import api from '@/lib/api';

/**
 * Get all users with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise} Users data
 */
export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise} User data
 */
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

/**
 * Create new user
 * @param {Object} data - User data
 * @returns {Promise} Created user
 */
export const createUser = async (data) => {
  const response = await api.post('/users', data);
  return response.data;
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} data - Updated user data
 * @returns {Promise} Updated user
 */
export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {Promise} Deletion result
 */
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
