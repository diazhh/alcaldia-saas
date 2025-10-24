/**
 * Controlador de Anticipos a Empleados
 */

import employeeAdvanceService from '../services/employeeAdvance.service.js';

class EmployeeAdvanceController {
  /**
   * Solicitar anticipo
   */
  async requestAdvance(req, res) {
    try {
      const userId = req.user.id;
      const advance = await employeeAdvanceService.requestAdvance(req.body, userId);

      res.status(201).json({
        success: true,
        data: advance,
        message: 'Anticipo solicitado exitosamente',
      });
    } catch (error) {
      console.error('Error solicitando anticipo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al solicitar anticipo',
      });
    }
  }

  /**
   * Obtener todos los anticipos
   */
  async getAllAdvances(req, res) {
    try {
      const filters = {
        employeeId: req.query.employeeId,
        status: req.query.status,
      };

      const advances = await employeeAdvanceService.getAllAdvances(filters);

      res.json({
        success: true,
        data: advances,
      });
    } catch (error) {
      console.error('Error obteniendo anticipos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener anticipos',
      });
    }
  }

  /**
   * Obtener anticipo por ID
   */
  async getAdvanceById(req, res) {
    try {
      const { id } = req.params;
      const advance = await employeeAdvanceService.getAdvanceById(id);

      res.json({
        success: true,
        data: advance,
      });
    } catch (error) {
      console.error('Error obteniendo anticipo:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Anticipo no encontrado',
      });
    }
  }

  /**
   * Aprobar anticipo
   */
  async approveAdvance(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const advance = await employeeAdvanceService.approveAdvance(id, userId);

      res.json({
        success: true,
        data: advance,
        message: 'Anticipo aprobado exitosamente',
      });
    } catch (error) {
      console.error('Error aprobando anticipo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al aprobar anticipo',
      });
    }
  }

  /**
   * Rechazar anticipo
   */
  async rejectAdvance(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const advance = await employeeAdvanceService.rejectAdvance(id, reason, userId);

      res.json({
        success: true,
        data: advance,
        message: 'Anticipo rechazado',
      });
    } catch (error) {
      console.error('Error rechazando anticipo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al rechazar anticipo',
      });
    }
  }

  /**
   * Desembolsar anticipo
   */
  async disburseAdvance(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const advance = await employeeAdvanceService.disburseAdvance(id, userId);

      res.json({
        success: true,
        data: advance,
        message: 'Anticipo desembolsado exitosamente',
      });
    } catch (error) {
      console.error('Error desembolsando anticipo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al desembolsar anticipo',
      });
    }
  }

  /**
   * Registrar descuento de cuota
   */
  async registerInstallmentPayment(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const advance = await employeeAdvanceService.registerInstallmentPayment(id, userId);

      res.json({
        success: true,
        data: advance,
        message: 'Cuota descontada exitosamente',
      });
    } catch (error) {
      console.error('Error registrando descuento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar descuento',
      });
    }
  }

  /**
   * Cancelar anticipo
   */
  async cancelAdvance(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const advance = await employeeAdvanceService.cancelAdvance(id, userId);

      res.json({
        success: true,
        data: advance,
        message: 'Anticipo cancelado exitosamente',
      });
    } catch (error) {
      console.error('Error cancelando anticipo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cancelar anticipo',
      });
    }
  }

  /**
   * Obtener estadísticas
   */
  async getAdvanceStats(req, res) {
    try {
      const { employeeId } = req.query;
      const stats = await employeeAdvanceService.getAdvanceStats(employeeId);

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
   * Obtener cuotas pendientes
   */
  async getPendingInstallments(req, res) {
    try {
      const { employeeId } = req.params;
      const installments = await employeeAdvanceService.getPendingInstallments(employeeId);

      res.json({
        success: true,
        data: installments,
      });
    } catch (error) {
      console.error('Error obteniendo cuotas pendientes:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener cuotas pendientes',
      });
    }
  }
}

export default new EmployeeAdvanceController();
