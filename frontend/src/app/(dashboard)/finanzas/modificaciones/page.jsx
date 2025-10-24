/**
 * Página de Gestión de Modificaciones Presupuestarias
 * Permite crear, aprobar, rechazar y visualizar modificaciones
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  FileEdit,
  Eye,
} from 'lucide-react';
import {
  useBudgetByYear,
  useBudgetModifications,
  useBudgetModificationStats,
  useApproveBudgetModification,
  useRejectBudgetModification,
} from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BudgetModificationDialog } from '@/components/modules/finance/BudgetModificationDialog';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  APPROVED: {
    label: 'Aprobada',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rechazada',
    color: 'bg-red-500',
    icon: XCircle,
  },
};

const TYPE_CONFIG = {
  CREDITO_ADICIONAL: {
    label: 'Crédito Adicional',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  TRASPASO: {
    label: 'Traspaso',
    icon: ArrowRightLeft,
    color: 'text-blue-600',
  },
  RECTIFICACION: {
    label: 'Rectificación',
    icon: FileEdit,
    color: 'text-purple-600',
  },
  REDUCCION: {
    label: 'Reducción',
    icon: TrendingDown,
    color: 'text-red-600',
  },
};

export default function ModificacionesPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewingModification, setViewingModification] = useState(null);
  const [rejectingModification, setRejectingModification] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: budget } = useBudgetByYear(selectedYear);
  const { data: modifications, isLoading } = useBudgetModifications(budget?.id, {
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
  });
  const { data: stats } = useBudgetModificationStats(budget?.id);

  const approveMutation = useApproveBudgetModification();
  const rejectMutation = useRejectBudgetModification();

  const handleApprove = async (id) => {
    if (confirm('¿Está seguro de aprobar esta modificación presupuestaria?')) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Debe proporcionar una razón para el rechazo');
      return;
    }

    await rejectMutation.mutateAsync({
      id: rejectingModification.id,
      reason: rejectReason,
    });

    setRejectingModification(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modificaciones Presupuestarias</h1>
          <p className="text-muted-foreground">
            Gestión de modificaciones al presupuesto aprobado
          </p>
        </div>
        {budget && (
          <BudgetModificationDialog budgetId={budget.id}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Modificación
            </Button>
          </BudgetModificationDialog>
        )}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modificaciones</CardTitle>
              <FileEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Modificaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Modificaciones {selectedYear}</CardTitle>
              <CardDescription>
                Historial de modificaciones presupuestarias
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="PENDING">Pendientes</TabsTrigger>
              <TabsTrigger value="APPROVED">Aprobadas</TabsTrigger>
              <TabsTrigger value="REJECTED">Rechazadas</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referencia</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modifications?.length > 0 ? (
                        modifications.map((mod) => {
                          const TypeIcon = TYPE_CONFIG[mod.type]?.icon;
                          const StatusIcon = STATUS_CONFIG[mod.status]?.icon;

                          return (
                            <TableRow key={mod.id}>
                              <TableCell className="font-medium">{mod.reference}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {TypeIcon && (
                                    <TypeIcon className={`h-4 w-4 ${TYPE_CONFIG[mod.type]?.color}`} />
                                  )}
                                  <span className="text-sm">{TYPE_CONFIG[mod.type]?.label}</span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {mod.description}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(mod.amount)}
                              </TableCell>
                              <TableCell>{formatDate(mod.createdAt)}</TableCell>
                              <TableCell>
                                <Badge className={STATUS_CONFIG[mod.status]?.color}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {STATUS_CONFIG[mod.status]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewingModification(mod)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {mod.status === 'PENDING' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleApprove(mod.id)}
                                        disabled={approveMutation.isPending}
                                      >
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setRejectingModification(mod)}
                                        disabled={rejectMutation.isPending}
                                      >
                                        <XCircle className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                              No se encontraron modificaciones presupuestarias
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de Detalle */}
      <Dialog open={!!viewingModification} onOpenChange={() => setViewingModification(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalle de Modificación</DialogTitle>
            <DialogDescription>
              Información completa de la modificación presupuestaria
            </DialogDescription>
          </DialogHeader>

          {viewingModification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Referencia</Label>
                  <p className="font-medium">{viewingModification.reference}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{TYPE_CONFIG[viewingModification.type]?.label}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Monto</Label>
                  <p className="font-medium text-lg">{formatCurrency(viewingModification.amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <Badge className={STATUS_CONFIG[viewingModification.status]?.color}>
                    {STATUS_CONFIG[viewingModification.status]?.label}
                  </Badge>
                </div>
              </div>

              {viewingModification.fromBudgetItem && (
                <div>
                  <Label className="text-muted-foreground">Partida Origen</Label>
                  <p className="font-medium">
                    {viewingModification.fromBudgetItem.code} - {viewingModification.fromBudgetItem.name}
                  </p>
                </div>
              )}

              {viewingModification.toBudgetItem && (
                <div>
                  <Label className="text-muted-foreground">Partida Destino</Label>
                  <p className="font-medium">
                    {viewingModification.toBudgetItem.code} - {viewingModification.toBudgetItem.name}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Descripción</Label>
                <p className="text-sm">{viewingModification.description}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Justificación</Label>
                <p className="text-sm">{viewingModification.justification}</p>
              </div>

              {viewingModification.notes && (
                <div>
                  <Label className="text-muted-foreground">Notas</Label>
                  <p className="text-sm">{viewingModification.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Fecha de Creación</Label>
                  <p>{formatDate(viewingModification.createdAt)}</p>
                </div>
                {viewingModification.approvedAt && (
                  <div>
                    <Label className="text-muted-foreground">Fecha de Aprobación</Label>
                    <p>{formatDate(viewingModification.approvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Rechazo */}
      <Dialog open={!!rejectingModification} onOpenChange={() => setRejectingModification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Modificación</DialogTitle>
            <DialogDescription>
              Proporcione una razón para rechazar esta modificación presupuestaria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Razón del Rechazo *</Label>
              <Textarea
                id="reason"
                placeholder="Explique por qué se rechaza esta modificación..."
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingModification(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
            >
              Rechazar Modificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
