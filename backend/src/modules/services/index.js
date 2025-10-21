/**
 * Rutas principales del módulo de Servicios Públicos
 */

import express from 'express';
import cleaningRoutes from './cleaning/routes.js';

const router = express.Router();

// Montar rutas
router.use('/cleaning', cleaningRoutes);

export default router;
