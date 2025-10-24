/**
 * @fileoverview Controlador para gestión de solvencias municipales
 * @module tax/controllers/solvency
 */

import solvencyService from '../services/solvency.service.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

/**
 * Controlador para gestión de solvencias
 */
class SolvencyController {
  /**
   * Verifica si un contribuyente está solvente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async checkSolvency(req, res) {
    try {
      const { taxpayerId } = req.params;
      const { solvencyType } = req.query;
      const check = await solvencyService.checkSolvency(taxpayerId, solvencyType);
      return successResponse(res, check);
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Genera una solvencia municipal
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async generateSolvency(req, res) {
    try {
      const solvency = await solvencyService.generateSolvency(req.body);
      return successResponse(res, solvency, 'Solvencia generada exitosamente', 201);
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene todas las solvencias con filtros
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSolvencies(req, res) {
    try {
      const result = await solvencyService.getSolvencies(req.query);
      return successResponse(res, result);
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene una solvencia por ID
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSolvencyById(req, res) {
    try {
      const solvency = await solvencyService.getSolvencyById(req.params.id);
      return successResponse(res, solvency);
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene una solvencia por número
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSolvencyByNumber(req, res) {
    try {
      const { solvencyNumber } = req.params;
      const solvency = await solvencyService.getSolvencyByNumber(solvencyNumber);
      return successResponse(res, solvency);
    } catch (error) {
      return res.status(404).json(errorResponse(error.message));
    }
  }

  /**
   * Verifica una solvencia por código QR
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async verifySolvencyByQR(req, res) {
    try {
      const { qrCode } = req.params;
      const verification = await solvencyService.verifySolvencyByQR(qrCode);
      return successResponse(res, verification);
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Revoca una solvencia
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async revokeSolvency(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json(errorResponse('Debe proporcionar una razón para revocar la solvencia'));
      }

      const revoked = await solvencyService.revokeSolvency(id, reason);
      return successResponse(res, revoked, 'Solvencia revocada exitosamente');
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene estadísticas de solvencias
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getSolvencyStatistics(req, res) {
    try {
      const stats = await solvencyService.getSolvencyStatistics(req.query);
      return successResponse(res, stats);
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }

  /**
   * Obtiene solvencias próximas a vencer
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getExpiringsSolvencies(req, res) {
    try {
      const { days } = req.query;
      const solvencies = await solvencyService.getExpiringsSolvencies(
        days ? parseInt(days) : 30
      );
      return successResponse(res, solvencies);
    } catch (error) {
      return res.status(500).json(errorResponse(error.message));
    }
  }
}

export default new SolvencyController();
