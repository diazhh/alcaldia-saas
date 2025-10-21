'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook personalizado para gestión de nómina
 */

// Keys para React Query
export const payrollKeys = {
  all: ['payroll'],
  lists: () => [...payrollKeys.all, 'list'],
  list: (filters) => [...payrollKeys.lists(), filters],
  details: () => [...payrollKeys.all, 'detail'],
  detail: (id) => [...payrollKeys.details(), id],
  employee: (employeeId, filters) => [...payrollKeys.all, 'employee', employeeId, filters],
};

/**
 * Obtener lista de nóminas
 */
export function usePayrolls(filters = {}) {
  return useQuery({
    queryKey: payrollKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.status) params.append('status', filters.status);
      
      const { data } = await api.get(`/hr/payroll?${params.toString()}`);
      return data.data;
    },
    keepPreviousData: true,
  });
}

/**
 * Obtener una nómina por ID
 */
export function usePayroll(id) {
  return useQuery({
    queryKey: payrollKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/hr/payroll/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Obtener nóminas de un empleado
 */
export function useEmployeePayrolls(employeeId, filters = {}) {
  return useQuery({
    queryKey: payrollKeys.employee(employeeId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      
      const { data } = await api.get(`/hr/payroll/employee/${employeeId}?${params.toString()}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Crear una nueva nómina
 */
export function useCreatePayroll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payrollData) => {
      const { data } = await api.post('/hr/payroll', payrollData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(payrollKeys.lists());
    },
  });
}

/**
 * Calcular nómina
 */
export function useCalculatePayroll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/hr/payroll/${id}/calculate`);
      return data.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries(payrollKeys.detail(id));
      queryClient.invalidateQueries(payrollKeys.lists());
    },
  });
}

/**
 * Aprobar nómina
 */
export function useApprovePayroll() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/hr/payroll/${id}/approve`);
      return data.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries(payrollKeys.detail(id));
      queryClient.invalidateQueries(payrollKeys.lists());
    },
  });
}

/**
 * Exportar nómina a TXT bancario
 */
export function useExportPayroll() {
  return useMutation({
    mutationFn: async (id) => {
      const response = await api.get(`/hr/payroll/${id}/export`, {
        responseType: 'blob',
      });
      
      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nomina-${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return response.data;
    },
  });
}

export default usePayrolls;
