import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Get documents by project
export const useDocumentsByProject = (projectId, type = null) => {
  return useQuery({
    queryKey: ['projects', projectId, 'documents', type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : '';
      const response = await api.get(`/projects/${projectId}/documents${params}`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get document count by type
export const useDocumentCountByType = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'documents', 'count'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/documents/count`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get document by ID
export const useDocument = (documentId) => {
  return useQuery({
    queryKey: ['documents', documentId],
    queryFn: async () => {
      const response = await api.get(`/projects/documents/${documentId}`);
      return response.data.data;
    },
    enabled: !!documentId,
  });
};

// Create document
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.post(`/projects/${projectId}/documents`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'documents'] });
    },
  });
};

// Update document
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, data }) => {
      const response = await api.put(`/projects/documents/${documentId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.documentId] });
    },
  });
};

// Delete document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId) => {
      const response = await api.delete(`/projects/documents/${documentId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};
