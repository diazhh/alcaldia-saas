import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import * as projectService from '../../src/modules/projects/services/projectService.js';

const prisma = new PrismaClient();

describe('Project Service - Unit Tests', () => {
  let testUser;
  let testProject;

  beforeAll(async () => {
    // Crear un usuario de prueba
    testUser = await prisma.user.findFirst({
      where: { email: 'admin@municipal.gob.ve' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-project@test.com',
          password: 'hashedpassword',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
        },
      });
    }
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

  describe('generateProjectCode', () => {
    test('debe generar un código de proyecto válido', async () => {
      const code = await projectService.generateProjectCode();
      const year = new Date().getFullYear();
      
      expect(code).toMatch(new RegExp(`^PRO-${year}-\\d{3}$`));
    });

    test('debe generar códigos secuenciales', async () => {
      const code1 = await projectService.generateProjectCode();
      
      // Crear un proyecto con ese código
      const tempProject = await prisma.project.create({
        data: {
          code: code1,
          name: 'Temp Project',
          budget: 10000,
          status: 'PLANNING',
          priority: 'MEDIUM',
          startDate: new Date(),
          endDate: new Date(),
          location: 'Test Location',
          sector: 'Centro',
          category: 'Vialidad',
          managerId: testUser.id,
        },
      });

      const code2 = await projectService.generateProjectCode();
      
      // Limpiar
      await prisma.project.delete({ where: { id: tempProject.id } });
      
      expect(code2).not.toBe(code1);
    });
  });

  describe('createProject', () => {
    test('debe crear un proyecto exitosamente', async () => {
      const projectData = {
        name: 'Proyecto de Prueba',
        description: 'Descripción del proyecto de prueba',
        budget: 50000,
        priority: 'HIGH',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        location: 'Sector Centro',
        sector: 'Centro',
        category: 'Vialidad',
        beneficiaries: 1000,
      };

      testProject = await projectService.createProject(projectData, testUser.id);

      expect(testProject).toHaveProperty('id');
      expect(testProject.name).toBe(projectData.name);
      expect(testProject.code).toMatch(/^PRO-\d{4}-\d{3}$/);
      expect(testProject.managerId).toBe(testUser.id);
      expect(testProject.manager).toBeDefined();
    });

    test('debe usar el managerId proporcionado si existe', async () => {
      const projectData = {
        name: 'Proyecto con Manager Específico',
        budget: 30000,
        startDate: new Date(),
        endDate: new Date(),
        location: 'Test',
        sector: 'Norte',
        category: 'Educación',
        managerId: testUser.id,
      };

      const project = await projectService.createProject(projectData, 'different-user-id');

      expect(project.managerId).toBe(testUser.id);
      
      // Limpiar
      await prisma.project.delete({ where: { id: project.id } });
    });
  });

  describe('getProjects', () => {
    test('debe obtener proyectos con paginación', async () => {
      const result = await projectService.getProjects({}, 1, 10);

      expect(result).toHaveProperty('projects');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.pagination).toHaveProperty('total');
      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('totalPages');
    });

    test('debe filtrar proyectos por estado', async () => {
      const result = await projectService.getProjects({ status: 'PLANNING' }, 1, 10);

      result.projects.forEach(project => {
        expect(project.status).toBe('PLANNING');
      });
    });

    test('debe buscar proyectos por texto', async () => {
      if (testProject) {
        const result = await projectService.getProjects({ search: 'Prueba' }, 1, 10);

        expect(result.projects.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getProjectById', () => {
    test('debe obtener un proyecto por ID con estadísticas', async () => {
      if (testProject) {
        const project = await projectService.getProjectById(testProject.id);

        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('stats');
        expect(project.stats).toHaveProperty('totalExpenses');
        expect(project.stats).toHaveProperty('remainingBudget');
        expect(project.stats).toHaveProperty('budgetUsedPercentage');
        expect(project.stats).toHaveProperty('progressPercentage');
      }
    });

    test('debe lanzar error si el proyecto no existe', async () => {
      await expect(
        projectService.getProjectById('non-existent-id')
      ).rejects.toThrow('Proyecto no encontrado');
    });
  });

  describe('updateProject', () => {
    test('debe actualizar un proyecto exitosamente', async () => {
      if (testProject) {
        const updateData = {
          name: 'Proyecto Actualizado',
          status: 'IN_PROGRESS',
        };

        const updated = await projectService.updateProject(testProject.id, updateData);

        expect(updated.name).toBe(updateData.name);
        expect(updated.status).toBe(updateData.status);
      }
    });

    test('debe lanzar error si el proyecto no existe', async () => {
      await expect(
        projectService.updateProject('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('Proyecto no encontrado');
    });
  });

  describe('getProjectStats', () => {
    test('debe obtener estadísticas generales', async () => {
      const stats = await projectService.getProjectStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('bySector');
      expect(stats).toHaveProperty('byCategory');
      expect(stats).toHaveProperty('totalBudget');
      expect(stats).toHaveProperty('totalExpenses');
      expect(typeof stats.total).toBe('number');
    });
  });
});
