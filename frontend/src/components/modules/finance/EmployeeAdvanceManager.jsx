/**
 * Gestor de Anticipos a Empleados
 * Permite gestionar anticipos de sueldo y descuentos por nómina
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  User,
  Calendar,
  CreditCard,
} from 'lucide-react';
import {
  useEmployeeAdvances,
  useEmployeeAdvanceStats,
  useRequestEmployeeAdvance,
  useApproveEmployeeAdvance,
  useRejectEmployeeAdvance,
  useDisburseEmployeeAdvance,
  useRegisterAdvanceInstallment,
  useCancelEmployeeAdvance,
} from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500', icon: Clock },
  APPROVED: { label: 'Aprobado', color: 'bg-blue-500', icon: CheckCircle },
  DISBURSED: { label: 'Desembolsado', color: 'bg-green-500', icon: DollarSign },
  IN_PAYMENT: { label: 'En Pago', color: 'bg-purple-500', icon: CreditCard },
  PAID: { label: 'Pagado', color: 'bg-green-600', icon: CheckCircle },
  REJECTED: { label: 'Rechazado', color: 'bg-red-500', icon: XCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-500', icon: XCircle },
};

export function EmployeeAdvanceManager() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const filters = {
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  };

  const { data: advances, isLoading } = useEmployeeAdvances(filters);
  const { data: stats } = useEmployeeAdvanceStats();

  const requestMutation = useRequestEmployeeAdvance();
  const approveMutation = useApproveEmployeeAdvance();
  const rejectMutation = useRejectEmployeeAdvance();
  const disburseMutation = useDisburseEmployeeAdvance();
  const installmentMutation = useRegisterAdvanceInstallment();
  const cancelMutation = useCancelEmployeeAdvance();

  const [newAdvance, setNewAdvance] = useState({
    employeeId: '',
    amount: '',
    concept: '',
    description: '',
    installments: '1',
  });

  const handleRequestAdvance = async () => {
    if (!newAdvance.employeeId || !newAdvance.amount || !newAdvance.concept) {
      toast.error('Complete los campos requeridos');
      return;
    }

    await requestMutation.mutateAsync({
      ...newAdvance,
      amount: parseFloat(newAdvance.amount),
      installments: parseInt(newAdvance.installments),
    });

    setShowRequestDialog(false);
    setNewAdvance({
      employeeId: '',
      amount: '',
      concept: '',
      description: '',
      installments: '1',
    });
  };

  const handleApprove = async (id) => {
    if (confirm('¿Está seguro de aprobar este anticipo?')) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Ingrese la razón del rechazo:');
    if (reason) {
      await rejectMutation.mutateAsync({ id, reason });
    }
  };

  const handleDisburse = async (id) => {
    if (confirm('¿Está seguro de desembolsar este anticipo?')) {
      await disburseMutation.mutateAsync(id);
    }
  };

  const handleRegisterInstallment = async (id) => {
    if (confirm('¿Está seguro de registrar el descuento de esta cuota?')) {
      await installmentMutation.mutateAsync(id);
    }
  };

  const handleCancel = async (id) => {
    if (confirm('¿Está seguro de cancelar este anticipo?')) {
      await cancelMutation.mutateAsync(id);
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Anticipos a Empleados</h2>
          <p className="text-muted-foreground">
            Gestione anticipos de sueldo y descuentos por nómina
          </p>
        </div>
        <Button onClick={() => setShowRequestDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Solicitar Anticipo
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending || 0}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Esperando aprobación
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active || 0}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <CreditCard className="w-3 h-3 mr-1" />
                En proceso de pago
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalPending || 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                Por descontar
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pagados Este Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.paidThisMonth || 0)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendientes</SelectItem>
            <SelectItem value="APPROVED">Aprobados</SelectItem>
            <SelectItem value="DISBURSED">Desembolsados</SelectItem>
            <SelectItem value="IN_PAYMENT">En Pago</SelectItem>
            <SelectItem value="PAID">Pagados</SelectItem>
            <SelectItem value="REJECTED">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Anticipos</CardTitle>
          <CardDescription>
            {advances?.length || 0} anticipo(s) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Saldo Pendiente</TableHead>
                <TableHead>Cuotas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances?.map((advance) => {
                const statusConfig = STATUS_CONFIG[advance.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={advance.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-muted-foreground" />
                        {advance.employeeId}
                      </div>
                    </TableCell>
                    <TableCell>{advance.concept}</TableCell>
                    <TableCell>{formatCurrency(advance.amount)}</TableCell>
                    <TableCell>
                      <span className={advance.remainingAmount > 0 ? 'text-orange-600 font-semibold' : 'text-green-600'}>
                        {formatCurrency(advance.remainingAmount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {advance.installmentsPaid}/{advance.installments}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(advance.requestDate)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {advance.status === 'PENDING' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(advance.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(advance.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {advance.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => handleDisburse(advance.id)}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Desembolsar
                          </Button>
                        )}
                        {(advance.status === 'DISBURSED' || advance.status === 'IN_PAYMENT') && (
                          <Button
                            size="sm"
                            onClick={() => handleRegisterInstallment(advance.id)}
                            disabled={advance.installmentsPaid >= advance.installments}
                          >
                            <CreditCard className="w-4 h-4 mr-1" />
                            Descontar Cuota
                          </Button>
                        )}
                        {(advance.status === 'PENDING' || advance.status === 'APPROVED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(advance.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!advances || advances.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No hay anticipos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Request Advance Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Anticipo</DialogTitle>
            <DialogDescription>
              Solicite un anticipo de sueldo para un empleado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">ID de Empleado *</Label>
              <Input
                id="employeeId"
                placeholder="EMP-001"
                value={newAdvance.employeeId}
                onChange={(e) => setNewAdvance({ ...newAdvance, employeeId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={newAdvance.amount}
                onChange={(e) => setNewAdvance({ ...newAdvance, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concept">Concepto *</Label>
              <Input
                id="concept"
                placeholder="Anticipo de sueldo"
                value={newAdvance.concept}
                onChange={(e) => setNewAdvance({ ...newAdvance, concept: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="installments">Número de Cuotas</Label>
              <Input
                id="installments"
                type="number"
                min="1"
                placeholder="1"
                value={newAdvance.installments}
                onChange={(e) => setNewAdvance({ ...newAdvance, installments: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                El anticipo se descontará en {newAdvance.installments} cuota(s)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Detalles adicionales"
                value={newAdvance.description}
                onChange={(e) => setNewAdvance({ ...newAdvance, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestAdvance} disabled={requestMutation.isPending}>
              {requestMutation.isPending ? 'Solicitando...' : 'Solicitar Anticipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
