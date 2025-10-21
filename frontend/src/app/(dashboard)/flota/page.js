'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Fuel, Wrench, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function FleetPage() {
  const modules = [
    {
      title: 'Gestión de Vehículos',
      description: 'Inventario completo de vehículos municipales',
      icon: Car,
      href: '/flota/vehiculos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Bitácora de Viajes',
      description: 'Registro y seguimiento de viajes',
      icon: TrendingUp,
      href: '/flota/bitacora',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Control de Combustible',
      description: 'Gestión de cargas y rendimiento',
      icon: Fuel,
      href: '/flota/combustible',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Mantenimiento',
      description: 'Preventivo y correctivo',
      icon: Wrench,
      href: '/flota/mantenimiento',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Costo Total (TCO)',
      description: 'Análisis de costos operativos',
      icon: DollarSign,
      href: '/flota/tco',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Dashboard',
      description: 'Indicadores y alertas',
      icon: AlertTriangle,
      href: '/flota/dashboard',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión de Flota Municipal</h1>
        <p className="text-gray-600 mt-2">
          Sistema integral para el control y optimización de vehículos municipales
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} href={module.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Vehículos</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Operativos</CardDescription>
            <CardTitle className="text-3xl text-green-600">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>En Reparación</CardDescription>
            <CardTitle className="text-3xl text-amber-600">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Mantenimientos Vencidos</CardDescription>
            <CardTitle className="text-3xl text-red-600">--</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
