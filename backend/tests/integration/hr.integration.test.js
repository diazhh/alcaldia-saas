/**
 * Tests de integración para el módulo de RRHH
 */
import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';
import { generateToken } from '../../src/config/jwt.js';

describe('HR Module Integration Tests', () => {
  let authToken;
  let adminToken;
  let testEmployee;
  let testPosition;
  let testPayroll;

  beforeAll(async () => {
    // Crear usuario de prueba con rol ADMIN
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminUser) {
      adminToken = generateToken({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      });
      authToken = adminToken;
    }

    // Crear posición de prueba
    testPosition = await prisma.position.create({
      data: {
        code: 'TEST-POS-001',
        name: 'Posición de Prueba',
        level: 'PROFESSIONAL',
        category: 'ADMINISTRATIVE',
        minSalary: 400,
        maxSalary: 800,
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      if (testEmployee) {
        await prisma.attendance.deleteMany({
          where: { employeeId: testEmployee.id },
        });
        await prisma.vacationRequest.deleteMany({
          where: { employeeId: testEmployee.id },
        });
        await prisma.employee.delete({
          where: { id: testEmployee.id },
        });
      }

      if (testPosition) {
        await prisma.position.delete({
          where: { id: testPosition.id },
        });
      }

      if (testPayroll) {
        await prisma.payrollDetail.deleteMany({
          where: { payrollId: testPayroll.id },
        });
        await prisma.payroll.delete({
          where: { id: testPayroll.id },
        });
      }
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('Employee Management', () => {
    describe('POST /api/hr/employees', () => {
      it('debe crear un nuevo empleado exitosamente', async () => {
        const newEmployee = {
          firstName: 'Juan',
          lastName: 'Pérez',
          idNumber: 'V-12345678',
          email: 'juan.perez.test@municipal.gob.ve',
          phone: '+58 414 1234567',
          birthDate: '1990-05-15',
          gender: 'MALE',
          maritalStatus: 'SINGLE',
          address: 'Calle Principal #123',
          positionId: testPosition.id,
          hireDate: '2024-01-15',
          contractType: 'PERMANENT',
          baseSalary: 500,
          status: 'ACTIVE',
        };

        const response = await request(app)
          .post('/api/hr/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send(newEmployee);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('employeeNumber');
        expect(response.body.data.employeeNumber).toMatch(/^EMP-\d{4}-\d{4}$/);
        expect(response.body.data.firstName).toBe(newEmployee.firstName);
        expect(response.body.data.email).toBe(newEmployee.email);

        testEmployee = response.body.data;
      });

      it('debe rechazar creación sin campos requeridos', async () => {
        const incompleteEmployee = {
          firstName: 'María',
          // Falta lastName, idNumber, etc.
        };

        const response = await request(app)
          .post('/api/hr/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send(incompleteEmployee);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('debe rechazar creación con email duplicado', async () => {
        const duplicateEmployee = {
          firstName: 'Pedro',
          lastName: 'González',
          idNumber: 'V-87654321',
          email: testEmployee.email, // Email duplicado
          positionId: testPosition.id,
          hireDate: '2024-01-15',
          baseSalary: 500,
        };

        const response = await request(app)
          .post('/api/hr/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send(duplicateEmployee);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/hr/employees', () => {
      it('debe listar empleados con paginación', async () => {
        const response = await request(app)
          .get('/api/hr/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data.data)).toBe(true);
      });

      it('debe filtrar empleados por estado', async () => {
        const response = await request(app)
          .get('/api/hr/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ status: 'ACTIVE' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        if (response.body.data.data.length > 0) {
          response.body.data.data.forEach(emp => {
            expect(emp.status).toBe('ACTIVE');
          });
        }
      });

      it('debe buscar empleados por nombre', async () => {
        const response = await request(app)
          .get('/api/hr/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ search: 'Juan' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/hr/employees/:id', () => {
      it('debe obtener un empleado por ID', async () => {
        const response = await request(app)
          .get(`/api/hr/employees/${testEmployee.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testEmployee.id);
        expect(response.body.data.firstName).toBe(testEmployee.firstName);
      });

      it('debe retornar 404 si el empleado no existe', async () => {
        const response = await request(app)
          .get('/api/hr/employees/invalid-id-123')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    describe('PUT /api/hr/employees/:id', () => {
      it('debe actualizar un empleado exitosamente', async () => {
        const updateData = {
          phone: '+58 424 9876543',
          address: 'Nueva Dirección #456',
        };

        const response = await request(app)
          .put(`/api/hr/employees/${testEmployee.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.phone).toBe(updateData.phone);
        expect(response.body.data.address).toBe(updateData.address);
      });
    });

    describe('GET /api/hr/employees/stats/general', () => {
      it('debe obtener estadísticas generales de empleados', async () => {
        const response = await request(app)
          .get('/api/hr/employees/stats/general')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data).toHaveProperty('byStatus');
      });
    });
  });

  describe('Attendance Management', () => {
    describe('POST /api/hr/attendance', () => {
      it('debe registrar asistencia de un empleado', async () => {
        const attendanceData = {
          employeeId: testEmployee.id,
          date: new Date().toISOString().split('T')[0],
          checkIn: new Date().toISOString(),
          status: 'PRESENT',
        };

        const response = await request(app)
          .post('/api/hr/attendance')
          .set('Authorization', `Bearer ${authToken}`)
          .send(attendanceData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.employeeId).toBe(testEmployee.id);
        expect(response.body.data.status).toBe('PRESENT');
      });

      it('debe rechazar registro duplicado para el mismo día', async () => {
        const attendanceData = {
          employeeId: testEmployee.id,
          date: new Date().toISOString().split('T')[0],
          checkIn: new Date().toISOString(),
          status: 'PRESENT',
        };

        const response = await request(app)
          .post('/api/hr/attendance')
          .set('Authorization', `Bearer ${authToken}`)
          .send(attendanceData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/hr/attendance/employee/:employeeId', () => {
      it('debe obtener registros de asistencia de un empleado', async () => {
        const response = await request(app)
          .get(`/api/hr/attendance/employee/${testEmployee.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .query({
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('data');
        expect(Array.isArray(response.body.data.data)).toBe(true);
      });
    });
  });

  describe('Vacation Management', () => {
    describe('POST /api/hr/vacations', () => {
      it('debe crear una solicitud de vacaciones', async () => {
        const vacationData = {
          employeeId: testEmployee.id,
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
          requestedDays: 7,
          reason: 'Vacaciones anuales',
        };

        const response = await request(app)
          .post('/api/hr/vacations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(vacationData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.employeeId).toBe(testEmployee.id);
        expect(response.body.data.status).toBe('PENDING');
      });
    });

    describe('GET /api/hr/vacations/employee/:employeeId', () => {
      it('debe obtener solicitudes de vacaciones de un empleado', async () => {
        const response = await request(app)
          .get(`/api/hr/vacations/employee/${testEmployee.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/hr/vacations/balance/:employeeId', () => {
      it('debe obtener el saldo de vacaciones de un empleado', async () => {
        const response = await request(app)
          .get(`/api/hr/vacations/balance/${testEmployee.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('available');
        expect(response.body.data).toHaveProperty('pending');
        expect(response.body.data).toHaveProperty('usable');
      });
    });
  });

  describe('Payroll Management', () => {
    describe('POST /api/hr/payroll', () => {
      it('debe crear una nueva nómina', async () => {
        const payrollData = {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          period: 'BIWEEKLY',
          periodNumber: 1,
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          paymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const response = await request(app)
          .post('/api/hr/payroll')
          .set('Authorization', `Bearer ${authToken}`)
          .send(payrollData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('reference');
        expect(response.body.data.reference).toMatch(/^NOM-\d{4}-\d{2}-Q\d$/);
        expect(response.body.data.status).toBe('DRAFT');

        testPayroll = response.body.data;
      });
    });

    describe('GET /api/hr/payroll', () => {
      it('debe listar nóminas con paginación', async () => {
        const response = await request(app)
          .get('/api/hr/payroll')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data.data)).toBe(true);
      });
    });

    describe('GET /api/hr/payroll/:id', () => {
      it('debe obtener una nómina por ID', async () => {
        const response = await request(app)
          .get(`/api/hr/payroll/${testPayroll.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testPayroll.id);
      });
    });
  });

  describe('Position Management', () => {
    describe('GET /api/hr/positions', () => {
      it('debe listar posiciones/cargos', async () => {
        const response = await request(app)
          .get('/api/hr/positions')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/hr/positions/:id', () => {
      it('debe obtener una posición por ID', async () => {
        const response = await request(app)
          .get(`/api/hr/positions/${testPosition.id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testPosition.id);
        expect(response.body.data.code).toBe(testPosition.code);
      });
    });
  });

  describe('Authorization Tests', () => {
    it('debe rechazar acceso sin token de autenticación', async () => {
      const response = await request(app).get('/api/hr/employees');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe rechazar acceso con token inválido', async () => {
      const response = await request(app)
        .get('/api/hr/employees')
        .set('Authorization', 'Bearer invalid-token-123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
