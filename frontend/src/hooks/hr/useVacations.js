'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook personalizado para gestión de vacaciones
 */

// Keys para React Query
export const vacationKeys = {
  all: ['vacations'],
  lists: () => [...vacationKeys.all, 'list'],
  list: (filters) => [...vacationKeys.lists(), filters],
  employee: (employeeId, filters) => [...vacationKeys.all, 'employee', employeeId, filters],
  balance: (employeeId) => [...vacationKeys.all, 'balance', employeeId],
};

/**
 * Obtener solicitudes de vacaciones
 */
export function useVacations(filters = {}) {
  return useQuery({
    queryKey: vacationKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const { data } = await api.get(`/hr/vacations?${params.toString()}`);
      return data.data;
    },
  });
}

/**
 * Obtener solicitudes de vacaciones de un empleado
 */
export function useEmployeeVacations(employeeId, filters = {}) {
  return useQuery({
    queryKey: vacationKeys.employee(employeeId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.year) params.append('year', filters.year);
      
      const { data } = await api.get(`/hr/vacations/employee/${employeeId}?${params.toString()}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Obtener saldo de vacaciones de un empleado
 */
export function useVacationBalance(employeeId) {
  return useQuery({
    queryKey: vacationKeys.balance(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/vacations/balance/${employeeId}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Crear solicitud de vacaciones
 */
export function useCreateVacation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vacationData) => {
      const { data } = await api.post('/hr/vacations', vacationData);
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(vacationKeys.lists());
      queryClient.invalidateQueries(vacationKeys.employee(variables.employeeId));
      queryClient.invalidateQueries(vacationKeys.balance(variables.employeeId));
    },
  });
}

/**
 * Aprobar solicitud de vacaciones
 */
export function useApproveVacation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/hr/vacations/${id}/approve`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(vacationKeys.lists());
      queryClient.invalidateQueries(vacationKeys.employee(data.employeeId));
      queryClient.invalidateQueries(vacationKeys.balance(data.employeeId));
    },
  });
}

/**
 * Rechazar solicitud de vacaciones
 */
export function useRejectVacation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/hr/vacations/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(vacationKeys.lists());
      queryClient.invalidateQueries(vacationKeys.employee(data.employeeId));
    },
  });
}

/**
 * Cancelar solicitud de vacaciones
 */
export function useCancelVacation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/hr/vacations/${id}/cancel`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(vacationKeys.lists());
      queryClient.invalidateQueries(vacationKeys.employee(data.employeeId));
      queryClient.invalidateQueries(vacationKeys.balance(data.employeeId));
    },
  });
}

export default useVacations;
