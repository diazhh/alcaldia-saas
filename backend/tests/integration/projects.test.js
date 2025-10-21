import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Projects API - Integration Tests', () => {
  let authToken;
  let adminToken;
  let testProject;
  let testMilestone;
  let testExpense;

  beforeAll(async () => {
    // Login como admin para obtener token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@municipal.gob.ve',
        password: 'Admin123!',
      });

    adminToken = loginRes.body.data.token;
    authToken = adminToken;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (testProject) {
      await prisma.project.deleteMany({
        where: { id: testProject.id },
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/projects', () => {
    test('debe crear un proyecto con datos válidos', async () => {
      const projectData = {
        name: 'Proyecto de Integración Test',
        description: 'Descripción del proyecto de prueba',
        budget: 100000,
        priority: 'HIGH',
        startDate: new Date('2025-01-01').toISOString(),
        endDate: new Date('2025-12-31').toISOString(),
        location: 'Sector Centro, Calle Principal',
        latitude: 10.4806,
        longitude: -66.9036,
        sector: 'Centro',
        category: 'Vialidad',
        beneficiaries: 5000,
        objectives: 'Mejorar la vialidad del sector',
        scope: 'Reparación de 2km de vías',
      };

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(projectData.name);
      expect(res.body.data.code).toMatch(/^PRO-\d{4}-\d{3}$/);

      testProject = res.body.data;
    });

    test('debe retornar 401 sin token de autenticación', async () => {
      const res = await request(app)
        .post('/api/projects')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });

    test('debe retornar 400 con datos inválidos', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'AB', // Nombre muy corto
          budget: -1000, // Presupuesto negativo
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    test('debe obtener lista de proyectos', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('projects');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.projects)).toBe(true);
    });

    test('debe filtrar proyectos por estado', async () => {
      const res = await request(app)
        .get('/api/projects?status=PLANNING')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.projects.forEach(project => {
        expect(project.status).toBe('PLANNING');
      });
    });

    test('debe buscar proyectos por texto', async () => {
      const res = await request(app)
        .get('/api/projects?search=Test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('debe paginar resultados', async () => {
      const res = await request(app)
        .get('/api/projects?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/projects/:id', () => {
    test('debe obtener un proyecto por ID', async () => {
      if (testProject) {
        const res = await request(app)
          .get(`/api/projects/${testProject.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(testProject.id);
        expect(res.body.data).toHaveProperty('stats');
      }
    });

    test('debe retornar 404 si el proyecto no existe', async () => {
      const res = await request(app)
        .get('/api/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    test('debe actualizar un proyecto', async () => {
      if (testProject) {
        const updateData = {
          name: 'Proyecto Actualizado via API',
          status: 'IN_PROGRESS',
          priority: 'CRITICAL',
        };

        const res = await request(app)
          .put(`/api/projects/${testProject.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe(updateData.name);
        expect(res.body.data.status).toBe(updateData.status);
      }
    });
  });

  describe('GET /api/projects/stats/general', () => {
    test('debe obtener estadísticas generales', async () => {
      const res = await request(app)
        .get('/api/projects/stats/general')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('byStatus');
      expect(res.body.data).toHaveProperty('totalBudget');
    });
  });

  describe('POST /api/projects/:projectId/milestones', () => {
    test('debe crear un hito para un proyecto', async () => {
      if (testProject) {
        const milestoneData = {
          name: 'Hito de Prueba',
          description: 'Descripción del hito',
          dueDate: new Date('2025-06-30').toISOString(),
          order: 1,
        };

        const res = await request(app)
          .post(`/api/projects/${testProject.id}/milestones`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(milestoneData);

        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe(milestoneData.name);
        expect(res.body.data.projectId).toBe(testProject.id);

        testMilestone = res.body.data;
      }
    });
  });

  describe('GET /api/projects/:projectId/milestones', () => {
    test('debe obtener todos los hitos de un proyecto', async () => {
      if (testProject) {
        const res = await request(app)
          .get(`/api/projects/${testProject.id}/milestones`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });
  });

  describe('PATCH /api/milestones/:id/progress', () => {
    test('debe actualizar el progreso de un hito', async () => {
      if (testMilestone) {
        const res = await request(app)
          .patch(`/api/projects/milestones/${testMilestone.id}/progress`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ progress: 50 });

        expect(res.status).toBe(200);
        expect(res.body.data.progress).toBe(50);
      }
    });
  });

  describe('POST /api/projects/:projectId/expenses', () => {
    test('debe crear un gasto para un proyecto', async () => {
      if (testProject) {
        const expenseData = {
          concept: 'Compra de materiales',
          description: 'Cemento y arena',
          amount: 5000,
          date: new Date().toISOString(),
          category: 'Materiales',
          invoice: 'INV-001',
          supplier: 'Ferretería Central',
        };

        const res = await request(app)
          .post(`/api/projects/${testProject.id}/expenses`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(expenseData);

        expect(res.status).toBe(201);
        expect(res.body.data.concept).toBe(expenseData.concept);
        expect(parseFloat(res.body.data.amount)).toBe(expenseData.amount);

        testExpense = res.body.data;
      }
    });

    test('debe rechazar gasto que exceda el presupuesto', async () => {
      if (testProject) {
        const expenseData = {
          concept: 'Gasto excesivo',
          amount: 999999999,
          date: new Date().toISOString(),
          category: 'Otros',
        };

        const res = await request(app)
          .post(`/api/projects/${testProject.id}/expenses`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(expenseData);

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('presupuesto');
      }
    });
  });

  describe('GET /api/projects/:projectId/expenses/stats', () => {
    test('debe obtener estadísticas de gastos', async () => {
      if (testProject) {
        const res = await request(app)
          .get(`/api/projects/${testProject.id}/expenses/stats`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('total');
        expect(res.body.data).toHaveProperty('count');
        expect(res.body.data).toHaveProperty('byCategory');
      }
    });
  });

  describe('DELETE /api/projects/:id', () => {
    test('debe eliminar un proyecto', async () => {
      if (testProject) {
        const res = await request(app)
          .delete(`/api/projects/${testProject.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);

        // Verificar que fue eliminado
        const checkRes = await request(app)
          .get(`/api/projects/${testProject.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(checkRes.status).toBe(404);

        testProject = null;
      }
    });
  });
});
