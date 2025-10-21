/**
 * Tests unitarios para el servicio de nómina
 */
import { jest } from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
  payroll: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  payrollDetail: {
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  },
  payrollConcept: {
    findMany: jest.fn(),
  },
  employee: {
    findMany: jest.fn(),
  },
  attendance: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const payrollService = await import('../../../src/modules/hr/services/payroll.service.js');

describe('PayrollService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPayrolls', () => {
    it('debe listar nóminas con paginación', async () => {
      const mockPayrolls = [
        {
          id: 'payroll-1',
          reference: 'NOM-2024-01-Q1',
          year: 2024,
          month: 1,
          period: 'BIWEEKLY',
          periodNumber: 1,
          status: 'DRAFT',
          _count: { details: 50 },
        },
        {
          id: 'payroll-2',
          reference: 'NOM-2024-01-Q2',
          year: 2024,
          month: 1,
          period: 'BIWEEKLY',
          periodNumber: 2,
          status: 'CALCULATED',
          _count: { details: 50 },
        },
      ];

      mockPrisma.payroll.findMany.mockResolvedValue(mockPayrolls);
      mockPrisma.payroll.count.mockResolvedValue(2);

      const result = await payrollService.getAllPayrolls({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(mockPrisma.payroll.findMany).toHaveBeenCalledTimes(1);
    });

    it('debe filtrar nóminas por año y mes', async () => {
      mockPrisma.payroll.findMany.mockResolvedValue([]);
      mockPrisma.payroll.count.mockResolvedValue(0);

      await payrollService.getAllPayrolls({ year: 2024, month: 1 });

      expect(mockPrisma.payroll.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            year: 2024,
            month: 1,
          }),
        })
      );
    });

    it('debe filtrar nóminas por estado', async () => {
      mockPrisma.payroll.findMany.mockResolvedValue([]);
      mockPrisma.payroll.count.mockResolvedValue(0);

      await payrollService.getAllPayrolls({ status: 'APPROVED' });

      expect(mockPrisma.payroll.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'APPROVED' }),
        })
      );
    });
  });

  describe('getPayrollById', () => {
    it('debe obtener una nómina por ID con detalles', async () => {
      const mockPayroll = {
        id: 'payroll-1',
        reference: 'NOM-2024-01-Q1',
        year: 2024,
        month: 1,
        details: [
          {
            id: 'detail-1',
            employee: {
              id: 'emp-1',
              firstName: 'Juan',
              lastName: 'Pérez',
              employeeNumber: 'EMP-2024-0001',
            },
            daysWorked: 15,
            grossSalary: 500,
            totalDeductions: 50,
            netSalary: 450,
            concepts: [],
          },
        ],
      };

      mockPrisma.payroll.findUnique.mockResolvedValue(mockPayroll);

      const result = await payrollService.getPayrollById('payroll-1');

      expect(result).toEqual(mockPayroll);
      expect(result.details).toHaveLength(1);
      expect(mockPrisma.payroll.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payroll-1' },
          include: expect.any(Object),
        })
      );
    });

    it('debe lanzar error si la nómina no existe', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue(null);

      await expect(payrollService.getPayrollById('invalid-id')).rejects.toThrow(
        'Nómina no encontrada'
      );
    });
  });

  describe('createPayroll', () => {
    it('debe crear una nómina con referencia única', async () => {
      const payrollData = {
        year: 2024,
        month: 1,
        period: 'BIWEEKLY',
        periodNumber: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        paymentDate: '2024-01-20',
      };

      const mockPayroll = {
        id: 'payroll-1',
        reference: 'NOM-2024-01-Q1',
        ...payrollData,
        status: 'DRAFT',
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
      };

      mockPrisma.payroll.findFirst.mockResolvedValue(null);
      mockPrisma.payroll.create.mockResolvedValue(mockPayroll);

      const result = await payrollService.createPayroll(payrollData);

      expect(result.reference).toBe('NOM-2024-01-Q1');
      expect(result.status).toBe('DRAFT');
      expect(mockPrisma.payroll.create).toHaveBeenCalledTimes(1);
    });

    it('debe generar referencia mensual correctamente', async () => {
      const payrollData = {
        year: 2024,
        month: 2,
        period: 'MONTHLY',
        periodNumber: 1,
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        paymentDate: '2024-03-05',
      };

      const mockPayroll = {
        id: 'payroll-2',
        reference: 'NOM-2024-02-M',
        ...payrollData,
        status: 'DRAFT',
      };

      mockPrisma.payroll.findFirst.mockResolvedValue(null);
      mockPrisma.payroll.create.mockResolvedValue(mockPayroll);

      const result = await payrollService.createPayroll(payrollData);

      expect(result.reference).toBe('NOM-2024-02-M');
    });

    it('debe rechazar nómina duplicada para el mismo período', async () => {
      const payrollData = {
        year: 2024,
        month: 1,
        period: 'BIWEEKLY',
        periodNumber: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        paymentDate: '2024-01-20',
      };

      mockPrisma.payroll.findFirst.mockResolvedValue({ id: 'existing-payroll' });

      await expect(payrollService.createPayroll(payrollData)).rejects.toThrow(
        'Ya existe una nómina para este período'
      );
    });
  });

  describe('calculatePayroll', () => {
    it('debe calcular nómina para empleados activos', async () => {
      const mockPayroll = {
        id: 'payroll-1',
        status: 'DRAFT',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
      };

      const mockEmployees = [
        {
          id: 'emp-1',
          firstName: 'Juan',
          lastName: 'Pérez',
          baseSalary: 500,
          status: 'ACTIVE',
        },
        {
          id: 'emp-2',
          firstName: 'María',
          lastName: 'González',
          baseSalary: 600,
          status: 'ACTIVE',
        },
      ];

      const mockConcepts = [
        {
          id: 'concept-1',
          code: 'SUELDO_BASE',
          name: 'Sueldo Base',
          type: 'ASSIGNMENT',
          calculationType: 'FIXED',
          isActive: true,
          order: 1,
        },
        {
          id: 'concept-2',
          code: 'IVSS',
          name: 'IVSS',
          type: 'DEDUCTION',
          calculationType: 'PERCENTAGE',
          percentage: 4,
          isActive: true,
          order: 2,
        },
      ];

      const mockAttendances = [
        {
          employeeId: 'emp-1',
          date: new Date('2024-01-02'),
          status: 'PRESENT',
        },
        {
          employeeId: 'emp-2',
          date: new Date('2024-01-02'),
          status: 'PRESENT',
        },
      ];

      mockPrisma.payroll.findUnique.mockResolvedValue(mockPayroll);
      mockPrisma.employee.findMany.mockResolvedValue(mockEmployees);
      mockPrisma.payrollConcept.findMany.mockResolvedValue(mockConcepts);
      mockPrisma.attendance.findMany.mockResolvedValue(mockAttendances);
      mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
      mockPrisma.payroll.update.mockResolvedValue({
        ...mockPayroll,
        status: 'CALCULATED',
        totalGross: 1100,
        totalNet: 1056,
      });

      const result = await payrollService.calculatePayroll('payroll-1');

      expect(result.status).toBe('CALCULATED');
      expect(mockPrisma.employee.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' },
        })
      );
    });

    it('debe rechazar cálculo si la nómina no está en estado DRAFT', async () => {
      const mockPayroll = {
        id: 'payroll-1',
        status: 'APPROVED',
      };

      mockPrisma.payroll.findUnique.mockResolvedValue(mockPayroll);

      await expect(payrollService.calculatePayroll('payroll-1')).rejects.toThrow(
        'Solo se pueden calcular nóminas en estado DRAFT'
      );
    });
  });

  describe('approvePayroll', () => {
    it('debe aprobar una nómina calculada', async () => {
      const mockPayroll = {
        id: 'payroll-1',
        status: 'CALCULATED',
        totalGross: 1000,
        totalNet: 900,
      };

      const approvedPayroll = {
        ...mockPayroll,
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'user-1',
      };

      mockPrisma.payroll.findUnique.mockResolvedValue(mockPayroll);
      mockPrisma.payroll.update.mockResolvedValue(approvedPayroll);

      const result = await payrollService.approvePayroll('payroll-1', 'user-1');

      expect(result.status).toBe('APPROVED');
      expect(result.approvedBy).toBe('user-1');
      expect(mockPrisma.payroll.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payroll-1' },
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedBy: 'user-1',
          }),
        })
      );
    });

    it('debe rechazar aprobación si la nómina no está calculada', async () => {
      const mockPayroll = {
        id: 'payroll-1',
        status: 'DRAFT',
      };

      mockPrisma.payroll.findUnique.mockResolvedValue(mockPayroll);

      await expect(payrollService.approvePayroll('payroll-1', 'user-1')).rejects.toThrow(
        'Solo se pueden aprobar nóminas calculadas'
      );
    });
  });

  describe('getPayrollByEmployee', () => {
    it('debe obtener detalles de nómina de un empleado', async () => {
      const mockDetails = [
        {
          id: 'detail-1',
          payroll: {
            id: 'payroll-1',
            reference: 'NOM-2024-01-Q1',
            year: 2024,
            month: 1,
          },
          daysWorked: 15,
          grossSalary: 500,
          netSalary: 450,
          concepts: [
            {
              concept: {
                code: 'SUELDO_BASE',
                name: 'Sueldo Base',
                type: 'ASSIGNMENT',
              },
              amount: 500,
            },
            {
              concept: {
                code: 'IVSS',
                name: 'IVSS',
                type: 'DEDUCTION',
              },
              amount: 20,
            },
          ],
        },
      ];

      mockPrisma.payrollDetail.findMany.mockResolvedValue(mockDetails);

      const result = await payrollService.getPayrollByEmployee('emp-1', {
        year: 2024,
      });

      expect(result).toHaveLength(1);
      expect(result[0].payroll.reference).toBe('NOM-2024-01-Q1');
      expect(mockPrisma.payrollDetail.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
          }),
        })
      );
    });
  });
});
