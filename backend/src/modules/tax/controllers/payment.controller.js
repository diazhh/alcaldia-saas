/**
 * @fileoverview Controlador para portal de autopago tributario
 * @module tax/controllers/payment
 */

import paymentService from '../services/payment.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Controlador para gestión de pagos tributarios
 */
class PaymentController {
  /**
   * Consulta deudas de un contribuyente por RIF/CI
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getDebtsByTaxId(req, res) {
    try {
      const { taxId } = req.params;
      const debts = await paymentService.getDebtsByTaxId(taxId);
      return res.json(successResponse(debts));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /**
   * Genera planilla de pago con código de referencia
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async generatePaymentSlip(req, res) {
    try {
      const slip = await paymentService.generatePaymentSlip(req.body);
      return res.json(successResponse(slip, 'Planilla de pago generada exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Registra un pago tributario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async registerPayment(req, res) {
    try {
      const payment = await paymentService.registerPayment(req.body);
      return res.status(201).json(successResponse(payment, 'Pago registrado exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene el recibo de un pago
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getReceipt(req, res) {
    try {
      const { receiptNumber } = req.params;
      const receipt = await paymentService.getReceipt(receiptNumber);
      return res.json(successResponse(receipt));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene historial de pagos de un contribuyente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getPaymentHistory(req, res) {
    try {
      const { taxpayerId } = req.params;
      const history = await paymentService.getPaymentHistory(taxpayerId, req.query);
      return res.json(successResponse(history));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Verifica el estado de un código de pago
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async verifyPaymentCode(req, res) {
    try {
      const { paymentCode } = req.params;
      const verification = await paymentService.verifyPaymentCode(paymentCode);
      return res.json(successResponse(verification));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }
}

export default new PaymentController();
