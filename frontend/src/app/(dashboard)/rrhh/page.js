'use client';

import { Users, Calendar, DollarSign, Clock, Award, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página principal del módulo de RRHH
 * Dashboard con acceso rápido a todas las funcionalidades
 */
export default function RRHHPage() {
  const modules = [
    {
      title: 'Gestión de Personal',
      description: 'Administrar empleados, expedientes y datos laborales',
      icon: Users,
      href: '/rrhh/empleados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Nómina',
      description: 'Procesar y gestionar el pago de nómina',
      icon: DollarSign,
      href: '/rrhh/nomina',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Asistencia',
      description: 'Control de asistencia y marcaciones',
      icon: Clock,
      href: '/rrhh/asistencia',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Vacaciones',
      description: 'Gestionar solicitudes y saldos de vacaciones',
      icon: Calendar,
      href: '/rrhh/vacaciones',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Evaluaciones',
      description: 'Evaluaciones de desempeño del personal',
      icon: Award,
      href: '/rrhh/evaluaciones',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Reportes',
      description: 'Reportes y estadísticas de RRHH',
      icon: FileText,
      href: '/rrhh/reportes',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Recursos Humanos</h1>
        <p className="text-muted-foreground mt-2">
          Sistema integral de gestión del personal de la alcaldía
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Empleados</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Empleados Activos</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vacaciones Pendientes</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nómina del Mes</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
