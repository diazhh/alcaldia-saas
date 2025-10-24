'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Bell, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Tabla de acciones disciplinarias
 * TODO: Implementar funcionalidad completa
 */
export default function DisciplinaryActionsTable({ data = [], pagination, isLoading, onPageChange }) {
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
        No hay acciones disciplinarias registradas
      </div>
    );
  }

  const getTypeLabel = (type) => {
    const labels = {
      VERBAL_WARNING: 'Amonestación Verbal',
      WRITTEN_WARNING: 'Amonestación Escrita',
      SUSPENSION: 'Suspensión',
      TERMINATION: 'Destitución',
      FINE: 'Multa',
    };
    return labels[type] || type;
  };

  const getSeverityBadge = (severity) => {
    const variants = {
      LOW: { variant: 'secondary', label: 'Baja' },
      MEDIUM: { variant: 'warning', label: 'Media' },
      HIGH: { variant: 'destructive', label: 'Alta' },
      CRITICAL: { variant: 'destructive', label: 'Crítica' },
    };
    const config = variants[severity] || { variant: 'secondary', label: severity };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      INITIATED: { variant: 'secondary', label: 'Iniciado' },
      NOTIFIED: { variant: 'warning', label: 'Notificado' },
      EMPLOYEE_RESPONDED: { variant: 'default', label: 'Respondido' },
      DECIDED: { variant: 'default', label: 'Decidido' },
      APPEALED: { variant: 'warning', label: 'Apelado' },
      CLOSED: { variant: 'success', label: 'Cerrado' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Severidad</TableHead>
              <TableHead>Razón</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((action) => (
              <TableRow key={action.id}>
                <TableCell className="font-medium">
                  {action.employee?.firstName} {action.employee?.lastName}
                </TableCell>
                <TableCell>{getTypeLabel(action.type)}</TableCell>
                <TableCell>{getSeverityBadge(action.severity)}</TableCell>
                <TableCell className="max-w-xs truncate">{action.reason}</TableCell>
                <TableCell>
                  {format(new Date(action.createdAt), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>{getStatusBadge(action.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {action.status === 'INITIATED' && (
                      <Button variant="ghost" size="sm">
                        <Bell className="w-4 h-4" />
                      </Button>
                    )}
                    {action.status === 'EMPLOYEE_RESPONDED' && (
                      <>
                        <Button variant="ghost" size="sm" className="text-green-600">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
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
