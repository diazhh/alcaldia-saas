/**
 * Setup global para tests
 * Este archivo se ejecuta antes de todos los tests
 */

import { disconnectPrisma } from './helpers/prisma.js';

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Cleanup global al finalizar todos los tests
global.afterAll(async () => {
  await disconnectPrisma();
});
