/**
 * Integration tests for Workflows API
 */

import request from 'supertest';
import app from '../../../src/server.js';
import { getPrismaClient, cleanupTestData } from '../../helpers/prisma.js';

const prisma = getPrismaClient();

describe('Workflows API', () => {
  let authToken;
  let testUser;
  let testDocument;
  let testWorkflowDefinition;

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
        title: 'Test Document for Workflow',
        content: 'Test content',
        type: 'OTHER',
        createdById: testUser.id,
      },
    });
  });

  afterAll(async () => {
    // Cleanup usando helper
    await cleanupTestData(prisma, {
      workflowDefinitionId: testWorkflowDefinition?.id,
      documentId: testDocument?.id,
    });
    // No desconectar aquí - se hace al final de todos los tests
  });

  describe('POST /api/documents/workflows/definitions', () => {
    it('should create a workflow definition', async () => {
      const response = await request(app)
        .post('/api/documents/workflows/definitions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Approval Workflow',
          description: 'Test workflow for document approval',
          documentType: 'MEMO',
          steps: [
            {
              name: 'Initial Review',
              order: 1,
              assignedRole: 'COORDINADOR',
              daysToComplete: 2,
            },
            {
              name: 'Final Approval',
              order: 2,
              assignedRole: 'DIRECTOR',
              daysToComplete: 3,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Approval Workflow');
      expect(response.body.data.steps).toHaveLength(2);

      testWorkflowDefinition = response.body.data;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/documents/workflows/definitions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Workflow',
          // Missing steps
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/documents/workflows/definitions', () => {
    it('should list workflow definitions', async () => {
      const response = await request(app)
        .get('/api/documents/workflows/definitions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/documents/workflows/instances', () => {
    it('should start a workflow instance', async () => {
      const response = await request(app)
        .post('/api/documents/workflows/instances')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          workflowDefinitionId: testWorkflowDefinition.id,
          documentId: testDocument.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
      expect(response.body.data.currentStep).toBe(1);
    });
  });

  describe('GET /api/documents/workflows/steps/pending', () => {
    it('should list pending workflow steps for current user', async () => {
      const response = await request(app)
        .get('/api/documents/workflows/steps/pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/documents/workflows/steps/:stepId/process', () => {
    let workflowInstance;
    let workflowStep;

    beforeEach(async () => {
      // Start a workflow instance
      const instanceResponse = await request(app)
        .post('/api/documents/workflows/instances')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          workflowDefinitionId: testWorkflowDefinition.id,
          documentId: testDocument.id,
        });

      workflowInstance = instanceResponse.body.data;

      // Get the first pending step
      workflowStep = await prisma.workflowStep.findFirst({
        where: {
          instanceId: workflowInstance.id,
          status: 'PENDING',
        },
      });
    });

    it('should approve a workflow step', async () => {
      const response = await request(app)
        .post(`/api/documents/workflows/steps/${workflowStep.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'approve',
          comment: 'Approved for processing',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should reject a workflow step', async () => {
      const response = await request(app)
        .post(`/api/documents/workflows/steps/${workflowStep.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'reject',
          comment: 'Needs revision',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');
    });

    it('should require action parameter', async () => {
      const response = await request(app)
        .post(`/api/documents/workflows/steps/${workflowStep.id}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          comment: 'Test comment',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/documents/workflows/instances/:id/cancel', () => {
    let workflowInstance;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/documents/workflows/instances')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          workflowDefinitionId: testWorkflowDefinition.id,
          documentId: testDocument.id,
        });

      workflowInstance = response.body.data;
    });

    it('should cancel a workflow instance', async () => {
      const response = await request(app)
        .post(`/api/documents/workflows/instances/${workflowInstance.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('CANCELLED');
    });
  });

  describe('GET /api/documents/workflows/instances', () => {
    it('should list workflow instances', async () => {
      const response = await request(app)
        .get('/api/documents/workflows/instances')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/documents/workflows/instances?status=IN_PROGRESS')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach((instance) => {
        expect(instance.status).toBe('IN_PROGRESS');
      });
    });
  });
});
