/**
 * Controlador de Firmas Electrónicas
 */

import * as signatureService from '../services/signature.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function create(req, res, next) {
  try {
    const signatureData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    };
    const signature = await signatureService.createSignature(signatureData, req.user.id);
    res.status(201).json(successResponse(signature, 'Documento firmado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const signature = await signatureService.getSignatureById(req.params.id);
    res.json(successResponse(signature));
  } catch (error) {
    next(error);
  }
}

async function getDocumentSignatures(req, res, next) {
  try {
    const signatures = await signatureService.getDocumentSignatures(req.params.documentId);
    res.json(successResponse(signatures));
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const verification = await signatureService.verifySignature(req.params.id);
    res.json(successResponse(verification));
  } catch (error) {
    next(error);
  }
}

async function requestSignatures(req, res, next) {
  try {
    const { documentId, signers } = req.body;
    const result = await signatureService.requestSignatures(documentId, signers);
    res.status(201).json(successResponse(result, 'Solicitudes de firma enviadas'));
  } catch (error) {
    next(error);
  }
}

async function getPending(req, res, next) {
  try {
    const signatures = await signatureService.getPendingSignatures(req.user.id);
    res.json(successResponse(signatures));
  } catch (error) {
    next(error);
  }
}

async function reject(req, res, next) {
  try {
    const { reason } = req.body;
    const signature = await signatureService.rejectSignature(req.params.id, reason);
    res.json(successResponse(signature, 'Firma rechazada'));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await signatureService.deleteSignature(req.params.id);
    res.json(successResponse(null, 'Firma eliminada exitosamente'));
  } catch (error) {
    next(error);
  }
}

export {
  create,
  getById,
  getDocumentSignatures,
  verify,
  requestSignatures,
  getPending,
  reject,
  remove,
};
