import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook para obtener el árbol jerárquico de departamentos
 */
export function useDepartmentTree() {
  return useQuery({
    queryKey: ['departments', 'tree'],
    queryFn: async () => {
      const { data } = await api.get('/departments?hierarchical=true');
      return data;
    },
  });
}

/**
 * Hook para obtener lista paginada de departamentos
 */
export function useDepartments(filters = {}) {
  return useQuery({
    queryKey: ['departments', 'list', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      const { data } = await api.get(`/departments?${params.toString()}`);
      return data;
    },
  });
}

/**
 * Hook para obtener un departamento por ID
 */
export function useDepartment(id) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: async () => {
      const { data } = await api.get(`/departments/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener ancestros de un departamento
 */
export function useDepartmentAncestors(id) {
  return useQuery({
    queryKey: ['departments', id, 'ancestors'],
    queryFn: async () => {
      const { data } = await api.get(`/departments/${id}/ancestors`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener descendientes de un departamento
 */
export function useDepartmentDescendants(id) {
  return useQuery({
    queryKey: ['departments', id, 'descendants'],
    queryFn: async () => {
      const { data } = await api.get(`/departments/${id}/descendants`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de jerarquía
 */
export function useDepartmentHierarchyStats(id) {
  return useQuery({
    queryKey: ['departments', id, 'hierarchy-stats'],
    queryFn: async () => {
      const { data } = await api.get(`/departments/${id}/hierarchy-stats`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener reportes y estadísticas
 */
export function useDepartmentReports() {
  return useQuery({
    queryKey: ['departments', 'reports'],
    queryFn: async () => {
      const { data } = await api.get('/departments/reports/stats');
      return data;
    },
  });
}

/**
 * Hook para crear un departamento
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentData) => {
      const { data } = await api.post('/departments', departmentData);
      return data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

/**
 * Hook para actualizar un departamento
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: departmentData }) => {
      const { data } = await api.put(`/departments/${id}`, departmentData);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
    },
  });
}

/**
 * Hook para eliminar un departamento
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

/**
 * Hook para asignar un usuario a un departamento
 */
export function useAssignUserToDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, userId, role, isPrimary = false }) => {
      const { data } = await api.post(`/departments/${departmentId}/users`, {
        userId,
        role,
        isPrimary,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', variables.departmentId] });
    },
  });
}

/**
 * Hook para remover un usuario de un departamento
 */
export function useRemoveUserFromDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, userId }) => {
      await api.delete(`/departments/${departmentId}/users/${userId}`);
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', variables.departmentId] });
    },
  });
}

/**
 * Hook para cambiar el rol de un usuario en un departamento
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ departmentId, userId, role }) => {
      const { data } = await api.patch(`/departments/${departmentId}/users/${userId}/role`, {
        role,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', variables.departmentId] });
    },
  });
}
