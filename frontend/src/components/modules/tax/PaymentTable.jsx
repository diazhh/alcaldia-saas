'use client';

import { useState, useEffect } from 'react';
import { Eye, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

export default function PaymentTable({ onEdit }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Simular datos mientras se implementa el endpoint
      setPayments([
        {
          id: '1',
          receiptNumber: 'REC-2024-001',
          taxpayer: { name: 'Juan Pérez' },
          amount: 500000,
          paymentMethod: 'MOBILE_PAYMENT',
          paymentDate: '2024-06-15',
          status: 'CONFIRMED',
        },
        {
          id: '2',
          receiptNumber: 'REC-2024-002',
          taxpayer: { name: 'María García' },
          amount: 750000,
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: '2024-06-14',
          status: 'CONFIRMED',
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.taxpayer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      MOBILE_PAYMENT: 'Pago Móvil',
      BANK_TRANSFER: 'Transferencia',
      POS: 'Punto de Venta',
      CASH: 'Efectivo',
    };
    return labels[method] || method;
  };

  if (loading) {
    return <Card><CardContent className="py-8"><p className="text-center text-muted-foreground">Cargando pagos...</p></CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Historial de Pagos</CardTitle>
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
              <TableHead>N° Recibo</TableHead>
              <TableHead>Contribuyente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No se encontraron pagos</TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.receiptNumber}</TableCell>
                  <TableCell>{payment.taxpayer?.name}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell><Badge variant="outline">{getPaymentMethodLabel(payment.paymentMethod)}</Badge></TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell><Badge>Confirmado</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
