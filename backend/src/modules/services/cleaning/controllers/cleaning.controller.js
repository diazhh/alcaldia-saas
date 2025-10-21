/**
 * Controladores para el módulo de Aseo Urbano
 */

import {
  CleaningRouteService,
  CollectionOperationService,
  CollectionPointService,
  CleaningCampaignService,
} from '../services/cleaning.service.js';
import { successResponse } from '../../../../shared/utils/response.js';

const routeService = new CleaningRouteService();
const operationService = new CollectionOperationService();
const pointService = new CollectionPointService();
const campaignService = new CleaningCampaignService();

/**
 * Controladores de Rutas de Recolección
 */
const routeController = {
  /**
   * Obtener todas las rutas
   */
  async getAll(req, res, next) {
    try {
      const result = await routeService.getAll(req.query);
      return successResponse(res, result.data, 'Rutas obtenidas exitosamente', result.pagination);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener una ruta por ID
   */
  async getById(req, res, next) {
    try {
      const route = await routeService.getById(req.params.id);
      return successResponse(res, route, 'Ruta obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear una nueva ruta
   */
  async create(req, res, next) {
    try {
      const route = await routeService.create(req.body);
      return successResponse(res, route, 'Ruta creada exitosamente', null, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar una ruta
   */
  async update(req, res, next) {
    try {
      const route = await routeService.update(req.params.id, req.body);
      return successResponse(res, route, 'Ruta actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar una ruta
   */
  async delete(req, res, next) {
    try {
      await routeService.delete(req.params.id);
      return successResponse(res, null, 'Ruta eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener estadísticas de rutas
   */
  async getStats(req, res, next) {
    try {
      const stats = await routeService.getStats();
      return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  },
};

/**
 * Controladores de Operaciones de Recolección
 */
const operationController = {
  /**
   * Obtener todas las operaciones
   */
  async getAll(req, res, next) {
    try {
      const result = await operationService.getAll(req.query);
      return successResponse(res, result.data, 'Operaciones obtenidas exitosamente', result.pagination);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener una operación por ID
   */
  async getById(req, res, next) {
    try {
      const operation = await operationService.getById(req.params.id);
      return successResponse(res, operation, 'Operación obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear una nueva operación
   */
  async create(req, res, next) {
    try {
      const operation = await operationService.create(req.body, req.user.id);
      return successResponse(res, operation, 'Operación creada exitosamente', null, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar una operación
   */
  async update(req, res, next) {
    try {
      const operation = await operationService.update(req.params.id, req.body);
      return successResponse(res, operation, 'Operación actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar una operación
   */
  async delete(req, res, next) {
    try {
      await operationService.delete(req.params.id);
      return successResponse(res, null, 'Operación eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener estadísticas de operaciones
   */
  async getStats(req, res, next) {
    try {
      const stats = await operationService.getStats(req.query);
      return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  },
};

/**
 * Controladores de Puntos de Recolección
 */
const pointController = {
  /**
   * Obtener todos los puntos
   */
  async getAll(req, res, next) {
    try {
      const result = await pointService.getAll(req.query);
      return successResponse(res, result.data, 'Puntos obtenidos exitosamente', result.pagination);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener un punto por ID
   */
  async getById(req, res, next) {
    try {
      const point = await pointService.getById(req.params.id);
      return successResponse(res, point, 'Punto obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear un nuevo punto
   */
  async create(req, res, next) {
    try {
      const point = await pointService.create(req.body);
      return successResponse(res, point, 'Punto creado exitosamente', null, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar un punto
   */
  async update(req, res, next) {
    try {
      const point = await pointService.update(req.params.id, req.body);
      return successResponse(res, point, 'Punto actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar un punto
   */
  async delete(req, res, next) {
    try {
      await pointService.delete(req.params.id);
      return successResponse(res, null, 'Punto eliminado exitosamente');
    } catch (error) {
      next(error);
    }
  },
};

/**
 * Controladores de Campañas de Limpieza
 */
const campaignController = {
  /**
   * Obtener todas las campañas
   */
  async getAll(req, res, next) {
    try {
      const result = await campaignService.getAll(req.query);
      return successResponse(res, result.data, 'Campañas obtenidas exitosamente', result.pagination);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener una campaña por ID
   */
  async getById(req, res, next) {
    try {
      const campaign = await campaignService.getById(req.params.id);
      return successResponse(res, campaign, 'Campaña obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear una nueva campaña
   */
  async create(req, res, next) {
    try {
      const campaign = await campaignService.create(req.body, req.user.id);
      return successResponse(res, campaign, 'Campaña creada exitosamente', null, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar una campaña
   */
  async update(req, res, next) {
    try {
      const campaign = await campaignService.update(req.params.id, req.body);
      return successResponse(res, campaign, 'Campaña actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar una campaña
   */
  async delete(req, res, next) {
    try {
      await campaignService.delete(req.params.id);
      return successResponse(res, null, 'Campaña eliminada exitosamente');
    } catch (error) {
      next(error);
    }
  },
};

export {
  routeController,
  operationController,
  pointController,
  campaignController,
};
