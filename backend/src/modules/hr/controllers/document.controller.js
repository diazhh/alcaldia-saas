import { PrismaClient } from '@prisma/client';
import { successResponse } from '../../../shared/utils/response.js';

const prisma = new PrismaClient();

async function getByEmployee(req, res, next) {
  try {
    const documents = await prisma.employeeDocument.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { uploadDate: 'desc' },
    });
    res.json(successResponse(documents, 'Documentos obtenidos exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function upload(req, res, next) {
  try {
    const document = await prisma.employeeDocument.create({
      data: {
        ...req.body,
        uploadedBy: req.user.id,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
      },
    });
    res.status(201).json(successResponse(document, 'Documento subido exitosamente'));
  } catch (error) {
    next(error);
  }
}

async function deleteDocument(req, res, next) {
  try {
    await prisma.employeeDocument.delete({ where: { id: req.params.id } });
    res.json(successResponse(null, 'Documento eliminado exitosamente'));
  } catch (error) {
    next(error);
  }
}

export { getByEmployee, upload, deleteDocument as delete };
