'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowRightLeft, Wrench, ShoppingCart, BarChart3, Warehouse } from 'lucide-react';
import Link from 'next/link';

export default function AssetsPage() {
  const modules = [
    {
      title: 'Gestión de Bienes',
      description: 'Inventario de bienes inmuebles y muebles',
      icon: Package,
      href: '/bienes/activos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Movimientos',
      description: 'Asignación, traspaso y control de bienes',
      icon: ArrowRightLeft,
      href: '/bienes/movimientos',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Mantenimientos',
      description: 'Preventivo y correctivo de activos',
      icon: Wrench,
      href: '/bienes/mantenimientos',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Almacén',
      description: 'Inventario fungible y control de stock',
      icon: Warehouse,
      href: '/bienes/almacen',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Solicitudes de Compra',
      description: 'Gestión de requisiciones y compras',
      icon: ShoppingCart,
      href: '/bienes/compras',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Reportes',
      description: 'Estadísticas y análisis patrimonial',
      icon: BarChart3,
      href: '/bienes/reportes',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Inventario y Bienes Municipales</h1>
        <p className="text-gray-600 mt-2">
          Sistema integral para el control y gestión del patrimonio municipal
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
            <CardDescription>Total Bienes</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Valor Total</CardDescription>
            <CardTitle className="text-3xl text-green-600">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Items en Stock</CardDescription>
            <CardTitle className="text-3xl text-blue-600">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Alertas de Stock</CardDescription>
            <CardTitle className="text-3xl text-red-600">--</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
