/**
 * Tests unitarios para el servicio de departamentos
 */
import { jest } from '@jest/globals';

// Mock de Prisma debe estar antes de los imports
const mockPrisma = {
  department: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const { default: departmentService } = await import('../../../src/modules/departments/department.service.js');
const prisma = mockPrisma;

describe('DepartmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDepartment', () => {
    it('debe crear un departamento correctamente', async () => {
      const mockDepartment = {
        id: '1',
        code: 'DIR-TEST',
        name: 'Dirección de Prueba',
        type: 'DIRECCION',
        parentId: null,
      };

      prisma.department.findUnique.mockResolvedValue(null); // No existe código duplicado
      prisma.department.create.mockResolvedValue(mockDepartment);

      const result = await departmentService.createDepartment({
        code: 'DIR-TEST',
        name: 'Dirección de Prueba',
        type: 'DIRECCION',
      });

      expect(result).toEqual(mockDepartment);
      expect(prisma.department.create).toHaveBeenCalledTimes(1);
    });

    it('debe rechazar código duplicado', async () => {
      prisma.department.findUnique.mockResolvedValue({ id: '1', code: 'DIR-TEST' });

      await expect(
        departmentService.createDepartment({
          code: 'DIR-TEST',
          name: 'Dirección de Prueba',
          type: 'DIRECCION',
        })
      ).rejects.toThrow('Ya existe un departamento con ese código');
    });

    it('debe validar jerarquía de tipos', async () => {
      const parentDept = {
        id: 'parent-1',
        code: 'COORD-TEST',
        type: 'COORDINACION',
      };

      prisma.department.findUnique
        .mockResolvedValueOnce(null) // No existe código duplicado
        .mockResolvedValueOnce(parentDept); // Padre existe

      await expect(
        departmentService.createDepartment({
          code: 'DIR-TEST',
          name: 'Dirección de Prueba',
          type: 'DIRECCION',
          parentId: 'parent-1',
        })
      ).rejects.toThrow(/no puede ser hijo de/);
    });
  });

  describe('getDepartmentById', () => {
    it('debe obtener un departamento por ID', async () => {
      const mockDepartment = {
        id: '1',
        code: 'DIR-TEST',
        name: 'Dirección de Prueba',
        type: 'DIRECCION',
        parent: null,
        children: [],
        users: [],
        permissions: [],
        _count: { children: 0, users: 0, permissions: 0 },
      };

      prisma.department.findUnique.mockResolvedValue(mockDepartment);

      const result = await departmentService.getDepartmentById('1');

      expect(result).toEqual(mockDepartment);
      expect(prisma.department.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('debe lanzar error si el departamento no existe', async () => {
      prisma.department.findUnique.mockResolvedValue(null);

      await expect(departmentService.getDepartmentById('999')).rejects.toThrow(
        'Departamento no encontrado'
      );
    });
  });

  describe('updateDepartment', () => {
    it('debe actualizar un departamento correctamente', async () => {
      const existingDept = {
        id: '1',
        code: 'DIR-TEST',
        name: 'Dirección de Prueba',
        parentId: null,
      };

      const updatedDept = {
        ...existingDept,
        name: 'Dirección Actualizada',
      };

      prisma.department.findUnique.mockResolvedValue(existingDept);
      prisma.department.update.mockResolvedValue(updatedDept);

      const result = await departmentService.updateDepartment('1', {
        name: 'Dirección Actualizada',
      });

      expect(result.name).toBe('Dirección Actualizada');
      expect(prisma.department.update).toHaveBeenCalledTimes(1);
    });

    it('debe rechazar cambio a código duplicado', async () => {
      const existingDept = {
        id: '1',
        code: 'DIR-TEST',
        name: 'Dirección de Prueba',
      };

      prisma.department.findUnique
        .mockResolvedValueOnce(existingDept) // Departamento existe
        .mockResolvedValueOnce({ id: '2', code: 'DIR-NEW' }); // Código ya existe

      await expect(
        departmentService.updateDepartment('1', { code: 'DIR-NEW' })
      ).rejects.toThrow('Ya existe un departamento con ese código');
    });
  });

  describe('deleteDepartment', () => {
    it('debe eliminar un departamento sin hijos ni usuarios', async () => {
      const mockDepartment = {
        id: '1',
        code: 'DIR-TEST',
        _count: { children: 0, users: 0 },
      };

      prisma.department.findUnique.mockResolvedValue(mockDepartment);
      prisma.department.delete.mockResolvedValue(mockDepartment);

      await departmentService.deleteDepartment('1');

      expect(prisma.department.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('debe rechazar eliminación si tiene hijos', async () => {
      const mockDepartment = {
        id: '1',
        code: 'DIR-TEST',
        _count: { children: 2, users: 0 },
      };

      prisma.department.findUnique.mockResolvedValue(mockDepartment);

      await expect(departmentService.deleteDepartment('1')).rejects.toThrow(
        'No se puede eliminar un departamento que tiene subdepartamentos'
      );
    });

    it('debe rechazar eliminación si tiene usuarios', async () => {
      const mockDepartment = {
        id: '1',
        code: 'DIR-TEST',
        _count: { children: 0, users: 5 },
      };

      prisma.department.findUnique.mockResolvedValue(mockDepartment);

      await expect(departmentService.deleteDepartment('1')).rejects.toThrow(
        'No se puede eliminar un departamento que tiene usuarios asignados'
      );
    });
  });

  describe('listDepartments', () => {
    it('debe listar departamentos con paginación', async () => {
      const mockDepartments = [
        { id: '1', code: 'DIR-1', name: 'Dirección 1', type: 'DIRECCION' },
        { id: '2', code: 'DIR-2', name: 'Dirección 2', type: 'DIRECCION' },
      ];

      prisma.department.count.mockResolvedValue(10);
      prisma.department.findMany.mockResolvedValue(mockDepartments);

      const result = await departmentService.listDepartments({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(5);
    });

    it('debe filtrar por tipo', async () => {
      prisma.department.count.mockResolvedValue(3);
      prisma.department.findMany.mockResolvedValue([]);

      await departmentService.listDepartments({ type: 'DIRECCION' });

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'DIRECCION' }),
        })
      );
    });
  });

  describe('getDepartmentTree', () => {
    it('debe construir árbol jerárquico correctamente', async () => {
      const mockDepartments = [
        { id: '1', code: 'DIR-1', name: 'Dirección 1', parentId: null, _count: { children: 1, users: 0 } },
        { id: '2', code: 'COORD-1', name: 'Coordinación 1', parentId: '1', _count: { children: 0, users: 0 } },
      ];

      prisma.department.findMany.mockResolvedValue(mockDepartments);

      const result = await departmentService.getDepartmentTree();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].id).toBe('2');
    });
  });

  describe('getAncestors', () => {
    it('debe obtener ancestros usando query recursivo', async () => {
      const mockDepartment = {
        id: 'child-1',
        parentId: 'parent-1',
      };

      const mockAncestors = [
        { id: 'parent-1', code: 'COORD-1', name: 'Coordinación', type: 'COORDINACION', level: 1 },
        { id: 'grandparent-1', code: 'DIR-1', name: 'Dirección', type: 'DIRECCION', level: 2 },
      ];

      prisma.department.findUnique.mockResolvedValue(mockDepartment);
      prisma.$queryRaw.mockResolvedValue(mockAncestors);

      const result = await departmentService.getAncestors('child-1');

      expect(result).toHaveLength(2);
      expect(result[0].level).toBe(1);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('getDescendants', () => {
    it('debe obtener descendientes usando query recursivo', async () => {
      const mockDepartment = {
        id: 'parent-1',
      };

      const mockDescendants = [
        { id: 'child-1', code: 'COORD-1', name: 'Coordinación', level: 1 },
        { id: 'grandchild-1', code: 'DEPT-1', name: 'Departamento', level: 2 },
      ];

      prisma.department.findUnique.mockResolvedValue(mockDepartment);
      prisma.$queryRaw.mockResolvedValue(mockDescendants);

      const result = await departmentService.getDescendants('parent-1');

      expect(result).toHaveLength(2);
      expect(result[1].level).toBe(2);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
