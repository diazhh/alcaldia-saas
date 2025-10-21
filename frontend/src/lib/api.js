import axios from 'axios';
import { API_URL } from '@/constants';

/**
 * Instancia de Axios configurada para la API
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

/**
 * Interceptor de peticiones
 * Adjunta el token JWT a todas las peticiones
 */
api.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state?.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas
 * Maneja errores globales y tokens expirados
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth-storage');
      
      // Redirigir al login si no estamos ya ahí
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Manejar errores de autorización
    if (error.response?.status === 403) {
      console.error('Acceso denegado:', error.response.data);
    }

    // Manejar errores de servidor
    if (error.response?.status >= 500) {
      console.error('Error del servidor:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * Funciones helper para peticiones comunes
 */

/**
 * GET request
 * @param {string} url - URL del endpoint
 * @param {Object} config - Configuración adicional
 * @returns {Promise}
 */
export const get = (url, config = {}) => {
  return api.get(url, config);
};

/**
 * POST request
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} config - Configuración adicional
 * @returns {Promise}
 */
export const post = (url, data, config = {}) => {
  return api.post(url, data, config);
};

/**
 * PUT request
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} config - Configuración adicional
 * @returns {Promise}
 */
export const put = (url, data, config = {}) => {
  return api.put(url, data, config);
};

/**
 * PATCH request
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} config - Configuración adicional
 * @returns {Promise}
 */
export const patch = (url, data, config = {}) => {
  return api.patch(url, data, config);
};

/**
 * DELETE request
 * @param {string} url - URL del endpoint
 * @param {Object} config - Configuración adicional
 * @returns {Promise}
 */
export const del = (url, config = {}) => {
  return api.delete(url, config);
};
