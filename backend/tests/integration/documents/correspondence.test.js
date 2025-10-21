/**
 * Integration tests for Correspondence API
 */

import request from 'supertest';
import app from '../../../src/server.js';
import { getPrismaClient } from '../../helpers/prisma.js';

const prisma = getPrismaClient();

describe('Correspondence API', () => {
  let authToken;
  let testUser;
  let testDepartment;

  beforeAll(async () => {
    // Create test user and authenticate
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

    // Create test department
    testDepartment = await prisma.department.create({
      data: {
        name: 'Test Department',
        code: 'TEST-DEPT',
        description: 'Test department for correspondence',
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    try {
      await prisma.correspondence.deleteMany({
        where: {
          OR: [
            { sender: 'Test Sender' },
            { sender: 'Track Test Sender' },
            { sender: 'Deliver Test Sender' },
          ]
        },
      });
      if (testDepartment?.id) {
        await prisma.department.delete({
          where: { id: testDepartment.id },
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Error en cleanup:', error.message);
    }
    // No desconectar aquí - se hace al final de todos los tests
  });

  describe('POST /api/documents/correspondence/incoming', () => {
    it('should create incoming correspondence', async () => {
      const response = await request(app)
        .post('/api/documents/correspondence/incoming')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sender: 'Test Sender',
          senderAddress: '123 Test St',
          subject: 'Test Subject',
          destinationId: testDepartment.id,
          registrationDate: new Date().toISOString(),
          notes: 'Test notes',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reference');
      expect(response.body.data.type).toBe('INCOMING');
      expect(response.body.data.sender).toBe('Test Sender');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/documents/correspondence/incoming')
        .send({
          sender: 'Test Sender',
          subject: 'Test Subject',
          destinationId: testDepartment.id,
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/documents/correspondence/incoming')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sender: 'Test Sender',
          // Missing subject and destinationId
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/documents/correspondence', () => {
    it('should list correspondence', async () => {
      const response = await request(app)
        .get('/api/documents/correspondence')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/documents/correspondence?type=INCOMING')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach((item) => {
        expect(item.type).toBe('INCOMING');
      });
    });
  });

  describe('GET /api/documents/correspondence/track/:identifier', () => {
    let testCorrespondence;

    beforeAll(async () => {
      // Create correspondence for tracking
      const response = await request(app)
        .post('/api/documents/correspondence/incoming')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sender: 'Track Test Sender',
          subject: 'Track Test Subject',
          destinationId: testDepartment.id,
          registrationDate: new Date().toISOString(),
        });

      testCorrespondence = response.body.data;
    });

    it('should track correspondence by reference', async () => {
      const response = await request(app)
        .get(`/api/documents/correspondence/track/${testCorrespondence.reference}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reference).toBe(testCorrespondence.reference);
    });

    it('should return 404 for non-existent reference', async () => {
      const response = await request(app)
        .get('/api/documents/correspondence/track/INVALID-REF');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/documents/correspondence/:id/deliver', () => {
    let testCorrespondence;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/documents/correspondence/incoming')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sender: 'Deliver Test Sender',
          subject: 'Deliver Test Subject',
          destinationId: testDepartment.id,
          registrationDate: new Date().toISOString(),
        });

      testCorrespondence = response.body.data;
    });

    it('should mark correspondence as delivered', async () => {
      const response = await request(app)
        .post(`/api/documents/correspondence/${testCorrespondence.id}/deliver`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          receivedBy: 'John Doe',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('DELIVERED');
      expect(response.body.data.deliveredAt).toBeTruthy();
    });
  });

  describe('GET /api/documents/correspondence/stats', () => {
    it('should return correspondence statistics', async () => {
      const response = await request(app)
        .get('/api/documents/correspondence/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('incomingToday');
      expect(response.body.data).toHaveProperty('outgoingToday');
      expect(response.body.data).toHaveProperty('pending');
      expect(response.body.data).toHaveProperty('delivered');
    });
  });
});
