/**
 * Hook personalizado para el módulo de finanzas
 * Maneja fetching y mutaciones de datos financieros usando React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';

// ============================================
// PRESUPUESTO
// ============================================

/**
 * Hook para obtener todos los presupuestos
 */
export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await api.get('/finance/budgets');
      return data.data;
    },
  });
}

/**
 * Hook para obtener un presupuesto por año
 */
export function useBudgetByYear(year) {
  return useQuery({
    queryKey: ['budget', year],
    queryFn: async () => {
      const { data } = await api.get(`/finance/budgets/year/${year}`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para obtener estadísticas de ejecución presupuestaria
 */
export function useBudgetStats(budgetId) {
  return useQuery({
    queryKey: ['budget-stats', budgetId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/budgets/${budgetId}/stats`);
      return data.data;
    },
    enabled: !!budgetId,
  });
}

/**
 * Hook para crear un presupuesto
 */
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetData) => {
      const { data } = await api.post('/finance/budgets', budgetData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Presupuesto creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear presupuesto');
    },
  });
}

/**
 * Hook para aprobar un presupuesto
 */
export function useApproveBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgetId) => {
      const { data } = await api.post(`/finance/budgets/${budgetId}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Presupuesto aprobado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al aprobar presupuesto');
    },
  });
}

// ============================================
// PARTIDAS PRESUPUESTARIAS
// ============================================

/**
 * Hook para obtener partidas presupuestarias
 */
export function useBudgetItems(budgetId) {
  return useQuery({
    queryKey: ['budget-items', budgetId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/budgets/${budgetId}/items`);
      return data.data;
    },
    enabled: !!budgetId,
  });
}

/**
 * Hook para verificar disponibilidad presupuestaria
 */
export function useCheckBudgetAvailability() {
  return useMutation({
    mutationFn: async ({ budgetItemId, amount }) => {
      const { data } = await api.post('/finance/budget-items/check-availability', {
        budgetItemId,
        amount,
      });
      return data.data;
    },
  });
}

// ============================================
// TRANSACCIONES
// ============================================

/**
 * Hook para obtener transacciones
 */
export function useTransactions(filters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/transactions', { params: filters });
      return data.data;
    },
  });
}

/**
 * Hook para obtener estadísticas de transacciones
 */
export function useTransactionStats() {
  return useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async () => {
      const { data } = await api.get('/finance/transactions/stats');
      return data.data;
    },
  });
}

/**
 * Hook para crear una transacción (compromiso)
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData) => {
      const { data } = await api.post('/finance/transactions', transactionData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast.success('Compromiso registrado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al registrar compromiso');
    },
  });
}

/**
 * Hook para causar una transacción
 */
export function useAccrueTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId) => {
      const { data } = await api.post(`/finance/transactions/${transactionId}/accrue`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast.success('Gasto causado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al causar gasto');
    },
  });
}

/**
 * Hook para pagar una transacción
 */
export function usePayTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, paymentData }) => {
      const { data } = await api.post(
        `/finance/transactions/${transactionId}/pay`,
        paymentData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago registrado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al registrar pago');
    },
  });
}

// ============================================
// TESORERÍA
// ============================================

/**
 * Hook para obtener cuentas bancarias
 */
export function useBankAccounts() {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const { data } = await api.get('/finance/bank-accounts');
      return data.data;
    },
  });
}

/**
 * Hook para obtener pagos
 */
export function usePayments(filters = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/payments', { params: filters });
      return data.data;
    },
  });
}

/**
 * Hook para obtener ingresos
 */
export function useIncomes(filters = {}) {
  return useQuery({
    queryKey: ['incomes', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/incomes', { params: filters });
      return data.data;
    },
  });
}

/**
 * Hook para registrar un ingreso
 */
export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incomeData) => {
      const { data } = await api.post('/finance/incomes', incomeData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Ingreso registrado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al registrar ingreso');
    },
  });
}

/**
 * Hook para obtener flujo de caja
 */
export function useCashFlow(filters = {}) {
  return useQuery({
    queryKey: ['cash-flow', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/cash-flow', { params: filters });
      return data.data;
    },
  });
}

// ============================================
// CONTABILIDAD
// ============================================

/**
 * Hook para obtener el libro diario
 */
export function useGeneralJournal(filters = {}) {
  return useQuery({
    queryKey: ['general-journal', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/accounting/journal', { params: filters });
      return data.data;
    },
  });
}

/**
 * Hook para obtener el libro mayor
 */
export function useGeneralLedger(filters = {}) {
  return useQuery({
    queryKey: ['general-ledger', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/accounting/ledger', { params: filters });
      return data.data;
    },
  });
}

/**
 * Hook para obtener el balance de comprobación
 */
export function useTrialBalance(date) {
  return useQuery({
    queryKey: ['trial-balance', date],
    queryFn: async () => {
      const { data } = await api.get('/finance/accounting/trial-balance', {
        params: { date },
      });
      return data.data;
    },
  });
}

// ============================================
// REPORTES Y ESTADOS FINANCIEROS
// ============================================

/**
 * Hook para obtener el Balance General
 */
export function useBalanceSheet(date) {
  return useQuery({
    queryKey: ['balance-sheet', date],
    queryFn: async () => {
      const { data } = await api.get('/finance/reports/balance-sheet', {
        params: { date },
      });
      return data.data;
    },
  });
}

/**
 * Hook para obtener el Estado de Resultados
 */
export function useIncomeStatement(startDate, endDate) {
  return useQuery({
    queryKey: ['income-statement', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/finance/reports/income-statement', {
        params: { startDate, endDate },
      });
      return data.data;
    },
    enabled: !!startDate,
  });
}

/**
 * Hook para obtener análisis de ejecución presupuestaria
 */
export function useBudgetExecutionAnalysis(year) {
  return useQuery({
    queryKey: ['budget-execution', year],
    queryFn: async () => {
      const { data } = await api.get(`/finance/reports/budget-execution/${year}`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para obtener reporte ONAPRE Form 1013
 */
export function useOnapreForm1013(year) {
  return useQuery({
    queryKey: ['onapre-1013', year],
    queryFn: async () => {
      const { data } = await api.get(`/finance/reports/onapre/form-1013/${year}`);
      return data.data;
    },
    enabled: !!year,
  });
}
