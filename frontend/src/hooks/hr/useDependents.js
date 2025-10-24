'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook personalizado para gestión de dependientes
 */

// Keys para React Query
export const dependentKeys = {
  all: ['dependents'],
  lists: () => [...dependentKeys.all, 'list'],
  list: (filters) => [...dependentKeys.lists(), filters],
  details: () => [...dependentKeys.all, 'detail'],
  detail: (id) => [...dependentKeys.details(), id],
  byEmployee: (employeeId) => [...dependentKeys.all, 'employee', employeeId],
  children: (employeeId) => [...dependentKeys.all, 'children', employeeId],
  childBonus: (employeeId) => [...dependentKeys.all, 'child-bonus', employeeId],
  stats: () => [...dependentKeys.all, 'stats'],
};

/**
 * Obtener estadísticas de dependientes
 */
export function useDependentStats() {
  return useQuery({
    queryKey: dependentKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get('/hr/dependents/stats');
      return data.data;
    },
  });
}

/**
 * Obtener lista de dependientes con filtros
 */
export function useDependents(filters = {}) {
  return useQuery({
    queryKey: dependentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.search) params.append('search', filters.search);
      if (filters.relationship) params.append('relationship', filters.relationship);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      
      const { data } = await api.get(`/hr/dependents?${params.toString()}`);
      return data.data;
    },
    keepPreviousData: true,
  });
}

/**
 * Obtener un dependiente por ID
 */
export function useDependent(id) {
  return useQuery({
    queryKey: dependentKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/hr/dependents/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Obtener dependientes por empleado
 */
export function useDependentsByEmployee(employeeId) {
  return useQuery({
    queryKey: dependentKeys.byEmployee(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/dependents/employee/${employeeId}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Obtener hijos menores de un empleado
 */
export function useEmployeeChildren(employeeId) {
  return useQuery({
    queryKey: dependentKeys.children(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/dependents/employee/${employeeId}/children`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Calcular prima por hijos
 */
export function useChildBonus(employeeId) {
  return useQuery({
    queryKey: dependentKeys.childBonus(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/dependents/employee/${employeeId}/child-bonus`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Crear dependiente
 */
export function useCreateDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dependentData) => {
      const { data } = await api.post('/hr/dependents', dependentData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(dependentKeys.lists());
      queryClient.invalidateQueries(dependentKeys.byEmployee(data.employeeId));
      queryClient.invalidateQueries(dependentKeys.stats());
    },
  });
}

/**
 * Actualizar dependiente
 */
export function useUpdateDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...dependentData }) => {
      const { data } = await api.put(`/hr/dependents/${id}`, dependentData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(dependentKeys.detail(data.id));
      queryClient.invalidateQueries(dependentKeys.lists());
      queryClient.invalidateQueries(dependentKeys.byEmployee(data.employeeId));
    },
  });
}

/**
 * Eliminar dependiente
 */
export function useDeleteDependent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/hr/dependents/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(dependentKeys.lists());
      queryClient.invalidateQueries(dependentKeys.stats());
    },
  });
}
