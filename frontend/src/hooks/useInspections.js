import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Get all inspections
export const useInspections = (filters = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['inspections', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit, ...filters });
      const response = await api.get(`/projects/inspections?${params}`);
      return response.data.data;
    },
  });
};

// Get inspections by project
export const useInspectionsByProject = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'inspections'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/inspections`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get inspection by ID
export const useInspection = (inspectionId) => {
  return useQuery({
    queryKey: ['inspections', inspectionId],
    queryFn: async () => {
      const response = await api.get(`/projects/inspections/${inspectionId}`);
      return response.data.data;
    },
    enabled: !!inspectionId,
  });
};

// Get inspection stats
export const useInspectionStats = (projectId = null) => {
  return useQuery({
    queryKey: ['inspections', 'stats', projectId],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await api.get(`/projects/inspections/stats${params}`);
      return response.data.data;
    },
  });
};

// Create inspection
export const useCreateInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.post(`/projects/${projectId}/inspections`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'inspections'] });
    },
  });
};

// Update inspection
export const useUpdateInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, data }) => {
      const response = await api.put(`/projects/inspections/${inspectionId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      queryClient.invalidateQueries({ queryKey: ['inspections', variables.inspectionId] });
    },
  });
};

// Complete inspection
export const useCompleteInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ inspectionId, data }) => {
      const response = await api.post(`/projects/inspections/${inspectionId}/complete`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', variables.inspectionId] });
    },
  });
};
