'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Hook personalizado para gestión de Caja de Ahorro
 */

// Keys para React Query
export const savingsBankKeys = {
  all: ['savings-bank'],
  lists: () => [...savingsBankKeys.all, 'list'],
  list: (filters) => [...savingsBankKeys.lists(), filters],
  details: () => [...savingsBankKeys.all, 'detail'],
  detail: (id) => [...savingsBankKeys.details(), id],
  employee: (employeeId) => [...savingsBankKeys.all, 'employee', employeeId],
  stats: () => [...savingsBankKeys.all, 'stats'],
  loans: () => [...savingsBankKeys.all, 'loans'],
  loansByEmployee: (employeeId) => [...savingsBankKeys.loans(), 'employee', employeeId],
};

/**
 * Obtener estadísticas de caja de ahorro
 */
export function useSavingsBankStats() {
  return useQuery({
    queryKey: savingsBankKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get('/hr/savings-bank/stats');
      return data.data;
    },
  });
}

/**
 * Obtener lista de cuentas de ahorro
 */
export function useSavingsBankAccounts(filters = {}) {
  return useQuery({
    queryKey: savingsBankKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
      
      const { data } = await api.get(`/hr/savings-bank?${params.toString()}`);
      return data.data;
    },
    keepPreviousData: true,
  });
}

/**
 * Obtener cuenta de ahorro por empleado
 */
export function useSavingsBankByEmployee(employeeId) {
  return useQuery({
    queryKey: savingsBankKeys.employee(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/savings-bank/employee/${employeeId}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Obtener préstamos por empleado
 */
export function useSavingsLoansByEmployee(employeeId) {
  return useQuery({
    queryKey: savingsBankKeys.loansByEmployee(employeeId),
    queryFn: async () => {
      const { data } = await api.get(`/hr/savings-bank/loans/employee/${employeeId}`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Crear cuenta de ahorro
 */
export function useCreateSavingsBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData) => {
      const { data } = await api.post('/hr/savings-bank', accountData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(savingsBankKeys.lists());
      queryClient.invalidateQueries(savingsBankKeys.stats());
    },
  });
}

/**
 * Actualizar tasas de aporte
 */
export function useUpdateSavingsBankRates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, rates }) => {
      const { data } = await api.patch(`/hr/savings-bank/employee/${employeeId}/rates`, rates);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(savingsBankKeys.employee(variables.employeeId));
      queryClient.invalidateQueries(savingsBankKeys.lists());
    },
  });
}

/**
 * Solicitar préstamo
 */
export function useCreateLoanRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanData) => {
      const { data } = await api.post('/hr/savings-bank/loans', loanData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(savingsBankKeys.loans());
      queryClient.invalidateQueries(savingsBankKeys.stats());
    },
  });
}

/**
 * Aprobar préstamo
 */
export function useApproveLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, approvedBy }) => {
      const { data } = await api.patch(`/hr/savings-bank/loans/${loanId}/approve`, { approvedBy });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(savingsBankKeys.loans());
      queryClient.invalidateQueries(savingsBankKeys.stats());
    },
  });
}

/**
 * Rechazar préstamo
 */
export function useRejectLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, rejectedBy, rejectionReason }) => {
      const { data } = await api.patch(`/hr/savings-bank/loans/${loanId}/reject`, {
        rejectedBy,
        rejectionReason,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(savingsBankKeys.loans());
      queryClient.invalidateQueries(savingsBankKeys.stats());
    },
  });
}

/**
 * Registrar pago de préstamo
 */
export function useRecordLoanPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, amount }) => {
      const { data } = await api.post(`/hr/savings-bank/loans/${loanId}/payment`, { amount });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(savingsBankKeys.loans());
      queryClient.invalidateQueries(savingsBankKeys.stats());
    },
  });
}
