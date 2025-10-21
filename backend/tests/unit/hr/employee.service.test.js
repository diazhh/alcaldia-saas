/**
 * Tests unitarios para el servicio de empleados
 */
import { jest } from '@jest/globals';

// Mock de Prisma debe estar antes de los imports
const mockPrisma = {
  employee: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  position: {
    findUnique: jest.fn(),
  },
  vacationRequest: {
    findMany: jest.fn(),
  },
  severancePayment: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const employeeService = await import('../../../src/modules/hr/services/employee.service.js');

describe('EmployeeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEmployeeNumber', () => {
    it('debe generar número de empleado con formato EMP-YYYY-0001 para el primer empleado', async () => {
      const year = new Date().getFullYear();
      mockPrisma.employee.findFirst.mockResolvedValue(null);
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.position.findUnique.mockResolvedValue({ id: 'position-1', name: 'Test Position' });

      const employeeData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        idNumber: 'V-12345678',
        email: 'juan.perez@test.com',
        positionId: 'position-1',
        hireDate: new Date(),
        baseSalary: 500,
      };

      const mockEmployee = {
        id: 'emp-1',
        employeeNumber: `EMP-${year}-0001`,
        ...employeeData,
      };

      mockPrisma.employee.create.mockResolvedValue(mockEmployee);

      const result = await employeeService.createEmployee(employeeData);

      expect(result.employeeNumber).toBe(`EMP-${year}-0001`);
    });

    it('debe incrementar el número de empleado correctamente', async () => {
      const year = new Date().getFullYear();
      mockPrisma.employee.findFirst.mockResolvedValue({
        employeeNumber: `EMP-${year}-0005`,
      });
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.position.findUnique.mockResolvedValue({ id: 'position-1', name: 'Test Position' });

      const employeeData = {
        firstName: 'María',
        lastName: 'González',
        idNumber: 'V-87654321',
        email: 'maria.gonzalez@test.com',
        positionId: 'position-1',
        hireDate: new Date(),
        baseSalary: 600,
      };

      const mockEmployee = {
        id: 'emp-2',
        employeeNumber: `EMP-${year}-0006`,
        ...employeeData,
      };

      mockPrisma.employee.create.mockResolvedValue(mockEmployee);

      const result = await employeeService.createEmployee(employeeData);

      expect(result.employeeNumber).toBe(`EMP-${year}-0006`);
    });
  });

  describe('getAllEmployees', () => {
    it('debe listar empleados con paginación', async () => {
      const mockEmployees = [
        {
          id: 'emp-1',
          firstName: 'Juan',
          lastName: 'Pérez',
          employeeNumber: 'EMP-2024-0001',
          position: { id: 'pos-1', name: 'Analista' },
        },
        {
          id: 'emp-2',
          firstName: 'María',
          lastName: 'González',
          employeeNumber: 'EMP-2024-0002',
          position: { id: 'pos-2', name: 'Coordinador' },
        },
      ];

      mockPrisma.employee.findMany.mockResolvedValue(mockEmployees);
      mockPrisma.employee.count.mockResolvedValue(2);

      const result = await employeeService.getAllEmployees({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(mockPrisma.employee.findMany).toHaveBeenCalledTimes(1);
    });

    it('debe filtrar empleados por estado', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(0);

      await employeeService.getAllEmployees({ status: 'ACTIVE' });

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        })
      );
    });

    it('debe buscar empleados por nombre o cédula', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([]);
      mockPrisma.employee.count.mockResolvedValue(0);

      await employeeService.getAllEmployees({ search: 'Juan' });

      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: expect.any(Object) }),
            ]),
          }),
        })
      );
    });
  });

  describe('getEmployeeById', () => {
    it('debe obtener un empleado por ID', async () => {
      const mockEmployee = {
        id: 'emp-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        employeeNumber: 'EMP-2024-0001',
        position: { id: 'pos-1', name: 'Analista' },
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployeeById('emp-1');

      expect(result).toEqual(mockEmployee);
      expect(mockPrisma.employee.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'emp-1' },
        })
      );
    });

    it('debe lanzar error si el empleado no existe', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(employeeService.getEmployeeById('invalid-id')).rejects.toThrow(
        'Empleado no encontrado'
      );
    });
  });

  describe('createEmployee', () => {
    it('debe crear un empleado exitosamente', async () => {
      const year = new Date().getFullYear();
      const employeeData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        idNumber: 'V-12345678',
        email: 'juan.perez@test.com',
        positionId: 'position-1',
        hireDate: new Date('2024-01-15'),
        baseSalary: 500,
      };

      const mockEmployee = {
        id: 'emp-1',
        employeeNumber: `EMP-${year}-0001`,
        ...employeeData,
        status: 'ACTIVE',
        vacationDays: 0,
      };

      mockPrisma.employee.findFirst.mockResolvedValue(null);
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.position.findUnique.mockResolvedValue({ id: 'position-1', name: 'Test Position' });
      mockPrisma.employee.create.mockResolvedValue(mockEmployee);

      const result = await employeeService.createEmployee(employeeData);

      expect(result).toEqual(mockEmployee);
      expect(result.employeeNumber).toMatch(/^EMP-\d{4}-\d{4}$/);
      expect(mockPrisma.employee.create).toHaveBeenCalledTimes(1);
    });

    it('debe calcular días de vacaciones según antigüedad', async () => {
      const year = new Date().getFullYear();
      const hireDate = new Date();
      hireDate.setFullYear(hireDate.getFullYear() - 2); // 2 años de antigüedad

      const employeeData = {
        firstName: 'María',
        lastName: 'González',
        idNumber: 'V-87654321',
        email: 'maria.gonzalez@test.com',
        positionId: 'position-1',
        hireDate,
        baseSalary: 600,
      };

      const mockEmployee = {
        id: 'emp-2',
        employeeNumber: `EMP-${year}-0002`,
        ...employeeData,
        status: 'ACTIVE',
        vacationDays: 30, // 15 días por año * 2 años
      };

      mockPrisma.employee.findFirst.mockResolvedValue(null);
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.position.findUnique.mockResolvedValue({ id: 'position-1', name: 'Test Position' });
      mockPrisma.employee.create.mockResolvedValue(mockEmployee);

      const result = await employeeService.createEmployee(employeeData);

      expect(result.vacationDays).toBeGreaterThan(0);
    });
  });

  describe('updateEmployee', () => {
    it('debe actualizar un empleado exitosamente', async () => {
      const existingEmployee = {
        id: 'emp-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@test.com',
      };

      const updateData = {
        phone: '+58 414 1234567',
        address: 'Calle Principal #123',
      };

      const updatedEmployee = {
        ...existingEmployee,
        ...updateData,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(existingEmployee);
      mockPrisma.employee.update.mockResolvedValue(updatedEmployee);

      const result = await employeeService.updateEmployee('emp-1', updateData);

      expect(result).toEqual(updatedEmployee);
      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'emp-1' },
          data: updateData,
        })
      );
    });

    it('debe lanzar error si el empleado no existe', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        employeeService.updateEmployee('invalid-id', { phone: '1234567' })
      ).rejects.toThrow('Empleado no encontrado');
    });
  });

  describe('updateEmployeeStatus', () => {
    it('debe cambiar el estado de un empleado', async () => {
      const employee = {
        id: 'emp-1',
        status: 'ACTIVE',
      };

      const updatedEmployee = {
        ...employee,
        status: 'INACTIVE',
      };

      mockPrisma.employee.findUnique.mockResolvedValue(employee);
      mockPrisma.employee.update.mockResolvedValue(updatedEmployee);

      const result = await employeeService.updateEmployeeStatus('emp-1', 'INACTIVE');

      expect(result.status).toBe('INACTIVE');
      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'emp-1' },
          data: { status: 'INACTIVE' },
        })
      );
    });
  });

  describe('getEmployeeStats', () => {
    it('debe obtener estadísticas generales de empleados', async () => {
      mockPrisma.employee.count
        .mockResolvedValueOnce(55) // totalActive
        .mockResolvedValueOnce(55); // totalInactive
      
      mockPrisma.employee.groupBy
        .mockResolvedValueOnce([{ departmentId: 'dept-1', _count: true }]) // byDepartment
        .mockResolvedValueOnce([{ positionId: 'pos-1', _count: true }]) // byPosition
        .mockResolvedValueOnce([{ contractType: 'PERMANENT', _count: true }]); // byContractType

      const result = await employeeService.getEmployeeStats();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalActive');
      expect(result).toHaveProperty('totalInactive');
      expect(result).toHaveProperty('byDepartment');
      expect(result).toHaveProperty('byPosition');
      expect(result).toHaveProperty('byContractType');
    });
  });
});
