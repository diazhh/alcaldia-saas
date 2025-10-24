import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Get progress reports by project
export const useProgressReportsByProject = (projectId, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['projects', projectId, 'progressReports', page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      const response = await api.get(`/projects/${projectId}/progress-reports?${params}`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get latest progress report
export const useLatestProgressReport = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'progressReports', 'latest'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/progress-reports/latest`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get progress report stats
export const useProgressReportStats = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId, 'progressReports', 'stats'],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/progress-reports/stats`);
      return response.data.data;
    },
    enabled: !!projectId,
  });
};

// Get progress report by ID
export const useProgressReport = (reportId) => {
  return useQuery({
    queryKey: ['progressReports', reportId],
    queryFn: async () => {
      const response = await api.get(`/projects/progress-reports/${reportId}`);
      return response.data.data;
    },
    enabled: !!reportId,
  });
};

// Create progress report
export const useCreateProgressReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }) => {
      const response = await api.post(`/projects/${projectId}/progress-reports`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'progressReports'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

// Update progress report
export const useUpdateProgressReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, data }) => {
      const response = await api.put(`/projects/progress-reports/${reportId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progressReports', variables.reportId] });
    },
  });
};
