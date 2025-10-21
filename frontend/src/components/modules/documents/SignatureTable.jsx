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
import { CheckCircle, XCircle, Eye } from 'lucide-react';
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

export function SignatureTable({ data, isLoading, onRefetch }) {
  const [signDialog, setSignDialog] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', variant: 'secondary' },
      SIGNED: { label: 'Firmado', variant: 'success' },
      REJECTED: { label: 'Rechazado', variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSign = async () => {
    if (!signDialog) return;

    setActionLoading(true);
    try {
      await api.post('/api/documents/signatures', {
        documentId: signDialog.documentId,
      });
      toast.success('Documento firmado exitosamente');
      setSignDialog(null);
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al firmar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog || !rejectReason.trim()) {
      toast.error('Debe proporcionar un motivo de rechazo');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/api/documents/signatures/${rejectDialog.id}/reject`, {
        reason: rejectReason,
      });
      toast.success('Firma rechazada');
      setRejectDialog(null);
      setRejectReason('');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al rechazar');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cargando firmas...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay documentos pendientes de firma</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Fecha Solicitud</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.document?.subject || 'Sin asunto'}
                </TableCell>
                <TableCell>{item.document?.createdBy?.name || '-'}</TableCell>
                <TableCell>
                  {format(new Date(item.requestedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.order}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right">
                  {item.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSignDialog(item)}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Firmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectDialog(item)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-3 w-3" />
                        Rechazar
                      </Button>
                    </div>
                  )}
                  {item.status === 'SIGNED' && item.signedAt && (
                    <span className="text-sm text-gray-500">
                      {format(new Date(item.signedAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Sign Confirmation Dialog */}
      <Dialog open={!!signDialog} onOpenChange={() => setSignDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Firma</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea firmar este documento?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              <strong>Documento:</strong> {signDialog?.document?.subject}
            </p>
            <p className="text-sm mt-2 text-gray-600">
              Al firmar, está dando su aprobación y validación al contenido del documento.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignDialog(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSign} disabled={actionLoading}>
              {actionLoading ? 'Firmando...' : 'Confirmar Firma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Firma</DialogTitle>
            <DialogDescription>
              Proporcione el motivo del rechazo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del Rechazo *</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique por qué rechaza la firma de este documento"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
              variant="destructive"
            >
              {actionLoading ? 'Rechazando...' : 'Rechazar Firma'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
