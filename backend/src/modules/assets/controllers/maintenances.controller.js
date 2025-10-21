/**
 * Controlador para gestión de mantenimientos de bienes
 */

import * as maintenancesService from '../services/maintenances.service.js';

async function getAllMaintenances(req, res) {
  try {
    const result = await maintenancesService.getAllMaintenances(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMaintenanceById(req, res) {
  try {
    const maintenance = await maintenancesService.getMaintenanceById(req.params.id);
    res.json(maintenance);
  } catch (error) {
    if (error.message === 'Mantenimiento no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

async function createMaintenance(req, res) {
  try {
    const maintenance = await maintenancesService.createMaintenance(req.body);
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateMaintenance(req, res) {
  try {
    const maintenance = await maintenancesService.updateMaintenance(req.params.id, req.body);
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function startMaintenance(req, res) {
  try {
    const maintenance = await maintenancesService.startMaintenance(req.params.id);
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function completeMaintenance(req, res) {
  try {
    const maintenance = await maintenancesService.completeMaintenance(req.params.id);
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function cancelMaintenance(req, res) {
  try {
    const maintenance = await maintenancesService.cancelMaintenance(req.params.id);
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteMaintenance(req, res) {
  try {
    await maintenancesService.deleteMaintenance(req.params.id);
    res.json({ message: 'Mantenimiento eliminado exitosamente' });
  } catch (error) {
    if (error.message === 'Mantenimiento no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

async function getAssetHistory(req, res) {
  try {
    const history = await maintenancesService.getAssetMaintenanceHistory(req.params.assetId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getStats(req, res) {
  try {
    const stats = await maintenancesService.getMaintenanceStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  getAllMaintenances,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  startMaintenance,
  completeMaintenance,
  cancelMaintenance,
  deleteMaintenance,
  getAssetHistory,
  getStats,
};
