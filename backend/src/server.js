import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './shared/middlewares/error.middleware.js';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
      // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`Origen no permitido: ${origin}`);
        callback(null, true); // Permitir de todos modos en desarrollo
      }
    },
    credentials: true,
  })
);

// Parseo de JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('public/uploads'));

// ============================================
// RUTAS
// ============================================

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sistema Integral de Gestión Municipal - API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Importar rutas de módulos
import authRoutes from './modules/auth/routes.js';
import permissionsRoutes from './modules/permissions/permissions.routes.js';
import adminRoutes from './modules/admin/routes.js';
import departmentRoutes from './modules/departments/department.routes.js';
import projectRoutes from './modules/projects/routes.js';
import financeRoutes from './modules/finance/routes.js';
import hrRoutes from './modules/hr/routes.js';
import taxRoutes from './modules/tax/routes.js';
import catastroRoutes from './modules/catastro/routes.js';
import participationRoutes from './modules/participation/routes.js';
import fleetRoutes from './modules/fleet/routes.js';
import assetsRoutes from './modules/assets/routes.js';
import documentsRoutes from './modules/documents/routes.js';
import servicesRoutes from './modules/services/index.js';
import customRolesRoutes from './modules/custom-roles/custom-roles.routes.js';
import authController from './modules/auth/controllers/auth.controller.js';
import { authenticate } from './shared/middlewares/auth.middleware.js';
import { requireAdmin } from './shared/middlewares/authorize.middleware.js';

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/catastro', catastroRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/custom-roles', customRolesRoutes);

// Ruta de usuarios (requiere admin)
app.get('/api/users', authenticate, requireAdmin, authController.getAllUsers);

// TODO: Agregar más rutas de módulos aquí
// etc...

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use(notFoundHandler);

// Manejador de errores global
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  await disconnectDatabase();
  process.exit(0);
});

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
