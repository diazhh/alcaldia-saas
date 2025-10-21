import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de logs
const LOGS_DIR = path.join(__dirname, '../../../logs');
const ACCESS_DENIED_LOG = path.join(LOGS_DIR, 'access-denied.log');

// Crear directorio de logs si no existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Formatea una fecha para el log
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
const formatDate = (date) => {
  return date.toISOString();
};

/**
 * Registra un intento de acceso denegado
 * @param {Object} data - Datos del intento de acceso
 * @param {string} data.userId - ID del usuario
 * @param {string} data.email - Email del usuario
 * @param {string} data.role - Rol del usuario
 * @param {string} data.module - Módulo al que intentó acceder
 * @param {string} data.action - Acción que intentó realizar
 * @param {string} data.ip - IP del usuario
 * @param {string} data.userAgent - User agent del navegador
 * @param {string} data.path - Ruta de la petición
 * @param {string} data.method - Método HTTP
 */
export const logAccessDenied = (data) => {
  const timestamp = formatDate(new Date());
  
  const logEntry = {
    timestamp,
    userId: data.userId,
    email: data.email,
    role: data.role,
    module: data.module,
    action: data.action,
    ip: data.ip,
    userAgent: data.userAgent,
    path: data.path,
    method: data.method,
  };

  // Formatear como JSON para facilitar el análisis
  const logLine = JSON.stringify(logEntry) + '\n';

  // Escribir en el archivo de log
  fs.appendFile(ACCESS_DENIED_LOG, logLine, (err) => {
    if (err) {
      console.error('Error al escribir en el log de accesos denegados:', err);
    }
  });

  // También registrar en consola en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.warn('🚫 ACCESO DENEGADO:', {
      user: `${data.email} (${data.role})`,
      module: data.module,
      action: data.action,
      path: `${data.method} ${data.path}`,
    });
  }
};

/**
 * Obtiene los últimos N intentos de acceso denegados
 * @param {number} limit - Número de registros a obtener
 * @returns {Promise<Array>} Array de intentos de acceso denegados
 */
export const getRecentAccessDenied = async (limit = 100) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(ACCESS_DENIED_LOG)) {
      return resolve([]);
    }

    fs.readFile(ACCESS_DENIED_LOG, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      const lines = data.trim().split('\n').filter(line => line);
      const entries = lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (e) {
            return null;
          }
        })
        .filter(entry => entry !== null)
        .reverse(); // Más recientes primero

      resolve(entries);
    });
  });
};

/**
 * Obtiene estadísticas de accesos denegados
 * @returns {Promise<Object>} Estadísticas
 */
export const getAccessDeniedStats = async () => {
  const entries = await getRecentAccessDenied(1000);

  const stats = {
    total: entries.length,
    byRole: {},
    byModule: {},
    byAction: {},
    byUser: {},
  };

  entries.forEach(entry => {
    // Por rol
    stats.byRole[entry.role] = (stats.byRole[entry.role] || 0) + 1;

    // Por módulo
    stats.byModule[entry.module] = (stats.byModule[entry.module] || 0) + 1;

    // Por acción
    stats.byAction[entry.action] = (stats.byAction[entry.action] || 0) + 1;

    // Por usuario
    const userKey = `${entry.email} (${entry.role})`;
    stats.byUser[userKey] = (stats.byUser[userKey] || 0) + 1;
  });

  return stats;
};

/**
 * Limpia el log de accesos denegados
 * @returns {Promise<void>}
 */
export const clearAccessDeniedLog = async () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(ACCESS_DENIED_LOG, '', (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};
