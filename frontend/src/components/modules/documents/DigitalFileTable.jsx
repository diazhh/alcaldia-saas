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
import { MoreHorizontal, Edit, FolderCheck, Archive, Trash2, Eye } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

export function DigitalFileTable({ data, isLoading, onEdit, onRefetch }) {
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const router = useRouter();

  const getStatusBadge = (status) => {
    const statusConfig = {
      OPEN: { label: 'Abierto', variant: 'success' },
      CLOSED: { label: 'Cerrado', variant: 'secondary' },
      ARCHIVED: { label: 'Archivado', variant: 'outline' },
    };

    const config = statusConfig[status] || statusConfig.OPEN;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleClose = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/files/${id}/close`);
      toast.success('Expediente cerrado exitosamente');
      onRefetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cerrar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/api/documents/files/${id}/archive`);
      toast.success('Expediente archivado');
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
      await api.delete(`/api/documents/files/${deleteId}`);
      toast.success('Expediente eliminado');
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
        <p className="text-gray-500">Cargando expedientes...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay expedientes registrados</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha Apertura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.code}</TableCell>
                <TableCell className="max-w-xs truncate">{item.subject}</TableCell>
                <TableCell>{item.type || '-'}</TableCell>
                <TableCell>{item.responsibleUser?.name || '-'}</TableCell>
                <TableCell>
                  {format(new Date(item.openingDate), 'dd/MM/yyyy', { locale: es })}
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
                      <DropdownMenuItem onClick={() => router.push(`/documentos/expedientes/${item.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {item.status === 'OPEN' && (
                        <DropdownMenuItem onClick={() => handleClose(item.id)}>
                          <FolderCheck className="mr-2 h-4 w-4" />
                          Cerrar Expediente
                        </DropdownMenuItem>
                      )}
                      {item.status === 'CLOSED' && (
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
              Esta acción no se puede deshacer. Se eliminará permanentemente el expediente.
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
