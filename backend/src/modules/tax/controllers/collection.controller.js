/**
 * @fileoverview Controlador para gestión de cobranza tributaria
 * @module tax/controllers/collection
 */

import collectionService from '../services/collection.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Controlador para gestión de cobranza
 */
class CollectionController {
  /**
   * Identifica automáticamente contribuyentes morosos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async identifyDefaulters(req, res) {
    try {
      const result = await collectionService.identifyDefaulters();
      return successResponse(
        res,
        result,
        `Identificados ${result.identified} casos de cobranza`
      );
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene todos los casos de cobranza con filtros
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCollections(req, res) {
    try {
      const result = await collectionService.getCollections(req.query);
      return res.json(successResponse(result));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene un caso de cobranza por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCollectionById(req, res) {
    try {
      const collection = await collectionService.getCollectionById(req.params.id);
      return res.json(successResponse(collection));
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /**
   * Registra una acción de cobranza
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async registerAction(req, res) {
    try {
      const { id } = req.params;
      const action = await collectionService.registerAction(id, req.body);
      return res.status(201).json(successResponse(action, 'Acción registrada exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Envía notificaciones escalonadas a morosos
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendNotifications(req, res) {
    try {
      const result = await collectionService.sendNotifications(req.body);
      return successResponse(
        res,
        result,
        `${result.sent} notificaciones enviadas exitosamente`
      );
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Crea un convenio de pago
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async createPaymentPlan(req, res) {
    try {
      const { id } = req.params;
      const plan = await collectionService.createPaymentPlan(id, req.body);
      return res.json(successResponse(plan, 'Convenio de pago creado exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Calcula intereses moratorios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async calculateLateInterest(req, res) {
    try {
      const { billId } = req.params;
      const calculation = await collectionService.calculateLateInterest(billId);
      return res.json(successResponse(calculation));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene estadísticas de cobranza
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getCollectionStatistics(req, res) {
    try {
      const stats = await collectionService.getCollectionStatistics();
      return res.json(successResponse(stats));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Cierra un caso de cobranza
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async closeCollection(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json(errorResponse('Debe proporcionar una razón para cerrar el caso'));
      }

      const closed = await collectionService.closeCollection(id, reason);
      return res.json(successResponse(closed, 'Caso de cobranza cerrado exitosamente'));
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }
}

export default new CollectionController();
