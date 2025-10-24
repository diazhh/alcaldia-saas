import * as documentService from '../services/documentService.js';
import { successResponse, errorResponse } from '../../../shared/utils/response.js';

export const createDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const document = await documentService.createDocument(req.params.projectId, req.body, userId);
    return successResponse(res, document, 'Documento creado exitosamente', 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getDocumentsByProject = async (req, res) => {
  try {
    const { type } = req.query;
    const documents = await documentService.getDocumentsByProject(req.params.projectId, type);
    return successResponse(res, documents, 'Documentos obtenidos exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    return successResponse(res, document, 'Documento obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateDocument = async (req, res) => {
  try {
    const document = await documentService.updateDocument(req.params.id, req.body);
    return successResponse(res, document, 'Documento actualizado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteDocument = async (req, res) => {
  try {
    await documentService.deleteDocument(req.params.id);
    return successResponse(res, null, 'Documento eliminado exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const getDocumentCountByType = async (req, res) => {
  try {
    const counts = await documentService.getDocumentCountByType(req.params.projectId);
    return successResponse(res, counts, 'Conteo obtenido exitosamente');
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
