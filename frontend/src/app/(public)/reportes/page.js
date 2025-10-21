'use client';

import { AlertCircle, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReportForm from '@/components/modules/participation/ReportForm';

/**
 * Página principal de reportes ciudadanos
 */
export default function ReportesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Reportes Ciudadanos</h1>
            <p className="text-xl text-blue-100">
              Ayúdanos a mejorar nuestra ciudad reportando problemas en tu comunidad
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
                  <CardDescription>Simple y rápido</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li>1. Selecciona el tipo de problema</li>
                  <li>2. Describe la situación y adjunta fotos</li>
                  <li>3. Proporciona la ubicación</li>
                  <li>4. Recibe un número de seguimiento</li>
                  <li>5. Te notificaremos sobre el progreso</li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">¿Ya tienes un reporte?</CardTitle>
                  <CardDescription>Consulta su estado</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Si ya creaste un reporte, puedes consultar su estado usando tu número de ticket.
                </p>
                <Link href="/reportes/seguimiento">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Consultar estado
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Formulario de reporte */}
          <Card>
            <CardHeader>
              <CardTitle>Crear nuevo reporte</CardTitle>
              <CardDescription>
                Completa el formulario para reportar un problema en tu comunidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportForm />
            </CardContent>
          </Card>

          {/* Información adicional */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Compromiso de la Alcaldía
            </h3>
            <p className="text-sm text-blue-800">
              Nos comprometemos a revisar todos los reportes en un plazo máximo de 48 horas
              y a mantenerle informado sobre el progreso de la solución. Su participación
              es fundamental para construir una mejor ciudad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
