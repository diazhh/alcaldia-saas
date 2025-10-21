/**
 * Controlador para gestión de solicitudes de compra
 */

import * as purchaseRequestsService from '../services/purchase-requests.service.js';

async function getAllRequests(req, res) {
  try {
    const result = await purchaseRequestsService.getAllRequests(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getRequestById(req, res) {
  try {
    const request = await purchaseRequestsService.getRequestById(req.params.id);
    res.json(request);
  } catch (error) {
    if (error.message === 'Solicitud no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

async function createRequest(req, res) {
  try {
    const request = await purchaseRequestsService.createRequest(req.body, req.user.id);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function updateRequest(req, res) {
  try {
    const request = await purchaseRequestsService.updateRequest(req.params.id, req.body);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function approveByHead(req, res) {
  try {
    const request = await purchaseRequestsService.approveByHead(req.params.id, req.user.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function approveByBudget(req, res) {
  try {
    const request = await purchaseRequestsService.approveByBudget(req.params.id, req.user.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function approveByPurchasing(req, res) {
  try {
    const request = await purchaseRequestsService.approveByPurchasing(req.params.id, req.user.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function approveCompletely(req, res) {
  try {
    const request = await purchaseRequestsService.approveCompletely(req.params.id, req.user.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function rejectRequest(req, res) {
  try {
    const { rejectionReason } = req.body;
    const request = await purchaseRequestsService.rejectRequest(
      req.params.id,
      req.user.id,
      rejectionReason
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function cancelRequest(req, res) {
  try {
    const request = await purchaseRequestsService.cancelRequest(req.params.id);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function addQuotation(req, res) {
  try {
    const request = await purchaseRequestsService.addQuotation(req.params.id, req.body);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function generatePurchaseOrder(req, res) {
  try {
    const request = await purchaseRequestsService.generatePurchaseOrder(req.params.id, req.body);
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function markAsReceived(req, res) {
  try {
    const { receivedDate } = req.body;
    const request = await purchaseRequestsService.markAsReceived(
      req.params.id,
      req.user.id,
      receivedDate
    );
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getStats(req, res) {
  try {
    const stats = await purchaseRequestsService.getRequestStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  approveByHead,
  approveByBudget,
  approveByPurchasing,
  approveCompletely,
  rejectRequest,
  cancelRequest,
  addQuotation,
  generatePurchaseOrder,
  markAsReceived,
  getStats,
};
