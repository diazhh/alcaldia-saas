'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getUrbanInspections, resolveInspection } from '@/services/catastro.service';

export default function UrbanControlPage() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const data = await getUrbanInspections();
      setInspections(data);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast.error('Error al cargar inspecciones');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (inspectionId) => {
    const resolution = prompt('Descripción de la resolución:');
    if (!resolution) return;
    
    try {
      await resolveInspection(inspectionId, { resolution });
      toast.success('Inspección resuelta exitosamente');
      fetchInspections();
    } catch (error) {
      console.error('Error resolving inspection:', error);
      toast.error('Error al resolver inspección');
    }
  };

  const filteredInspections = inspections.filter(inspection => 
    inspection.inspectionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.property?.cadastralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      NOTIFIED: 'bg-orange-100 text-orange-800',
      SANCTIONED: 'bg-red-100 text-red-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      NOTIFIED: 'Notificado',
      SANCTIONED: 'Sancionado',
      RESOLVED: 'Resuelto',
      CLOSED: 'Cerrado',
    };
    return labels[status] || status;
  };

  const getViolationTypeLabel = (type) => {
    const labels = {
      ILLEGAL_CONSTRUCTION: 'Construcción Ilegal',
      NO_PERMIT: 'Sin Permiso',
      VIOLATION_OF_SETBACKS: 'Violación de Retiros',
      EXCESS_HEIGHT: 'Exceso de Altura',
      UNAUTHORIZED_USE: 'Uso No Autorizado',
      ENVIRONMENTAL_DAMAGE: 'Daño Ambiental',
      OTHER: 'Otro',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Control Urbano</h1>
          <p className="text-gray-600 mt-2">
            Gestión de inspecciones, denuncias y sanciones urbanísticas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inspecciones</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inspections.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inspections.filter(i => i.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inspections.filter(i => i.status === 'IN_PROGRESS').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inspections.filter(i => i.status === 'RESOLVED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Inspecciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por número de inspección, código catastral o denunciante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Inspections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inspecciones Urbanas</CardTitle>
          <CardDescription>
            {filteredInspections.length} inspecciones encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando inspecciones...</div>
          ) : filteredInspections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron inspecciones
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Inspección</TableHead>
                    <TableHead>Propiedad</TableHead>
                    <TableHead>Tipo de Violación</TableHead>
                    <TableHead>Denunciante</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">
                        {inspection.inspectionNumber}
                      </TableCell>
                      <TableCell>
                        {inspection.property?.cadastralCode || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getViolationTypeLabel(inspection.violationType)}
                      </TableCell>
                      <TableCell>
                        {inspection.reportedBy || 'De oficio'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(inspection.status)}>
                          {getStatusLabel(inspection.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(inspection.inspectionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {inspection.status !== 'RESOLVED' && inspection.status !== 'CLOSED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResolve(inspection.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
