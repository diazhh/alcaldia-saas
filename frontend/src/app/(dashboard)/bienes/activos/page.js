'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Eye, Package, Filter, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { getAssets, deleteAsset } from '@/services/assets.service';
import AssetDialog from '@/components/modules/assets/AssetDialog';

export default function AssetsListPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchAssets();
  }, [pagination.page, statusFilter, typeFilter]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getAssets(params);
      setAssets(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Error al cargar bienes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este bien?')) return;
    
    try {
      await deleteAsset(id);
      toast.success('Bien eliminado exitosamente');
      fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Error al eliminar bien');
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setSelectedAsset(null);
    if (refresh) fetchAssets();
  };

  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchAssets();
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      IN_USE: 'bg-blue-100 text-blue-800',
      IN_MAINTENANCE: 'bg-amber-100 text-amber-800',
      DAMAGED: 'bg-red-100 text-red-800',
      DISPOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Activo',
      IN_USE: 'En Uso',
      IN_MAINTENANCE: 'En Mantenimiento',
      DAMAGED: 'Dañado',
      DISPOSED: 'Dado de Baja',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      REAL_ESTATE: 'Inmueble',
      VEHICLE: 'Vehículo',
      FURNITURE: 'Mobiliario',
      EQUIPMENT: 'Equipo',
      COMPUTER: 'Computadora',
      OTHER: 'Otro',
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
          <h1 className="text-3xl font-bold">Gestión de Bienes</h1>
          <p className="text-gray-600 mt-2">
            Inventario de bienes inmuebles y muebles municipales
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Bien
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
                  placeholder="Buscar por código, nombre o descripción..."
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
                <SelectValue placeholder="Tipo de bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="REAL_ESTATE">Inmueble</SelectItem>
                <SelectItem value="VEHICLE">Vehículo</SelectItem>
                <SelectItem value="FURNITURE">Mobiliario</SelectItem>
                <SelectItem value="EQUIPMENT">Equipo</SelectItem>
                <SelectItem value="COMPUTER">Computadora</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="IN_USE">En Uso</SelectItem>
                <SelectItem value="IN_MAINTENANCE">En Mantenimiento</SelectItem>
                <SelectItem value="DAMAGED">Dañado</SelectItem>
                <SelectItem value="DISPOSED">Dado de Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Bienes Registrados</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron bienes
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Custodio</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Valor Actual</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-mono text-sm">
                        {asset.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {asset.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(asset.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(asset.status)}>
                          {getStatusLabel(asset.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {asset.custodian?.name || 'Sin asignar'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {asset.location || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(asset.currentValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/bienes/activos/${asset.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(asset)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Mostrando {assets.length} de {pagination.total} bienes
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

      {/* Asset Dialog */}
      <AssetDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        asset={selectedAsset}
      />
    </div>
  );
}
