'use client';

import { useEffect, useState } from 'react';
import { MapPin, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  REPORT_TYPES,
  REPORT_TYPE_LABELS,
  REPORT_STATUS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
} from '@/constants';
import { getHeatmapData } from '@/services/participation.service';

/**
 * Mapa de calor de reportes ciudadanos
 */
export default function ReportsHeatmap() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    days: '30',
  });
  const [selectedReport, setSelectedReport] = useState(null);

  /**
   * Cargar datos del mapa de calor
   */
  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.days) params.days = filters.days;

      const response = await getHeatmapData(params);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmapData();
  }, [filters]);

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
   * Agrupar reportes por ubicación aproximada
   */
  const groupReportsByLocation = () => {
    const groups = {};
    
    reports.forEach((report) => {
      if (report.latitude && report.longitude) {
        // Redondear coordenadas para agrupar reportes cercanos
        const lat = report.latitude.toFixed(3);
        const lng = report.longitude.toFixed(3);
        const key = `${lat},${lng}`;
        
        if (!groups[key]) {
          groups[key] = {
            latitude: report.latitude,
            longitude: report.longitude,
            reports: [],
          };
        }
        groups[key].reports.push(report);
      }
    });

    return Object.values(groups);
  };

  const locationGroups = groupReportsByLocation();

  /**
   * Obtener color según cantidad de reportes
   */
  const getHeatColor = (count) => {
    if (count >= 10) return 'bg-red-600';
    if (count >= 5) return 'bg-orange-500';
    if (count >= 3) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value })}
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Select
                value={filters.days}
                onValueChange={(value) => setFilters({ ...filters, days: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                  <SelectItem value="">Todo el tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total de reportes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {locationGroups.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Zonas con reportes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {locationGroups.filter((g) => g.reports.length >= 5).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Zonas críticas (5+ reportes)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa simplificado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualización de zonas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Zonas con reportes</CardTitle>
            <CardDescription>
              Áreas con mayor concentración de reportes ciudadanos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Cargando datos...</p>
              </div>
            ) : locationGroups.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">No hay reportes con ubicación</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {locationGroups
                  .sort((a, b) => b.reports.length - a.reports.length)
                  .map((group, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedReport(group)}
                    >
                      <div
                        className={`w-12 h-12 rounded-full ${getHeatColor(
                          group.reports.length
                        )} flex items-center justify-center text-white font-bold`}
                      >
                        {group.reports.length}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">
                            Zona {index + 1}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {group.latitude.toFixed(6)}, {group.longitude.toFixed(6)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.reports.length} reporte{group.reports.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            group.reports.length >= 10
                              ? 'border-red-500 text-red-700'
                              : group.reports.length >= 5
                              ? 'border-orange-500 text-orange-700'
                              : 'border-blue-500 text-blue-700'
                          }
                        >
                          {group.reports.length >= 10
                            ? 'Crítico'
                            : group.reports.length >= 5
                            ? 'Alto'
                            : 'Normal'}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalles de zona seleccionada */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de zona</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReport ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Ubicación</p>
                  <p className="font-medium">
                    {selectedReport.latitude.toFixed(6)},{' '}
                    {selectedReport.longitude.toFixed(6)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Reportes en esta zona ({selectedReport.reports.length})
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedReport.reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {report.ticketNumber}
                          </span>
                          <Badge className={REPORT_STATUS_COLORS[report.status]}>
                            {REPORT_STATUS_LABELS[report.status]}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-xs">
                          {REPORT_TYPE_LABELS[report.type]}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
                Selecciona una zona para ver los detalles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle>Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm">1-2 reportes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm">3-4 reportes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-sm">5-9 reportes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600" />
              <span className="text-sm">10+ reportes (Crítico)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
