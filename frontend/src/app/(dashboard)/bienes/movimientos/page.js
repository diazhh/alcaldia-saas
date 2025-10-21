'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getMovements, approveMovement, rejectMovement, completeMovement } from '@/services/assets.service';
import MovementDialog from '@/components/modules/assets/MovementDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchMovements();
  }, [pagination.page, statusFilter, typeFilter]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getMovements(params);
      setMovements(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('¿Aprobar este movimiento?')) return;
    
    try {
      await approveMovement(id);
      toast.success('Movimiento aprobado exitosamente');
      fetchMovements();
    } catch (error) {
      console.error('Error approving movement:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar movimiento');
    }
  };

  const handleComplete = async (id) => {
    if (!confirm('¿Completar este movimiento?')) return;
    
    try {
      await completeMovement(id);
      toast.success('Movimiento completado exitosamente');
      fetchMovements();
    } catch (error) {
      console.error('Error completing movement:', error);
      toast.error(error.response?.data?.message || 'Error al completar movimiento');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    try {
      await rejectMovement(id, { rejectionReason: reason });
      toast.success('Movimiento rechazado');
      fetchMovements();
    } catch (error) {
      console.error('Error rejecting movement:', error);
      toast.error('Error al rechazar movimiento');
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setSelectedMovement(null);
    if (refresh) fetchMovements();
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMovements();
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      COMPLETED: 'Completado',
      REJECTED: 'Rechazado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      ASSIGNMENT: 'Asignación',
      TRANSFER: 'Traspaso',
      LOAN: 'Préstamo',
      REPAIR: 'Reparación',
      DISPOSAL: 'Baja',
      DONATION: 'Donación',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Movimientos de Bienes</h1>
          <p className="text-gray-600 mt-2">
            Gestión de asignaciones, traspasos y control de bienes
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
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
                  placeholder="Buscar por acta, bien o responsable..."
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
                <SelectValue placeholder="Tipo de movimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ASSIGNMENT">Asignación</SelectItem>
                <SelectItem value="TRANSFER">Traspaso</SelectItem>
                <SelectItem value="LOAN">Préstamo</SelectItem>
                <SelectItem value="REPAIR">Reparación</SelectItem>
                <SelectItem value="DISPOSAL">Baja</SelectItem>
                <SelectItem value="DONATION">Donación</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="APPROVED">Aprobado</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="REJECTED">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron movimientos
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Bien</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-mono text-sm">
                        {movement.actNumber}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(movement.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.asset?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {movement.responsibleUser?.name || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {movement.movementDate ? format(new Date(movement.movementDate), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(movement.status)}>
                          {getStatusLabel(movement.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMovement(movement);
                              setDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {movement.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(movement.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(movement.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {movement.status === 'APPROVED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleComplete(movement.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-blue-600" />
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
                  Mostrando {movements.length} de {pagination.total} movimientos
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

      {/* Movement Dialog */}
      <MovementDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        movement={selectedMovement}
      />
    </div>
  );
}
