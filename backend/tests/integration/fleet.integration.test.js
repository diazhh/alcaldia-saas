/**
 * Tests de integración para el módulo de gestión de flota
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';

describe('Fleet Integration Tests', () => {
  let authToken;
  let vehicleId;
  let tripLogId;
  let fuelControlId;
  let maintenanceId;

  beforeAll(async () => {
    // Autenticar usuario para obtener token
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'admin@municipal.gob.ve',
      password: 'Admin123!',
    });

    authToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    if (maintenanceId) {
      await prisma.maintenance.deleteMany({
        where: { id: maintenanceId },
      });
    }
    if (fuelControlId) {
      await prisma.fuelControl.deleteMany({
        where: { id: fuelControlId },
      });
    }
    if (tripLogId) {
      await prisma.tripLog.deleteMany({
        where: { id: tripLogId },
      });
    }
    if (vehicleId) {
      await prisma.fleetVehicle.deleteMany({
        where: { id: vehicleId },
      });
    }
  });

  describe('POST /api/fleet/vehicles', () => {
    it('debe crear un nuevo vehículo', async () => {
      const vehicleData = {
        code: `VEH-TEST-${Date.now()}`,
        plate: `TEST-${Date.now().toString().slice(-3)}`,
        brand: 'Toyota',
        model: 'Hilux',
        year: 2020,
        type: 'PICKUP',
        fuelType: 'DIESEL',
        color: 'Blanco',
        vin: `VIN${Date.now()}`,
        engineNumber: `ENG${Date.now()}`,
        capacity: 5,
        acquisitionDate: '2020-01-15',
        acquisitionValue: 50000,
        currentValue: 40000,
        currentMileage: 0,
        status: 'OPERATIONAL',
      };

      const response = await request(app)
        .post('/api/fleet/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe(vehicleData.code);
      expect(response.body.data.plate).toBe(vehicleData.plate);
      vehicleId = response.body.data.id;
    });

    it('debe rechazar creación con código duplicado', async () => {
      const vehicleData = {
        code: `VEH-TEST-${Date.now()}`,
        plate: `DUP-${Date.now().toString().slice(-3)}`,
        brand: 'Ford',
        model: 'Ranger',
        year: 2021,
        type: 'PICKUP',
        fuelType: 'DIESEL',
        acquisitionDate: '2021-01-15',
        acquisitionValue: 55000,
        currentValue: 45000,
        currentMileage: 0,
        status: 'OPERATIONAL',
      };

      // Crear primer vehículo
      await request(app)
        .post('/api/fleet/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicleData);

      // Intentar crear segundo vehículo con mismo código
      const response = await request(app)
        .post('/api/fleet/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vehicleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('código');
    });
  });

  describe('GET /api/fleet/vehicles', () => {
    it('debe obtener lista de vehículos', async () => {
      const response = await request(app)
        .get('/api/fleet/vehicles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('debe filtrar vehículos por estado', async () => {
      const response = await request(app)
        .get('/api/fleet/vehicles?status=OPERATIONAL')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/fleet/vehicles/:id', () => {
    it('debe obtener un vehículo por ID', async () => {
      const response = await request(app)
        .get(`/api/fleet/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(vehicleId);
    });

    it('debe retornar 404 para vehículo inexistente', async () => {
      const response = await request(app)
        .get('/api/fleet/vehicles/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/fleet/vehicles/:id', () => {
    it('debe actualizar un vehículo', async () => {
      const updateData = {
        currentMileage: 5000,
        status: 'IN_REPAIR',
      };

      const response = await request(app)
        .put(`/api/fleet/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentMileage).toBe(5000);
      expect(response.body.data.status).toBe('IN_REPAIR');
    });
  });

  describe('POST /api/fleet/trip-logs', () => {
    it('debe crear un registro de viaje', async () => {
      const tripData = {
        vehicleId,
        driverName: 'Juan Pérez',
        driverLicense: 'V-12345678',
        destination: 'Centro Municipal',
        purpose: 'Reunión administrativa',
        departureDate: new Date().toISOString(),
        startMileage: 5000,
        observations: 'Viaje de prueba',
      };

      const response = await request(app)
        .post('/api/fleet/trip-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tripData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicleId).toBe(vehicleId);
      tripLogId = response.body.data.id;
    });
  });

  describe('PUT /api/fleet/trip-logs/:id/finalize', () => {
    it('debe finalizar un viaje', async () => {
      const finalizeData = {
        endMileage: 5100,
        returnDate: new Date().toISOString(),
        observations: 'Viaje completado sin incidentes',
      };

      const response = await request(app)
        .put(`/api/fleet/trip-logs/${tripLogId}/finalize`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(finalizeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.endMileage).toBe(5100);
      expect(response.body.data.distance).toBe(100);
    });
  });

  describe('POST /api/fleet/fuel-controls', () => {
    it('debe crear un registro de combustible', async () => {
      const fuelData = {
        vehicleId,
        voucherNumber: `VALE-TEST-${Date.now()}`,
        loadDate: new Date().toISOString(),
        station: 'PDVSA Centro',
        loadedLiters: 50,
        pricePerLiter: 2.5,
        cost: 125,
        mileageAtLoad: 5100,
        attendant: 'Carlos López',
      };

      const response = await request(app)
        .post('/api/fleet/fuel-controls')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fuelData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicleId).toBe(vehicleId);
      expect(response.body.data.loadedLiters).toBe(50);
      fuelControlId = response.body.data.id;
    });
  });

  describe('GET /api/fleet/fuel-controls/statistics', () => {
    it('debe obtener estadísticas de combustible', async () => {
      const response = await request(app)
        .get('/api/fleet/fuel-controls/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLoads).toBeDefined();
      expect(response.body.data.totalLiters).toBeDefined();
    });
  });

  describe('POST /api/fleet/maintenances', () => {
    it('debe crear un mantenimiento preventivo', async () => {
      const maintenanceData = {
        vehicleId,
        type: 'PREVENTIVE',
        status: 'SCHEDULED',
        description: 'Cambio de aceite y filtros',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledMileage: 10000,
        estimatedCost: 150,
      };

      const response = await request(app)
        .post('/api/fleet/maintenances')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maintenanceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('PREVENTIVE');
      maintenanceId = response.body.data.id;
    });
  });

  describe('PUT /api/fleet/maintenances/:id/complete', () => {
    it('debe completar un mantenimiento', async () => {
      const completeData = {
        workPerformed: 'Cambio de aceite, filtro de aceite y filtro de aire',
        partsUsed: 'Aceite 5W-30 (5L), Filtro de aceite, Filtro de aire',
        laborCost: 50,
        partsCost: 100,
        actualMileage: 5100,
        notes: 'Mantenimiento completado satisfactoriamente',
      };

      const response = await request(app)
        .put(`/api/fleet/maintenances/${maintenanceId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.totalCost).toBe(150);
    });
  });

  describe('GET /api/fleet/maintenances/upcoming', () => {
    it('debe obtener mantenimientos próximos', async () => {
      const response = await request(app)
        .get('/api/fleet/maintenances/upcoming')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overdue).toBeDefined();
      expect(response.body.data.upcoming).toBeDefined();
    });
  });

  describe('GET /api/fleet/tco/vehicle/:id', () => {
    it('debe calcular el TCO de un vehículo', async () => {
      const response = await request(app)
        .get(`/api/fleet/tco/vehicle/${vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicleId).toBe(vehicleId);
      expect(response.body.data.costs).toBeDefined();
      expect(response.body.data.usage).toBeDefined();
    });
  });

  describe('GET /api/fleet/tco/fleet', () => {
    it('debe calcular el TCO de toda la flota', async () => {
      const response = await request(app)
        .get('/api/fleet/tco/fleet')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fleet).toBeDefined();
      expect(response.body.data.costs).toBeDefined();
      expect(response.body.data.rankedVehicles).toBeDefined();
    });
  });

  describe('GET /api/fleet/statistics', () => {
    it('debe obtener estadísticas generales de la flota', async () => {
      const response = await request(app)
        .get('/api/fleet/statistics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeDefined();
      expect(response.body.data.operational).toBeDefined();
    });
  });

  describe('Authorization', () => {
    it('debe rechazar peticiones sin token', async () => {
      const response = await request(app)
        .get('/api/fleet/vehicles')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe rechazar peticiones con token inválido', async () => {
      const response = await request(app)
        .get('/api/fleet/vehicles')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
