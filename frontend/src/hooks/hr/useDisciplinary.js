'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook personalizado para gestión de acciones disciplinarias
 */

// Keys para React Query
export const disciplinaryKeys = {
  all: ['disciplinary'],
  lists: () => [...disciplinaryKeys.all, 'list'],
  list: (filters) => [...disciplinaryKeys.lists(), filters],
  details: () => [...disciplinaryKeys.all, 'detail'],
  detail: (id) => [...disciplinaryKeys.details(), id],
  byEmployee: (employeeId) => [...disciplinaryKeys.all, 'employee', employeeId],
  history: (employeeId) => [...disciplinaryKeys.all, 'history', employeeId],
  stats: () => [...disciplinaryKeys.all, 'stats'],
};

/**
 * Obtener estadísticas de acciones disciplinarias
 */
export function useDisciplinaryStats() {
  return useQuery({
    queryKey: disciplinaryKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get('/hr/disciplinary/stats');
      return data.data;
    },
  });
}

/**
 * Obtener lista de acciones disciplinarias con filtros
 */
export function useDisciplinaryActions(filters = {}) {
  return useQuery({
    queryKey: disciplinaryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      
      const { data } = await api.get(`/hr/disciplinary?${params.toString()}`);
      return data.data;
    },
    keepPreviousData: true,
  });
}

/**
 * Obtener una acción disciplinaria por ID
 */
export function useDisciplinaryAction(id) {
  return useQuery({
    queryKey: disciplinaryKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/hr/disciplinary/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Obtener acciones disciplinarias por empleado
 */
export function useDisciplinaryActionsByEmployee(employeeId) {
  return useQuery({
    queryKey: disciplinaryKeys.byEmployee(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/disciplinary/employee/${employeeId}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Obtener historial disciplinario de un empleado
 */
export function useDisciplinaryHistory(employeeId) {
  return useQuery({
    queryKey: disciplinaryKeys.history(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/disciplinary/employee/${employeeId}/history`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Crear acción disciplinaria
 */
export function useCreateDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionData) => {
      const { data } = await api.post('/hr/disciplinary', actionData);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(disciplinaryKeys.lists());
      queryClient.invalidateQueries(disciplinaryKeys.byEmployee(data.employeeId));
      queryClient.invalidateQueries(disciplinaryKeys.stats());
    },
  });
}

/**
 * Notificar al empleado
 */
export function useNotifyEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, responseDeadline }) => {
      const { data } = await api.patch(`/hr/disciplinary/${id}/notify`, { responseDeadline });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(disciplinaryKeys.detail(data.id));
      queryClient.invalidateQueries(disciplinaryKeys.lists());
    },
  });
}

/**
 * Registrar respuesta del empleado
 */
export function useRespondDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, employeeResponse }) => {
      const { data } = await api.patch(`/hr/disciplinary/${id}/respond`, { employeeResponse });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(disciplinaryKeys.detail(data.id));
      queryClient.invalidateQueries(disciplinaryKeys.lists());
    },
  });
}

/**
 * Tomar decisión sobre acción disciplinaria
 */
export function useDecideDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, decision, decidedBy, suspensionDays, suspensionStart, suspensionEnd }) => {
      const { data } = await api.patch(`/hr/disciplinary/${id}/decide`, {
        decision,
        decidedBy,
        suspensionDays,
        suspensionStart,
        suspensionEnd,
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(disciplinaryKeys.detail(data.id));
      queryClient.invalidateQueries(disciplinaryKeys.lists());
      queryClient.invalidateQueries(disciplinaryKeys.stats());
    },
  });
}

/**
 * Apelar acción disciplinaria
 */
export function useAppealDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, appealReason }) => {
      const { data } = await api.patch(`/hr/disciplinary/${id}/appeal`, { appealReason });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(disciplinaryKeys.detail(data.id));
      queryClient.invalidateQueries(disciplinaryKeys.lists());
    },
  });
}

/**
 * Resolver apelación
 */
export function useResolveAppeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, appealDecision, resolvedBy }) => {
      const { data } = await api.patch(`/hr/disciplinary/${id}/resolve-appeal`, {
        appealDecision,
        resolvedBy,
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(disciplinaryKeys.detail(data.id));
      queryClient.invalidateQueries(disciplinaryKeys.lists());
    },
  });
}

/**
 * Cerrar acción disciplinaria
 */
export function useCloseDisciplinaryAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/hr/disciplinary/${id}/close`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(disciplinaryKeys.detail(data.id));
      queryClient.invalidateQueries(disciplinaryKeys.lists());
      queryClient.invalidateQueries(disciplinaryKeys.stats());
    },
  });
}
