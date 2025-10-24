'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook personalizado para gestión de empleados
 */

// Keys para React Query
export const employeeKeys = {
  all: ['employees'],
  lists: () => [...employeeKeys.all, 'list'],
  list: (filters) => [...employeeKeys.lists(), filters],
  details: () => [...employeeKeys.all, 'detail'],
  detail: (id) => [...employeeKeys.details(), id],
  profile: (id) => [...employeeKeys.all, 'profile', id],
  stats: () => [...employeeKeys.all, 'stats'],
};

/**
 * Obtener lista de empleados con filtros
 */
export function useEmployees(filters = {}) {
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.positionId) params.append('positionId', filters.positionId);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/hr/employees?${params.toString()}`);
      // La respuesta tiene estructura: { success, data: [...], pagination: {...} }
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || { total: 0, page: 1, limit: 20, pages: 0 }
      };
    },
    keepPreviousData: true,
  });
}

/**
 * Obtener un empleado por ID
 */
export function useEmployee(id) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/hr/employees/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Obtener perfil completo de un empleado
 */
export function useEmployeeProfile(id) {
  return useQuery({
    queryKey: employeeKeys.profile(id),
    queryFn: async () => {
      const { data } = await api.get(`/hr/employees/${id}/profile`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Obtener estadísticas de empleados
 */
export function useEmployeeStats() {
  return useQuery({
    queryKey: employeeKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get('/hr/employees/stats/general');
      return data.data;
    },
  });
}

/**
 * Crear un nuevo empleado
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (employeeData) => {
      const { data } = await api.post('/hr/employees', employeeData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(employeeKeys.lists());
      queryClient.invalidateQueries(employeeKeys.stats());
    },
  });
}

/**
 * Actualizar un empleado
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data: employeeData }) => {
      const { data } = await api.put(`/hr/employees/${id}`, employeeData);
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(employeeKeys.detail(variables.id));
      queryClient.invalidateQueries(employeeKeys.profile(variables.id));
      queryClient.invalidateQueries(employeeKeys.lists());
    },
  });
}

/**
 * Cambiar estado de un empleado
 */
export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, reason }) => {
      const { data } = await api.patch(`/hr/employees/${id}/status`, { status, reason });
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(employeeKeys.detail(variables.id));
      queryClient.invalidateQueries(employeeKeys.lists());
      queryClient.invalidateQueries(employeeKeys.stats());
    },
  });
}

/**
 * Eliminar un empleado (soft delete)
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/hr/employees/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(employeeKeys.lists());
      queryClient.invalidateQueries(employeeKeys.stats());
    },
  });
}

export default useEmployees;
