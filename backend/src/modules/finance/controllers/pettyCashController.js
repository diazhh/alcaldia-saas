/**
 * Controlador de Cajas Chicas
 */

import pettyCashService from '../services/pettyCash.service.js';

class PettyCashController {
  /**
   * Crear caja chica
   */
  async createPettyCash(req, res) {
    try {
      const userId = req.user.id;
      const pettyCash = await pettyCashService.createPettyCash(req.body, userId);

      res.status(201).json({
        success: true,
        data: pettyCash,
        message: 'Caja chica creada exitosamente',
      });
    } catch (error) {
      console.error('Error creando caja chica:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear caja chica',
      });
    }
  }

  /**
   * Obtener todas las cajas chicas
   */
  async getAllPettyCashes(req, res) {
    try {
      const filters = {
        status: req.query.status,
        custodianId: req.query.custodianId,
        departmentId: req.query.departmentId,
      };

      const pettyCashes = await pettyCashService.getAllPettyCashes(filters);

      res.json({
        success: true,
        data: pettyCashes,
      });
    } catch (error) {
      console.error('Error obteniendo cajas chicas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener cajas chicas',
      });
    }
  }

  /**
   * Obtener caja chica por ID
   */
  async getPettyCashById(req, res) {
    try {
      const { id } = req.params;
      const pettyCash = await pettyCashService.getPettyCashById(id);

      res.json({
        success: true,
        data: pettyCash,
      });
    } catch (error) {
      console.error('Error obteniendo caja chica:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Caja chica no encontrada',
      });
    }
  }

  /**
   * Registrar gasto
   */
  async registerExpense(req, res) {
    try {
      const userId = req.user.id;
      const result = await pettyCashService.registerExpense(req.body, userId);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Gasto registrado exitosamente',
      });
    } catch (error) {
      console.error('Error registrando gasto:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar gasto',
      });
    }
  }

  /**
   * Solicitar reembolso
   */
  async requestReimbursement(req, res) {
    try {
      const userId = req.user.id;
      const reimbursement = await pettyCashService.requestReimbursement(req.body, userId);

      res.status(201).json({
        success: true,
        data: reimbursement,
        message: 'Reembolso solicitado exitosamente',
      });
    } catch (error) {
      console.error('Error solicitando reembolso:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al solicitar reembolso',
      });
    }
  }

  /**
   * Aprobar reembolso
   */
  async approveReimbursement(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const reimbursement = await pettyCashService.approveReimbursement(id, userId);

      res.json({
        success: true,
        data: reimbursement,
        message: 'Reembolso aprobado exitosamente',
      });
    } catch (error) {
      console.error('Error aprobando reembolso:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al aprobar reembolso',
      });
    }
  }

  /**
   * Procesar pago de reembolso
   */
  async processReimbursement(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await pettyCashService.processReimbursement(id, userId);

      res.json({
        success: true,
        data: result,
        message: 'Reembolso procesado exitosamente',
      });
    } catch (error) {
      console.error('Error procesando reembolso:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al procesar reembolso',
      });
    }
  }

  /**
   * Rechazar reembolso
   */
  async rejectReimbursement(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { reason } = req.body;

      const reimbursement = await pettyCashService.rejectReimbursement(id, reason, userId);

      res.json({
        success: true,
        data: reimbursement,
        message: 'Reembolso rechazado',
      });
    } catch (error) {
      console.error('Error rechazando reembolso:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al rechazar reembolso',
      });
    }
  }

  /**
   * Obtener estadísticas
   */
  async getPettyCashStats(req, res) {
    try {
      const { id } = req.params;
      const stats = await pettyCashService.getPettyCashStats(id);

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
   * Cerrar caja chica
   */
  async closePettyCash(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const pettyCash = await pettyCashService.closePettyCash(id, userId);

      res.json({
        success: true,
        data: pettyCash,
        message: 'Caja chica cerrada exitosamente',
      });
    } catch (error) {
      console.error('Error cerrando caja chica:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cerrar caja chica',
      });
    }
  }

  /**
   * Actualizar caja chica
   */
  async updatePettyCash(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const pettyCash = await pettyCashService.updatePettyCash(id, req.body, userId);

      res.json({
        success: true,
        data: pettyCash,
        message: 'Caja chica actualizada exitosamente',
      });
    } catch (error) {
      console.error('Error actualizando caja chica:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar caja chica',
      });
    }
  }
}

export default new PettyCashController();
