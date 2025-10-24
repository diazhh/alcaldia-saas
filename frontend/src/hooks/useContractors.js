import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Get all contractors
export const useContractors = (filters = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['contractors', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit, ...filters });
      const response = await api.get(`/projects/contractors?${params}`);
      return response.data.data;
    },
  });
};

// Get contractor by ID
export const useContractor = (contractorId) => {
  return useQuery({
    queryKey: ['contractors', contractorId],
    queryFn: async () => {
      const response = await api.get(`/projects/contractors/${contractorId}`);
      return response.data.data;
    },
    enabled: !!contractorId,
  });
};

// Get contractor stats
export const useContractorStats = () => {
  return useQuery({
    queryKey: ['contractors', 'stats'],
    queryFn: async () => {
      const response = await api.get('/projects/contractors/stats');
      return response.data.data;
    },
  });
};

// Create contractor
export const useCreateContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contractorData) => {
      const response = await api.post('/projects/contractors', contractorData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
    },
  });
};

// Update contractor
export const useUpdateContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractorId, data }) => {
      const response = await api.put(`/projects/contractors/${contractorId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      queryClient.invalidateQueries({ queryKey: ['contractors', variables.contractorId] });
    },
  });
};

// Delete contractor
export const useDeleteContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contractorId) => {
      const response = await api.delete(`/projects/contractors/${contractorId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
    },
  });
};

// Blacklist contractor
export const useBlacklistContractor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractorId, reason }) => {
      const response = await api.post(`/projects/contractors/${contractorId}/blacklist`, { reason });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      queryClient.invalidateQueries({ queryKey: ['contractors', variables.contractorId] });
    },
  });
};
