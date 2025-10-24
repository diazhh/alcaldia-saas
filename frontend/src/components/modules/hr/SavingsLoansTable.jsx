'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, DollarSign } from 'lucide-react';

/**
 * Tabla de préstamos de caja de ahorro
 * TODO: Implementar funcionalidad completa con datos reales
 */
export default function SavingsLoansTable() {
  // Datos de ejemplo - TODO: Reemplazar con datos reales de la API
  const mockLoans = [];

  const getLoanTypeLabel = (type) => {
    const types = {
      PERSONAL: 'Personal',
      EMERGENCY: 'Emergencia',
      VEHICLE: 'Vehículo',
      HOUSING: 'Vivienda',
      EDUCATION: 'Educación',
      MEDICAL: 'Médico',
      OTHER: 'Otro',
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { variant: 'warning', label: 'Pendiente' },
      APPROVED: { variant: 'success', label: 'Aprobado' },
      REJECTED: { variant: 'destructive', label: 'Rechazado' },
      ACTIVE: { variant: 'default', label: 'Activo' },
      PAID: { variant: 'success', label: 'Pagado' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (mockLoans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay préstamos registrados
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número de Préstamo</TableHead>
            <TableHead>Empleado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-center">Cuotas</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockLoans.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell className="font-medium">{loan.loanNumber}</TableCell>
              <TableCell>
                {loan.savingsBank?.employee?.firstName} {loan.savingsBank?.employee?.lastName}
              </TableCell>
              <TableCell>{getLoanTypeLabel(loan.type)}</TableCell>
              <TableCell className="text-right">
                Bs. {parseFloat(loan.amount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-center">
                {loan.paidInstallments}/{loan.installments}
              </TableCell>
              <TableCell className="text-right">
                Bs. {parseFloat(loan.balance).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell>{getStatusBadge(loan.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {loan.status === 'PENDING' && (
                    <>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {loan.status === 'ACTIVE' && (
                    <Button variant="ghost" size="sm">
                      <DollarSign className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
