/**
 * Servicio de Aseo Urbano
 * Gestiona rutas de recolección, operaciones diarias, puntos especiales y campañas
 */

import prisma from '../../../../config/database.js';
import { NotFoundError, ValidationError } from '../../../../shared/utils/errors.js';

/**
 * Servicio de Rutas de Recolección
 */
class CleaningRouteService {
  /**
   * Obtener todas las rutas con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    const { sector, collectionType, isActive, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (sector) where.sector = sector;
    if (collectionType) where.collectionType = collectionType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [routes, total] = await Promise.all([
      prisma.collectionRoute.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { operations: true },
          },
        },
      }),
      prisma.collectionRoute.count({ where }),
    ]);

    return {
      data: routes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener una ruta por ID
   * @param {string} id - ID de la ruta
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const route = await prisma.collectionRoute.findUnique({
      where: { id },
      include: {
        operations: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!route) {
      throw new NotFoundError('Ruta de recolección no encontrada');
    }

    return route;
  }

  /**
   * Crear una nueva ruta
   * @param {Object} data - Datos de la ruta
   * @returns {Promise<Object>}
   */
  async create(data) {
    // Verificar que el código no exista
    const existing = await prisma.collectionRoute.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ValidationError('Ya existe una ruta con ese código');
    }

    const route = await prisma.collectionRoute.create({
      data,
    });

    return route;
  }

  /**
   * Actualizar una ruta
   * @param {string} id - ID de la ruta
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const route = await this.getById(id);

    // Si se cambia el código, verificar que no exista
    if (data.code && data.code !== route.code) {
      const existing = await prisma.collectionRoute.findUnique({
        where: { code: data.code },
      });

      if (existing) {
        throw new ValidationError('Ya existe una ruta con ese código');
      }
    }

    const updated = await prisma.collectionRoute.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Eliminar una ruta
   * @param {string} id - ID de la ruta
   * @returns {Promise<void>}
   */
  async delete(id) {
    await this.getById(id);

    await prisma.collectionRoute.delete({
      where: { id },
    });
  }

  /**
   * Obtener estadísticas de rutas
   * @returns {Promise<Object>}
   */
  async getStats() {
    const [total, byType, bySector] = await Promise.all([
      prisma.collectionRoute.count({ where: { isActive: true } }),
      prisma.collectionRoute.groupBy({
        by: ['collectionType'],
        where: { isActive: true },
        _count: true,
      }),
      prisma.collectionRoute.groupBy({
        by: ['sector'],
        where: { isActive: true },
        _count: true,
      }),
    ]);

    return {
      total,
      byType,
      bySector,
    };
  }
}

/**
 * Servicio de Operaciones de Recolección
 */
class CollectionOperationService {
  /**
   * Obtener todas las operaciones con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    const { routeId, status, dateFrom, dateTo, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (routeId) where.routeId = routeId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [operations, total] = await Promise.all([
      prisma.collectionOperation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
        include: {
          route: {
            select: {
              code: true,
              name: true,
              sector: true,
            },
          },
        },
      }),
      prisma.collectionOperation.count({ where }),
    ]);

    return {
      data: operations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener una operación por ID
   * @param {string} id - ID de la operación
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const operation = await prisma.collectionOperation.findUnique({
      where: { id },
      include: {
        route: true,
      },
    });

    if (!operation) {
      throw new NotFoundError('Operación no encontrada');
    }

    return operation;
  }

  /**
   * Crear una nueva operación
   * @param {Object} data - Datos de la operación
   * @param {string} userId - ID del usuario que crea
   * @returns {Promise<Object>}
   */
  async create(data, userId) {
    // Verificar que la ruta exista
    const route = await prisma.collectionRoute.findUnique({
      where: { id: data.routeId },
    });

    if (!route) {
      throw new NotFoundError('Ruta no encontrada');
    }

    const operation = await prisma.collectionOperation.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        route: true,
      },
    });

    return operation;
  }

  /**
   * Actualizar una operación
   * @param {string} id - ID de la operación
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    await this.getById(id);

    const updated = await prisma.collectionOperation.update({
      where: { id },
      data,
      include: {
        route: true,
      },
    });

    return updated;
  }

  /**
   * Eliminar una operación
   * @param {string} id - ID de la operación
   * @returns {Promise<void>}
   */
  async delete(id) {
    await this.getById(id);

    await prisma.collectionOperation.delete({
      where: { id },
    });
  }

  /**
   * Obtener estadísticas de operaciones
   * @param {Object} filters - Filtros
   * @returns {Promise<Object>}
   */
  async getStats(filters = {}) {
    const { dateFrom, dateTo } = filters;
    const where = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [total, byStatus, totalTons] = await Promise.all([
      prisma.collectionOperation.count({ where }),
      prisma.collectionOperation.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.collectionOperation.aggregate({
        where: {
          ...where,
          tonsCollected: { not: null },
        },
        _sum: {
          tonsCollected: true,
        },
      }),
    ]);

    return {
      total,
      byStatus,
      totalTonsCollected: totalTons._sum.tonsCollected || 0,
    };
  }
}

/**
 * Servicio de Puntos de Recolección
 */
class CollectionPointService {
  /**
   * Obtener todos los puntos
   * @param {Object} filters - Filtros
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}) {
    const { sector, type, status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (sector) where.sector = sector;
    if (type) where.type = type;
    if (status) where.status = status;
    if (filters.isActive !== undefined) where.isActive = filters.isActive === 'true';

    const [points, total] = await Promise.all([
      prisma.collectionPoint.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.collectionPoint.count({ where }),
    ]);

    return {
      data: points,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un punto por ID
   * @param {string} id - ID del punto
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const point = await prisma.collectionPoint.findUnique({
      where: { id },
    });

    if (!point) {
      throw new NotFoundError('Punto de recolección no encontrado');
    }

    return point;
  }

  /**
   * Crear un punto
   * @param {Object} data - Datos del punto
   * @returns {Promise<Object>}
   */
  async create(data) {
    const existing = await prisma.collectionPoint.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ValidationError('Ya existe un punto con ese código');
    }

    const point = await prisma.collectionPoint.create({
      data,
    });

    return point;
  }

  /**
   * Actualizar un punto
   * @param {string} id - ID del punto
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    await this.getById(id);

    const updated = await prisma.collectionPoint.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Eliminar un punto
   * @param {string} id - ID del punto
   * @returns {Promise<void>}
   */
  async delete(id) {
    await this.getById(id);

    await prisma.collectionPoint.delete({
      where: { id },
    });
  }
}

/**
 * Servicio de Campañas de Limpieza
 */
class CleaningCampaignService {
  /**
   * Obtener todas las campañas
   * @param {Object} filters - Filtros
   * @returns {Promise<Object>}
   */
  async getAll(filters = {}) {
    const { sector, dateFrom, dateTo, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (sector) where.sector = sector;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    const [campaigns, total] = await Promise.all([
      prisma.cleaningCampaign.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
      }),
      prisma.cleaningCampaign.count({ where }),
    ]);

    return {
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener una campaña por ID
   * @param {string} id - ID de la campaña
   * @returns {Promise<Object>}
   */
  async getById(id) {
    const campaign = await prisma.cleaningCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundError('Campaña no encontrada');
    }

    return campaign;
  }

  /**
   * Crear una campaña
   * @param {Object} data - Datos de la campaña
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async create(data, userId) {
    const campaign = await prisma.cleaningCampaign.create({
      data: {
        ...data,
        organizedBy: userId,
      },
    });

    return campaign;
  }

  /**
   * Actualizar una campaña
   * @param {string} id - ID de la campaña
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    await this.getById(id);

    const updated = await prisma.cleaningCampaign.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Eliminar una campaña
   * @param {string} id - ID de la campaña
   * @returns {Promise<void>}
   */
  async delete(id) {
    await this.getById(id);

    await prisma.cleaningCampaign.delete({
      where: { id },
    });
  }
}

export {
  CleaningRouteService,
  CollectionOperationService,
  CollectionPointService,
  CleaningCampaignService,
};
