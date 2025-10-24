/**
 * Controlador de Proyección de Flujo de Caja
 */

import cashFlowProjectionService from '../services/cashFlowProjection.service.js';

class CashFlowProjectionController {
  /**
   * Crear proyección manual
   */
  async createProjection(req, res) {
    try {
      const userId = req.user.id;
      const projection = await cashFlowProjectionService.createProjection(req.body, userId);

      res.status(201).json({
        success: true,
        data: projection,
        message: 'Proyección creada exitosamente',
      });
    } catch (error) {
      console.error('Error creando proyección:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear proyección',
      });
    }
  }

  /**
   * Generar proyección automática
   */
  async generateAutoProjection(req, res) {
    try {
      const userId = req.user.id;
      const { year, month, scenario } = req.body;

      const projection = await cashFlowProjectionService.generateAutoProjection(
        year,
        month,
        scenario,
        userId
      );

      res.status(201).json({
        success: true,
        data: projection,
        message: 'Proyección automática generada exitosamente',
      });
    } catch (error) {
      console.error('Error generando proyección automática:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar proyección automática',
      });
    }
  }

  /**
   * Generar proyecciones para todo un año
   */
  async generateYearProjections(req, res) {
    try {
      const userId = req.user.id;
      const { year, scenario } = req.body;

      const projections = await cashFlowProjectionService.generateYearProjections(
        year,
        scenario,
        userId
      );

      res.status(201).json({
        success: true,
        data: projections,
        message: `${projections.length} proyecciones generadas para el año ${year}`,
      });
    } catch (error) {
      console.error('Error generando proyecciones del año:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar proyecciones del año',
      });
    }
  }

  /**
   * Actualizar con valores reales
   */
  async updateWithActuals(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const projection = await cashFlowProjectionService.updateWithActuals(id, userId);

      res.json({
        success: true,
        data: projection,
        message: 'Proyección actualizada con valores reales',
      });
    } catch (error) {
      console.error('Error actualizando con valores reales:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar con valores reales',
      });
    }
  }

  /**
   * Obtener proyecciones con filtros
   */
  async getProjections(req, res) {
    try {
      const filters = {
        year: req.query.year ? parseInt(req.query.year) : undefined,
        month: req.query.month ? parseInt(req.query.month) : undefined,
        scenario: req.query.scenario,
        hasDeficit: req.query.hasDeficit === 'true' ? true : undefined,
      };

      const projections = await cashFlowProjectionService.getProjections(filters);

      res.json({
        success: true,
        data: projections,
      });
    } catch (error) {
      console.error('Error obteniendo proyecciones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener proyecciones',
      });
    }
  }

  /**
   * Obtener proyección por ID
   */
  async getProjectionById(req, res) {
    try {
      const { id } = req.params;
      const projection = await cashFlowProjectionService.getProjectionById(id);

      res.json({
        success: true,
        data: projection,
      });
    } catch (error) {
      console.error('Error obteniendo proyección:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Proyección no encontrada',
      });
    }
  }

  /**
   * Obtener proyecciones de un año
   */
  async getYearProjections(req, res) {
    try {
      const { year } = req.params;
      const { scenario } = req.query;

      const projections = await cashFlowProjectionService.getYearProjections(
        parseInt(year),
        scenario
      );

      res.json({
        success: true,
        data: projections,
      });
    } catch (error) {
      console.error('Error obteniendo proyecciones del año:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener proyecciones del año',
      });
    }
  }

  /**
   * Obtener comparación de escenarios
   */
  async getScenarioComparison(req, res) {
    try {
      const { year, month } = req.params;

      const comparison = await cashFlowProjectionService.getScenarioComparison(
        parseInt(year),
        parseInt(month)
      );

      res.json({
        success: true,
        data: comparison,
      });
    } catch (error) {
      console.error('Error obteniendo comparación de escenarios:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener comparación de escenarios',
      });
    }
  }

  /**
   * Obtener estadísticas
   */
  async getProjectionStats(req, res) {
    try {
      const { year } = req.params;
      const stats = await cashFlowProjectionService.getProjectionStats(parseInt(year));

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas',
      });
    }
  }

  /**
   * Obtener alertas de déficit
   */
  async getDeficitAlerts(req, res) {
    try {
      const { year } = req.params;
      const alerts = await cashFlowProjectionService.getDeficitAlerts(parseInt(year));

      res.json({
        success: true,
        data: alerts,
      });
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener alertas',
      });
    }
  }

  /**
   * Actualizar proyección
   */
  async updateProjection(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const projection = await cashFlowProjectionService.updateProjection(id, req.body, userId);

      res.json({
        success: true,
        data: projection,
        message: 'Proyección actualizada exitosamente',
      });
    } catch (error) {
      console.error('Error actualizando proyección:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar proyección',
      });
    }
  }

  /**
   * Eliminar proyección
   */
  async deleteProjection(req, res) {
    try {
      const { id } = req.params;
      await cashFlowProjectionService.deleteProjection(id);

      res.json({
        success: true,
        message: 'Proyección eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error eliminando proyección:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar proyección',
      });
    }
  }
}

export default new CashFlowProjectionController();
