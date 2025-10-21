/**
 * Integration tests for Signatures API
 */

import request from 'supertest';
import app from '../../../src/server.js';
import { getPrismaClient, cleanupTestData } from '../../helpers/prisma.js';

const prisma = getPrismaClient();

describe('Signatures API', () => {
  let authToken;
  let testUser;
  let testDocument;

  beforeAll(async () => {
    // Authenticate
    testUser = await prisma.user.findFirst({
      where: { email: 'admin@municipal.gob.ve' },
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@municipal.gob.ve',
        password: 'Admin123!',
      });

    authToken = loginResponse.body.data.token;

    // Create test document
    testDocument = await prisma.document.create({
      data: {
        title: 'Test Document for Signatures',
        content: 'Test content',
        type: 'OTHER',
        createdById: testUser.id,
      },
    });
  });

  afterAll(async () => {
    // Cleanup usando helper
    await cleanupTestData(prisma, {
      documentId: testDocument?.id,
    });
    // No desconectar aquí - se hace al final de todos los tests
  });

  describe('POST /api/documents/signatures/request', () => {
    it('should request signatures for a document', async () => {
      const response = await request(app)
        .post('/api/documents/signatures/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId: testDocument.id,
          signers: [
            {
              userId: testUser.id,
              order: 1,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('order', 1);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/documents/signatures/request')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId: testDocument.id,
          // Missing signers
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/documents/signatures/pending', () => {
    it('should list pending signatures for current user', async () => {
      const response = await request(app)
        .get('/api/documents/signatures/pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/documents/signatures', () => {
    let pendingSignature;

    beforeEach(async () => {
      // Create a pending signature
      pendingSignature = await prisma.signature.create({
        data: {
          documentId: testDocument.id,
          signerId: testUser.id,
          order: 1,
          status: 'PENDING',
          requestedAt: new Date(),
        },
      });
    });

    afterEach(async () => {
      await prisma.signature.deleteMany({
        where: { id: pendingSignature.id },
      });
    });

    it('should sign a document', async () => {
      const response = await request(app)
        .post('/api/documents/signatures')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId: testDocument.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SIGNED');
      expect(response.body.data).toHaveProperty('signedAt');
      expect(response.body.data).toHaveProperty('signatureHash');
    });
  });

  describe('POST /api/documents/signatures/:id/reject', () => {
    let pendingSignature;

    beforeEach(async () => {
      pendingSignature = await prisma.signature.create({
        data: {
          documentId: testDocument.id,
          signerId: testUser.id,
          order: 1,
          status: 'PENDING',
          requestedAt: new Date(),
        },
      });
    });

    it('should reject a signature with reason', async () => {
      const response = await request(app)
        .post(`/api/documents/signatures/${pendingSignature.id}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Document needs revision',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');
      expect(response.body.data.rejectionReason).toBe('Document needs revision');
    });

    it('should require rejection reason', async () => {
      const response = await request(app)
        .post(`/api/documents/signatures/${pendingSignature.id}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/documents/signatures/:id/verify', () => {
    let signedSignature;

    beforeAll(async () => {
      signedSignature = await prisma.signature.create({
        data: {
          documentId: testDocument.id,
          signerId: testUser.id,
          order: 1,
          status: 'SIGNED',
          requestedAt: new Date(),
          signedAt: new Date(),
          signatureHash: 'test-hash-123',
        },
      });
    });

    afterAll(async () => {
      await prisma.signature.delete({
        where: { id: signedSignature.id },
      });
    });

    it('should verify a signature', async () => {
      const response = await request(app)
        .get(`/api/documents/signatures/${signedSignature.id}/verify`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('valid');
      expect(response.body.data).toHaveProperty('signatureHash');
    });
  });

  describe('GET /api/documents/:documentId/signatures', () => {
    it('should list all signatures for a document', async () => {
      const response = await request(app)
        .get(`/api/documents/${testDocument.id}/signatures`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
