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
import { CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function WorkflowStepsTable({ data, isLoading, onRefetch }) {
  const [processDialog, setProcessDialog] = useState(null);
  const [action, setAction] = useState('approve'); // 'approve' or 'reject'
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleProcess = async () => {
    if (!processDialog) return;

    setActionLoading(true);
    try {
      await api.post(`/api/documents/workflows/steps/${processDialog.id}/process`, {
        action,
        comment: comment.trim() || undefined,
      });
      toast.success(action === 'approve' ? 'Tarea aprobada' : 'Tarea rechazada');
      setProcessDialog(null);
      setComment('');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al procesar');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cargando tareas...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay tareas pendientes</p>
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
              <TableHead>Paso</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((step) => (
              <TableRow key={step.id}>
                <TableCell className="font-medium">
                  {step.workflowInstance?.workflowDefinition?.name || '-'}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {step.workflowInstance?.document?.subject || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Paso {step.stepNumber}</Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(step.assignedAt), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>
                  {step.dueDate ? (
                    <span className={new Date(step.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                      {format(new Date(step.dueDate), 'dd/MM/yyyy', { locale: es })}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAction('approve');
                        setProcessDialog(step);
                      }}
                      className="gap-1 text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAction('reject');
                        setProcessDialog(step);
                      }}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3 w-3" />
                      Rechazar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Process Dialog */}
      <Dialog open={!!processDialog} onOpenChange={() => setProcessDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Aprobar' : 'Rechazar'} Tarea
            </DialogTitle>
            <DialogDescription>
              {action === 'approve'
                ? 'Confirme la aprobación de esta tarea del workflow'
                : 'Proporcione el motivo del rechazo'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">
                Comentario {action === 'reject' && '*'}
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  action === 'approve'
                    ? 'Comentario opcional'
                    : 'Explique el motivo del rechazo'
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleProcess}
              disabled={actionLoading || (action === 'reject' && !comment.trim())}
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {actionLoading
                ? 'Procesando...'
                : action === 'approve'
                ? 'Confirmar Aprobación'
                : 'Confirmar Rechazo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
