/**
 * Controlador para gestión de bienes municipales
 */

import * as assetsService from '../services/assets.service.js';

/**
 * Obtiene todos los bienes
 */
async function getAllAssets(req, res) {
  try {
    const result = await assetsService.getAllAssets(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Obtiene un bien por ID
 */
async function getAssetById(req, res) {
  try {
    const asset = await assetsService.getAssetById(req.params.id);
    res.json(asset);
  } catch (error) {
    if (error.message === 'Bien no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Crea un nuevo bien
 */
async function createAsset(req, res) {
  try {
    const asset = await assetsService.createAsset(req.body, req.user.id);
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * Actualiza un bien
 */
async function updateAsset(req, res) {
  try {
    const asset = await assetsService.updateAsset(req.params.id, req.body);
    res.json(asset);
  } catch (error) {
    if (error.message === 'Bien no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
}

/**
 * Elimina un bien
 */
async function deleteAsset(req, res) {
  try {
    await assetsService.deleteAsset(req.params.id);
    res.json({ message: 'Bien eliminado exitosamente' });
  } catch (error) {
    if (error.message === 'Bien no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Actualiza la depreciación de todos los bienes
 */
async function updateDepreciations(req, res) {
  try {
    const updated = await assetsService.updateAllDepreciations();
    res.json({ 
      message: 'Depreciaciones actualizadas exitosamente',
      updated 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Obtiene estadísticas de bienes
 */
async function getStats(req, res) {
  try {
    const stats = await assetsService.getAssetStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  updateDepreciations,
  getStats,
};
