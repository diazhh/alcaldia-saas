/**
 * Controlador para gestión de movimientos de bienes
 */

import * as movementsService from '../services/movements.service.js';

async function getAllMovements(req, res) {
  try {
    const result = await movementsService.getAllMovements(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMovementById(req, res) {
  try {
    const movement = await movementsService.getMovementById(req.params.id);
    res.json(movement);
  } catch (error) {
    if (error.message === 'Movimiento no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

async function createMovement(req, res) {
  try {
    const movement = await movementsService.createMovement(req.body, req.user.id);
    res.status(201).json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function approveMovement(req, res) {
  try {
    const movement = await movementsService.approveMovement(req.params.id, req.user.id);
    res.json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function completeMovement(req, res) {
  try {
    const movement = await movementsService.completeMovement(req.params.id, req.user.id);
    res.json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function rejectMovement(req, res) {
  try {
    const movement = await movementsService.rejectMovement(req.params.id, req.user.id);
    res.json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function cancelMovement(req, res) {
  try {
    const movement = await movementsService.cancelMovement(req.params.id);
    res.json(movement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getAssetHistory(req, res) {
  try {
    const history = await movementsService.getAssetMovementHistory(req.params.assetId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  getAllMovements,
  getMovementById,
  createMovement,
  approveMovement,
  completeMovement,
  rejectMovement,
  cancelMovement,
  getAssetHistory,
};
