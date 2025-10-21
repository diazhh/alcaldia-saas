/**
 * Tests unitarios para el servicio de asistencia
 */
import { jest } from '@jest/globals';

// Mock de Prisma
const mockPrisma = {
  attendance: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  employee: {
    findUnique: jest.fn(),
  },
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

const attendanceService = await import('../../../src/modules/hr/services/attendance.service.js');

describe('AttendanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordAttendance', () => {
    it('debe registrar entrada de un empleado', async () => {
      const attendanceData = {
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkIn: new Date('2024-01-15T08:00:00'),
        status: 'PRESENT',
      };

      const mockEmployee = {
        id: 'emp-1',
        firstName: 'Juan',
        lastName: 'Pérez',
      };

      const mockAttendance = {
        id: 'attendance-1',
        ...attendanceData,
        hoursWorked: 0,
        isLate: false,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(mockAttendance);

      const result = await attendanceService.recordAttendance(attendanceData);

      expect(result).toEqual(mockAttendance);
      expect(mockPrisma.attendance.create).toHaveBeenCalledTimes(1);
    });

    it('debe detectar retardo si llega después de las 8:15 AM', async () => {
      const attendanceData = {
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkIn: new Date('2024-01-15T08:30:00'), // 30 minutos tarde
        status: 'PRESENT',
      };

      const mockEmployee = {
        id: 'emp-1',
        firstName: 'Juan',
        lastName: 'Pérez',
      };

      const mockAttendance = {
        id: 'attendance-1',
        ...attendanceData,
        isLate: true,
        lateMinutes: 30,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(mockAttendance);

      const result = await attendanceService.recordAttendance(attendanceData);

      expect(result.isLate).toBe(true);
      expect(result.lateMinutes).toBeGreaterThan(0);
    });

    it('debe rechazar registro duplicado para el mismo día', async () => {
      const attendanceData = {
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkIn: new Date('2024-01-15T08:00:00'),
      };

      const mockEmployee = {
        id: 'emp-1',
      };

      const existingAttendance = {
        id: 'attendance-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.attendance.findFirst.mockResolvedValue(existingAttendance);

      await expect(attendanceService.recordAttendance(attendanceData)).rejects.toThrow(
        'Ya existe un registro de asistencia para este día'
      );
    });
  });

  describe('updateCheckOut', () => {
    it('debe registrar salida y calcular horas trabajadas', async () => {
      const mockAttendance = {
        id: 'attendance-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        checkIn: new Date('2024-01-15T08:00:00'),
        checkOut: null,
        hoursWorked: 0,
      };

      const checkOutTime = new Date('2024-01-15T17:00:00');
      
      const updatedAttendance = {
        ...mockAttendance,
        checkOut: checkOutTime,
        hoursWorked: 9, // 9 horas trabajadas
      };

      mockPrisma.attendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrisma.attendance.update.mockResolvedValue(updatedAttendance);

      const result = await attendanceService.updateCheckOut('attendance-1', checkOutTime);

      expect(result.checkOut).toEqual(checkOutTime);
      expect(result.hoursWorked).toBe(9);
      expect(mockPrisma.attendance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'attendance-1' },
          data: expect.objectContaining({
            checkOut: checkOutTime,
            hoursWorked: expect.any(Number),
          }),
        })
      );
    });

    it('debe rechazar actualización si ya tiene salida registrada', async () => {
      const mockAttendance = {
        id: 'attendance-1',
        checkIn: new Date('2024-01-15T08:00:00'),
        checkOut: new Date('2024-01-15T17:00:00'),
      };

      mockPrisma.attendance.findUnique.mockResolvedValue(mockAttendance);

      await expect(
        attendanceService.updateCheckOut('attendance-1', new Date())
      ).rejects.toThrow('Ya existe una salida registrada');
    });
  });

  describe('getAttendanceByEmployee', () => {
    it('debe obtener registros de asistencia de un empleado', async () => {
      const mockAttendances = [
        {
          id: 'attendance-1',
          employeeId: 'emp-1',
          date: new Date('2024-01-15'),
          checkIn: new Date('2024-01-15T08:00:00'),
          checkOut: new Date('2024-01-15T17:00:00'),
          status: 'PRESENT',
          hoursWorked: 9,
          isLate: false,
        },
        {
          id: 'attendance-2',
          employeeId: 'emp-1',
          date: new Date('2024-01-16'),
          checkIn: new Date('2024-01-16T08:30:00'),
          checkOut: new Date('2024-01-16T17:00:00'),
          status: 'PRESENT',
          hoursWorked: 8.5,
          isLate: true,
          lateMinutes: 30,
        },
      ];

      mockPrisma.attendance.findMany.mockResolvedValue(mockAttendances);
      mockPrisma.attendance.count.mockResolvedValue(2);

      const result = await attendanceService.getAttendanceByEmployee('emp-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].employeeId).toBe('emp-1');
      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
          }),
        })
      );
    });

    it('debe filtrar por rango de fechas', async () => {
      mockPrisma.attendance.findMany.mockResolvedValue([]);
      mockPrisma.attendance.count.mockResolvedValue(0);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await attendanceService.getAttendanceByEmployee('emp-1', {
        startDate,
        endDate,
      });

      expect(mockPrisma.attendance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            employeeId: 'emp-1',
            date: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });
  });

  describe('getAttendanceStats', () => {
    it('debe calcular estadísticas de asistencia de un empleado', async () => {
      const mockAttendances = [
        {
          status: 'PRESENT',
          isLate: false,
          hoursWorked: 9,
        },
        {
          status: 'PRESENT',
          isLate: true,
          hoursWorked: 8,
        },
        {
          status: 'ABSENT',
          isLate: false,
          hoursWorked: 0,
        },
        {
          status: 'PRESENT',
          isLate: false,
          hoursWorked: 9,
        },
      ];

      mockPrisma.attendance.findMany.mockResolvedValue(mockAttendances);

      const result = await attendanceService.getAttendanceStats('emp-1', {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result).toHaveProperty('totalDays');
      expect(result).toHaveProperty('presentDays');
      expect(result).toHaveProperty('absentDays');
      expect(result).toHaveProperty('lateDays');
      expect(result).toHaveProperty('totalHoursWorked');
      expect(result.presentDays).toBe(3);
      expect(result.absentDays).toBe(1);
      expect(result.lateDays).toBe(1);
    });
  });

  describe('justifyAbsence', () => {
    it('debe justificar una ausencia', async () => {
      const mockAttendance = {
        id: 'attendance-1',
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        status: 'ABSENT',
        isJustified: false,
      };

      const justifiedAttendance = {
        ...mockAttendance,
        isJustified: true,
        justificationReason: 'Cita médica',
        justificationDocument: 'doc-url.pdf',
      };

      mockPrisma.attendance.findUnique.mockResolvedValue(mockAttendance);
      mockPrisma.attendance.update.mockResolvedValue(justifiedAttendance);

      const result = await attendanceService.justifyAbsence('attendance-1', {
        reason: 'Cita médica',
        document: 'doc-url.pdf',
      });

      expect(result.isJustified).toBe(true);
      expect(result.justificationReason).toBe('Cita médica');
      expect(mockPrisma.attendance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'attendance-1' },
          data: expect.objectContaining({
            isJustified: true,
            justificationReason: 'Cita médica',
          }),
        })
      );
    });

    it('debe rechazar justificación si no es ausencia o retardo', async () => {
      const mockAttendance = {
        id: 'attendance-1',
        status: 'PRESENT',
        isLate: false,
      };

      mockPrisma.attendance.findUnique.mockResolvedValue(mockAttendance);

      await expect(
        attendanceService.justifyAbsence('attendance-1', { reason: 'Test' })
      ).rejects.toThrow('Solo se pueden justificar ausencias o retardos');
    });
  });

  describe('getAttendanceReport', () => {
    it('debe generar reporte de asistencia por departamento', async () => {
      const mockGroupedData = [
        {
          status: 'PRESENT',
          _count: { id: 45 },
        },
        {
          status: 'ABSENT',
          _count: { id: 5 },
        },
      ];

      mockPrisma.attendance.groupBy.mockResolvedValue(mockGroupedData);

      const result = await attendanceService.getAttendanceReport({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      });

      expect(result).toHaveProperty('byStatus');
      expect(mockPrisma.attendance.groupBy).toHaveBeenCalled();
    });
  });

  describe('markAbsence', () => {
    it('debe marcar ausencia para un empleado sin registro', async () => {
      const absenceData = {
        employeeId: 'emp-1',
        date: new Date('2024-01-15'),
        status: 'ABSENT',
      };

      const mockEmployee = {
        id: 'emp-1',
        firstName: 'Juan',
        lastName: 'Pérez',
      };

      const mockAbsence = {
        id: 'attendance-1',
        ...absenceData,
        isJustified: false,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPrisma.attendance.findFirst.mockResolvedValue(null);
      mockPrisma.attendance.create.mockResolvedValue(mockAbsence);

      const result = await attendanceService.markAbsence(absenceData);

      expect(result.status).toBe('ABSENT');
      expect(result.isJustified).toBe(false);
    });
  });
});
