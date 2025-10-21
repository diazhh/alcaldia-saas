/**
 * Controlador de Documentos y Búsqueda
 */

import * as documentService from '../services/document.service.js';
import { successResponse } from '../../../shared/utils/response.js';

async function create(req, res, next) {
  try {
    const document = await documentService.createDocument(req.body, req.user.id);
    res.status(201).json(successResponse(document, 'Documento creado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    res.json(successResponse(document));
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  try {
    const filters = {
      search: req.query.search,
      type: req.query.type,
      status: req.query.status,
      departmentId: req.query.departmentId,
      folderId: req.query.folderId,
      isPublic: req.query.isPublic === 'true',
      accessLevel: req.query.accessLevel,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      tags: req.query.tags,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    const result = await documentService.searchDocuments(filters);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const document = await documentService.updateDocument(req.params.id, req.body);
    res.json(successResponse(document, 'Documento actualizado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function createVersion(req, res, next) {
  try {
    const version = await documentService.createDocumentVersion(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(201).json(successResponse(version, 'Nueva versión creada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getVersions(req, res, next) {
  try {
    const versions = await documentService.getDocumentVersions(req.params.id);
    res.json(successResponse(versions));
  } catch (error) {
    next(error);
  }
}

async function compareVersions(req, res, next) {
  try {
    const { version1, version2 } = req.query;
    const comparison = await documentService.compareVersions(
      req.params.id,
      parseInt(version1),
      parseInt(version2)
    );
    res.json(successResponse(comparison));
  } catch (error) {
    next(error);
  }
}

async function restoreVersion(req, res, next) {
  try {
    const { versionNumber } = req.body;
    const version = await documentService.restoreVersion(
      req.params.id,
      versionNumber,
      req.user.id
    );
    res.json(successResponse(version, 'Versión restaurada exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function archive(req, res, next) {
  try {
    const document = await documentService.archiveDocument(req.params.id);
    res.json(successResponse(document, 'Documento archivado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await documentService.deleteDocument(req.params.id);
    res.json(successResponse(null, 'Documento eliminado exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const filters = { departmentId: req.query.departmentId };
    const stats = await documentService.getDocumentStats(filters);
    res.json(successResponse(stats));
  } catch (error) {
    next(error);
  }
}

export {
  create,
  getById,
  search,
  update,
  createVersion,
  getVersions,
  compareVersions,
  restoreVersion,
  archive,
  remove,
  getStats,
};
