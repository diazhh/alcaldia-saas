'use client';

import { useState, useEffect } from 'react';
import { Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export default function FeeTable({ onEdit }) {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tax/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(response.data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = fees.filter(fee =>
    fee.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.feeType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { variant: 'secondary', label: 'Pendiente' },
      PAID: { variant: 'default', label: 'Pagada' },
      OVERDUE: { variant: 'destructive', label: 'Vencida' },
      CANCELLED: { variant: 'outline', label: 'Anulada' },
    };
    return variants[status] || variants.PENDING;
  };

  if (loading) {
    return <Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Cargando facturas...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Facturas de Tasas</CardTitle>
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
              <TableHead>N° Factura</TableHead>
              <TableHead>Tipo de Tasa</TableHead>
              <TableHead>Contribuyente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha Emisión</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No se encontraron facturas</TableCell>
              </TableRow>
            ) : (
              filteredFees.map((fee) => {
                const statusInfo = getStatusBadge(fee.status);
                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.billNumber}</TableCell>
                    <TableCell>{fee.feeType}</TableCell>
                    <TableCell>{fee.taxpayer?.name || '-'}</TableCell>
                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                    <TableCell>{new Date(fee.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant={statusInfo.variant}>{statusInfo.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(fee)}><Eye className="w-4 h-4" /></Button>
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
