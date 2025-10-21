/**
 * Controlador para gestión de inventario de almacén
 */

import * as inventoryService from '../services/inventory.service.js';

// ============================================
// ITEMS
// ============================================

async function getAllItems(req, res) {
  try {
    const result = await inventoryService.getAllItems(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getItemById(req, res) {
  try {
    const item = await inventoryService.getItemById(req.params.id);
    res.json(item);
  } catch (error) {
    if (error.message === 'Item no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

async function createItem(req, res) {
  try {
    const item = await inventoryService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateItem(req, res) {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteItem(req, res) {
  try {
    await inventoryService.deleteItem(req.params.id);
    res.json({ message: 'Item desactivado exitosamente' });
  } catch (error) {
    if (error.message === 'Item no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

async function getLowStockItems(req, res) {
  try {
    const items = await inventoryService.getLowStockItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ============================================
// ENTRADAS
// ============================================

async function getAllEntries(req, res) {
  try {
    const result = await inventoryService.getAllEntries(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createEntry(req, res) {
  try {
    const entry = await inventoryService.createEntry(req.body, req.user.id);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ============================================
// SALIDAS
// ============================================

async function getAllExits(req, res) {
  try {
    const result = await inventoryService.getAllExits(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createExit(req, res) {
  try {
    const exit = await inventoryService.createExit(req.body, req.user.id);
    res.status(201).json(exit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ============================================
// ESTADÍSTICAS
// ============================================

async function getStats(req, res) {
  try {
    const stats = await inventoryService.getInventoryStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  // Items
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
  // Entradas
  getAllEntries,
  createEntry,
  // Salidas
  getAllExits,
  createExit,
  // Estadísticas
  getStats,
};
