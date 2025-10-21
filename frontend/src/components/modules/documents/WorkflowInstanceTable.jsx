'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function WorkflowInstanceTable({ data, isLoading, onRefetch }) {
  const [cancelId, setCancelId] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      IN_PROGRESS: { label: 'En Progreso', variant: 'default' },
      COMPLETED: { label: 'Completado', variant: 'success' },
      CANCELLED: { label: 'Cancelado', variant: 'destructive' },
      REJECTED: { label: 'Rechazado', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.IN_PROGRESS;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCancel = async () => {
    if (!cancelId) return;

    try {
      await api.post(`/api/documents/workflows/instances/${cancelId}/cancel`);
      toast.success('Workflow cancelado');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    } finally {
      setCancelId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cargando workflows...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay workflows registrados</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Iniciado Por</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Paso Actual</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((instance) => (
              <TableRow key={instance.id}>
                <TableCell className="font-medium">
                  {instance.workflowDefinition?.name || '-'}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {instance.document?.subject || '-'}
                </TableCell>
                <TableCell>{instance.initiatedBy?.name || '-'}</TableCell>
                <TableCell>
                  {format(new Date(instance.startedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {instance.currentStep || 0} / {instance.workflowDefinition?.steps?.length || 0}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(instance.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {instance.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelId(instance.id)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-3 w-3" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción detendrá el workflow y no se podrá reanudar. ¿Está seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
