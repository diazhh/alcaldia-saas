/**
 * Página de Gestión Presupuestaria
 * Permite crear, modificar y visualizar el presupuesto anual
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, FileEdit } from 'lucide-react';
import { useBudgetByYear, useBudgetItems } from '@/hooks/useFinance';
import { formatCurrency } from '@/lib/utils';
import { CreateBudgetDialog } from '@/components/modules/finance/CreateBudgetDialog';
import { CreateBudgetItemDialog } from '@/components/modules/finance/CreateBudgetItemDialog';
import { BudgetModificationDialog } from '@/components/modules/finance/BudgetModificationDialog';
import Link from 'next/link';

const STATUS_CONFIG = {
  DRAFT: { label: 'Borrador', color: 'bg-gray-500' },
  SUBMITTED: { label: 'Presentado', color: 'bg-blue-500' },
  APPROVED: { label: 'Aprobado', color: 'bg-green-500' },
  ACTIVE: { label: 'Activo', color: 'bg-green-600' },
  CLOSED: { label: 'Cerrado', color: 'bg-gray-600' },
};

export default function PresupuestoPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: budget, isLoading: budgetLoading } = useBudgetByYear(selectedYear);
  const { data: budgetItems, isLoading: itemsLoading } = useBudgetItems(budget?.id);

  const filteredItems = budgetItems?.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión Presupuestaria</h1>
          <p className="text-muted-foreground">
            Administración del presupuesto anual y partidas presupuestarias
          </p>
        </div>
        <div className="flex gap-2">
          {budget && (
            <>
              <Link href="/finanzas/modificaciones">
                <Button variant="outline">
                  <FileEdit className="mr-2 h-4 w-4" />
                  Modificaciones
                </Button>
              </Link>
              <BudgetModificationDialog budgetId={budget.id}>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Modificación
                </Button>
              </BudgetModificationDialog>
            </>
          )}
          <CreateBudgetDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Presupuesto
            </Button>
          </CreateBudgetDialog>
        </div>
      </div>

      {/* Información del Presupuesto Actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Presupuesto {selectedYear}</CardTitle>
              <CardDescription>
                Información general del presupuesto del año fiscal
              </CardDescription>
            </div>
            {budget && (
              <Badge className={STATUS_CONFIG[budget.status]?.color}>
                {STATUS_CONFIG[budget.status]?.label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {budgetLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : budget ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
                <p className="text-2xl font-bold">{formatCurrency(budget.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos Estimados</p>
                <p className="text-2xl font-bold">{formatCurrency(budget.estimatedIncome)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="text-2xl font-bold">{STATUS_CONFIG[budget.status]?.label}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No hay presupuesto para el año {selectedYear}
              </p>
              <Button className="mt-4">Crear Presupuesto</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partidas Presupuestarias */}
      {budget && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Partidas Presupuestarias</CardTitle>
                <CardDescription>
                  Distribución del presupuesto por partidas según clasificador ONAPRE
                </CardDescription>
              </div>
              <CreateBudgetItemDialog budgetId={budget.id}>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Partida
                </Button>
              </CreateBudgetItemDialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Búsqueda */}
            <div className="mb-4">
              <div className="relative">
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Tabla de Partidas */}
            {itemsLoading ? (
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
                      <TableHead>Código</TableHead>
                      <TableHead>Denominación</TableHead>
                      <TableHead className="text-right">Asignado</TableHead>
                      <TableHead className="text-right">Comprometido</TableHead>
                      <TableHead className="text-right">Causado</TableHead>
                      <TableHead className="text-right">Pagado</TableHead>
                      <TableHead className="text-right">Disponible</TableHead>
                      <TableHead className="text-right">% Ejecución</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems?.length > 0 ? (
                      filteredItems.map((item) => {
                        const executionRate = item.allocatedAmount > 0
                          ? (item.paidAmount / item.allocatedAmount) * 100
                          : 0;

                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.allocatedAmount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.committedAmount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.accruedAmount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.paidAmount)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.availableAmount)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={executionRate > 90 ? 'destructive' : 'secondary'}
                              >
                                {executionRate.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            No se encontraron partidas presupuestarias
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Resumen */}
            {budgetItems && budgetItems.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Asignado</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(
                        budgetItems.reduce((sum, item) => sum + parseFloat(item.allocatedAmount), 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Comprometido</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(
                        budgetItems.reduce((sum, item) => sum + parseFloat(item.committedAmount), 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Pagado</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(
                        budgetItems.reduce((sum, item) => sum + parseFloat(item.paidAmount), 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Disponible</p>
                    <p className="text-lg font-bold">
                      {formatCurrency(
                        budgetItems.reduce((sum, item) => sum + parseFloat(item.availableAmount), 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
