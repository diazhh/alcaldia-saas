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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, CheckCircle, Send, Archive, Trash2, Eye } from 'lucide-react';
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

export function CorrespondenceTable({ data, isLoading, onEdit, onRefetch, type }) {
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', variant: 'secondary' },
      IN_TRANSIT: { label: 'En Tránsito', variant: 'default' },
      DELIVERED: { label: 'Entregado', variant: 'success' },
      DISPATCHED: { label: 'Despachado', variant: 'success' },
      ARCHIVED: { label: 'Archivado', variant: 'outline' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleMarkAsDelivered = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/correspondence/${id}/deliver`);
      toast.success('Correspondencia marcada como entregada');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsDispatched = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/correspondence/${id}/dispatch`);
      toast.success('Correspondencia marcada como despachada');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/correspondence/${id}/archive`);
      toast.success('Correspondencia archivada');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al archivar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/api/documents/correspondence/${deleteId}`);
      toast.success('Correspondencia eliminada');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cargando correspondencia...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay correspondencia registrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referencia</TableHead>
              <TableHead>Asunto</TableHead>
              {type === 'incoming' ? (
                <>
                  <TableHead>Remitente</TableHead>
                  <TableHead>Destino</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Dirección</TableHead>
                </>
              )}
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.reference}</TableCell>
                <TableCell className="max-w-xs truncate">{item.subject}</TableCell>
                {type === 'incoming' ? (
                  <>
                    <TableCell>{item.sender || '-'}</TableCell>
                    <TableCell>{item.destination?.name || '-'}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{item.recipient || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.recipientAddress || '-'}</TableCell>
                  </>
                )}
                <TableCell>
                  {format(new Date(item.registrationDate), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={actionLoading === item.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {type === 'incoming' && item.status === 'PENDING' && (
                        <DropdownMenuItem onClick={() => handleMarkAsDelivered(item.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marcar Entregado
                        </DropdownMenuItem>
                      )}
                      {type === 'outgoing' && item.status === 'PENDING' && (
                        <DropdownMenuItem onClick={() => handleMarkAsDispatched(item.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Marcar Despachado
                        </DropdownMenuItem>
                      )}
                      {(item.status === 'DELIVERED' || item.status === 'DISPATCHED') && (
                        <DropdownMenuItem onClick={() => handleArchive(item.id)}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archivar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(item.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la correspondencia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
