/**
 * Tests de integración para API de Reportes Ciudadanos
 */

import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';

describe('API de Reportes Ciudadanos (311)', () => {
  let authToken;
  let adminToken;
  let testReport;
  
  beforeAll(async () => {
    // Obtener token de usuario regular
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'empleado@municipal.gob.ve',
        password: 'Admin123!'
      });
    authToken = loginResponse.body.data.token;
    
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
    // Limpiar reportes de prueba
    if (testReport) {
      await prisma.citizenReport.deleteMany({
        where: {
          ticketNumber: {
            startsWith: 'RP-'
          }
        }
      });
    }
    await prisma.$disconnect();
  });
  
  describe('POST /api/participation/reports', () => {
    it('debe crear un reporte ciudadano sin autenticación', async () => {
      const reportData = {
        type: 'POTHOLE',
        title: 'Bache grande en Av. Principal',
        description: 'Hay un bache muy grande que puede causar accidentes',
        location: 'Av. Principal con Calle 5',
        latitude: 10.4806,
        longitude: -66.9036,
        sector: 'Centro',
        reporterName: 'Juan Pérez',
        reporterEmail: 'juan@example.com',
        reporterPhone: '04141234567'
      };
      
      const response = await request(app)
        .post('/api/participation/reports')
        .send(reportData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('ticketNumber');
      expect(response.body.data.ticketNumber).toMatch(/^RP-\d{4}-\d{5}$/);
      expect(response.body.data.status).toBe('RECEIVED');
      expect(response.body.data.priority).toBe('HIGH'); // POTHOLE es HIGH
      
      testReport = response.body.data;
    });
    
    it('debe crear un reporte anónimo', async () => {
      const reportData = {
        type: 'GARBAGE',
        title: 'Basura acumulada',
        description: 'Hay mucha basura acumulada en la esquina',
        location: 'Calle 10 con Av. 2',
        isAnonymous: true
      };
      
      const response = await request(app)
        .post('/api/participation/reports')
        .send(reportData);
      
      expect(response.status).toBe(201);
      expect(response.body.data.isAnonymous).toBe(true);
    });
    
    it('debe rechazar reporte con datos inválidos', async () => {
      const reportData = {
        type: 'POTHOLE',
        title: 'Cor', // Muy corto
        description: 'Corto' // Muy corto
      };
      
      const response = await request(app)
        .post('/api/participation/reports')
        .send(reportData);
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/participation/reports/ticket/:ticketNumber', () => {
    it('debe obtener un reporte por número de ticket (público)', async () => {
      const response = await request(app)
        .get(`/api/participation/reports/ticket/${testReport.ticketNumber}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testReport.id);
      expect(response.body.data.ticketNumber).toBe(testReport.ticketNumber);
    });
    
    it('debe retornar 404 para ticket inexistente', async () => {
      const response = await request(app)
        .get('/api/participation/reports/ticket/RP-2025-99999');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('GET /api/participation/reports', () => {
    it('debe listar reportes con autenticación', async () => {
      const response = await request(app)
        .get('/api/participation/reports')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('debe filtrar reportes por tipo', async () => {
      const response = await request(app)
        .get('/api/participation/reports?type=POTHOLE')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(r => r.type === 'POTHOLE')).toBe(true);
    });
    
    it('debe rechazar acceso sin autenticación', async () => {
      const response = await request(app)
        .get('/api/participation/reports');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('PATCH /api/participation/reports/:id/status', () => {
    it('debe actualizar el estado de un reporte', async () => {
      const response = await request(app)
        .patch(`/api/participation/reports/${testReport.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS',
          resolutionNotes: 'Cuadrilla asignada'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('IN_PROGRESS');
      expect(response.body.data.inProgressAt).toBeDefined();
    });
    
    it('debe rechazar estado inválido', async () => {
      const response = await request(app)
        .patch(`/api/participation/reports/${testReport.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'INVALID_STATUS'
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('PATCH /api/participation/reports/:id/assign', () => {
    it('debe asignar un reporte a un usuario', async () => {
      const response = await request(app)
        .patch(`/api/participation/reports/${testReport.id}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'CRITICAL'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.priority).toBe('CRITICAL');
      expect(response.body.data.assignedAt).toBeDefined();
    });
  });
  
  describe('POST /api/participation/reports/:id/comments', () => {
    it('debe agregar un comentario público', async () => {
      const response = await request(app)
        .post(`/api/participation/reports/${testReport.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          comment: 'Estamos trabajando en la solución',
          isInternal: false
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data.comment).toBe('Estamos trabajando en la solución');
    });
    
    it('debe agregar un comentario interno', async () => {
      const response = await request(app)
        .post(`/api/participation/reports/${testReport.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          comment: 'Nota interna: requiere materiales especiales',
          isInternal: true
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data.isInternal).toBe(true);
    });
  });
  
  describe('POST /api/participation/reports/:id/rate', () => {
    it('debe permitir calificar un reporte resuelto', async () => {
      // Primero marcar como resuelto
      await request(app)
        .patch(`/api/participation/reports/${testReport.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'RESOLVED' });
      
      // Luego calificar
      const response = await request(app)
        .post(`/api/participation/reports/${testReport.id}/rate`)
        .send({
          rating: 5,
          ratingComment: 'Excelente servicio'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.ratingComment).toBe('Excelente servicio');
    });
    
    it('debe rechazar calificación fuera de rango', async () => {
      const response = await request(app)
        .post(`/api/participation/reports/${testReport.id}/rate`)
        .send({
          rating: 6
        });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/participation/reports/stats', () => {
    it('debe obtener estadísticas de reportes', async () => {
      const response = await request(app)
        .get('/api/participation/reports/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('byType');
      expect(response.body.data).toHaveProperty('avgRating');
    });
  });
  
  describe('GET /api/participation/reports/heatmap', () => {
    it('debe obtener datos para mapa de calor (público)', async () => {
      const response = await request(app)
        .get('/api/participation/reports/heatmap');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every(r => r.latitude && r.longitude)).toBe(true);
    });
  });
  
  describe('DELETE /api/participation/reports/:id', () => {
    it('debe rechazar eliminación sin permisos de SUPER_ADMIN', async () => {
      const response = await request(app)
        .delete(`/api/participation/reports/${testReport.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(403);
    });
  });
});
