/**
 * @fileoverview Controlador para gestión de facturación de tasas municipales
 * @module tax/controllers/fee
 */

import feeService from '../services/fee.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Controlador para gestión de tasas municipales
 */
class FeeController {
  /**
   * Crea una nueva factura de tasa municipal
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createFeeBill(req, res) {
    try {
      const bill = await feeService.createFeeBill(req.body);
      return res.status(201).json(successResponse(bill, 'Factura de tasa creada exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene todas las facturas de tasas con filtros
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getFeeBills(req, res) {
    try {
      const result = await feeService.getFeeBills(req.query);
      return res.json(successResponse(result));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene una factura por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getFeeBillById(req, res) {
    try {
      const bill = await feeService.getFeeBillById(req.params.id);
      return res.json(successResponse(bill));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene una factura por número de factura
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getFeeBillByNumber(req, res) {
    try {
      const bill = await feeService.getFeeBillByNumber(req.params.billNumber);
      return res.json(successResponse(bill));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /**
   * Actualiza una factura de tasa
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async updateFeeBill(req, res) {
    try {
      const bill = await feeService.updateFeeBill(req.params.id, req.body);
      return res.json(successResponse(bill, 'Factura actualizada exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Anula una factura de tasa
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async cancelFeeBill(req, res) {
    try {
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json(errorResponse('Debe proporcionar una razón para anular la factura'));
      }

      const bill = await feeService.cancelFeeBill(req.params.id, reason);
      return res.json(successResponse(bill, 'Factura anulada exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Genera facturas masivas de tasa de aseo urbano
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async generateUrbanCleaningBills(req, res) {
    try {
      const result = await feeService.generateUrbanCleaningBills(req.body);
      return successResponse(
        res,
        result,
        `Generación completada: ${result.success} facturas creadas, ${result.errors} errores`
      );
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene estadísticas de facturación de tasas
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getFeeStatistics(req, res) {
    try {
      const stats = await feeService.getFeeStatistics(req.query);
      return res.json(successResponse(stats));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }
}

export default new FeeController();
