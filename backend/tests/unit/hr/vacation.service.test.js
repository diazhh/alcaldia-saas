/**
 * Tests unitarios para el servicio de vacaciones
 */
import { jest } from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
  vacationRequest: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  employee: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const vacationService = await import('../../../src/modules/hr/services/vacation.service.js');

describe('VacationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateAvailableVacationDays', () => {
    it('debe calcular 15 días de vacaciones para el primer año', async () => {
      const hireDate = new Date();
      hireDate.setFullYear(hireDate.getFullYear() - 1); // 1 año de antigüedad

      const mockEmployee = {
        id: 'emp-1',
        hireDate,
        vacationDays: 0,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await vacationService.calculateAvailableVacationDays('emp-1');

      expect(result).toBeGreaterThanOrEqual(15);
      expect(result).toBeLessThanOrEqual(16); // Puede tener 1 día adicional por año adicional
    });

    it('debe calcular más días de vacaciones después del primer año', async () => {
      const hireDate = new Date();
      hireDate.setFullYear(hireDate.getFullYear() - 3); // 3 años de antigüedad

      const mockEmployee = {
        id: 'emp-2',
        hireDate,
        vacationDays: 0,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await vacationService.calculateAvailableVacationDays('emp-2');

      // Primer año: 15 días, años adicionales: 1 día por año
      expect(result).toBeGreaterThanOrEqual(17); // 15 + 2
    });
  });

  describe('createVacationRequest', () => {
    it('debe crear una solicitud de vacaciones exitosamente', async () => {
      const requestData = {
        employeeId: 'emp-1',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-15'),
        requestedDays: 15,
        reason: 'Vacaciones anuales',
      };

      const mockEmployee = {
        id: 'emp-1',
        vacationDays: 20,
        firstName: 'Juan',
        lastName: 'Pérez',
      };

      const mockRequest = {
        id: 'vacation-1',
        ...requestData,
        status: 'PENDING',
        createdAt: new Date(),
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.vacationRequest.create.mockResolvedValue(mockRequest);

      const result = await vacationService.createVacationRequest(requestData);

      expect(result).toEqual(mockRequest);
      expect(result.status).toBe('PENDING');
      expect(mockPrisma.vacationRequest.create).toHaveBeenCalledTimes(1);
    });

    it('debe rechazar solicitud si no hay días disponibles', async () => {
      const requestData = {
        employeeId: 'emp-1',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-15'),
        requestedDays: 15,
      };

      const mockEmployee = {
        id: 'emp-1',
        vacationDays: 5, // Solo 5 días disponibles
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      await expect(vacationService.createVacationRequest(requestData)).rejects.toThrow(
        'No hay suficientes días de vacaciones disponibles'
      );
    });

    it('debe validar que la fecha de inicio sea anterior a la fecha de fin', async () => {
      const requestData = {
        employeeId: 'emp-1',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-01'), // Fecha incorrecta
        requestedDays: 15,
      };

      await expect(vacationService.createVacationRequest(requestData)).rejects.toThrow();
    });
  });

  describe('approveVacationRequest', () => {
    it('debe aprobar una solicitud de vacaciones y descontar días', async () => {
      const mockRequest = {
        id: 'vacation-1',
        employeeId: 'emp-1',
        requestedDays: 10,
        status: 'PENDING',
      };

      const mockEmployee = {
        id: 'emp-1',
        vacationDays: 20,
      };

      const approvedRequest = {
        ...mockRequest,
        status: 'APPROVED',
        approvedBy: 'supervisor-1',
        approvedAt: new Date(),
      };

      mockPrisma.vacationRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
      mockPrisma.vacationRequest.update.mockResolvedValue(approvedRequest);
      mockPrisma.employee.update.mockResolvedValue({
        ...mockEmployee,
        vacationDays: 10,
      });

      const result = await vacationService.approveVacationRequest(
        'vacation-1',
        'supervisor-1'
      );

      expect(result.status).toBe('APPROVED');
      expect(result.approvedBy).toBe('supervisor-1');
      expect(mockPrisma.employee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'emp-1' },
          data: { vacationDays: 10 },
        })
      );
    });

    it('debe rechazar aprobación si la solicitud no está pendiente', async () => {
      const mockRequest = {
        id: 'vacation-1',
        status: 'APPROVED',
      };

      mockPrisma.vacationRequest.findUnique.mockResolvedValue(mockRequest);

      await expect(
        vacationService.approveVacationRequest('vacation-1', 'supervisor-1')
      ).rejects.toThrow('Solo se pueden aprobar solicitudes pendientes');
    });
  });

  describe('rejectVacationRequest', () => {
    it('debe rechazar una solicitud de vacaciones', async () => {
      const mockRequest = {
        id: 'vacation-1',
        employeeId: 'emp-1',
        status: 'PENDING',
      };

      const rejectedRequest = {
        ...mockRequest,
        status: 'REJECTED',
        rejectedBy: 'supervisor-1',
        rejectedAt: new Date(),
        rejectionReason: 'Período no disponible',
      };

      mockPrisma.vacationRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrisma.vacationRequest.update.mockResolvedValue(rejectedRequest);

      const result = await vacationService.rejectVacationRequest(
        'vacation-1',
        'supervisor-1',
        'Período no disponible'
      );

      expect(result.status).toBe('REJECTED');
      expect(result.rejectionReason).toBe('Período no disponible');
    });
  });

  describe('getVacationRequestsByEmployee', () => {
    it('debe obtener solicitudes de vacaciones de un empleado', async () => {
      const mockRequests = [
        {
          id: 'vacation-1',
          employeeId: 'emp-1',
          startDate: new Date('2024-07-01'),
          endDate: new Date('2024-07-15'),
          requestedDays: 15,
          status: 'APPROVED',
        },
        {
          id: 'vacation-2',
          employeeId: 'emp-1',
          startDate: new Date('2024-12-20'),
          endDate: new Date('2024-12-31'),
          requestedDays: 12,
          status: 'PENDING',
        },
      ];

      mockPrisma.vacationRequest.findMany.mockResolvedValue(mockRequests);

      const result = await vacationService.getVacationRequestsByEmployee('emp-1');

      expect(result).toHaveLength(2);
      expect(result[0].employeeId).toBe('emp-1');
      expect(mockPrisma.vacationRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { employeeId: 'emp-1' },
        })
      );
    });

    it('debe filtrar solicitudes por estado', async () => {
      mockPrisma.vacationRequest.findMany.mockResolvedValue([]);

      await vacationService.getVacationRequestsByEmployee('emp-1', {
        status: 'APPROVED',
      });

      expect(mockPrisma.vacationRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
            status: 'APPROVED',
          }),
        })
      );
    });
  });

  describe('getVacationBalance', () => {
    it('debe obtener el saldo de vacaciones de un empleado', async () => {
      const mockEmployee = {
        id: 'emp-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        hireDate: new Date('2022-01-15'),
        vacationDays: 12,
      };

      const mockPendingRequests = [
        { requestedDays: 5, status: 'PENDING' },
      ];

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.vacationRequest.findMany.mockResolvedValue(mockPendingRequests);

      const result = await vacationService.getVacationBalance('emp-1');

      expect(result).toHaveProperty('available', 12);
      expect(result).toHaveProperty('pending', 5);
      expect(result).toHaveProperty('usable', 7); // 12 - 5
    });
  });

  describe('cancelVacationRequest', () => {
    it('debe cancelar una solicitud pendiente y devolver días', async () => {
      const mockRequest = {
        id: 'vacation-1',
        employeeId: 'emp-1',
        requestedDays: 10,
        status: 'PENDING',
      };

      const mockEmployee = {
        id: 'emp-1',
        vacationDays: 5,
      };

      const cancelledRequest = {
        ...mockRequest,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      };

      mockPrisma.vacationRequest.findUnique.mockResolvedValue(mockRequest);
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
      mockPrisma.vacationRequest.update.mockResolvedValue(cancelledRequest);

      const result = await vacationService.cancelVacationRequest('vacation-1', 'emp-1');

      expect(result.status).toBe('CANCELLED');
    });

    it('debe rechazar cancelación de solicitud aprobada', async () => {
      const mockRequest = {
        id: 'vacation-1',
        status: 'APPROVED',
      };

      mockPrisma.vacationRequest.findUnique.mockResolvedValue(mockRequest);

      await expect(
        vacationService.cancelVacationRequest('vacation-1', 'emp-1')
      ).rejects.toThrow('No se puede cancelar una solicitud aprobada');
    });
  });
});
