/**
 * Tests de integración para el módulo de departamentos
 */
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';
import jwt from 'jsonwebtoken';

describe('Departments API Integration Tests', () => {
  let authToken;
  let superAdminToken;
  let testDepartmentId;
  let testUserId;

  beforeAll(async () => {
    // Crear usuario de prueba para autenticación
    const testUser = await prisma.user.create({
      data: {
        email: 'test-dept@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
      },
    });

    testUserId = testUser.id;

    // Crear super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin-dept@example.com',
        password: 'hashedpassword',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    // Generar tokens
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    superAdminToken = jwt.sign(
      { id: superAdmin.id, email: superAdmin.email, role: superAdmin.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.userDepartment.deleteMany({});
    await prisma.departmentPermission.deleteMany({});
    await prisma.department.deleteMany({
      where: {
        code: { startsWith: 'TEST-' },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test-dept' },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/departments', () => {
    it('debe crear un departamento correctamente', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST-DIR-1',
          name: 'Dirección de Prueba 1',
          description: 'Departamento de prueba',
          type: 'DIRECCION',
          phone: '+58 212 1234567',
          email: 'test@example.com',
          maxStaff: 50,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('TEST-DIR-1');
      expect(response.body.data.name).toBe('Dirección de Prueba 1');

      testDepartmentId = response.body.data.id;
    });

    it('debe rechazar código duplicado', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST-DIR-1',
          name: 'Otra Dirección',
          type: 'DIRECCION',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Ya existe un departamento con ese código');
    });

    it('debe rechazar sin autenticación', async () => {
      const response = await request(app).post('/api/departments').send({
        code: 'TEST-DIR-2',
        name: 'Dirección de Prueba 2',
        type: 'DIRECCION',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/departments', () => {
    it('debe listar departamentos con paginación', async () => {
      const response = await request(app)
        .get('/api/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('debe filtrar por tipo', async () => {
      const response = await request(app)
        .get('/api/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'DIRECCION' });

      expect(response.status).toBe(200);
      expect(response.body.data.every((dept) => dept.type === 'DIRECCION')).toBe(true);
    });

    it('debe buscar por texto', async () => {
      const response = await request(app)
        .get('/api/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Prueba' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/departments/tree', () => {
    it('debe obtener árbol jerárquico', async () => {
      const response = await request(app)
        .get('/api/departments/tree')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/departments/:id', () => {
    it('debe obtener un departamento por ID', async () => {
      const response = await request(app)
        .get(`/api/departments/${testDepartmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testDepartmentId);
      expect(response.body.data.code).toBe('TEST-DIR-1');
    });

    it('debe retornar 404 si no existe', async () => {
      const response = await request(app)
        .get('/api/departments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/departments/:id', () => {
    it('debe actualizar un departamento', async () => {
      const response = await request(app)
        .put(`/api/departments/${testDepartmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Dirección Actualizada',
          description: 'Descripción actualizada',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Dirección Actualizada');
    });
  });

  describe('POST /api/departments/:departmentId/users', () => {
    it('debe asignar un usuario a un departamento', async () => {
      const response = await request(app)
        .post(`/api/departments/${testDepartmentId}/users`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          role: 'HEAD',
          isPrimary: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.role).toBe('HEAD');
    });

    it('debe rechazar asignación duplicada', async () => {
      const response = await request(app)
        .post(`/api/departments/${testDepartmentId}/users`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: testUserId,
          role: 'MEMBER',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('ya está asignado');
    });
  });

  describe('GET /api/departments/:departmentId/users', () => {
    it('debe listar usuarios de un departamento', async () => {
      const response = await request(app)
        .get(`/api/departments/${testDepartmentId}/users`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/departments/:departmentId/permissions', () => {
    it('debe asignar un permiso a un departamento', async () => {
      const response = await request(app)
        .post(`/api/departments/${testDepartmentId}/permissions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          module: 'proyectos',
          action: 'create',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.module).toBe('proyectos');
      expect(response.body.data.action).toBe('create');
    });
  });

  describe('GET /api/departments/reports/stats', () => {
    it('debe obtener estadísticas generales', async () => {
      const response = await request(app)
        .get('/api/departments/reports/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalDepartments');
      expect(response.body.data).toHaveProperty('uniqueEmployees');
      expect(response.body.data).toHaveProperty('departmentsByType');
    });
  });

  describe('DELETE /api/departments/:id', () => {
    it('debe rechazar eliminación si tiene usuarios', async () => {
      const response = await request(app)
        .delete(`/api/departments/${testDepartmentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('tiene usuarios asignados');
    });

    it('debe eliminar después de remover usuarios', async () => {
      // Primero remover el usuario
      await request(app)
        .delete(`/api/departments/${testDepartmentId}/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Ahora eliminar el departamento
      const response = await request(app)
        .delete(`/api/departments/${testDepartmentId}`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
