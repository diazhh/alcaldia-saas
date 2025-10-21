'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Scale, Download, Eye, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function OrdenanzasPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch active ordinances
  const { data: activeOrdinances, isLoading } = useQuery({
    queryKey: ['active-ordinances'],
    queryFn: async () => {
      const response = await api.get('/api/documents/ordinances/active');
      return response.data;
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/api/documents/ordinances?search=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.data);
    } catch (error) {
      toast.error('Error al buscar ordenanzas');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const displayOrdinances = searchResults !== null ? searchResults : (activeOrdinances?.data || []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { label: 'Vigente', variant: 'success' },
      REPEALED: { label: 'Derogada', variant: 'destructive' },
      MODIFIED: { label: 'Modificada', variant: 'default' },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Ordenanzas Municipales</h1>
        <p className="text-gray-600 mt-2">
          Portal público de consulta de ordenanzas y normativas municipales
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda de Ordenanzas
          </CardTitle>
          <CardDescription>
            Busque por número, título, materia o contenido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: ordenanza de tránsito, impuestos municipales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
              <Search className="h-4 w-4" />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
            {searchResults !== null && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">Cargando ordenanzas...</p>
            </CardContent>
          </Card>
        ) : displayOrdinances.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">
                {searchResults !== null
                  ? 'No se encontraron ordenanzas con ese criterio'
                  : 'No hay ordenanzas publicadas'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {searchResults !== null ? 'Resultados de Búsqueda' : 'Ordenanzas Vigentes'}
                <span className="ml-2 text-gray-500 font-normal">
                  ({displayOrdinances.length})
                </span>
              </h2>
            </div>

            {displayOrdinances.map((ordinance) => (
              <Card key={ordinance.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Scale className="h-5 w-5 text-purple-600" />
                        <span className="font-mono text-sm font-semibold text-purple-600">
                          {ordinance.number}
                        </span>
                        {getStatusBadge(ordinance.status)}
                      </div>
                      <CardTitle className="text-xl mb-2">{ordinance.title}</CardTitle>
                      {ordinance.subject && (
                        <CardDescription className="text-base">
                          <strong>Materia:</strong> {ordinance.subject}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  {ordinance.summary && (
                    <p className="text-sm text-gray-700">{ordinance.summary}</p>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Fecha de Sanción</p>
                        <p className="text-sm font-medium">
                          {format(new Date(ordinance.sanctionDate), 'PPP', { locale: es })}
                        </p>
                      </div>
                    </div>

                    {ordinance.publicationDate && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Fecha de Publicación</p>
                          <p className="text-sm font-medium">
                            {format(new Date(ordinance.publicationDate), 'PPP', { locale: es })}
                          </p>
                        </div>
                      </div>
                    )}

                    {ordinance.effectiveDate && (
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Vigencia Desde</p>
                          <p className="text-sm font-medium">
                            {format(new Date(ordinance.effectiveDate), 'PPP', { locale: es })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Texto Completo
                    </Button>
                    {ordinance.documentUrl && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Descargar PDF
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
