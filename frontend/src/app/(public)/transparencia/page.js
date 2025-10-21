'use client';

import { useEffect, useState } from 'react';
import { FileText, TrendingUp, Eye, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TransparencyDocuments from '@/components/modules/participation/TransparencyDocuments';
import {
  listTransparencyDocuments,
  getTransparencyStats,
  getCategoriesWithCount,
} from '@/services/participation.service';

/**
 * Portal de Transparencia
 */
export default function TransparenciaPage() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar datos
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [docsResponse, statsResponse, categoriesResponse] = await Promise.all([
        listTransparencyDocuments({ limit: 100 }),
        getTransparencyStats(),
        getCategoriesWithCount(),
      ]);

      setDocuments(docsResponse.data || []);
      setStats(statsResponse.data || {});
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading transparency data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Portal de Transparencia</h1>
            <p className="text-xl text-purple-100">
              Acceso a información pública de la gestión municipal
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalDocuments || 0}</p>
                    <p className="text-sm text-gray-600">Documentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-gray-600">Categorías</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
                    <p className="text-sm text-gray-600">Vistas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Download className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
                    <p className="text-sm text-gray-600">Descargas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Sobre el Portal de Transparencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                En cumplimiento con la Ley de Transparencia y Acceso a la Información
                Pública, ponemos a disposición de todos los ciudadanos la información
                relevante sobre la gestión municipal.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">¿Qué información encontrarás?</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Presupuesto y ejecución presupuestaria</li>
                    <li>Nómina de funcionarios públicos</li>
                    <li>Contrataciones y licitaciones</li>
                    <li>Ordenanzas y normativas municipales</li>
                    <li>Actas de sesiones del concejo</li>
                    <li>Inventario de bienes municipales</li>
                    <li>Informes de gestión</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Actualización</h4>
                  <p className="text-sm text-gray-600">
                    Los documentos se actualizan periódicamente según lo establecido por
                    la ley. La información financiera se publica trimestralmente, mientras
                    que las actas y ordenanzas se publican inmediatamente después de su
                    aprobación.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <TransparencyDocuments
            documents={documents}
            loading={loading}
            onRefresh={loadData}
          />
        </div>
      </div>
    </div>
  );
}
