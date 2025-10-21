'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Eye, CheckCircle, XCircle, FileText, Package } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getPurchaseRequests, 
  approveByHead,
  approveByBudget,
  approveByPurchasing,
  approvePurchaseRequest,
  rejectPurchaseRequest 
} from '@/services/assets.service';
import PurchaseRequestDialog from '@/components/modules/assets/PurchaseRequestDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, statusFilter, priorityFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getPurchaseRequests(params);
      setRequests(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    if (!confirm('¿Aprobar esta solicitud?')) return;
    
    try {
      const { status } = request;
      
      if (status === 'PENDING_HEAD') {
        await approveByHead(request.id);
      } else if (status === 'PENDING_BUDGET') {
        await approveByBudget(request.id);
      } else if (status === 'PENDING_PURCHASING') {
        await approveByPurchasing(request.id);
      } else if (status === 'PENDING_FINAL') {
        await approvePurchaseRequest(request.id);
      }
      
      toast.success('Solicitud aprobada exitosamente');
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar solicitud');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    try {
      await rejectPurchaseRequest(id, { rejectionReason: reason });
      toast.success('Solicitud rechazada');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Error al rechazar solicitud');
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setSelectedRequest(null);
    if (refresh) fetchRequests();
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchRequests();
  };

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_HEAD: 'bg-yellow-100 text-yellow-800',
      PENDING_BUDGET: 'bg-orange-100 text-orange-800',
      PENDING_PURCHASING: 'bg-blue-100 text-blue-800',
      PENDING_FINAL: 'bg-purple-100 text-purple-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      IN_QUOTATION: 'bg-cyan-100 text-cyan-800',
      ORDERED: 'bg-indigo-100 text-indigo-800',
      RECEIVED: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: 'Borrador',
      PENDING_HEAD: 'Pendiente Jefe',
      PENDING_BUDGET: 'Pendiente Presupuesto',
      PENDING_PURCHASING: 'Pendiente Compras',
      PENDING_FINAL: 'Pendiente Aprobación Final',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      CANCELLED: 'Cancelado',
      IN_QUOTATION: 'En Cotización',
      ORDERED: 'Ordenado',
      RECEIVED: 'Recibido',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      LOW: 'Baja',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
    }).format(value || 0);
  };

  const canApprove = (request) => {
    const approvableStatuses = [
      'PENDING_HEAD',
      'PENDING_BUDGET',
      'PENDING_PURCHASING',
      'PENDING_FINAL'
    ];
    return approvableStatuses.includes(request.status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Compra</h1>
          <p className="text-gray-600 mt-2">
            Gestión de requisiciones y proceso de compras
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
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
                  placeholder="Buscar por número o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="DRAFT">Borrador</SelectItem>
                <SelectItem value="PENDING_HEAD">Pendiente Jefe</SelectItem>
                <SelectItem value="PENDING_BUDGET">Pendiente Presupuesto</SelectItem>
                <SelectItem value="PENDING_PURCHASING">Pendiente Compras</SelectItem>
                <SelectItem value="PENDING_FINAL">Pendiente Final</SelectItem>
                <SelectItem value="APPROVED">Aprobado</SelectItem>
                <SelectItem value="IN_QUOTATION">En Cotización</SelectItem>
                <SelectItem value="ORDERED">Ordenado</SelectItem>
                <SelectItem value="RECEIVED">Recibido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron solicitudes
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Monto Estimado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.requestNumber}
                      </TableCell>
                      <TableCell>
                        {request.department?.name || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(request.priority)}>
                          {getPriorityLabel(request.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(request.estimatedTotal)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.requestDate ? format(new Date(request.requestDate), 'dd/MM/yyyy', { locale: es }) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canApprove(request) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(request)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
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
                  Mostrando {requests.length} de {pagination.total} solicitudes
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

      {/* Purchase Request Dialog */}
      <PurchaseRequestDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        request={selectedRequest}
      />
    </div>
  );
}
