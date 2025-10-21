/**
 * Servicio de Firma Electrónica/Digital
 * Gestiona firmas electrónicas y digitales de documentos
 */

import prisma from '../../../config/database.js';
import crypto from 'crypto';
import { NotFoundError, ValidationError } from '../../../shared/utils/errors.js';

/**
 * Generar hash del documento
 */
function generateDocumentHash(documentContent, algorithm = 'SHA-256') {
  const hash = crypto.createHash('sha256');
  hash.update(documentContent);
  return hash.digest('hex');
}

/**
 * Generar timestamp token (simulado)
 */
function generateTimestampToken() {
  const timestamp = new Date().toISOString();
  const token = crypto.randomBytes(32).toString('hex');
  return `TS-${timestamp}-${token}`;
}

/**
 * Crear firma electrónica
 */
async function createSignature(data, userId) {
  // Verificar que el documento existe
  const document = await prisma.document.findUnique({
    where: { id: data.documentId },
  });
  
  if (!document) {
    throw new NotFoundError('Documento no encontrado');
  }
  
  // Obtener información del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }
  
  // Generar hash del documento
  const documentHash = generateDocumentHash(document.id + document.documentNumber);
  
  // Generar timestamp token
  const timestampToken = generateTimestampToken();
  
  const signature = await prisma.electronicSignature.create({
    data: {
      documentId: data.documentId,
      signerId: userId,
      signerName: `${user.firstName} ${user.lastName}`,
      signerPosition: data.signerPosition,
      signatureType: data.signatureType || 'SIMPLE',
      signatureData: data.signatureData,
      certificateId: data.certificateId,
      documentHash,
      algorithm: 'SHA-256',
      timestampToken,
      signOrder: data.signOrder,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: 'SIGNED',
      signedAt: new Date(),
      isVerified: true,
      verifiedAt: new Date(),
    },
  });
  
  // Actualizar estado del documento
  await prisma.document.update({
    where: { id: data.documentId },
    data: {
      status: 'SIGNED',
    },
  });
  
  return signature;
}

/**
 * Obtener firma por ID
 */
async function getSignatureById(id) {
  const signature = await prisma.electronicSignature.findUnique({
    where: { id },
    include: {
      document: {
        select: {
          id: true,
          documentNumber: true,
          title: true,
          type: true,
        },
      },
    },
  });
  
  if (!signature) {
    throw new NotFoundError('Firma no encontrada');
  }
  
  return signature;
}

/**
 * Listar firmas de un documento
 */
async function getDocumentSignatures(documentId) {
  const signatures = await prisma.electronicSignature.findMany({
    where: { documentId },
    orderBy: [
      { signOrder: 'asc' },
      { signedAt: 'asc' },
    ],
  });
  
  return signatures;
}

/**
 * Verificar firma
 */
async function verifySignature(id) {
  const signature = await getSignatureById(id);
  
  // Verificar hash del documento
  const document = await prisma.document.findUnique({
    where: { id: signature.documentId },
  });
  
  const currentHash = generateDocumentHash(document.id + document.documentNumber);
  
  const isValid = currentHash === signature.documentHash;
  
  return {
    signatureId: signature.id,
    isValid,
    signedAt: signature.signedAt,
    signerName: signature.signerName,
    documentHash: signature.documentHash,
    currentHash,
    timestampToken: signature.timestampToken,
  };
}

/**
 * Solicitar firma a múltiples usuarios
 */
async function requestSignatures(documentId, signers) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  
  if (!document) {
    throw new NotFoundError('Documento no encontrado');
  }
  
  const signatureRequests = signers.map((signer, index) => ({
    documentId,
    signerId: signer.userId,
    signerName: signer.name,
    signerPosition: signer.position,
    signatureType: 'SIMPLE',
    documentHash: generateDocumentHash(document.id + document.documentNumber),
    algorithm: 'SHA-256',
    signOrder: index + 1,
    status: 'PENDING',
  }));
  
  const created = await prisma.electronicSignature.createMany({
    data: signatureRequests,
  });
  
  // Actualizar documento
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: 'PENDING_SIGNATURE',
    },
  });
  
  return created;
}

/**
 * Obtener firmas pendientes de un usuario
 */
async function getPendingSignatures(userId) {
  const signatures = await prisma.electronicSignature.findMany({
    where: {
      signerId: userId,
      status: 'PENDING',
    },
    include: {
      document: {
        select: {
          id: true,
          documentNumber: true,
          title: true,
          type: true,
          documentDate: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return signatures;
}

/**
 * Rechazar firma
 */
async function rejectSignature(id, reason) {
  const signature = await getSignatureById(id);
  
  const updated = await prisma.electronicSignature.update({
    where: { id },
    data: {
      status: 'REJECTED',
    },
  });
  
  // Actualizar documento
  await prisma.document.update({
    where: { id: signature.documentId },
    data: {
      status: 'REJECTED',
    },
  });
  
  return updated;
}

/**
 * Eliminar firma
 */
async function deleteSignature(id) {
  await getSignatureById(id);
  
  await prisma.electronicSignature.delete({
    where: { id },
  });
}

export {
  createSignature,
  getSignatureById,
  getDocumentSignatures,
  verifySignature,
  requestSignatures,
  getPendingSignatures,
  rejectSignature,
  deleteSignature,
};
