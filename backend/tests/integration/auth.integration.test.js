import request from 'supertest';
import app from '../../src/server.js';
import prisma from '../../src/config/database.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../src/config/jwt.js';

describe('Auth Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Limpiar datos de prueba
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-',
        },
      },
    });

    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'test-integration@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        phone: '+58 414 1234567',
        role: 'EMPLEADO',
        isActive: true,
      },
    });

    // Generar token para pruebas autenticadas
    authToken = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    try {
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: 'test-',
          },
        },
      });
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const newUser = {
        email: 'test-newuser@example.com',
        password: 'NewUser123!',
        firstName: 'New',
        lastName: 'User',
        phone: '+58 424 9876543',
      };

      const response = await request(app).post('/api/auth/register').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user.role).toBe('EMPLEADO');
    });

    it('debe retornar error 409 si el email ya existe', async () => {
      const duplicateUser = {
        email: testUser.email,
        password: 'Test123!',
        firstName: 'Duplicate',
        lastName: 'User',
        phone: '+58 412 1111111',
      };

      const response = await request(app).post('/api/auth/register').send(duplicateUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email ya está registrado');
    });

    it('debe retornar error 400 si faltan campos requeridos', async () => {
      const incompleteUser = {
        email: 'test-incomplete@example.com',
        // falta password
        firstName: 'Incomplete',
      };

      const response = await request(app).post('/api/auth/register').send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe retornar error 400 si el email es inválido', async () => {
      const invalidEmailUser = {
        email: 'invalid-email',
        password: 'Test123!',
        firstName: 'Invalid',
        lastName: 'Email',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe retornar error 400 si la contraseña es débil', async () => {
      const weakPasswordUser = {
        email: 'test-weak@example.com',
        password: '123',
        firstName: 'Weak',
        lastName: 'Password',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión exitosamente con credenciales válidas', async () => {
      const credentials = {
        email: testUser.email,
        password: 'Test123!',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('debe retornar error 401 con credenciales inválidas', async () => {
      const invalidCredentials = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      const response = await request(app).post('/api/auth/login').send(invalidCredentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Credenciales inválidas');
    });

    it('debe retornar error 401 si el usuario no existe', async () => {
      const nonExistentUser = {
        email: 'nonexistent@example.com',
        password: 'Test123!',
      };

      const response = await request(app).post('/api/auth/login').send(nonExistentUser);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe retornar error 401 si el usuario está inactivo', async () => {
      // Crear usuario inactivo
      const hashedPassword = await bcrypt.hash('Test123!', 10);
      const inactiveUser = await prisma.user.create({
        data: {
          email: 'test-inactive@example.com',
          password: hashedPassword,
          firstName: 'Inactive',
          lastName: 'User',
          role: 'EMPLEADO',
          isActive: false,
        },
      });

      const credentials = {
        email: inactiveUser.email,
        password: 'Test123!',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Usuario inactivo');
    });

    it('debe retornar error 400 si faltan campos', async () => {
      const incompleteCredentials = {
        email: testUser.email,
        // falta password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(incompleteCredentials);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe retornar el usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('debe retornar error 401 sin token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe retornar error 401 con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('debe obtener el perfil del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('debe retornar error 401 sin autenticación', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('debe actualizar el perfil del usuario autenticado', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+58 416 5555555',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    it('debe retornar error 401 sin autenticación', async () => {
      const response = await request(app).put('/api/auth/profile').send({
        firstName: 'Test',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe retornar error 400 con datos inválidos', async () => {
      const invalidData = {
        email: 'invalid-email-format',
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('debe cambiar la contraseña exitosamente', async () => {
      const passwordData = {
        currentPassword: 'Test123!',
        newPassword: 'NewPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('Contraseña actualizada');

      // Verificar que puede iniciar sesión con la nueva contraseña
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: passwordData.newPassword,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data).toHaveProperty('token');

      // Usar el nuevo token para restaurar la contraseña original
      const newToken = loginResponse.body.data.token;
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          currentPassword: passwordData.newPassword,
          newPassword: 'Test123!',
        });
    });

    it('debe retornar error 401 con contraseña actual incorrecta', async () => {
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Contraseña actual incorrecta');
    });

    it('debe retornar error 401 sin autenticación', async () => {
      const response = await request(app).post('/api/auth/change-password').send({
        currentPassword: 'Test123!',
        newPassword: 'NewPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('debe retornar error 400 si falta algún campo', async () => {
      const incompleteData = {
        currentPassword: 'Test123!',
        // falta newPassword
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debe retornar error 400 si la nueva contraseña es débil', async () => {
      const weakPasswordData = {
        currentPassword: 'Test123!',
        newPassword: '123',
      };

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(weakPasswordData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debe cerrar sesión exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debe retornar error 401 sin autenticación', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
