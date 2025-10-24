/**
 * Gestor de Cierre Contable
 * Permite gestionar cierres mensuales y anuales
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
} from 'lucide-react';
import {
  useAccountingClosures,
  useClosureStats,
  useValidatePreClosure,
  useCloseMonth,
  useCloseYear,
  useReopenPeriod,
} from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const STATUS_CONFIG = {
  CLOSED: { label: 'Cerrado', color: 'bg-green-500', icon: Lock },
  REOPENED: { label: 'Reabierto', color: 'bg-yellow-500', icon: Unlock },
};

const TYPE_CONFIG = {
  MONTHLY: { label: 'Mensual', icon: Calendar },
  ANNUAL: { label: 'Anual', icon: FileText },
};

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function AccountingClosureManager() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [selectedClosure, setSelectedClosure] = useState(null);
  const [reopenReason, setReopenReason] = useState('');
  const [closureType, setClosureType] = useState('MONTHLY');

  const { data: closures, isLoading } = useAccountingClosures({ year: selectedYear });
  const { data: stats } = useClosureStats(selectedYear);
  const { data: validation } = useValidatePreClosure(
    selectedYear,
    closureType === 'MONTHLY' ? selectedMonth : null
  );

  const closeMonthMutation = useCloseMonth();
  const closeYearMutation = useCloseYear();
  const reopenMutation = useReopenPeriod();

  const handleOpenCloseDialog = (type, month = null) => {
    setClosureType(type);
    setSelectedMonth(month);
    setShowCloseDialog(true);
  };

  const handleClosePeriod = async () => {
    if (closureType === 'MONTHLY') {
      if (!selectedMonth) {
        toast.error('Seleccione un mes');
        return;
      }
      await closeMonthMutation.mutateAsync({ year: selectedYear, month: selectedMonth });
    } else {
      await closeYearMutation.mutateAsync(selectedYear);
    }
    setShowCloseDialog(false);
  };

  const handleOpenReopenDialog = (closure) => {
    setSelectedClosure(closure);
    setShowReopenDialog(true);
  };

  const handleReopenPeriod = async () => {
    if (!reopenReason.trim()) {
      toast.error('Ingrese la razón de la reapertura');
      return;
    }

    await reopenMutation.mutateAsync({ id: selectedClosure.id, reason: reopenReason });
    setShowReopenDialog(false);
    setReopenReason('');
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
          <h2 className="text-3xl font-bold tracking-tight">Cierre Contable</h2>
          <p className="text-muted-foreground">
            Gestione cierres mensuales y anuales de períodos contables
          </p>
        </div>
        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Meses Cerrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthsClosed}/12</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                {stats.monthsPending} pendientes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Año Cerrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.yearClosed ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.yearClosed ? 'Cerrado' : 'Pendiente'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Año {selectedYear}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalExpense)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                Año {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Closures Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Cierres Mensuales {selectedYear}</CardTitle>
          <CardDescription>
            Estado de cierre de cada mes del año
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {MONTHS.map((month, index) => {
              const monthNumber = index + 1;
              const closure = closures?.find(
                (c) => c.type === 'MONTHLY' && c.month === monthNumber
              );
              const isClosed = closure?.status === 'CLOSED';

              return (
                <Card key={month} className={isClosed ? 'border-green-500' : 'border-gray-200'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      {month}
                      {isClosed ? (
                        <Lock className="w-4 h-4 text-green-500" />
                      ) : (
                        <Unlock className="w-4 h-4 text-gray-400" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {closure ? (
                      <>
                        <Badge className={`${STATUS_CONFIG[closure.status].color} text-white mb-2`}>
                          {STATUS_CONFIG[closure.status].label}
                        </Badge>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Resultado:</span>
                            <span className={closure.result >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(closure.result)}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            {formatDate(closure.closedAt)}
                          </div>
                        </div>
                        {closure.status === 'CLOSED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => handleOpenReopenDialog(closure)}
                          >
                            <Unlock className="w-3 h-3 mr-1" />
                            Reabrir
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenCloseDialog('MONTHLY', monthNumber)}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Cerrar Mes
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Annual Closure */}
      <Card>
        <CardHeader>
          <CardTitle>Cierre Anual {selectedYear}</CardTitle>
          <CardDescription>
            Cierre del ejercicio fiscal completo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {closures?.find((c) => c.type === 'ANNUAL') ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Año Cerrado</AlertTitle>
                <AlertDescription>
                  El año {selectedYear} ha sido cerrado exitosamente.
                </AlertDescription>
              </Alert>
              {stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Ingresos</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.totalIncome)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Gastos</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(stats.totalExpense)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Resultado</div>
                    <div className={`text-2xl font-bold ${stats.totalResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(stats.totalResult)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {stats && stats.monthsClosed < 12 ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No se puede cerrar el año</AlertTitle>
                  <AlertDescription>
                    Todos los meses deben estar cerrados antes de cerrar el año.
                    Faltan {stats.monthsPending} mes(es) por cerrar.
                  </AlertDescription>
                </Alert>
              ) : (
                <Button onClick={() => handleOpenCloseDialog('ANNUAL')}>
                  <Lock className="w-4 h-4 mr-2" />
                  Cerrar Año {selectedYear}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closures History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Cierres</CardTitle>
          <CardDescription>
            {closures?.length || 0} cierre(s) registrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead>Gastos</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Fecha Cierre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closures?.map((closure) => {
                const typeConfig = TYPE_CONFIG[closure.type];
                const statusConfig = STATUS_CONFIG[closure.status];
                const TypeIcon = typeConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={closure.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <TypeIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        {typeConfig.label}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {closure.type === 'MONTHLY'
                        ? `${MONTHS[closure.month - 1]} ${closure.year}`
                        : `Año ${closure.year}`}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(closure.totalIncome)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(closure.totalExpense)}
                    </TableCell>
                    <TableCell>
                      <span className={closure.result >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {formatCurrency(closure.result)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(closure.closedAt)}</TableCell>
                  </TableRow>
                );
              })}
              {(!closures || closures.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay cierres registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Close Period Dialog */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {closureType === 'MONTHLY'
                ? `Cerrar ${selectedMonth ? MONTHS[selectedMonth - 1] : ''} ${selectedYear}`
                : `Cerrar Año ${selectedYear}`}
            </DialogTitle>
            <DialogDescription>
              Esta acción cerrará el período contable y generará los asientos de cierre
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {validation && (
              <>
                {validation.isValid ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Validación Exitosa</AlertTitle>
                    <AlertDescription>
                      El período está listo para ser cerrado.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Errores de Validación</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2">
                        {validation.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleClosePeriod}
              disabled={!validation?.isValid || closeMonthMutation.isPending || closeYearMutation.isPending}
            >
              {closeMonthMutation.isPending || closeYearMutation.isPending ? 'Cerrando...' : 'Cerrar Período'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen Period Dialog */}
      <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reabrir Período</DialogTitle>
            <DialogDescription>
              Esta acción reabrirá el período para permitir correcciones. Solo debe usarse en casos excepcionales.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Razón de la Reapertura *</Label>
              <Textarea
                id="reason"
                placeholder="Explique la razón por la cual se debe reabrir este período..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReopenDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReopenPeriod}
              disabled={reopenMutation.isPending}
            >
              {reopenMutation.isPending ? 'Reabriendo...' : 'Reabrir Período'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
