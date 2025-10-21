'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Inbox, 
  Send, 
  FileStack, 
  Scale, 
  FileCheck, 
  Search,
  Workflow
} from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  const modules = [
    {
      title: 'Mesa de Entrada',
      description: 'Registro de correspondencia entrante y saliente',
      icon: Inbox,
      href: '/documentos/mesa-entrada',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Oficios Internos',
      description: 'Comunicaciones entre dependencias',
      icon: Send,
      href: '/documentos/oficios',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Expedientes',
      description: 'Gestión de expedientes digitales',
      icon: FileStack,
      href: '/documentos/expedientes',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Ordenanzas',
      description: 'Repositorio de ordenanzas municipales',
      icon: Scale,
      href: '/documentos/ordenanzas',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Firmas Pendientes',
      description: 'Documentos pendientes de firma',
      icon: FileCheck,
      href: '/documentos/firmas',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Búsqueda',
      description: 'Motor de búsqueda de documentos',
      icon: Search,
      href: '/documentos/busqueda',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Workflows',
      description: 'Gestión de flujos de aprobación',
      icon: Workflow,
      href: '/documentos/workflows',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión Documental y Archivo</h1>
        <p className="text-gray-600 mt-2">
          Sistema integral para el control de documentos, correspondencia y archivo digital
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
            <CardDescription>Correspondencia Hoy</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Firmas Pendientes</CardDescription>
            <CardTitle className="text-3xl text-red-600">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Expedientes Activos</CardDescription>
            <CardTitle className="text-3xl text-blue-600">--</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Workflows en Curso</CardDescription>
            <CardTitle className="text-3xl text-green-600">--</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
