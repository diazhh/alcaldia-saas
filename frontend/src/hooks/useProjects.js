import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook para obtener todos los proyectos con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Número de página
 * @param {number} limit - Límite de resultados
 */
export const useProjects = (filters = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['projects', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });
      
      const response = await api.get(`/projects?${params}`);
      return response.data.data;
    },
  });
};

/**
 * Hook para obtener un proyecto por ID
 * @param {string} projectId - ID del proyecto
 */
export const useProject = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

/**
 * Hook para obtener estadísticas generales de proyectos
 */
export const useProjectStats = () => {
  return useQuery({
    queryKey: ['projectStats'],
    queryFn: async () => {
      const response = await api.get('/projects/stats/general');
      return response.data.data;
    },
  });
};

/**
 * Hook para crear un proyecto
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData) => {
      const response = await api.post('/projects', projectData);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidar cache de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });
    },
  });
};

/**
 * Hook para actualizar un proyecto
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.put(`/projects/${projectId}`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });
    },
  });
};

/**
 * Hook para eliminar un proyecto
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId) => {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });
    },
  });
};

/**
 * Hook para obtener hitos de un proyecto
 */
export const useMilestones = (projectId) => {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/milestones`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

/**
 * Hook para crear un hito
 */
export const useCreateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.post(`/projects/${projectId}/milestones`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

/**
 * Hook para actualizar progreso de un hito
 */
export const useUpdateMilestoneProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ milestoneId, progress, projectId }) => {
      const response = await api.patch(`/projects/milestones/${milestoneId}/progress`, { progress });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['milestones', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

/**
 * Hook para obtener gastos de un proyecto
 */
export const useExpenses = (projectId) => {
  return useQuery({
    queryKey: ['expenses', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/expenses`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

/**
 * Hook para obtener estadísticas de gastos
 */
export const useExpenseStats = (projectId) => {
  return useQuery({
    queryKey: ['expenseStats', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/expenses/stats`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

/**
 * Hook para crear un gasto
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.post(`/projects/${projectId}/expenses`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};

/**
 * Hook para obtener fotos de un proyecto
 */
export const usePhotos = (projectId, type = null) => {
  return useQuery({
    queryKey: ['photos', projectId, type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : '';
      const response = await api.get(`/projects/${projectId}/photos${params}`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

/**
 * Hook para subir una foto
 */
export const useUploadPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, formData }) => {
      const response = await api.post(`/projects/${projectId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
};
