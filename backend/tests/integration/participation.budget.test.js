/**
 * Tests de integración para API de Presupuesto Participativo
 */

import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';

describe('API de Presupuesto Participativo', () => {
  let adminToken;
  let testBudget;
  let testProposal;
  
  beforeAll(async () => {
    // Obtener token de admin
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@municipal.gob.ve',
        password: 'Admin123!'
      });
    adminToken = adminResponse.body.data.token;
  });
  
  afterAll(async () => {
    // Limpiar datos de prueba
    if (testProposal) {
      await prisma.proposalVote.deleteMany({
        where: { proposalId: testProposal.id }
      });
      await prisma.budgetProposal.deleteMany({
        where: { budgetId: testBudget.id }
      });
    }
    if (testBudget) {
      await prisma.participatoryBudget.deleteMany({
        where: { id: testBudget.id }
      });
    }
    await prisma.$disconnect();
  });
  
  describe('POST /api/participation/participatory-budgets', () => {
    it('debe crear una convocatoria de presupuesto participativo', async () => {
      const budgetData = {
        title: 'Presupuesto Participativo 2025',
        description: 'Convocatoria para proyectos comunitarios del año 2025',
        year: 2025,
        totalBudget: 5000000,
        proposalStartDate: new Date('2025-01-01').toISOString(),
        proposalEndDate: new Date('2025-02-28').toISOString(),
        evaluationStartDate: new Date('2025-03-01').toISOString(),
        evaluationEndDate: new Date('2025-03-31').toISOString(),
        votingStartDate: new Date('2025-04-01').toISOString(),
        votingEndDate: new Date('2025-04-30').toISOString(),
        allowMultipleVotes: false,
        maxVotesPerCitizen: 1,
        requiresRegistration: true
      };
      
      const response = await request(app)
        .post('/api/participation/participatory-budgets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(budgetData);
      
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(budgetData.title);
      expect(response.body.data.year).toBe(2025);
      expect(response.body.data.status).toBe('DRAFT');
      
      testBudget = response.body.data;
    });
    
    it('debe rechazar convocatoria duplicada para el mismo año', async () => {
      const budgetData = {
        title: 'Otra convocatoria 2025',
        description: 'Descripción',
        year: 2025,
        totalBudget: 1000000,
        proposalStartDate: new Date('2025-01-01').toISOString(),
        proposalEndDate: new Date('2025-02-28').toISOString(),
        evaluationStartDate: new Date('2025-03-01').toISOString(),
        evaluationEndDate: new Date('2025-03-31').toISOString(),
        votingStartDate: new Date('2025-04-01').toISOString(),
        votingEndDate: new Date('2025-04-30').toISOString()
      };
      
      // Primero activar la convocatoria existente
      await request(app)
        .put(`/api/participation/participatory-budgets/${testBudget.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACTIVE' });
      
      const response = await request(app)
        .post('/api/participation/participatory-budgets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(budgetData);
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/participation/participatory-budgets', () => {
    it('debe listar convocatorias (público)', async () => {
      const response = await request(app)
        .get('/api/participation/participatory-budgets');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('debe filtrar por año', async () => {
      const response = await request(app)
        .get('/api/participation/participatory-budgets?year=2025');
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(b => b.year === 2025)).toBe(true);
    });
  });
  
  describe('GET /api/participation/participatory-budgets/:id', () => {
    it('debe obtener una convocatoria por ID', async () => {
      const response = await request(app)
        .get(`/api/participation/participatory-budgets/${testBudget.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testBudget.id);
    });
  });
  
  describe('PUT /api/participation/participatory-budgets/:id', () => {
    it('debe actualizar una convocatoria', async () => {
      const response = await request(app)
        .put(`/api/participation/participatory-budgets/${testBudget.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          totalBudget: 6000000,
          status: 'APPROVED'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.totalBudget).toBe('6000000.00');
      expect(response.body.data.status).toBe('APPROVED');
    });
  });
  
  describe('POST /api/participation/participatory-budgets/:budgetId/proposals', () => {
    it('debe crear una propuesta de proyecto (público)', async () => {
      // Primero ajustar fechas para permitir propuestas
      await request(app)
        .put(`/api/participation/participatory-budgets/${testBudget.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          proposalStartDate: new Date(Date.now() - 86400000).toISOString(), // Ayer
          proposalEndDate: new Date(Date.now() + 86400000 * 30).toISOString() // +30 días
        });
      
      const proposalData = {
        budgetId: testBudget.id,
        title: 'Parque Infantil en Sector Norte',
        description: 'Construcción de un parque infantil con juegos seguros y áreas verdes para los niños del sector',
        objectives: 'Proporcionar un espacio recreativo seguro para los niños de la comunidad',
        beneficiaries: 500,
        location: 'Sector Norte, Calle 15',
        sector: 'Norte',
        latitude: 10.5,
        longitude: -66.9,
        estimatedCost: 150000,
        proposerName: 'María González',
        proposerEmail: 'maria@example.com',
        proposerPhone: '04141234567',
        organizationName: 'Consejo Comunal Norte'
      };
      
      const response = await request(app)
        .post(`/api/participation/participatory-budgets/${testBudget.id}/proposals`)
        .send(proposalData);
      
      expect(response.status).toBe(201);
      expect(response.body.data.proposalNumber).toMatch(/^PP-2025-\d{3}$/);
      expect(response.body.data.status).toBe('SUBMITTED');
      
      testProposal = response.body.data;
    });
    
    it('debe rechazar propuesta fuera del período', async () => {
      // Cambiar fechas para cerrar período
      await request(app)
        .put(`/api/participation/participatory-budgets/${testBudget.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          proposalStartDate: new Date('2024-01-01').toISOString(),
          proposalEndDate: new Date('2024-02-28').toISOString()
        });
      
      const proposalData = {
        budgetId: testBudget.id,
        title: 'Otra propuesta',
        description: 'Descripción de otra propuesta que debería ser rechazada',
        objectives: 'Objetivos del proyecto',
        location: 'Ubicación',
        sector: 'Centro',
        estimatedCost: 100000,
        proposerName: 'Juan Pérez',
        proposerEmail: 'juan@example.com',
        proposerPhone: '04141234567'
      };
      
      const response = await request(app)
        .post(`/api/participation/participatory-budgets/${testBudget.id}/proposals`)
        .send(proposalData);
      
      expect(response.status).toBe(400);
      
      // Restaurar fechas
      await request(app)
        .put(`/api/participation/participatory-budgets/${testBudget.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          proposalStartDate: new Date(Date.now() - 86400000).toISOString(),
          proposalEndDate: new Date(Date.now() + 86400000 * 30).toISOString()
        });
    });
  });
  
  describe('GET /api/participation/participatory-budgets/:budgetId/proposals', () => {
    it('debe listar propuestas de una convocatoria', async () => {
      const response = await request(app)
        .get(`/api/participation/participatory-budgets/${testBudget.id}/proposals`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/participation/proposals/:id', () => {
    it('debe obtener una propuesta por ID', async () => {
      const response = await request(app)
        .get(`/api/participation/proposals/${testProposal.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testProposal.id);
    });
  });
  
  describe('POST /api/participation/proposals/:id/evaluate', () => {
    it('debe evaluar técnicamente una propuesta', async () => {
      // Ajustar fechas de evaluación
      await request(app)
        .put(`/api/participation/participatory-budgets/${testBudget.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          evaluationStartDate: new Date(Date.now() - 86400000).toISOString(),
          evaluationEndDate: new Date(Date.now() + 86400000 * 30).toISOString()
        });
      
      const response = await request(app)
        .post(`/api/participation/proposals/${testProposal.id}/evaluate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isFeasible: true,
          technicalCost: 180000,
          technicalNotes: 'Proyecto viable. Costo ajustado según evaluación técnica.',
          status: 'APPROVED'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.isFeasible).toBe(true);
      expect(response.body.data.technicalCost).toBe('180000.00');
    });
  });
  
  describe('POST /api/participation/proposals/:id/vote', () => {
    it('debe registrar un voto por una propuesta', async () => {
      // Ajustar fechas de votación
      await request(app)
        .put(`/api/participation/participatory-budgets/${testBudget.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          votingStartDate: new Date(Date.now() - 86400000).toISOString(),
          votingEndDate: new Date(Date.now() + 86400000 * 30).toISOString()
        });
      
      const response = await request(app)
        .post(`/api/participation/proposals/${testProposal.id}/vote`)
        .send({
          voterIdNumber: 'V12345678',
          voterName: 'Carlos Rodríguez',
          voterEmail: 'carlos@example.com'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data.voterIdNumber).toBe('V12345678');
    });
    
    it('debe rechazar voto duplicado', async () => {
      const response = await request(app)
        .post(`/api/participation/proposals/${testProposal.id}/vote`)
        .send({
          voterIdNumber: 'V12345678',
          voterName: 'Carlos Rodríguez'
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/participation/participatory-budgets/:id/stats', () => {
    it('debe obtener estadísticas de una convocatoria', async () => {
      const response = await request(app)
        .get(`/api/participation/participatory-budgets/${testBudget.id}/stats`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalProposals');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('totalVotes');
      expect(response.body.data).toHaveProperty('uniqueVoters');
    });
  });
  
  describe('POST /api/participation/participatory-budgets/:id/calculate-winners', () => {
    it('debe calcular ganadores de la convocatoria', async () => {
      const response = await request(app)
        .post(`/api/participation/participatory-budgets/${testBudget.id}/calculate-winners`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalProposals');
      expect(response.body.data).toHaveProperty('winners');
      expect(response.body.data).toHaveProperty('allocatedBudget');
    });
  });
});
