'use client';

import { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export default function CollectionTable({ onView }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tax/collections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollections(response.data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = collections.filter(collection =>
    collection.taxpayer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: { variant: 'destructive', label: 'Activo' },
      IN_PAYMENT_PLAN: { variant: 'secondary', label: 'En Convenio' },
      RESOLVED: { variant: 'default', label: 'Resuelto' },
      CLOSED: { variant: 'outline', label: 'Cerrado' },
    };
    return variants[status] || variants.ACTIVE;
  };

  if (loading) {
    return <Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Cargando casos de cobranza...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Casos de Cobranza</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-[300px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contribuyente</TableHead>
              <TableHead>Deuda Total</TableHead>
              <TableHead>Antigüedad</TableHead>
              <TableHead>Última Acción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No se encontraron casos de cobranza</TableCell>
              </TableRow>
            ) : (
              filteredCollections.map((collection) => {
                const statusInfo = getStatusBadge(collection.status);
                return (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.taxpayer?.name}</TableCell>
                    <TableCell>{formatCurrency(collection.totalDebt)}</TableCell>
                    <TableCell>{collection.daysOverdue} días</TableCell>
                    <TableCell>{collection.lastAction || '-'}</TableCell>
                    <TableCell><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onView(collection)}><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
