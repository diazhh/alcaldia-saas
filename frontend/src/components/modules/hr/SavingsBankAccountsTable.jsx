'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Tabla de cuentas de caja de ahorro
 * TODO: Implementar funcionalidad completa
 */
export default function SavingsBankAccountsTable({ data = [], pagination, isLoading, onPageChange }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay cuentas de ahorro registradas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Número de Empleado</TableHead>
              <TableHead className="text-right">Tasa Empleado</TableHead>
              <TableHead className="text-right">Tasa Patronal</TableHead>
              <TableHead className="text-right">Saldo Total</TableHead>
              <TableHead className="text-right">Saldo Disponible</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">
                  {account.employee?.firstName} {account.employee?.lastName}
                </TableCell>
                <TableCell>{account.employee?.employeeNumber}</TableCell>
                <TableCell className="text-right">{account.employeeRate}%</TableCell>
                <TableCell className="text-right">{account.employerRate}%</TableCell>
                <TableCell className="text-right">
                  Bs. {parseFloat(account.totalBalance).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  Bs. {parseFloat(account.availableBalance).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? 'success' : 'secondary'}>
                    {account.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
