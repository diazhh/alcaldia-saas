'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

/**
 * Tabla de contribuyentes con búsqueda y acciones
 */
export default function TaxpayerTable({ onEdit }) {
  const { token } = useAuth();
  const [taxpayers, setTaxpayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchTaxpayers();
  }, []);

  const fetchTaxpayers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tax/taxpayers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTaxpayers(response.data);
    } catch (error) {
      console.error('Error fetching taxpayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tax/taxpayers/${deleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTaxpayers(taxpayers.filter(t => t.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting taxpayer:', error);
      alert('Error al eliminar contribuyente');
    }
  };

  const filteredTaxpayers = taxpayers.filter(taxpayer =>
    taxpayer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taxpayer.taxId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taxpayer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type) => {
    return type === 'NATURAL' ? 'Natural' : 'Jurídica';
  };

  const getTypeBadgeVariant = (type) => {
    return type === 'NATURAL' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Cargando contribuyentes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Contribuyentes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RIF/CI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTaxpayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron contribuyentes
                  </TableCell>
                </TableRow>
              ) : (
                filteredTaxpayers.map((taxpayer) => (
                  <TableRow key={taxpayer.id}>
                    <TableCell className="font-medium">{taxpayer.taxId}</TableCell>
                    <TableCell>{taxpayer.name}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(taxpayer.type)}>
                        {getTypeLabel(taxpayer.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{taxpayer.email || '-'}</TableCell>
                    <TableCell>{taxpayer.phone || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(taxpayer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(taxpayer.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el contribuyente
              y todos sus registros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
