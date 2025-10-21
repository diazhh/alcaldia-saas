'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, MapPin, Calendar, User, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  REPORT_STATUS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  REPORT_TYPES,
  REPORT_TYPE_LABELS,
} from '@/constants';

/**
 * Tabla de reportes ciudadanos
 */
export default function ReportsTable({ reports, loading, onRefresh }) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
  });

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Filtrar reportes
   */
  const filteredReports = reports.filter((report) => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.type && report.type !== filters.type) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        report.ticketNumber.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.address?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  /**
   * Navegar a detalles del reporte
   */
  const handleViewReport = (id) => {
    router.push(`/participacion/reportes/${id}`);
  };

  /**
   * Exportar reportes
   */
  const handleExport = () => {
    // TODO: Implementar exportación a CSV/Excel
    console.log('Exportar reportes');
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por ticket, descripción o dirección..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            {Object.entries(REPORT_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipo de reporte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>

        {(filters.status || filters.type || filters.search) && (
          <Button
            variant="ghost"
            onClick={() => setFilters({ status: '', type: '', search: '' })}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tabla */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando reportes...
                </TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No se encontraron reportes
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewReport(report.id)}
                >
                  <TableCell className="font-medium">
                    {report.ticketNumber}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {REPORT_TYPE_LABELS[report.type]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={report.description}>
                      {report.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="max-w-[150px] truncate">
                        {report.address || 'No especificada'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={REPORT_STATUS_COLORS[report.status]}>
                      {REPORT_STATUS_LABELS[report.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.assignedTo ? (
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        <span>
                          {report.assignedTo.firstName} {report.assignedTo.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(report.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(report.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación info */}
      {!loading && filteredReports.length > 0 && (
        <div className="text-sm text-gray-600">
          Mostrando {filteredReports.length} de {reports.length} reportes
        </div>
      )}
    </div>
  );
}
