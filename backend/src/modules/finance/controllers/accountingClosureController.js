/**
 * Controlador de Cierre Contable
 */

import accountingClosureService from '../services/accountingClosure.service.js';

class AccountingClosureController {
  /**
   * Validar pre-cierre
   */
  async validatePreClosure(req, res) {
    try {
      const { year, month } = req.query;

      const validation = await accountingClosureService.validatePreClosure(
        parseInt(year),
        month ? parseInt(month) : null
      );

      res.json({
        success: true,
        data: validation,
      });
    } catch (error) {
      console.error('Error validando pre-cierre:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al validar pre-cierre',
      });
    }
  }

  /**
   * Cerrar mes
   */
  async closeMonth(req, res) {
    try {
      const userId = req.user.id;
      const { year, month } = req.body;

      const result = await accountingClosureService.closeMonth(
        parseInt(year),
        parseInt(month),
        userId
      );

      res.status(201).json({
        success: true,
        data: result,
        message: `Mes ${month}/${year} cerrado exitosamente`,
      });
    } catch (error) {
      console.error('Error cerrando mes:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cerrar mes',
      });
    }
  }

  /**
   * Cerrar año
   */
  async closeYear(req, res) {
    try {
      const userId = req.user.id;
      const { year } = req.body;

      const result = await accountingClosureService.closeYear(parseInt(year), userId);

      res.status(201).json({
        success: true,
        data: result,
        message: `Año ${year} cerrado exitosamente`,
      });
    } catch (error) {
      console.error('Error cerrando año:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cerrar año',
      });
    }
  }

  /**
   * Reabrir período
   */
  async reopenPeriod(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const closure = await accountingClosureService.reopenPeriod(id, reason, userId);

      res.json({
        success: true,
        data: closure,
        message: 'Período reabierto exitosamente',
      });
    } catch (error) {
      console.error('Error reabriendo período:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al reabrir período',
      });
    }
  }

  /**
   * Obtener cierres
   */
  async getClosures(req, res) {
    try {
      const filters = {
        year: req.query.year,
        type: req.query.type,
        status: req.query.status,
      };

      const closures = await accountingClosureService.getClosures(filters);

      res.json({
        success: true,
        data: closures,
      });
    } catch (error) {
      console.error('Error obteniendo cierres:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener cierres',
      });
    }
  }

  /**
   * Obtener cierre por ID
   */
  async getClosureById(req, res) {
    try {
      const { id } = req.params;
      const closure = await accountingClosureService.getClosureById(id);

      res.json({
        success: true,
        data: closure,
      });
    } catch (error) {
      console.error('Error obteniendo cierre:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Cierre no encontrado',
      });
    }
  }

  /**
   * Obtener estadísticas de cierre
   */
  async getClosureStats(req, res) {
    try {
      const { year } = req.params;
      const stats = await accountingClosureService.getClosureStats(year);

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
   * Verificar si período está cerrado
   */
  async isPeriodClosed(req, res) {
    try {
      const { year, month } = req.query;

      const isClosed = await accountingClosureService.isPeriodClosed(
        parseInt(year),
        month ? parseInt(month) : null
      );

      res.json({
        success: true,
        data: { isClosed },
      });
    } catch (error) {
      console.error('Error verificando período:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al verificar período',
      });
    }
  }
}

export default new AccountingClosureController();
