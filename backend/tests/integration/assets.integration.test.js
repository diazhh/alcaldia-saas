/**
 * Tests de integración para el módulo de Inventario y Bienes Municipales
 * Prueba los servicios directamente sin pasar por las rutas HTTP
 */

import * as assetsService from '../../src/modules/assets/services/assets.service.js';
import * as movementsService from '../../src/modules/assets/services/movements.service.js';
import * as maintenancesService from '../../src/modules/assets/services/maintenances.service.js';
import * as inventoryService from '../../src/modules/assets/services/inventory.service.js';
import * as purchaseRequestsService from '../../src/modules/assets/services/purchase-requests.service.js';
import prisma from '../../src/config/database.js';

describe('Assets Module - Integration Tests', () => {
  let testAssetId;
  let testItemId;
  let testMovementId;
  let testMaintenanceId;
  let testRequestId;
  const testUserId = 'test-user-123';

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    // Limpiar datos de prueba en orden inverso
    try {
      if (testMovementId) {
        await prisma.assetMovement.deleteMany({ where: { id: testMovementId } });
      }
      if (testMaintenanceId) {
        await prisma.assetMaintenance.deleteMany({ where: { id: testMaintenanceId } });
      }
      if (testAssetId) {
        await prisma.asset.deleteMany({ where: { id: testAssetId } });
      }
      if (testRequestId) {
        await prisma.purchaseRequestItem.deleteMany({ where: { requestId: testRequestId } });
        await prisma.purchaseRequest.deleteMany({ where: { id: testRequestId } });
      }
      if (testItemId) {
        await prisma.inventoryEntry.deleteMany({ where: { itemId: testItemId } });
        await prisma.inventoryExit.deleteMany({ where: { itemId: testItemId } });
        await prisma.inventoryItem.deleteMany({ where: { id: testItemId } });
      }
    } catch (error) {
      console.error('Error en limpieza:', error);
    }
    await prisma.$disconnect();
  });

  // ==========================================
  // TESTS DE BIENES
  // ==========================================

  describe('Assets Service', () => {
    test('Debe crear un nuevo bien con código autogenerado', async () => {
      const asset = await assetsService.createAsset({
        type: 'MUEBLE',
        category: 'Equipos de Oficina',
        name: 'Laptop Dell Test',
        acquisitionValue: 1200,
        usefulLife: 36,
        acquisitionDate: new Date().toISOString(),
      }, testUserId);

      expect(asset.code).toMatch(/^BM-\d{4}-\d{4}$/);
      expect(asset.monthlyDepreciation).toBeGreaterThan(0);
      testAssetId = asset.id;
    });

    test('Debe listar bienes con paginación', async () => {
      const result = await assetsService.getAllAssets({ page: 1, limit: 10 });
      expect(result.assets).toBeInstanceOf(Array);
      expect(result.pagination).toHaveProperty('total');
    });

    test('Debe obtener un bien por ID', async () => {
      const asset = await assetsService.getAssetById(testAssetId);
      expect(asset.id).toBe(testAssetId);
    });

    test('Debe actualizar un bien', async () => {
      const updated = await assetsService.updateAsset(testAssetId, { condition: 'BUENO' });
      expect(updated.condition).toBe('BUENO');
    });

    test('Debe obtener estadísticas de bienes', async () => {
      const stats = await assetsService.getAssetStats();
      expect(stats.totalAssets).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // TESTS DE MOVIMIENTOS
  // ==========================================

  describe('Movements Service', () => {
    test('Debe crear un movimiento con acta autogenerada', async () => {
      const movement = await movementsService.createMovement({
        assetId: testAssetId,
        type: 'ASIGNACION_INICIAL',
        toDepartment: 'Sistemas',
        reason: 'Asignación inicial',
        movementDate: new Date().toISOString(),
      }, testUserId);

      expect(movement.actNumber).toMatch(/^ACTA-\d{4}-\d{4}$/);
      expect(movement.status).toBe('PENDING');
      testMovementId = movement.id;
    });

    test('Debe aprobar un movimiento', async () => {
      const approved = await movementsService.approveMovement(testMovementId, testUserId);
      expect(approved.status).toBe('APPROVED');
    });

    test('Debe listar movimientos', async () => {
      const result = await movementsService.getAllMovements({});
      expect(result.movements).toBeInstanceOf(Array);
    });
  });

  // ==========================================
  // TESTS DE MANTENIMIENTOS
  // ==========================================

  describe('Maintenances Service', () => {
    test('Debe crear un mantenimiento', async () => {
      const maintenance = await maintenancesService.createMaintenance({
        assetId: testAssetId,
        type: 'PREVENTIVO',
        description: 'Mantenimiento preventivo',
        cost: 50,
      });

      expect(maintenance.type).toBe('PREVENTIVO');
      testMaintenanceId = maintenance.id;
    });

    test('Debe iniciar un mantenimiento', async () => {
      const started = await maintenancesService.startMaintenance(testMaintenanceId);
      expect(started.status).toBe('IN_PROGRESS');
    });

    test('Debe completar un mantenimiento', async () => {
      const completed = await maintenancesService.completeMaintenance(testMaintenanceId);
      expect(completed.status).toBe('COMPLETED');
    });

    test('Debe obtener estadísticas de mantenimientos', async () => {
      const stats = await maintenancesService.getMaintenanceStats();
      expect(stats).toHaveProperty('total');
    });
  });

  // ==========================================
  // TESTS DE INVENTARIO
  // ==========================================

  describe('Inventory Service', () => {
    test('Debe crear un item con código autogenerado', async () => {
      const item = await inventoryService.createItem({
        name: 'Papel Bond Test',
        category: 'Papelería',
        unit: 'Resma',
        currentStock: 0,
        minStock: 10,
        unitCost: 5.5,
      });

      expect(item.code).toMatch(/^INV-\d{4}-\d{4}$/);
      testItemId = item.id;
    });

    test('Debe crear una entrada y actualizar stock', async () => {
      const entry = await inventoryService.createEntry({
        itemId: testItemId,
        quantity: 50,
        unitCost: 5.5,
        source: 'COMPRA',
        entryDate: new Date().toISOString(),
      }, testUserId);

      expect(entry.reference).toMatch(/^ENT-\d{6}-\d{4}$/);
      
      const item = await inventoryService.getItemById(testItemId);
      expect(item.currentStock).toBe(50);
    });

    test('Debe crear una salida y validar stock', async () => {
      const exit = await inventoryService.createExit({
        itemId: testItemId,
        quantity: 5,
        department: 'Test',
        purpose: 'Prueba',
        exitDate: new Date().toISOString(),
      }, testUserId);

      expect(exit.reference).toMatch(/^SAL-\d{6}-\d{4}$/);
      
      const item = await inventoryService.getItemById(testItemId);
      expect(item.currentStock).toBe(45);
    });

    test('Debe fallar al intentar salida con stock insuficiente', async () => {
      await expect(
        inventoryService.createExit({
          itemId: testItemId,
          quantity: 1000,
          department: 'Test',
          purpose: 'Prueba',
          exitDate: new Date().toISOString(),
        }, testUserId)
      ).rejects.toThrow('Stock insuficiente');
    });

    test('Debe obtener estadísticas de inventario', async () => {
      const stats = await inventoryService.getInventoryStats();
      expect(stats.totalItems).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // TESTS DE SOLICITUDES DE COMPRA
  // ==========================================

  describe('Purchase Requests Service', () => {
    test('Debe crear una solicitud con items', async () => {
      const request = await purchaseRequestsService.createRequest({
        department: 'Sistemas',
        priority: 'MEDIUM',
        justification: 'Necesidad de equipos',
        estimatedAmount: 2000,
        items: [
          {
            description: 'Laptop HP',
            quantity: 2,
            unit: 'Unidad',
            estimatedUnitPrice: 1000,
          },
        ],
      }, testUserId);

      expect(request.requestNumber).toMatch(/^SOL-\d{4}-\d{4}$/);
      expect(request.items).toHaveLength(1);
      testRequestId = request.id;
    });

    test('Debe aprobar por jefe', async () => {
      const approved = await purchaseRequestsService.approveByHead(testRequestId, testUserId);
      expect(approved.status).toBe('APPROVED_HEAD');
    });

    test('Debe aprobar por presupuesto', async () => {
      const approved = await purchaseRequestsService.approveByBudget(testRequestId, testUserId);
      expect(approved.status).toBe('APPROVED_BUDGET');
    });

    test('Debe aprobar por compras', async () => {
      const approved = await purchaseRequestsService.approveByPurchasing(testRequestId, testUserId);
      expect(approved.status).toBe('APPROVED_PURCHASING');
    });

    test('Debe agregar cotización', async () => {
      const quoted = await purchaseRequestsService.addQuotation(testRequestId, {
        quotationAmount: 1950,
        quotationSupplier: 'TechStore',
      });
      expect(quoted.quotationReceived).toBe(true);
    });

    test('Debe obtener estadísticas de solicitudes', async () => {
      const stats = await purchaseRequestsService.getRequestStats();
      expect(stats.total).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // TESTS DE VALIDACIÓN
  // ==========================================

  describe('Validation Tests', () => {
    test('Debe fallar al crear bien sin datos requeridos', async () => {
      await expect(
        assetsService.createAsset({}, testUserId)
      ).rejects.toThrow();
    });

    test('Debe fallar al obtener bien inexistente', async () => {
      await expect(
        assetsService.getAssetById('id-inexistente')
      ).rejects.toThrow('Bien no encontrado');
    });
  });
});
