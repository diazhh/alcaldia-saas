'use client';

import { useState } from 'react';
import { FileText, Download, Eye, Search, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TRANSPARENCY_CATEGORIES, TRANSPARENCY_CATEGORY_LABELS } from '@/constants';
import { registerDownload } from '@/services/participation.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Lista de documentos de transparencia
 */
export default function TransparencyDocuments({ documents, loading, onRefresh }) {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    category: '',
    year: '',
    search: '',
  });

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
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

  /**
   * Manejar descarga
   */
  const handleDownload = async (document) => {
    try {
      // Registrar descarga
      await registerDownload(document.id);
      
      // Abrir documento en nueva pestaña
      window.open(document.fileUrl, '_blank');
      
      toast({
        title: 'Descargando',
        description: 'El documento se está descargando',
      });

      onRefresh?.();
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'No se pudo descargar el documento',
        variant: 'destructive',
      });
    }
  };

  /**
   * Filtrar documentos
   */
  const filteredDocuments = documents.filter((doc) => {
    if (filters.category && doc.category !== filters.category) return false;
    if (filters.year && new Date(doc.publishDate).getFullYear().toString() !== filters.year)
      return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        doc.title.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  /**
   * Obtener años disponibles
   */
  const availableYears = [
    ...new Set(
      documents.map((doc) => new Date(doc.publishDate).getFullYear().toString())
    ),
  ].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar documentos..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las categorías</SelectItem>
                  {Object.entries(TRANSPARENCY_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.year}
                onValueChange={(value) => setFilters({ ...filters, year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los años</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filters.category || filters.year || filters.search) && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ category: '', year: '', search: '' })}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando documentos...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron documentos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Información del documento */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{document.title}</h3>
                        {document.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {document.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline">
                              {TRANSPARENCY_CATEGORY_LABELS[document.category]}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(document.publishDate)}
                          </div>

                          {document.year && (
                            <div className="flex items-center gap-1">
                              <span>Año fiscal: {document.year}</span>
                            </div>
                          )}

                          {document.fileSize && (
                            <div className="flex items-center gap-1">
                              <span>{formatFileSize(document.fileSize)}</span>
                            </div>
                          )}
                        </div>

                        {/* Estadísticas */}
                        <div className="flex gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {document.viewCount || 0} vistas
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {document.downloadCount || 0} descargas
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Información de resultados */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Mostrando {filteredDocuments.length} de {documents.length} documentos
        </div>
      )}
    </div>
  );
}
