'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook personalizado para gestión de asistencia
 */

// Keys para React Query
export const attendanceKeys = {
  all: ['attendance'],
  lists: () => [...attendanceKeys.all, 'list'],
  list: (filters) => [...attendanceKeys.lists(), filters],
  employee: (employeeId, filters) => [...attendanceKeys.all, 'employee', employeeId, filters],
  stats: (employeeId, filters) => [...attendanceKeys.all, 'stats', employeeId, filters],
  report: (filters) => [...attendanceKeys.all, 'report', filters],
};

/**
 * Obtener registros de asistencia
 */
export function useAttendance(filters = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      
      const { data } = await api.get(`/hr/attendance?${params.toString()}`);
      return data.data;
    },
  });
}

/**
 * Obtener asistencia de un empleado
 */
export function useEmployeeAttendance(employeeId, filters = {}) {
  return useQuery({
    queryKey: attendanceKeys.employee(employeeId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const { data } = await api.get(`/hr/attendance/employee/${employeeId}?${params.toString()}`);
      return data.data;
    },
    enabled: !!employeeId,
    keepPreviousData: true,
  });
}

/**
 * Obtener estadísticas de asistencia de un empleado
 */
export function useAttendanceStats(employeeId, filters = {}) {
  return useQuery({
    queryKey: attendanceKeys.stats(employeeId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const { data } = await api.get(`/hr/attendance/stats/${employeeId}?${params.toString()}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Obtener reporte de asistencia
 */
export function useAttendanceReport(filters = {}) {
  return useQuery({
    queryKey: attendanceKeys.report(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      
      const { data } = await api.get(`/hr/attendance/report?${params.toString()}`);
      return data.data;
    },
  });
}

/**
 * Registrar asistencia
 */
export function useRecordAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceData) => {
      const { data } = await api.post('/hr/attendance', attendanceData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(attendanceKeys.lists());
      queryClient.invalidateQueries(attendanceKeys.employee(data.employeeId));
      queryClient.invalidateQueries(attendanceKeys.stats(data.employeeId));
    },
  });
}

/**
 * Actualizar salida de asistencia
 */
export function useUpdateCheckOut() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, checkOut }) => {
      const { data } = await api.patch(`/hr/attendance/${id}/checkout`, { checkOut });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(attendanceKeys.lists());
      queryClient.invalidateQueries(attendanceKeys.employee(data.employeeId));
      queryClient.invalidateQueries(attendanceKeys.stats(data.employeeId));
    },
  });
}

/**
 * Justificar ausencia o retardo
 */
export function useJustifyAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason, document }) => {
      const { data } = await api.patch(`/hr/attendance/${id}/justify`, { reason, document });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(attendanceKeys.lists());
      queryClient.invalidateQueries(attendanceKeys.employee(data.employeeId));
      queryClient.invalidateQueries(attendanceKeys.stats(data.employeeId));
    },
  });
}

export default useAttendance;
