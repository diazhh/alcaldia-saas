/**
 * Página de Conciliación Bancaria
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  useBankReconciliations,
  useBankReconciliationStats,
  useBankAccounts,
} from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

const STATUS_CONFIG = {
  IN_PROGRESS: {
    label: 'En Progreso',
    color: 'bg-blue-500',
    icon: Clock,
  },
  COMPLETED: {
    label: 'Completada',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  APPROVED: {
    label: 'Aprobada',
    color: 'bg-emerald-500',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rechazada',
    color: 'bg-red-500',
    icon: XCircle,
  },
};

export default function ConciliacionPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBankAccount, setSelectedBankAccount] = useState('all');

  const { data: bankAccounts } = useBankAccounts();
  const { data: reconciliations, isLoading } = useBankReconciliations({
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    bankAccountId: selectedBankAccount !== 'all' ? selectedBankAccount : undefined,
  });
  const { data: stats } = useBankReconciliationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conciliación Bancaria</h1>
          <p className="text-muted-foreground">
            Concilia los saldos bancarios con los registros contables
          </p>
        </div>
        <Link href="/finanzas/conciliacion/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Conciliación
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conciliaciones</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Cuenta Bancaria</label>
            <select
              className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
              value={selectedBankAccount}
              onChange={(e) => setSelectedBankAccount(e.target.value)}
            >
              <option value="all">Todas las cuentas</option>
              {bankAccounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {account.accountNumber}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Conciliaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Conciliaciones Bancarias</CardTitle>
          <CardDescription>Historial de conciliaciones realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="IN_PROGRESS">En Progreso</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completadas</TabsTrigger>
              <TabsTrigger value="APPROVED">Aprobadas</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus} className="mt-4">
              {isLoading ? (
                <div className="text-center py-8">Cargando...</div>
              ) : !reconciliations || reconciliations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay conciliaciones registradas
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cuenta Bancaria</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">Saldo Banco</TableHead>
                      <TableHead className="text-right">Saldo Libros</TableHead>
                      <TableHead className="text-right">Diferencia</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reconciliations.map((reconciliation) => {
                      const statusConfig = STATUS_CONFIG[reconciliation.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow key={reconciliation.id}>
                          <TableCell>
                            {formatDate(reconciliation.reconciliationDate)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {reconciliation.bankAccount.bankName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reconciliation.bankAccount.accountNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(reconciliation.periodStart)} -{' '}
                              {formatDate(reconciliation.periodEnd)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(reconciliation.statementBalance)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(reconciliation.bookBalance)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                Math.abs(reconciliation.totalDifference) > 0.01
                                  ? 'text-red-600 font-medium'
                                  : 'text-green-600'
                              }
                            >
                              {formatCurrency(reconciliation.totalDifference)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${statusConfig.color} text-white border-0`}
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/finanzas/conciliacion/${reconciliation.id}`}>
                              <Button variant="ghost" size="sm">
                                Ver Detalle
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
