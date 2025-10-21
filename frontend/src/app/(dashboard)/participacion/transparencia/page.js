'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, RefreshCw, FileText, Eye, Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TRANSPARENCY_CATEGORIES, TRANSPARENCY_CATEGORY_LABELS } from '@/constants';
import {
  listTransparencyDocuments,
  getTransparencyStats,
} from '@/services/participation.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Página de gestión del portal de transparencia
 */
export default function TransparenciaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar documentos y estadísticas
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const [docsResponse, statsResponse] = await Promise.all([
        listTransparencyDocuments({ limit: 100 }),
        getTransparencyStats(),
      ]);

      setDocuments(docsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error('Error loading transparency data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los documentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
   * Formatear tamaño de archivo
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portal de Transparencia</h1>
          <p className="text-gray-600 mt-1">
            Gestión de documentos públicos y datos abiertos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Publicar Documento
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold">{stats?.categoriesCount || 0}</p>
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

      {/* Tabla de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Publicados</CardTitle>
          <CardDescription>
            Listado de todos los documentos de transparencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Fecha Publicación</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Vistas</TableHead>
                  <TableHead>Descargas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando documentos...
                    </TableCell>
                  </TableRow>
                ) : documents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No hay documentos publicados
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((document) => (
                    <TableRow
                      key={document.id}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{document.title}</p>
                          {document.description && (
                            <p className="text-sm text-gray-500 max-w-md truncate">
                              {document.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TRANSPARENCY_CATEGORY_LABELS[document.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>{document.year || 'N/A'}</TableCell>
                      <TableCell>{formatDate(document.publishDate)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatFileSize(document.fileSize)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-3 w-3 text-gray-400" />
                          {document.viewCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Download className="h-3 w-3 text-gray-400" />
                          {document.downloadCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(document.fileUrl, '_blank')}
                          >
                            Ver
                          </Button>
                          <Button variant="ghost" size="sm">
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Cumplimiento Legal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Categorías Obligatorias</h4>
              <ul className="space-y-2 text-sm">
                {Object.entries(TRANSPARENCY_CATEGORY_LABELS).map(([key, label]) => {
                  const count = documents.filter((d) => d.category === key).length;
                  return (
                    <li key={key} className="flex items-center justify-between">
                      <span className="text-gray-700">{label}</span>
                      <Badge variant={count > 0 ? 'default' : 'secondary'}>
                        {count} doc{count !== 1 ? 's' : ''}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Recomendaciones</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Actualizar presupuesto trimestralmente</li>
                <li>• Publicar nómina mensualmente</li>
                <li>• Subir actas dentro de 48 horas de aprobación</li>
                <li>• Mantener ordenanzas actualizadas</li>
                <li>• Publicar contratos mayores a 100 UT</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
