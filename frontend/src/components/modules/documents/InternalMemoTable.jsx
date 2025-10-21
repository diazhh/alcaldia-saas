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
import { MoreHorizontal, Edit, CheckCircle, Send, Archive, Trash2 } from 'lucide-react';
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

export function InternalMemoTable({ data, isLoading, onEdit, onRefetch }) {
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { label: 'Borrador', variant: 'secondary' },
      PENDING_APPROVAL: { label: 'Pendiente Aprobación', variant: 'default' },
      APPROVED: { label: 'Aprobado', variant: 'success' },
      DISTRIBUTED: { label: 'Distribuido', variant: 'success' },
      ARCHIVED: { label: 'Archivado', variant: 'outline' },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      MEMO: { label: 'Memorando', color: 'bg-blue-100 text-blue-800' },
      OFFICE: { label: 'Oficio', color: 'bg-green-100 text-green-800' },
      CIRCULAR: { label: 'Circular', color: 'bg-purple-100 text-purple-800' },
      PROVIDENCE: { label: 'Providencia', color: 'bg-amber-100 text-amber-800' },
    };

    const config = typeConfig[type] || typeConfig.MEMO;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/memos/${id}/approve`);
      toast.success('Oficio aprobado exitosamente');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al aprobar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDistribute = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/memos/${id}/distribute`);
      toast.success('Oficio distribuido exitosamente');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al distribuir');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/memos/${id}/archive`);
      toast.success('Oficio archivado');
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
      await api.delete(`/api/documents/memos/${deleteId}`);
      toast.success('Oficio eliminado');
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
        <p className="text-gray-500">Cargando oficios...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay oficios registrados</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.number}</TableCell>
                <TableCell>{getTypeBadge(item.type)}</TableCell>
                <TableCell className="max-w-xs truncate">{item.subject}</TableCell>
                <TableCell>{item.originDepartment?.name || '-'}</TableCell>
                <TableCell>{item.destinationDepartment?.name || '-'}</TableCell>
                <TableCell>
                  {format(new Date(item.issueDate), 'dd/MM/yyyy', { locale: es })}
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
                      {item.status === 'PENDING_APPROVAL' && (
                        <DropdownMenuItem onClick={() => handleApprove(item.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aprobar
                        </DropdownMenuItem>
                      )}
                      {item.status === 'APPROVED' && (
                        <DropdownMenuItem onClick={() => handleDistribute(item.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Distribuir
                        </DropdownMenuItem>
                      )}
                      {item.status === 'DISTRIBUTED' && (
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
              Esta acción no se puede deshacer. Se eliminará permanentemente el oficio.
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
