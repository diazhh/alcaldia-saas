import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Get all contracts
export const useContracts = (filters = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['contracts', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit, ...filters });
      const response = await api.get(`/projects/contracts?${params}`);
      return response.data.data;
    },
  });
};

// Get contracts by project
export const useContractsByProject = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'contracts'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/contracts`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get contract by ID
export const useContract = (contractId) => {
  return useQuery({
    queryKey: ['contracts', contractId],
    queryFn: async () => {
      const response = await api.get(`/projects/contracts/${contractId}`);
      return response.data.data;
    },
    enabled: !!contractId,
  });
};

// Get contract stats
export const useContractStats = () => {
  return useQuery({
    queryKey: ['contracts', 'stats'],
    queryFn: async () => {
      const response = await api.get('/projects/contracts/stats');
      return response.data.data;
    },
  });
};

// Create contract
export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.post(`/projects/${projectId}/contracts`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'contracts'] });
    },
  });
};

// Update contract
export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, data }) => {
      const response = await api.put(`/projects/contracts/${contractId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.contractId] });
    },
  });
};

// Adjudicate contract
export const useAdjudicateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, contractorId, adjudicationDate }) => {
      const response = await api.post(`/projects/contracts/${contractId}/adjudicate`, {
        contractorId,
        adjudicationDate,
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.contractId] });
    },
  });
};

// Register payment
export const useRegisterPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contractId, amount }) => {
      const response = await api.post(`/projects/contracts/${contractId}/payment`, { amount });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.contractId] });
    },
  });
};
