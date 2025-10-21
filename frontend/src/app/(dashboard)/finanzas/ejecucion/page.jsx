/**
 * Página de Ejecución del Gasto
 * Gestión del ciclo del gasto: Compromiso → Causado → Pagado
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, ArrowRight, CheckCircle } from 'lucide-react';
import { useTransactions } from '@/hooks/useFinance';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreateTransactionDialog } from '@/components/modules/finance/CreateTransactionDialog';

const STATUS_CONFIG = {
  COMPROMISO: { label: 'Compromiso', color: 'bg-blue-500', icon: ArrowRight },
  CAUSADO: { label: 'Causado', color: 'bg-orange-500', icon: ArrowRight },
  PAGADO: { label: 'Pagado', color: 'bg-green-500', icon: CheckCircle },
  ANULADO: { label: 'Anulado', color: 'bg-gray-500', icon: CheckCircle },
};

export default function EjecucionPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { data: transactions, isLoading } = useTransactions({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ejecución del Gasto</h1>
          <p className="text-muted-foreground">
            Gestión del ciclo presupuestario: Compromiso, Causado y Pagado
          </p>
        </div>
        <CreateTransactionDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Compromiso
          </Button>
        </CreateTransactionDialog>
      </div>

      {/* Tabs por Estado */}
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="COMPROMISO">Compromisos</TabsTrigger>
          <TabsTrigger value="CAUSADO">Causados</TabsTrigger>
          <TabsTrigger value="PAGADO">Pagados</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>
                Listado de transacciones financieras del municipio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Beneficiario</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.transactions?.length > 0 ? (
                      transactions.transactions.map((transaction) => {
                        const StatusIcon = STATUS_CONFIG[transaction.status]?.icon;
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">
                              {transaction.reference}
                            </TableCell>
                            <TableCell>{transaction.concept}</TableCell>
                            <TableCell>{transaction.beneficiary}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge className={STATUS_CONFIG[transaction.status]?.color}>
                                {STATUS_CONFIG[transaction.status]?.label}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                Ver detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            No hay transacciones registradas
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
