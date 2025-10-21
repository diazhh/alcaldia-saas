/**
 * Tests de integración para el módulo de catastro
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';

describe('Catastro Integration Tests', () => {
  let authToken;
  let taxpayerId;
  let propertyId;
  let urbanVariableId;
  let permitId;

  beforeAll(async () => {
    // Autenticar usuario para obtener token
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'admin@municipal.gob.ve',
      password: 'Admin123!',
    });

    authToken = loginResponse.body.data.token;

    // Crear un contribuyente para las pruebas
    const taxpayer = await prisma.taxpayer.create({
      data: {
        taxId: 'V-99999999',
        taxpayerType: 'NATURAL',
        firstName: 'Test',
        lastName: 'Catastro',
        email: 'test.catastro@example.com',
        phone: '04141234567',
        address: 'Dirección de prueba',
        status: 'ACTIVE',
      },
    });
    taxpayerId = taxpayer.id;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (permitId) {
      await prisma.constructionPermit.deleteMany({
        where: { id: permitId },
      });
    }
    if (propertyId) {
      await prisma.property.deleteMany({
        where: { id: propertyId },
      });
    }
    if (urbanVariableId) {
      await prisma.urbanVariable.deleteMany({
        where: { id: urbanVariableId },
      });
    }
    if (taxpayerId) {
      await prisma.taxpayer.deleteMany({
        where: { id: taxpayerId },
      });
    }
  });

  describe('POST /api/catastro/properties', () => {
    it('debe crear una nueva propiedad', async () => {
      const propertyData = {
        taxpayerId,
        cadastralCode: `TEST-CAT-${Date.now()}`,
        address: 'Calle Test #123',
        parish: 'Centro',
        landArea: 250,
        buildingArea: 150,
        propertyUse: 'RESIDENTIAL',
        propertyType: 'HOUSE',
        landValue: 50000,
        buildingValue: 30000,
        totalValue: 80000,
        taxRate: 0.5,
        hasWater: true,
        hasElectricity: true,
      };

      const response = await request(app)
        .post('/api/catastro/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cadastralCode).toBe(propertyData.cadastralCode);
      propertyId = response.body.data.id;
    });

    it('debe rechazar creación con código catastral duplicado', async () => {
      const propertyData = {
        taxpayerId,
        cadastralCode: `TEST-CAT-${Date.now()}`,
        address: 'Otra dirección',
        parish: 'Norte',
        landArea: 200,
        propertyUse: 'COMMERCIAL',
        propertyType: 'LOCAL',
        landValue: 60000,
        buildingValue: 40000,
        totalValue: 100000,
        taxRate: 1.0,
      };

      // Crear primera propiedad
      await request(app)
        .post('/api/catastro/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      // Intentar crear con mismo código
      const response = await request(app)
        .post('/api/catastro/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/catastro/properties', () => {
    it('debe obtener lista de propiedades', async () => {
      const response = await request(app)
        .get('/api/catastro/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('debe filtrar propiedades por uso', async () => {
      const response = await request(app)
        .get('/api/catastro/properties?propertyUse=RESIDENTIAL')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/catastro/urban-variables', () => {
    it('debe crear una variable urbana', async () => {
      const variableData = {
        zoneCode: `TEST-R${Date.now()}`,
        zoneName: 'Zona Residencial Test',
        zoneType: 'RESIDENTIAL',
        frontSetback: 5,
        rearSetback: 3,
        leftSetback: 2,
        rightSetback: 2,
        maxHeight: 12,
        maxFloors: 3,
        buildingDensity: 60,
        maxCoverage: 70,
        parkingRequired: true,
        parkingRatio: '1 por cada 100m²',
        allowedUses: JSON.stringify(['RESIDENTIAL']),
        isActive: true,
      };

      const response = await request(app)
        .post('/api/catastro/urban-variables')
        .set('Authorization', `Bearer ${authToken}`)
        .send(variableData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.zoneCode).toBe(variableData.zoneCode);
      urbanVariableId = response.body.data.id;
    });
  });

  describe('POST /api/catastro/urban-variables/check-compliance/:zoneCode', () => {
    it('debe verificar cumplimiento de variables urbanas', async () => {
      // Primero crear una variable urbana
      const variableData = {
        zoneCode: `COMP-${Date.now()}`,
        zoneName: 'Zona Compliance Test',
        zoneType: 'RESIDENTIAL',
        frontSetback: 5,
        maxHeight: 12,
        allowedUses: JSON.stringify(['RESIDENTIAL']),
      };

      await request(app)
        .post('/api/catastro/urban-variables')
        .set('Authorization', `Bearer ${authToken}`)
        .send(variableData);

      // Verificar cumplimiento
      const projectData = {
        frontSetback: 6,
        height: 10,
        propertyUse: 'RESIDENTIAL',
      };

      const response = await request(app)
        .post(`/api/catastro/urban-variables/check-compliance/${variableData.zoneCode}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.compliance).toBeDefined();
      expect(response.body.data.compliance.complies).toBe(true);
    });
  });

  describe('POST /api/catastro/permits', () => {
    it('debe crear un permiso de construcción', async () => {
      if (!propertyId) {
        // Crear propiedad si no existe
        const property = await prisma.property.create({
          data: {
            taxpayerId,
            cadastralCode: `PERMIT-TEST-${Date.now()}`,
            address: 'Dirección para permiso',
            parish: 'Centro',
            landArea: 300,
            propertyUse: 'RESIDENTIAL',
            propertyType: 'HOUSE',
            landValue: 60000,
            buildingValue: 0,
            totalValue: 60000,
            taxRate: 0.5,
          },
        });
        propertyId = property.id;
      }

      const permitData = {
        propertyId,
        applicantName: 'Juan Pérez',
        applicantId: 'V-12345678',
        applicantPhone: '04141234567',
        applicantEmail: 'juan@example.com',
        permitType: 'NEW_CONSTRUCTION',
        projectDescription: 'Construcción de vivienda unifamiliar de 150m²',
        constructionArea: 150,
        estimatedCost: 80000,
        permitFee: 5000,
        totalFee: 5000,
        applicationDate: new Date().toISOString(),
      };

      const response = await request(app)
        .post('/api/catastro/permits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(permitData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.permitNumber).toMatch(/^PC-\d{4}-\d{4}$/);
      expect(response.body.data.status).toBe('SUBMITTED');
      permitId = response.body.data.id;
    });
  });

  describe('GET /api/catastro/permits', () => {
    it('debe obtener lista de permisos', async () => {
      const response = await request(app)
        .get('/api/catastro/permits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.permits).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/catastro/properties/stats', () => {
    it('debe obtener estadísticas de propiedades', async () => {
      const response = await request(app)
        .get('/api/catastro/properties/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/catastro/permits/stats', () => {
    it('debe obtener estadísticas de permisos', async () => {
      const response = await request(app)
        .get('/api/catastro/permits/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThanOrEqual(0);
    });
  });
});
