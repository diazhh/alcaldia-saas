'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

/**
 * Página de reportes tributarios
 */
export default function ReportesPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('');
  const [period, setPeriod] = useState('current-month');
  const [format, setFormat] = useState('pdf');

  const reportTypes = [
    {
      id: 'collection',
      name: 'Recaudación por Período',
      description: 'Detalle de ingresos tributarios en un período específico',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'defaulters',
      name: 'Cartera de Morosos',
      description: 'Listado de contribuyentes con deudas pendientes',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'taxpayers',
      name: 'Registro de Contribuyentes',
      description: 'Base de datos completa de contribuyentes',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'solvencies',
      name: 'Solvencias Emitidas',
      description: 'Historial de solvencias generadas',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'efficiency',
      name: 'Eficiencia Tributaria',
      description: 'Indicadores de gestión y eficiencia',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'business-licenses',
      name: 'Patentes Comerciales',
      description: 'Reporte de licencias y actividades económicas',
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) {
      alert('Por favor selecciona un tipo de reporte');
      return;
    }

    setLoading(true);
    try {
      // Aquí se implementaría la llamada al backend para generar el reporte
      const response = await axios.get(
        `${API_BASE_URL}/api/tax/reports/${reportType}`,
        {
          params: { period, format },
          headers: { Authorization: `Bearer ${token}` },
          responseType: format === 'pdf' ? 'blob' : 'json',
        }
      );

      if (format === 'pdf') {
        // Descargar PDF
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte-${reportType}-${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Descargar Excel
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte-${reportType}-${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      alert('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte. Esta funcionalidad estará disponible próximamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes Tributarios</h1>
        <p className="text-muted-foreground mt-2">
          Genera reportes de recaudación, morosidad y gestión tributaria
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generar Reporte</TabsTrigger>
          <TabsTrigger value="scheduled">Reportes Programados</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          {/* Selector de tipo de reporte */}
          <Card>
            <CardHeader>
              <CardTitle>Selecciona el Tipo de Reporte</CardTitle>
              <CardDescription>
                Elige el reporte que deseas generar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <div
                      key={report.id}
                      onClick={() => setReportType(report.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        reportType === report.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${report.bgColor} flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 ${report.color}`} />
                      </div>
                      <h3 className="font-semibold mb-1">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuración del reporte */}
          {reportType && (
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Reporte</CardTitle>
                <CardDescription>
                  Define los parámetros para generar el reporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="period">Período</Label>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger id="period">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-month">Mes Actual</SelectItem>
                        <SelectItem value="last-month">Mes Anterior</SelectItem>
                        <SelectItem value="current-quarter">Trimestre Actual</SelectItem>
                        <SelectItem value="last-quarter">Trimestre Anterior</SelectItem>
                        <SelectItem value="current-year">Año Actual</SelectItem>
                        <SelectItem value="last-year">Año Anterior</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="format">Formato</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger id="format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setReportType('')}>
                    Cancelar
                  </Button>
                  <Button onClick={handleGenerateReport} disabled={loading}>
                    <Download className="w-4 h-4 mr-2" />
                    {loading ? 'Generando...' : 'Generar Reporte'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reportes rápidos */}
          <Card>
            <CardHeader>
              <CardTitle>Reportes Rápidos</CardTitle>
              <CardDescription>
                Acceso directo a los reportes más utilizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Recaudación del Mes</p>
                      <p className="text-sm text-muted-foreground">Ingresos del mes actual</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium">Morosos Activos</p>
                      <p className="text-sm text-muted-foreground">Contribuyentes con deudas</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Solvencias del Mes</p>
                      <p className="text-sm text-muted-foreground">Certificaciones emitidas</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes Programados</CardTitle>
              <CardDescription>
                Configura reportes automáticos periódicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay reportes programados</h3>
                <p className="text-muted-foreground mb-4">
                  Configura reportes automáticos para recibirlos periódicamente
                </p>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Programar Reporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reportes</CardTitle>
              <CardDescription>
                Reportes generados recientemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: 'Recaudación Mensual - Junio 2024',
                    date: '2024-06-30',
                    type: 'PDF',
                    size: '2.4 MB',
                  },
                  {
                    name: 'Cartera de Morosos - Mayo 2024',
                    date: '2024-05-31',
                    type: 'Excel',
                    size: '1.8 MB',
                  },
                  {
                    name: 'Solvencias Emitidas - Mayo 2024',
                    date: '2024-05-31',
                    type: 'PDF',
                    size: '890 KB',
                  },
                ].map((report, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.date).toLocaleDateString()} • {report.type} • {report.size}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
