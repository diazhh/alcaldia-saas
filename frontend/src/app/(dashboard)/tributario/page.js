'use client';

import { 
  Users, 
  Building2, 
  Home, 
  Car, 
  FileText, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2,
  BarChart3,
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página principal del módulo tributario
 * Dashboard con acceso rápido a todas las funcionalidades
 */
export default function TributarioPage() {
  const modules = [
    {
      title: 'Contribuyentes',
      description: 'Gestionar registro de contribuyentes y su historial',
      icon: Users,
      href: '/tributario/contribuyentes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Patentes Comerciales',
      description: 'Administrar licencias de actividades económicas',
      icon: Building2,
      href: '/tributario/patentes',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Impuesto Inmobiliario',
      description: 'Gestión de impuestos sobre inmuebles urbanos',
      icon: Home,
      href: '/tributario/inmuebles',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Impuesto Vehicular',
      description: 'Administrar impuestos sobre vehículos',
      icon: Car,
      href: '/tributario/vehiculos',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Tasas y Servicios',
      description: 'Facturación de tasas municipales',
      icon: Receipt,
      href: '/tributario/tasas',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Pagos',
      description: 'Registrar y consultar pagos realizados',
      icon: CreditCard,
      href: '/tributario/pagos',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Cobranza',
      description: 'Gestión de morosos y convenios de pago',
      icon: AlertCircle,
      href: '/tributario/cobranza',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Solvencias',
      description: 'Emisión y verificación de solvencias',
      icon: CheckCircle2,
      href: '/tributario/solvencias',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Dashboard',
      description: 'Indicadores y estadísticas tributarias',
      icon: BarChart3,
      href: '/tributario/dashboard',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Reportes',
      description: 'Reportes de recaudación y gestión',
      icon: FileText,
      href: '/tributario/reportes',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión Tributaria</h1>
        <p className="text-muted-foreground mt-2">
          Sistema integral de administración de impuestos, tasas y contribuciones municipales
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
            <CardDescription>Recaudación del Mes</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contribuyentes Activos</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Morosidad Total</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Solvencias Emitidas</CardDescription>
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
