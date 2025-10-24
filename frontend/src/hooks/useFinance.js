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
// MODIFICACIONES PRESUPUESTARIAS
// ============================================

/**
 * Hook para obtener modificaciones presupuestarias
 */
export function useBudgetModifications(budgetId, filters = {}) {
  return useQuery({
    queryKey: ['budget-modifications', budgetId, filters],
    queryFn: async () => {
      const { data } = await api.get(`/finance/budgets/${budgetId}/modifications`, {
        params: filters,
      });
      return data.data;
    },
    enabled: !!budgetId,
  });
}

/**
 * Hook para obtener una modificación por ID
 */
export function useBudgetModification(id) {
  return useQuery({
    queryKey: ['budget-modification', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/budget-modifications/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de modificaciones
 */
export function useBudgetModificationStats(budgetId) {
  return useQuery({
    queryKey: ['budget-modification-stats', budgetId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/budgets/${budgetId}/modifications/stats`);
      return data.data;
    },
    enabled: !!budgetId,
  });
}

/**
 * Hook para crear una modificación presupuestaria
 */
export function useCreateBudgetModification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modificationData) => {
      const { data } = await api.post('/finance/budget-modifications', modificationData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-modifications'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast.success('Modificación presupuestaria creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear modificación');
    },
  });
}

/**
 * Hook para aprobar una modificación presupuestaria
 */
export function useApproveBudgetModification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/budget-modifications/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-modifications'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Modificación presupuestaria aprobada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al aprobar modificación');
    },
  });
}

/**
 * Hook para rechazar una modificación presupuestaria
 */
export function useRejectBudgetModification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/finance/budget-modifications/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-modifications'] });
      toast.success('Modificación presupuestaria rechazada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al rechazar modificación');
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

// ============================================
// CONCILIACIÓN BANCARIA
// ============================================

/**
 * Hook para obtener conciliaciones bancarias
 */
export function useBankReconciliations(filters = {}) {
  return useQuery({
    queryKey: ['bank-reconciliations', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/bank-reconciliations', { params: filters });
      return data.data;
    },
  });
}

/**
 * Hook para obtener una conciliación por ID
 */
export function useBankReconciliation(id) {
  return useQuery({
    queryKey: ['bank-reconciliation', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/bank-reconciliations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de conciliaciones
 */
export function useBankReconciliationStats(bankAccountId) {
  return useQuery({
    queryKey: ['bank-reconciliation-stats', bankAccountId],
    queryFn: async () => {
      const { data } = await api.get('/finance/bank-reconciliations/stats', {
        params: { bankAccountId },
      });
      return data.data;
    },
  });
}

/**
 * Hook para crear conciliación bancaria
 */
export function useCreateBankReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reconciliationData) => {
      const { data } = await api.post('/finance/bank-reconciliations', reconciliationData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliations'] });
      toast.success('Conciliación bancaria creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear conciliación');
    },
  });
}

/**
 * Hook para agregar partida a conciliación
 */
export function useAddReconciliationItem(reconciliationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData) => {
      const { data } = await api.post(
        `/finance/bank-reconciliations/${reconciliationId}/items`,
        itemData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation', reconciliationId] });
      toast.success('Partida agregada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al agregar partida');
    },
  });
}

/**
 * Hook para cargar transacciones del sistema
 */
export function useLoadSystemTransactions(reconciliationId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/finance/bank-reconciliations/${reconciliationId}/load-transactions`
      );
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation', reconciliationId] });
      toast.success(
        `${data.totalItems} transacciones cargadas (${data.paymentsLoaded} pagos, ${data.incomesLoaded} ingresos)`
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al cargar transacciones');
    },
  });
}

/**
 * Hook para marcar partida como conciliada
 */
export function useReconcileItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => {
      const { data } = await api.post(
        `/finance/bank-reconciliations/items/${itemId}/reconcile`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation'] });
      toast.success('Partida conciliada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al conciliar partida');
    },
  });
}

/**
 * Hook para eliminar partida
 */
export function useDeleteReconciliationItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId) => {
      const { data } = await api.delete(`/finance/bank-reconciliations/items/${itemId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation'] });
      toast.success('Partida eliminada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al eliminar partida');
    },
  });
}

/**
 * Hook para completar conciliación
 */
export function useCompleteBankReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/bank-reconciliations/${id}/complete`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliations'] });
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation'] });
      toast.success('Conciliación completada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al completar conciliación');
    },
  });
}

/**
 * Hook para aprobar conciliación
 */
export function useApproveBankReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/bank-reconciliations/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliations'] });
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation'] });
      toast.success('Conciliación aprobada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al aprobar conciliación');
    },
  });
}

/**
 * Hook para rechazar conciliación
 */
export function useRejectBankReconciliation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/finance/bank-reconciliations/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliations'] });
      queryClient.invalidateQueries({ queryKey: ['bank-reconciliation'] });
      toast.success('Conciliación rechazada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al rechazar conciliación');
    },
  });
}

// ============================================
// PROGRAMACIÓN DE PAGOS
// ============================================

/**
 * Hook para obtener programaciones de pago
 */
export function usePaymentSchedules(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.priority) queryParams.append('priority', filters.priority);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.batchId) queryParams.append('batchId', filters.batchId);

  return useQuery({
    queryKey: ['payment-schedules', filters],
    queryFn: async () => {
      const { data } = await api.get(`/finance/payment-schedules?${queryParams.toString()}`);
      return data.data;
    },
  });
}

/**
 * Hook para obtener una programación por ID
 */
export function usePaymentSchedule(id) {
  return useQuery({
    queryKey: ['payment-schedule', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/payment-schedules/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de programación
 */
export function usePaymentScheduleStats(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);

  return useQuery({
    queryKey: ['payment-schedule-stats', filters],
    queryFn: async () => {
      const { data } = await api.get(`/finance/payment-schedules/stats?${queryParams.toString()}`);
      return data.data;
    },
  });
}

/**
 * Hook para obtener calendario de pagos
 */
export function usePaymentCalendar(year, month) {
  return useQuery({
    queryKey: ['payment-calendar', year, month],
    queryFn: async () => {
      const { data } = await api.get(`/finance/payment-schedules/calendar?year=${year}&month=${month}`);
      return data.data;
    },
    enabled: !!year && !!month,
  });
}

/**
 * Hook para crear programación de pago
 */
export function useCreatePaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData) => {
      const { data } = await api.post('/finance/payment-schedules', scheduleData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Pago programado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al programar pago');
    },
  });
}

/**
 * Hook para aprobar programación
 */
export function useApprovePaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/payment-schedules/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule-stats'] });
      toast.success('Programación aprobada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al aprobar programación');
    },
  });
}

/**
 * Hook para rechazar programación
 */
export function useRejectPaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/finance/payment-schedules/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule-stats'] });
      toast.success('Programación rechazada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al rechazar programación');
    },
  });
}

/**
 * Hook para procesar pago
 */
export function useProcessPaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paymentData }) => {
      const { data } = await api.post(`/finance/payment-schedules/${id}/process`, paymentData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast.success('Pago procesado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al procesar pago');
    },
  });
}

/**
 * Hook para cancelar programación
 */
export function useCancelPaymentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/finance/payment-schedules/${id}/cancel`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule-stats'] });
      toast.success('Programación cancelada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al cancelar programación');
    },
  });
}

/**
 * Hook para actualizar fecha programada
 */
export function useUpdateScheduledDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scheduledDate }) => {
      const { data } = await api.patch(`/finance/payment-schedules/${id}/date`, { scheduledDate });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule'] });
      queryClient.invalidateQueries({ queryKey: ['payment-calendar'] });
      toast.success('Fecha actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al actualizar fecha');
    },
  });
}

/**
 * Hook para crear lote de pagos
 */
export function useCreatePaymentBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchData) => {
      const { data } = await api.post('/finance/payment-schedules/batch', batchData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['payment-schedule-stats'] });
      toast.success('Lote de pagos creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Error al crear lote de pagos');
    },
  });
}

// ============================================
// PROYECCIÓN DE FLUJO DE CAJA
// ============================================

/**
 * Hook para obtener proyecciones con filtros
 */
export function useCashFlowProjections(filters = {}) {
  const params = new URLSearchParams();
  if (filters.year) params.append('year', filters.year);
  if (filters.month) params.append('month', filters.month);
  if (filters.scenario) params.append('scenario', filters.scenario);
  if (filters.hasDeficit !== undefined) params.append('hasDeficit', filters.hasDeficit);

  return useQuery({
    queryKey: ['cash-flow-projections', filters],
    queryFn: async () => {
      const { data } = await api.get(`/finance/cash-flow-projections?${params}`);
      return data.data;
    },
  });
}

/**
 * Hook para obtener proyección por ID
 */
export function useCashFlowProjection(id) {
  return useQuery({
    queryKey: ['cash-flow-projection', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/cash-flow-projections/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener proyecciones de un año
 */
export function useYearProjections(year, scenario = 'REALISTIC') {
  return useQuery({
    queryKey: ['year-projections', year, scenario],
    queryFn: async () => {
      const { data } = await api.get(`/finance/cash-flow-projections/year/${year}?scenario=${scenario}`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para obtener estadísticas de proyecciones
 */
export function useProjectionStats(year) {
  return useQuery({
    queryKey: ['projection-stats', year],
    queryFn: async () => {
      const { data } = await api.get(`/finance/cash-flow-projections/year/${year}/stats`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para obtener alertas de déficit
 */
export function useDeficitAlerts(year) {
  return useQuery({
    queryKey: ['deficit-alerts', year],
    queryFn: async () => {
      const { data } = await api.get(`/finance/cash-flow-projections/year/${year}/alerts`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para obtener comparación de escenarios
 */
export function useScenarioComparison(year, month) {
  return useQuery({
    queryKey: ['scenario-comparison', year, month],
    queryFn: async () => {
      const { data } = await api.get(`/finance/cash-flow-projections/scenarios/${year}/${month}`);
      return data.data;
    },
    enabled: !!year && !!month,
  });
}

/**
 * Hook para crear proyección manual
 */
export function useCreateProjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectionData) => {
      const { data } = await api.post('/finance/cash-flow-projections', projectionData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projections'] });
      queryClient.invalidateQueries({ queryKey: ['year-projections'] });
      toast.success('Proyección creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear proyección');
    },
  });
}

/**
 * Hook para generar proyección automática
 */
export function useGenerateAutoProjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, month, scenario }) => {
      const { data } = await api.post('/finance/cash-flow-projections/auto', { year, month, scenario });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projections'] });
      queryClient.invalidateQueries({ queryKey: ['year-projections'] });
      toast.success('Proyección automática generada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al generar proyección automática');
    },
  });
}

/**
 * Hook para generar proyecciones de un año completo
 */
export function useGenerateYearProjections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, scenario }) => {
      const { data } = await api.post('/finance/cash-flow-projections/year', { year, scenario });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projections'] });
      queryClient.invalidateQueries({ queryKey: ['year-projections'] });
      toast.success(`${data.length} proyecciones generadas exitosamente`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al generar proyecciones del año');
    },
  });
}

/**
 * Hook para actualizar con valores reales
 */
export function useUpdateWithActuals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/cash-flow-projections/${id}/update-actuals`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projections'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projection'] });
      queryClient.invalidateQueries({ queryKey: ['year-projections'] });
      toast.success('Proyección actualizada con valores reales');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar con valores reales');
    },
  });
}

/**
 * Hook para actualizar proyección
 */
export function useUpdateProjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { data: response } = await api.put(`/finance/cash-flow-projections/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projections'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projection'] });
      queryClient.invalidateQueries({ queryKey: ['year-projections'] });
      toast.success('Proyección actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar proyección');
    },
  });
}

/**
 * Hook para eliminar proyección
 */
export function useDeleteProjection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/finance/cash-flow-projections/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projections'] });
      queryClient.invalidateQueries({ queryKey: ['year-projections'] });
      toast.success('Proyección eliminada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar proyección');
    },
  });
}

// ============================================
// CAJAS CHICAS
// ============================================

/**
 * Hook para obtener todas las cajas chicas
 */
export function usePettyCashes(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.custodianId) params.append('custodianId', filters.custodianId);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);

  return useQuery({
    queryKey: ['petty-cashes', filters],
    queryFn: async () => {
      const { data } = await api.get(`/finance/petty-cash?${params}`);
      return data.data;
    },
  });
}

/**
 * Hook para obtener caja chica por ID
 */
export function usePettyCash(id) {
  return useQuery({
    queryKey: ['petty-cash', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/petty-cash/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de caja chica
 */
export function usePettyCashStats(id) {
  return useQuery({
    queryKey: ['petty-cash-stats', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/petty-cash/${id}/stats`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para crear caja chica
 */
export function useCreatePettyCash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pettyCashData) => {
      const { data } = await api.post('/finance/petty-cash', pettyCashData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      toast.success('Caja chica creada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al crear caja chica');
    },
  });
}

/**
 * Hook para registrar gasto de caja chica
 */
export function useRegisterPettyCashExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData) => {
      const { data } = await api.post('/finance/petty-cash/expense', expenseData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      toast.success('Gasto registrado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al registrar gasto');
    },
  });
}

/**
 * Hook para solicitar reembolso
 */
export function useRequestPettyCashReimbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reimbursementData) => {
      const { data } = await api.post('/finance/petty-cash/reimbursement', reimbursementData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      toast.success('Reembolso solicitado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al solicitar reembolso');
    },
  });
}

/**
 * Hook para aprobar reembolso
 */
export function useApprovePettyCashReimbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/petty-cash/reimbursement/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      toast.success('Reembolso aprobado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al aprobar reembolso');
    },
  });
}

/**
 * Hook para procesar reembolso
 */
export function useProcessPettyCashReimbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/petty-cash/reimbursement/${id}/process`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      toast.success('Reembolso procesado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al procesar reembolso');
    },
  });
}

/**
 * Hook para rechazar reembolso
 */
export function useRejectPettyCashReimbursement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/finance/petty-cash/reimbursement/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      toast.success('Reembolso rechazado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al rechazar reembolso');
    },
  });
}

/**
 * Hook para cerrar caja chica
 */
export function useClosePettyCash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/petty-cash/${id}/close`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      toast.success('Caja chica cerrada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cerrar caja chica');
    },
  });
}

/**
 * Hook para actualizar caja chica
 */
export function useUpdatePettyCash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: updateData }) => {
      const { data } = await api.put(`/finance/petty-cash/${id}`, updateData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petty-cashes'] });
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] });
      toast.success('Caja chica actualizada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al actualizar caja chica');
    },
  });
}

// ============================================
// ANTICIPOS A EMPLEADOS
// ============================================

/**
 * Hook para obtener todos los anticipos
 */
export function useEmployeeAdvances(filters = {}) {
  const params = new URLSearchParams();
  if (filters.employeeId) params.append('employeeId', filters.employeeId);
  if (filters.status) params.append('status', filters.status);

  return useQuery({
    queryKey: ['employee-advances', filters],
    queryFn: async () => {
      const { data } = await api.get(`/finance/employee-advances?${params}`);
      return data.data;
    },
  });
}

/**
 * Hook para obtener anticipo por ID
 */
export function useEmployeeAdvance(id) {
  return useQuery({
    queryKey: ['employee-advance', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/employee-advances/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de anticipos
 */
export function useEmployeeAdvanceStats() {
  return useQuery({
    queryKey: ['employee-advance-stats'],
    queryFn: async () => {
      const { data } = await api.get('/finance/employee-advances/stats');
      return data.data;
    },
  });
}

/**
 * Hook para obtener cuotas pendientes de un empleado
 */
export function useEmployeePendingInstallments(employeeId) {
  return useQuery({
    queryKey: ['employee-pending-installments', employeeId],
    queryFn: async () => {
      const { data } = await api.get(`/finance/employee-advances/employee/${employeeId}/pending`);
      return data.data;
    },
    enabled: !!employeeId,
  });
}

/**
 * Hook para solicitar anticipo
 */
export function useRequestEmployeeAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (advanceData) => {
      const { data } = await api.post('/finance/employee-advances', advanceData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-advances'] });
      toast.success('Anticipo solicitado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al solicitar anticipo');
    },
  });
}

/**
 * Hook para aprobar anticipo
 */
export function useApproveEmployeeAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/employee-advances/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-advances'] });
      queryClient.invalidateQueries({ queryKey: ['employee-advance'] });
      toast.success('Anticipo aprobado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al aprobar anticipo');
    },
  });
}

/**
 * Hook para rechazar anticipo
 */
export function useRejectEmployeeAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/finance/employee-advances/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-advances'] });
      queryClient.invalidateQueries({ queryKey: ['employee-advance'] });
      toast.success('Anticipo rechazado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al rechazar anticipo');
    },
  });
}

/**
 * Hook para desembolsar anticipo
 */
export function useDisburseEmployeeAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/employee-advances/${id}/disburse`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-advances'] });
      queryClient.invalidateQueries({ queryKey: ['employee-advance'] });
      toast.success('Anticipo desembolsado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al desembolsar anticipo');
    },
  });
}

/**
 * Hook para registrar descuento de cuota
 */
export function useRegisterAdvanceInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/employee-advances/${id}/installment`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-advances'] });
      queryClient.invalidateQueries({ queryKey: ['employee-advance'] });
      queryClient.invalidateQueries({ queryKey: ['employee-pending-installments'] });
      toast.success('Cuota descontada exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al descontar cuota');
    },
  });
}

/**
 * Hook para cancelar anticipo
 */
export function useCancelEmployeeAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/finance/employee-advances/${id}/cancel`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-advances'] });
      queryClient.invalidateQueries({ queryKey: ['employee-advance'] });
      toast.success('Anticipo cancelado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cancelar anticipo');
    },
  });
}

// ============================================
// CIERRE CONTABLE
// ============================================

/**
 * Hook para obtener cierres contables
 */
export function useAccountingClosures(filters = {}) {
  const params = new URLSearchParams();
  if (filters.year) params.append('year', filters.year);
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);

  return useQuery({
    queryKey: ['accounting-closures', filters],
    queryFn: async () => {
      const { data } = await api.get(`/finance/accounting-closures?${params}`);
      return data.data;
    },
  });
}

/**
 * Hook para obtener cierre por ID
 */
export function useAccountingClosure(id) {
  return useQuery({
    queryKey: ['accounting-closure', id],
    queryFn: async () => {
      const { data } = await api.get(`/finance/accounting-closures/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de cierre
 */
export function useClosureStats(year) {
  return useQuery({
    queryKey: ['closure-stats', year],
    queryFn: async () => {
      const { data } = await api.get(`/finance/accounting-closures/stats/${year}`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para validar pre-cierre
 */
export function useValidatePreClosure(year, month = null) {
  return useQuery({
    queryKey: ['validate-pre-closure', year, month],
    queryFn: async () => {
      const params = new URLSearchParams({ year });
      if (month) params.append('month', month);
      const { data } = await api.get(`/finance/accounting-closures/validate?${params}`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para verificar si período está cerrado
 */
export function useIsPeriodClosed(year, month = null) {
  return useQuery({
    queryKey: ['is-period-closed', year, month],
    queryFn: async () => {
      const params = new URLSearchParams({ year });
      if (month) params.append('month', month);
      const { data } = await api.get(`/finance/accounting-closures/check?${params}`);
      return data.data;
    },
    enabled: !!year,
  });
}

/**
 * Hook para cerrar mes
 */
export function useCloseMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, month }) => {
      const { data } = await api.post('/finance/accounting-closures/month', { year, month });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-closures'] });
      queryClient.invalidateQueries({ queryKey: ['closure-stats'] });
      queryClient.invalidateQueries({ queryKey: ['is-period-closed'] });
      toast.success('Mes cerrado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cerrar mes');
    },
  });
}

/**
 * Hook para cerrar año
 */
export function useCloseYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year) => {
      const { data } = await api.post('/finance/accounting-closures/year', { year });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-closures'] });
      queryClient.invalidateQueries({ queryKey: ['closure-stats'] });
      queryClient.invalidateQueries({ queryKey: ['is-period-closed'] });
      toast.success('Año cerrado exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cerrar año');
    },
  });
}

/**
 * Hook para reabrir período
 */
export function useReopenPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.post(`/finance/accounting-closures/${id}/reopen`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting-closures'] });
      queryClient.invalidateQueries({ queryKey: ['closure-stats'] });
      queryClient.invalidateQueries({ queryKey: ['is-period-closed'] });
      toast.success('Período reabierto exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al reabrir período');
    },
  });
}
