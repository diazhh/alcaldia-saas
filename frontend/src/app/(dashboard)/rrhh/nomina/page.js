'use client';

import { useState } from 'react';
import { Plus, Download, Calculator, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { usePayrolls } from '@/hooks/hr/usePayroll';

/**
 * Página de gestión de nómina
 */
export default function NominaPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [filters, setFilters] = useState({
    year: currentYear,
    month: currentMonth,
    status: '',
    page: 1,
    limit: 20,
  });

  const { data: payrollsData, isLoading } = usePayrolls(filters);

  const getStatusBadge = (status) => {
    const variants = {
      DRAFT: { label: 'Borrador', className: 'bg-gray-500' },
      CALCULATED: { label: 'Calculada', className: 'bg-blue-500' },
      APPROVED: { label: 'Aprobada', className: 'bg-green-500' },
      PAID: { label: 'Pagada', className: 'bg-purple-500' },
    };
    const config = variants[status] || variants.DRAFT;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Nómina</h1>
          <p className="text-muted-foreground mt-1">
            Procesar y gestionar el pago de nómina
          </p>
        </div>
        <Link href="/rrhh/nomina/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Nómina
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              value={filters.year.toString()}
              onValueChange={(value) => setFilters({ ...filters, year: parseInt(value), page: 1 })}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.month.toString()}
              onValueChange={(value) => setFilters({ ...filters, month: parseInt(value), page: 1 })}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => 
                setFilters({ ...filters, status: value === 'all' ? '' : value, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="CALCULATED">Calculada</SelectItem>
                <SelectItem value="APPROVED">Aprobada</SelectItem>
                <SelectItem value="PAID">Pagada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de nóminas */}
      <Card>
        <CardHeader>
          <CardTitle>Nóminas Registradas</CardTitle>
          <CardDescription>
            Historial de nóminas procesadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !payrollsData?.data || payrollsData.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron nóminas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Empleados</TableHead>
                  <TableHead>Total Bruto</TableHead>
                  <TableHead>Total Neto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollsData.data.map((payroll) => (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-mono text-sm">
                      {payroll.reference}
                    </TableCell>
                    <TableCell>
                      {payroll.period === 'BIWEEKLY' ? 'Quincenal' : 'Mensual'} - Q{payroll.periodNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(payroll.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payroll._count?.details || 0}</TableCell>
                    <TableCell>${payroll.totalGross?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell className="font-semibold">
                      ${payroll.totalNet?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/rrhh/nomina/${payroll.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                        </Link>
                        {payroll.status === 'DRAFT' && (
                          <Button size="sm" variant="default">
                            <Calculator className="w-4 h-4 mr-1" />
                            Calcular
                          </Button>
                        )}
                        {payroll.status === 'CALCULATED' && (
                          <Button size="sm" variant="default">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                        )}
                        {payroll.status === 'APPROVED' && (
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Exportar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
