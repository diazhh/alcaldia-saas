'use client';

import { useState, useEffect } from 'react';
import { Eye, FileText, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';

const TAX_TYPES = {
  BUSINESS_TAX: 'Patente Comercial',
  PROPERTY_TAX: 'Impuesto Inmobiliario',
  VEHICLE_TAX: 'Impuesto Vehicular',
  URBAN_CLEANING: 'Aseo Urbano',
  ADMINISTRATIVE: 'Tasa Administrativa',
  SPACE_USE: 'Uso de Espacios',
  CEMETERY: 'Cementerio',
  PUBLIC_EVENTS: 'Eventos Públicos',
  OTHER: 'Otros'
};

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  PARTIAL: { label: 'Parcial', variant: 'info' },
  PAID: { label: 'Pagado', variant: 'success' },
  OVERDUE: { label: 'Vencido', variant: 'destructive' },
  CANCELLED: { label: 'Anulado', variant: 'secondary' }
};

export default function TaxBillTable({ onView }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      // Since there's no dedicated bills endpoint, we'll fetch from different sources
      // For now, we'll create a placeholder that can be connected to the backend
      const response = await api.get('/tax/taxpayers');
      // This is a placeholder - in production, you'd have a dedicated bills endpoint
      setBills([]);
    } catch (error) {
      console.error('Error fetching tax bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-VE');
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.taxpayer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.taxpayer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const matchesType = typeFilter === 'all' || bill.taxType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Cargando declaraciones tributarias...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Declaraciones Tributarias
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por número de factura o contribuyente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(TAX_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredBills.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay declaraciones registradas</p>
            <p className="text-sm mt-2">
              Las declaraciones tributarias se generan automáticamente al crear facturas
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Contribuyente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Año Fiscal</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell>
                      {bill.taxpayer?.firstName} {bill.taxpayer?.lastName}
                      {bill.taxpayer?.businessName && (
                        <div className="text-sm text-muted-foreground">
                          {bill.taxpayer.businessName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{TAX_TYPES[bill.taxType] || bill.taxType}</TableCell>
                    <TableCell>{bill.fiscalYear}</TableCell>
                    <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(bill.paidAmount)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(bill.balanceAmount)}
                    </TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_CONFIG[bill.status]?.variant || 'secondary'}>
                        {STATUS_CONFIG[bill.status]?.label || bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView?.(bill)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* Download PDF */}}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
