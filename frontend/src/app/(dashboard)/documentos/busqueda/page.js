'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BusquedaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Ingrese un término de búsqueda');
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...(searchType !== 'all' && { type: searchType }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await api.get(`/api/documents/documents/search?${params}`);
      setResults(response.data.data);
      
      if (response.data.data.length === 0) {
        toast.info('No se encontraron resultados');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al buscar');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getDocumentTypeBadge = (type) => {
    const typeConfig = {
      CORRESPONDENCE: { label: 'Correspondencia', color: 'bg-blue-100 text-blue-800' },
      MEMO: { label: 'Memorando', color: 'bg-green-100 text-green-800' },
      ORDINANCE: { label: 'Ordenanza', color: 'bg-purple-100 text-purple-800' },
      ACT: { label: 'Acta', color: 'bg-amber-100 text-amber-800' },
      FILE: { label: 'Expediente', color: 'bg-red-100 text-red-800' },
      OTHER: { label: 'Otro', color: 'bg-gray-100 text-gray-800' },
    };

    const config = typeConfig[type] || typeConfig.OTHER;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Búsqueda de Documentos</h1>
        <p className="text-gray-600 mt-2">
          Motor de búsqueda avanzada con texto completo y filtros
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Avanzada
          </CardTitle>
          <CardDescription>
            Busque documentos por contenido, tipo, fecha y más
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="query">Término de Búsqueda</Label>
            <div className="flex gap-2">
              <Input
                id="query"
                placeholder="Ingrese palabras clave, número de referencia, asunto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
                <Search className="h-4 w-4" />
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Documento</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="CORRESPONDENCE">Correspondencia</SelectItem>
                  <SelectItem value="MEMO">Memorando</SelectItem>
                  <SelectItem value="ORDINANCE">Ordenanza</SelectItem>
                  <SelectItem value="ACT">Acta</SelectItem>
                  <SelectItem value="FILE">Expediente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de Búsqueda</CardTitle>
            <CardDescription>
              Se encontraron {results.length} documento(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No se encontraron documentos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((doc) => (
                  <div
                    key={doc.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getDocumentTypeBadge(doc.type)}
                          {doc.reference && (
                            <span className="text-sm font-mono text-gray-600">
                              {doc.reference}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{doc.title || doc.subject}</h3>
                        {doc.content && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {doc.content}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {doc.createdAt && (
                            <span>
                              {format(new Date(doc.createdAt), 'PPP', { locale: es })}
                            </span>
                          )}
                          {doc.createdBy && (
                            <span>Por: {doc.createdBy.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Ver
                        </Button>
                        {doc.attachmentUrl && (
                          <Button size="sm" variant="outline" className="gap-1">
                            <Download className="h-3 w-3" />
                            Descargar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
