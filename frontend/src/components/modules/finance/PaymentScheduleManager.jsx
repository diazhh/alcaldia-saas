/**
 * Gestor de Programación de Pagos
 * Permite programar, aprobar y procesar pagos
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  usePaymentSchedules,
  usePaymentScheduleStats,
  usePaymentCalendar,
  useCreatePaymentSchedule,
  useApprovePaymentSchedule,
  useRejectPaymentSchedule,
  useProcessPaymentSchedule,
  useCancelPaymentSchedule,
  useUpdateScheduledDate,
  useTransactions,
  useBankAccounts,
} from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const PRIORITY_CONFIG = {
  CRITICAL: {
    label: 'Crítica',
    color: 'bg-red-500',
    icon: AlertTriangle,
    description: 'Nómina, servicios básicos',
  },
  HIGH: {
    label: 'Alta',
    color: 'bg-orange-500',
    icon: AlertTriangle,
    description: 'Contratos importantes',
  },
  MEDIUM: {
    label: 'Media',
    color: 'bg-yellow-500',
    icon: Clock,
    description: 'Proveedores regulares',
  },
  LOW: {
    label: 'Baja',
    color: 'bg-blue-500',
    icon: Clock,
    description: 'Gastos diferibles',
  },
};

const STATUS_CONFIG = {
  SCHEDULED: { label: 'Programado', color: 'bg-blue-500', icon: Calendar },
  APPROVED: { label: 'Aprobado', color: 'bg-green-500', icon: CheckCircle },
  PROCESSING: { label: 'Procesando', color: 'bg-yellow-500', icon: Clock },
  PAID: { label: 'Pagado', color: 'bg-green-600', icon: CheckCircle },
  REJECTED: { label: 'Rechazado', color: 'bg-red-500', icon: XCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-500', icon: XCircle },
};

export function PaymentScheduleManager() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const filters = {
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    priority: selectedPriority !== 'all' ? selectedPriority : undefined,
  };

  const { data: schedules, isLoading } = usePaymentSchedules(filters);
  const { data: stats } = usePaymentScheduleStats();
  const { data: calendar } = usePaymentCalendar(selectedYear, selectedMonth);

  const approveMutation = useApprovePaymentSchedule();
  const rejectMutation = useRejectPaymentSchedule();
  const processMutation = useProcessPaymentSchedule();
  const cancelMutation = useCancelPaymentSchedule();

  const handleApprove = async (id) => {
    if (confirm('¿Está seguro de aprobar esta programación de pago?')) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Ingrese la razón del rechazo:');
    if (reason) {
      await rejectMutation.mutateAsync({ id, reason });
    }
  };

  const handleCancel = async (id) => {
    if (confirm('¿Está seguro de cancelar esta programación?')) {
      await cancelMutation.mutateAsync(id);
    }
  };

  const handleProcess = (schedule) => {
    setSelectedSchedule(schedule);
    setShowProcessDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Programación de Pagos</h2>
          <p className="text-muted-foreground">
            Gestione la programación y procesamiento de pagos
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Programar Pago
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Programados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.scheduledAmount || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aprobados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.approvedAmount || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagados Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidToday || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.paidTodayAmount || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.totalMonthAmount || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Transacción</TableHead>
                  <TableHead>Beneficiario</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Fecha Programada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules?.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <Badge className={PRIORITY_CONFIG[schedule.priority].color}>
                        {PRIORITY_CONFIG[schedule.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{schedule.transaction?.reference}</div>
                      <div className="text-sm text-muted-foreground">
                        {schedule.transaction?.concept}
                      </div>
                    </TableCell>
                    <TableCell>{schedule.transaction?.beneficiary}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(schedule.transaction?.amount)}
                    </TableCell>
                    <TableCell>{formatDate(schedule.scheduledDate)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[schedule.status].color}>
                        {STATUS_CONFIG[schedule.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {schedule.status === 'SCHEDULED' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(schedule.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(schedule.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {schedule.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcess(schedule)}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Procesar
                          </Button>
                        )}
                        {['SCHEDULED', 'APPROVED'].includes(schedule.status) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancel(schedule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!schedules || schedules.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No hay pagos programados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendario de Pagos</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2025, i, 1).toLocaleDateString('es-ES', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = currentDate.getFullYear() - 1 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calendar?.map((day) => (
                <div key={day.date} className="border rounded-lg p-4">
                  <div className="font-medium mb-2">
                    {formatDate(day.date)} - {day.schedules?.length || 0} pagos
                  </div>
                  {day.schedules?.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge className={PRIORITY_CONFIG[schedule.priority].color} size="sm">
                          {PRIORITY_CONFIG[schedule.priority].label}
                        </Badge>
                        <span className="text-sm">{schedule.transaction?.beneficiary}</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(schedule.transaction?.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              {(!calendar || calendar.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  No hay pagos programados para este mes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <CreatePaymentScheduleDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />

      {/* Process Payment Dialog */}
      <ProcessPaymentDialog
        open={showProcessDialog}
        schedule={selectedSchedule}
        onClose={() => {
          setShowProcessDialog(false);
          setSelectedSchedule(null);
        }}
      />
    </div>
  );
}

function CreatePaymentScheduleDialog({ open, onClose }) {
  const [formData, setFormData] = useState({
    transactionId: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
    priority: 'MEDIUM',
    notes: '',
  });

  const { data: transactions } = useTransactions({ status: 'CAUSADO' });
  const createMutation = useCreatePaymentSchedule();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    onClose();
    setFormData({
      transactionId: '',
      scheduledDate: new Date().toISOString().slice(0, 10),
      priority: 'MEDIUM',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Programar Pago</DialogTitle>
          <DialogDescription>
            Seleccione una transacción causada para programar su pago
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transacción *</Label>
            <Select
              value={formData.transactionId}
              onValueChange={(value) => setFormData({ ...formData, transactionId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una transacción" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(transactions) && transactions.map((transaction) => (
                  <SelectItem key={transaction.id} value={transaction.id}>
                    {transaction.reference} - {transaction.beneficiary} -{' '}
                    {formatCurrency(transaction.amount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Fecha Programada *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label} - {config.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones adicionales..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Programar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProcessPaymentDialog({ open, schedule, onClose }) {
  const [paymentData, setPaymentData] = useState({
    bankAccountId: '',
    paymentMethod: 'TRANSFERENCIA',
    reference: '',
    notes: '',
  });

  const { data: bankAccounts } = useBankAccounts();
  const processMutation = useProcessPaymentSchedule();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await processMutation.mutateAsync({
      id: schedule.id,
      paymentData,
    });
    onClose();
  };

  if (!schedule) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>
            Complete los datos del pago para {schedule.transaction?.beneficiary}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Monto:</div>
              <div className="font-medium">{formatCurrency(schedule.transaction?.amount)}</div>
              <div className="text-muted-foreground">Beneficiario:</div>
              <div className="font-medium">{schedule.transaction?.beneficiary}</div>
              <div className="text-muted-foreground">Concepto:</div>
              <div className="font-medium">{schedule.transaction?.concept}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankAccountId">Cuenta Bancaria *</Label>
            <Select
              value={paymentData.bankAccountId}
              onValueChange={(value) => setPaymentData({ ...paymentData, bankAccountId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una cuenta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.bankName} - {account.accountNumber} ({formatCurrency(account.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Método de Pago *</Label>
              <Select
                value={paymentData.paymentMethod}
                onValueChange={(value) => setPaymentData({ ...paymentData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="PAGO_MOVIL">Pago Móvil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia *</Label>
              <Input
                id="reference"
                placeholder="Número de referencia"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones del pago..."
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processMutation.isPending}>
              <DollarSign className="w-4 h-4 mr-2" />
              Procesar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
