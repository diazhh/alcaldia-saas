'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  Award,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

/**
 * Página de reportes de RRHH
 */
export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState('birthdays');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async (reportType, params = {}) => {
    setLoading(true);
    try {
      // TODO: Implementar llamada a API
      toast({
        title: 'Generando reporte...',
        description: 'El reporte se está generando. Por favor espere.',
      });
      
      // Simular generación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Reporte generado',
        description: 'El reporte se ha generado exitosamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    {
      id: 'birthdays',
      title: 'Cumpleaños del Mes',
      description: 'Lista de empleados que cumplen años en el mes actual',
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      id: 'seniority',
      title: 'Antigüedad de Empleados',
      description: 'Reporte de años de servicio del personal',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'turnover',
      title: 'Rotación de Personal',
      description: 'Análisis de rotación y tasa de retención',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'absenteeism',
      title: 'Ausentismo',
      description: 'Reporte de faltas y tasa de ausentismo',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'payroll-cost',
      title: 'Costo de Personal',
      description: 'Análisis de costos de nómina por período',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'retirement',
      title: 'Proyección de Jubilaciones',
      description: 'Empleados próximos a jubilarse',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'certificates',
      title: 'Certificados de Trabajo',
      description: 'Generar certificados laborales',
      icon: FileCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'income-proof',
      title: 'Constancias de Ingresos',
      description: 'Constancias de ingresos para trámites',
      icon: FileText,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reportes de RRHH</h1>
        <p className="text-muted-foreground mt-1">
          Generación de reportes, certificados y constancias
        </p>
      </div>

      {/* Grid de reportes */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generar Reporte
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sección de reportes personalizados */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Personalizados</CardTitle>
          <CardDescription>
            Configure y genere reportes personalizados según sus necesidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="birthdays">Cumpleaños</TabsTrigger>
              <TabsTrigger value="seniority">Antigüedad</TabsTrigger>
              <TabsTrigger value="cost">Costos</TabsTrigger>
              <TabsTrigger value="retirement">Jubilaciones</TabsTrigger>
            </TabsList>

            {/* Cumpleaños */}
            <TabsContent value="birthdays" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mes</Label>
                  <Select defaultValue={new Date().getMonth().toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {new Date(2024, i).toLocaleDateString('es-VE', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
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
              <Button onClick={() => handleGenerateReport('birthdays')} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Generar Reporte de Cumpleaños
              </Button>
            </TabsContent>

            {/* Antigüedad */}
            <TabsContent value="seniority" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Rango de Antigüedad</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="0-1">0-1 años</SelectItem>
                      <SelectItem value="1-5">1-5 años</SelectItem>
                      <SelectItem value="5-10">5-10 años</SelectItem>
                      <SelectItem value="10+">Más de 10 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleGenerateReport('seniority')} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Generar Reporte de Antigüedad
              </Button>
            </TabsContent>

            {/* Costos */}
            <TabsContent value="cost" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Año</Label>
                  <Select defaultValue={new Date().getFullYear().toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mes (Opcional)</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo el año</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {new Date(2024, i).toLocaleDateString('es-VE', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleGenerateReport('payroll-cost')} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Generar Reporte de Costos
              </Button>
            </TabsContent>

            {/* Jubilaciones */}
            <TabsContent value="retirement" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Proyección (años)</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 año</SelectItem>
                      <SelectItem value="2">2 años</SelectItem>
                      <SelectItem value="5">5 años</SelectItem>
                      <SelectItem value="10">10 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleGenerateReport('retirement')} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Generar Proyección de Jubilaciones
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
