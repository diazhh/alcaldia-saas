import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Get all change orders
export const useChangeOrders = (filters = {}, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['changeOrders', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit, ...filters });
      const response = await api.get(`/projects/change-orders?${params}`);
      return response.data.data;
    },
  });
};

// Get change orders by project
export const useChangeOrdersByProject = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'changeOrders'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/change-orders`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get change order by ID
export const useChangeOrder = (orderId) => {
  return useQuery({
    queryKey: ['changeOrders', orderId],
    queryFn: async () => {
      const response = await api.get(`/projects/change-orders/${orderId}`);
      return response.data.data;
    },
    enabled: !!orderId,
  });
};

// Get change order stats
export const useChangeOrderStats = (projectId = null) => {
  return useQuery({
    queryKey: ['changeOrders', 'stats', projectId],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await api.get(`/projects/change-orders/stats${params}`);
      return response.data.data;
    },
  });
};

// Create change order
export const useCreateChangeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.post(`/projects/${projectId}/change-orders`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'changeOrders'] });
    },
  });
};

// Update change order
export const useUpdateChangeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, data }) => {
      const response = await api.put(`/projects/change-orders/${orderId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders'] });
      queryClient.invalidateQueries({ queryKey: ['changeOrders', variables.orderId] });
    },
  });
};

// Review change order
export const useReviewChangeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, reviewNotes }) => {
      const response = await api.post(`/projects/change-orders/${orderId}/review`, { reviewNotes });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders', variables.orderId] });
    },
  });
};

// Approve change order
export const useApproveChangeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId) => {
      const response = await api.post(`/projects/change-orders/${orderId}/approve`);
      return response.data.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders', orderId] });
    },
  });
};

// Reject change order
export const useRejectChangeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, rejectionReason }) => {
      const response = await api.post(`/projects/change-orders/${orderId}/reject`, { rejectionReason });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders', variables.orderId] });
    },
  });
};

// Implement change order
export const useImplementChangeOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId) => {
      const response = await api.post(`/projects/change-orders/${orderId}/implement`);
      return response.data.data;
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['changeOrders', orderId] });
    },
  });
};
