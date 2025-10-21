/**
 * Tests de integración para API de Portal de Transparencia
 */

import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';

describe('API de Portal de Transparencia', () => {
  let adminToken;
  let testDocument;
  
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
    // Limpiar documentos de prueba
    if (testDocument) {
      await prisma.transparencyDocument.deleteMany({
        where: {
          title: {
            contains: 'Test'
          }
        }
      });
    }
    await prisma.$disconnect();
  });
  
  describe('POST /api/participation/transparency/documents', () => {
    it('debe publicar un documento de transparencia', async () => {
      const documentData = {
        title: 'Test - Presupuesto Municipal 2025',
        description: 'Presupuesto aprobado para el ejercicio fiscal 2025',
        category: 'BUDGET',
        subcategory: 'Presupuesto Anual',
        fileUrl: 'https://example.com/documents/presupuesto-2025.pdf',
        fileName: 'presupuesto-2025.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        year: 2025,
        summary: 'Resumen del presupuesto municipal',
        tags: ['presupuesto', '2025', 'finanzas']
      };
      
      const response = await request(app)
        .post('/api/participation/transparency/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(documentData);
      
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe(documentData.title);
      expect(response.body.data.category).toBe('BUDGET');
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.tags).toEqual(documentData.tags);
      
      testDocument = response.body.data;
    });
    
    it('debe rechazar documento sin autenticación', async () => {
      const documentData = {
        title: 'Documento sin auth',
        category: 'BUDGET',
        fileUrl: 'https://example.com/doc.pdf',
        fileName: 'doc.pdf'
      };
      
      const response = await request(app)
        .post('/api/participation/transparency/documents')
        .send(documentData);
      
      expect(response.status).toBe(401);
    });
    
    it('debe rechazar documento con datos inválidos', async () => {
      const documentData = {
        title: 'Doc', // Muy corto
        category: 'INVALID_CATEGORY',
        fileUrl: 'not-a-url',
        fileName: 'doc.pdf'
      };
      
      const response = await request(app)
        .post('/api/participation/transparency/documents')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(documentData);
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/participation/transparency/documents', () => {
    it('debe listar documentos (público)', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/documents');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
    
    it('debe filtrar documentos por categoría', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/documents?category=BUDGET');
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(d => d.category === 'BUDGET')).toBe(true);
    });
    
    it('debe filtrar documentos por año', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/documents?year=2025');
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(d => d.year === 2025)).toBe(true);
    });
    
    it('debe buscar documentos por texto', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/documents?search=presupuesto');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/participation/transparency/documents/:id', () => {
    it('debe obtener un documento por ID', async () => {
      const response = await request(app)
        .get(`/api/participation/transparency/documents/${testDocument.id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(testDocument.id);
      expect(response.body.data.viewCount).toBeGreaterThan(0); // Se incrementa al ver
    });
    
    it('debe retornar 404 para documento inexistente', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/documents/00000000-0000-0000-0000-000000000000');
      
      expect(response.status).toBe(404);
    });
  });
  
  describe('POST /api/participation/transparency/documents/:id/download', () => {
    it('debe registrar una descarga', async () => {
      const response = await request(app)
        .post(`/api/participation/transparency/documents/${testDocument.id}/download`);
      
      expect(response.status).toBe(200);
      
      // Verificar que se incrementó el contador
      const doc = await prisma.transparencyDocument.findUnique({
        where: { id: testDocument.id }
      });
      expect(doc.downloadCount).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/participation/transparency/categories/:category/documents', () => {
    it('debe obtener documentos por categoría', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/categories/BUDGET/documents');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.every(d => d.category === 'BUDGET')).toBe(true);
    });
  });
  
  describe('GET /api/participation/transparency/search', () => {
    it('debe buscar documentos por texto', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/search?q=presupuesto');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
    
    it('debe rechazar búsqueda sin parámetro', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/search');
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('GET /api/participation/transparency/stats', () => {
    it('debe obtener estadísticas del portal', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalDocuments');
      expect(response.body.data).toHaveProperty('byCategory');
      expect(response.body.data).toHaveProperty('totalDownloads');
      expect(response.body.data).toHaveProperty('totalViews');
      expect(response.body.data).toHaveProperty('recentDocuments');
    });
  });
  
  describe('GET /api/participation/transparency/years', () => {
    it('debe obtener años disponibles', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/years');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toContain(2025);
    });
  });
  
  describe('GET /api/participation/transparency/categories', () => {
    it('debe obtener categorías con conteo', async () => {
      const response = await request(app)
        .get('/api/participation/transparency/categories');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty('category');
      expect(response.body.data[0]).toHaveProperty('count');
    });
  });
  
  describe('PUT /api/participation/transparency/documents/:id', () => {
    it('debe actualizar un documento', async () => {
      const response = await request(app)
        .put(`/api/participation/transparency/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test - Presupuesto Municipal 2025 (Actualizado)',
          summary: 'Resumen actualizado del presupuesto'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.title).toContain('Actualizado');
      expect(response.body.data.summary).toBe('Resumen actualizado del presupuesto');
    });
  });
  
  describe('DELETE /api/participation/transparency/documents/:id', () => {
    it('debe desactivar un documento', async () => {
      const response = await request(app)
        .delete(`/api/participation/transparency/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      
      // Verificar que se desactivó
      const doc = await prisma.transparencyDocument.findUnique({
        where: { id: testDocument.id }
      });
      expect(doc.isActive).toBe(false);
    });
    
    it('debe rechazar eliminación sin permisos', async () => {
      // Login como empleado
      const empResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'empleado@municipal.gob.ve',
          password: 'Admin123!'
        });
      
      const response = await request(app)
        .delete(`/api/participation/transparency/documents/${testDocument.id}`)
        .set('Authorization', `Bearer ${empResponse.body.data.token}`);
      
      expect(response.status).toBe(403);
    });
  });
});
