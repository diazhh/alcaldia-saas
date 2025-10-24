/**
 * Gestor de Cajas Chicas
 * Permite gestionar cajas chicas, gastos y reembolsos
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
  DollarSign,
  Plus,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  RefreshCw,
  FileText,
} from 'lucide-react';
import {
  usePettyCashes,
  usePettyCash,
  usePettyCashStats,
  useCreatePettyCash,
  useRegisterPettyCashExpense,
  useRequestPettyCashReimbursement,
  useApprovePettyCashReimbursement,
  useProcessPettyCashReimbursement,
  useRejectPettyCashReimbursement,
  useClosePettyCash,
} from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Activa', color: 'bg-green-500', icon: CheckCircle },
  SUSPENDED: { label: 'Suspendida', color: 'bg-yellow-500', icon: Clock },
  CLOSED: { label: 'Cerrada', color: 'bg-gray-500', icon: XCircle },
};

const REIMBURSEMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500' },
  APPROVED: { label: 'Aprobado', color: 'bg-blue-500' },
  PAID: { label: 'Pagado', color: 'bg-green-500' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-500' },
};

export function PettyCashManager() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showReimbursementDialog, setShowReimbursementDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPettyCash, setSelectedPettyCash] = useState(null);

  const filters = {
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  };

  const { data: pettyCashes, isLoading } = usePettyCashes(filters);
  const { data: pettyCashDetails } = usePettyCash(selectedPettyCash?.id);
  const { data: stats } = usePettyCashStats(selectedPettyCash?.id);

  const createMutation = useCreatePettyCash();
  const expenseMutation = useRegisterPettyCashExpense();
  const reimbursementMutation = useRequestPettyCashReimbursement();
  const approveMutation = useApprovePettyCashReimbursement();
  const processMutation = useProcessPettyCashReimbursement();
  const rejectMutation = useRejectPettyCashReimbursement();
  const closeMutation = useClosePettyCash();

  const [newPettyCash, setNewPettyCash] = useState({
    code: '',
    name: '',
    description: '',
    custodianId: '',
    departmentId: '',
    maxAmount: '',
  });

  const [newExpense, setNewExpense] = useState({
    pettyCashId: '',
    amount: '',
    concept: '',
    description: '',
    receipt: '',
    beneficiary: '',
  });

  const [newReimbursement, setNewReimbursement] = useState({
    pettyCashId: '',
    amount: '',
    notes: '',
  });

  const handleCreatePettyCash = async () => {
    if (!newPettyCash.code || !newPettyCash.name || !newPettyCash.maxAmount) {
      toast.error('Complete los campos requeridos');
      return;
    }

    await createMutation.mutateAsync({
      ...newPettyCash,
      maxAmount: parseFloat(newPettyCash.maxAmount),
    });

    setShowCreateDialog(false);
    setNewPettyCash({
      code: '',
      name: '',
      description: '',
      custodianId: '',
      departmentId: '',
      maxAmount: '',
    });
  };

  const handleRegisterExpense = async () => {
    if (!newExpense.amount || !newExpense.concept) {
      toast.error('Complete los campos requeridos');
      return;
    }

    await expenseMutation.mutateAsync({
      ...newExpense,
      amount: parseFloat(newExpense.amount),
    });

    setShowExpenseDialog(false);
    setNewExpense({
      pettyCashId: '',
      amount: '',
      concept: '',
      description: '',
      receipt: '',
      beneficiary: '',
    });
  };

  const handleRequestReimbursement = async () => {
    if (!newReimbursement.amount) {
      toast.error('Ingrese el monto del reembolso');
      return;
    }

    await reimbursementMutation.mutateAsync({
      ...newReimbursement,
      amount: parseFloat(newReimbursement.amount),
    });

    setShowReimbursementDialog(false);
    setNewReimbursement({
      pettyCashId: '',
      amount: '',
      notes: '',
    });
  };

  const handleApproveReimbursement = async (id) => {
    if (confirm('¿Está seguro de aprobar este reembolso?')) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleProcessReimbursement = async (id) => {
    if (confirm('¿Está seguro de procesar el pago de este reembolso?')) {
      await processMutation.mutateAsync(id);
    }
  };

  const handleRejectReimbursement = async (id) => {
    const reason = prompt('Ingrese la razón del rechazo:');
    if (reason) {
      await rejectMutation.mutateAsync({ id, reason });
    }
  };

  const handleClosePettyCash = async (id) => {
    if (confirm('¿Está seguro de cerrar esta caja chica? Esta acción no se puede deshacer.')) {
      await closeMutation.mutateAsync(id);
    }
  };

  const handleViewDetails = (pettyCash) => {
    setSelectedPettyCash(pettyCash);
    setShowDetailsDialog(true);
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
          <h2 className="text-3xl font-bold tracking-tight">Cajas Chicas</h2>
          <p className="text-muted-foreground">
            Gestione cajas chicas, gastos y reembolsos
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Caja Chica
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Activas</SelectItem>
            <SelectItem value="SUSPENDED">Suspendidas</SelectItem>
            <SelectItem value="CLOSED">Cerradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Petty Cashes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cajas Chicas</CardTitle>
          <CardDescription>
            {pettyCashes?.length || 0} caja(s) chica(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Monto Máximo</TableHead>
                <TableHead>Saldo Actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pettyCashes?.map((pettyCash) => {
                const statusConfig = STATUS_CONFIG[pettyCash.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={pettyCash.id}>
                    <TableCell className="font-medium">{pettyCash.code}</TableCell>
                    <TableCell>{pettyCash.name}</TableCell>
                    <TableCell>{formatCurrency(pettyCash.maxAmount)}</TableCell>
                    <TableCell>
                      <span className={pettyCash.currentBalance < pettyCash.maxAmount * 0.2 ? 'text-red-600 font-semibold' : ''}>
                        {formatCurrency(pettyCash.currentBalance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(pettyCash)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {pettyCash.status === 'ACTIVE' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setNewExpense({ ...newExpense, pettyCashId: pettyCash.id });
                                setShowExpenseDialog(true);
                              }}
                            >
                              <TrendingDown className="w-4 h-4 mr-1" />
                              Gasto
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setNewReimbursement({ ...newReimbursement, pettyCashId: pettyCash.id });
                                setShowReimbursementDialog(true);
                              }}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Reembolso
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleClosePettyCash(pettyCash.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!pettyCashes || pettyCashes.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay cajas chicas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Petty Cash Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Caja Chica</DialogTitle>
            <DialogDescription>
              Cree una nueva caja chica para gastos menores
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  placeholder="CC-001"
                  value={newPettyCash.code}
                  onChange={(e) => setNewPettyCash({ ...newPettyCash, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Caja Chica Administración"
                  value={newPettyCash.name}
                  onChange={(e) => setNewPettyCash({ ...newPettyCash, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción de la caja chica"
                value={newPettyCash.description}
                onChange={(e) => setNewPettyCash({ ...newPettyCash, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Monto Máximo *</Label>
              <Input
                id="maxAmount"
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={newPettyCash.maxAmount}
                onChange={(e) => setNewPettyCash({ ...newPettyCash, maxAmount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePettyCash} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Caja Chica'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gasto</DialogTitle>
            <DialogDescription>
              Registre un gasto de la caja chica
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concept">Concepto *</Label>
              <Input
                id="concept"
                placeholder="Compra de materiales de oficina"
                value={newExpense.concept}
                onChange={(e) => setNewExpense({ ...newExpense, concept: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiary">Beneficiario</Label>
              <Input
                id="beneficiary"
                placeholder="Nombre del proveedor"
                value={newExpense.beneficiary}
                onChange={(e) => setNewExpense({ ...newExpense, beneficiary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt">Número de Recibo</Label>
              <Input
                id="receipt"
                placeholder="REC-001"
                value={newExpense.receipt}
                onChange={(e) => setNewExpense({ ...newExpense, receipt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseDescription">Descripción</Label>
              <Textarea
                id="expenseDescription"
                placeholder="Detalles adicionales del gasto"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterExpense} disabled={expenseMutation.isPending}>
              {expenseMutation.isPending ? 'Registrando...' : 'Registrar Gasto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Reimbursement Dialog */}
      <Dialog open={showReimbursementDialog} onOpenChange={setShowReimbursementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Reembolso</DialogTitle>
            <DialogDescription>
              Solicite un reembolso para la caja chica
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reimbursementAmount">Monto *</Label>
              <Input
                id="reimbursementAmount"
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={newReimbursement.amount}
                onChange={(e) => setNewReimbursement({ ...newReimbursement, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Justificación del reembolso"
                value={newReimbursement.notes}
                onChange={(e) => setNewReimbursement({ ...newReimbursement, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReimbursementDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestReimbursement} disabled={reimbursementMutation.isPending}>
              {reimbursementMutation.isPending ? 'Solicitando...' : 'Solicitar Reembolso'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Caja Chica</DialogTitle>
            <DialogDescription>
              {pettyCashDetails?.code} - {pettyCashDetails?.name}
            </DialogDescription>
          </DialogHeader>
          {pettyCashDetails && (
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transacciones</TabsTrigger>
                <TabsTrigger value="reimbursements">Reembolsos</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Saldo Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(pettyCashDetails.currentBalance)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Monto Máximo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(pettyCashDetails.maxAmount)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Utilización</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {((pettyCashDetails.currentBalance / pettyCashDetails.maxAmount) * 100).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Beneficiario</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pettyCashDetails.transactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'EXPENSE' ? 'destructive' : 'default'}>
                            {transaction.type === 'EXPENSE' ? 'Gasto' : 'Reembolso'}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.concept}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>{transaction.beneficiary || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {(!pettyCashDetails.transactions || pettyCashDetails.transactions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay transacciones registradas
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="reimbursements" className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha Solicitud</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pettyCashDetails.reimbursements?.map((reimbursement) => {
                      const statusConfig = REIMBURSEMENT_STATUS_CONFIG[reimbursement.status];

                      return (
                        <TableRow key={reimbursement.id}>
                          <TableCell>{formatDate(reimbursement.requestDate)}</TableCell>
                          <TableCell>{formatCurrency(reimbursement.amount)}</TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig.color} text-white`}>
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{reimbursement.notes || '-'}</TableCell>
                          <TableCell>
                            {reimbursement.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveReimbursement(reimbursement.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectReimbursement(reimbursement.id)}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                            {reimbursement.status === 'APPROVED' && (
                              <Button
                                size="sm"
                                onClick={() => handleProcessReimbursement(reimbursement.id)}
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Procesar Pago
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!pettyCashDetails.reimbursements || pettyCashDetails.reimbursements.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay reembolsos registrados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
