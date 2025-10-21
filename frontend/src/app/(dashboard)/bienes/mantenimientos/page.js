'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, Play, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getMaintenances, 
  startMaintenance, 
  completeMaintenance, 
  cancelMaintenance 
} from '@/services/assets.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchMaintenances();
  }, [pagination.page, statusFilter, typeFilter]);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getMaintenances(params);
      setMaintenances(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      toast.error('Error al cargar mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    if (!confirm('¿Iniciar este mantenimiento?')) return;
    
    try {
      await startMaintenance(id);
      toast.success('Mantenimiento iniciado');
      fetchMaintenances();
    } catch (error) {
      console.error('Error starting maintenance:', error);
      toast.error('Error al iniciar mantenimiento');
    }
  };

  const handleComplete = async (id) => {
    const observations = prompt('Observaciones del mantenimiento completado:');
    if (observations === null) return;
    
    try {
      await completeMaintenance(id, { completionObservations: observations });
      toast.success('Mantenimiento completado');
      fetchMaintenances();
    } catch (error) {
      console.error('Error completing maintenance:', error);
      toast.error('Error al completar mantenimiento');
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Motivo de cancelación:');
    if (!reason) return;
    
    try {
      await cancelMaintenance(id, { cancellationReason: reason });
      toast.success('Mantenimiento cancelado');
      fetchMaintenances();
    } catch (error) {
      console.error('Error canceling maintenance:', error);
      toast.error('Error al cancelar mantenimiento');
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMaintenances();
  };

  const getStatusColor = (status) => {
    const colors = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      SCHEDULED: 'Programado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      PREVENTIVE: 'Preventivo',
      CORRECTIVE: 'Correctivo',
    };
    return labels[type] || type;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mantenimientos de Bienes</h1>
          <p className="text-gray-600 mt-2">
            Gestión de mantenimiento preventivo y correctivo
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Programar Mantenimiento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar por bien o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="PREVENTIVE">Preventivo</SelectItem>
                <SelectItem value="CORRECTIVE">Correctivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SCHEDULED">Programado</SelectItem>
                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mantenimientos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : maintenances.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron mantenimientos
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bien</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Fecha Programada</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenances.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell className="font-medium">
                        {maintenance.asset?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(maintenance.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {maintenance.description}
                      </TableCell>
                      <TableCell className="text-sm">
                        {maintenance.scheduledDate ? format(new Date(maintenance.scheduledDate), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(maintenance.cost)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(maintenance.status)}>
                          {getStatusLabel(maintenance.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {maintenance.status === 'SCHEDULED' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStart(maintenance.id)}
                              >
                                <Play className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(maintenance.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {maintenance.status === 'IN_PROGRESS' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleComplete(maintenance.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Mostrando {maintenances.length} de {pagination.total} mantenimientos
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
