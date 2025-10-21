'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Eye, CheckCircle, XCircle, DollarSign, Play, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getConstructionPermits, 
  reviewPermit, 
  approveOrRejectPermit,
  registerPayment,
  startConstruction,
  completeConstruction 
} from '@/services/catastro.service';
import ConstructionPermitDialog from '@/components/modules/catastro/ConstructionPermitDialog';

export default function ConstructionPermitsPage() {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    try {
      setLoading(true);
      const data = await getConstructionPermits();
      setPermits(data);
    } catch (error) {
      console.error('Error fetching permits:', error);
      toast.error('Error al cargar permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (permitId) => {
    const complies = confirm('¿El proyecto cumple con las normativas urbanísticas?');
    const observations = prompt('Observaciones de la revisión:');
    
    try {
      await reviewPermit(permitId, {
        complies,
        observations: observations || '',
      });
      toast.success('Revisión registrada exitosamente');
      fetchPermits();
    } catch (error) {
      console.error('Error reviewing permit:', error);
      toast.error('Error al revisar permiso');
    }
  };

  const handleApprove = async (permitId) => {
    if (!confirm('¿Aprobar este permiso de construcción?')) return;
    
    try {
      await approveOrRejectPermit(permitId, {
        approved: true,
        observations: 'Aprobado',
      });
      toast.success('Permiso aprobado exitosamente');
      fetchPermits();
    } catch (error) {
      console.error('Error approving permit:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar permiso');
    }
  };

  const handleReject = async (permitId) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    try {
      await approveOrRejectPermit(permitId, {
        approved: false,
        observations: reason,
      });
      toast.success('Permiso rechazado');
      fetchPermits();
    } catch (error) {
      console.error('Error rejecting permit:', error);
      toast.error('Error al rechazar permiso');
    }
  };

  const handleRegisterPayment = async (permitId) => {
    const amount = prompt('Monto del pago (Bs.):');
    if (!amount) return;
    
    try {
      await registerPayment(permitId, {
        amount: parseFloat(amount),
        paymentMethod: 'TRANSFER',
        reference: `REF-${Date.now()}`,
      });
      toast.success('Pago registrado exitosamente');
      fetchPermits();
    } catch (error) {
      console.error('Error registering payment:', error);
      toast.error('Error al registrar pago');
    }
  };

  const handleStartConstruction = async (permitId) => {
    if (!confirm('¿Iniciar construcción?')) return;
    
    try {
      await startConstruction(permitId);
      toast.success('Construcción iniciada');
      fetchPermits();
    } catch (error) {
      console.error('Error starting construction:', error);
      toast.error('Error al iniciar construcción');
    }
  };

  const handleComplete = async (permitId) => {
    if (!confirm('¿Marcar construcción como completada?')) return;
    
    try {
      await completeConstruction(permitId);
      toast.success('Construcción completada');
      fetchPermits();
    } catch (error) {
      console.error('Error completing construction:', error);
      toast.error(error.response?.data?.message || 'Error al completar construcción');
    }
  };

  const handleDialogClose = (refresh) => {
    setDialogOpen(false);
    setSelectedPermit(null);
    if (refresh) fetchPermits();
  };

  const filteredPermits = permits.filter(permit => 
    permit.permitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permit.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permit.property?.cadastralCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      REQUIRES_CORRECTIONS: 'bg-orange-100 text-orange-800',
      PENDING_PAYMENT: 'bg-purple-100 text-purple-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_CONSTRUCTION: 'bg-cyan-100 text-cyan-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING_REVIEW: 'Pendiente Revisión',
      UNDER_REVIEW: 'En Revisión',
      REQUIRES_CORRECTIONS: 'Requiere Correcciones',
      PENDING_PAYMENT: 'Pendiente Pago',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      IN_CONSTRUCTION: 'En Construcción',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getProjectTypeLabel = (type) => {
    const labels = {
      NEW_CONSTRUCTION: 'Construcción Nueva',
      EXPANSION: 'Ampliación',
      REMODELING: 'Remodelación',
      DEMOLITION: 'Demolición',
      REPAIR: 'Reparación',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Permisos de Construcción</h1>
          <p className="text-gray-600 mt-2">
            Gestión de solicitudes y trámites de construcción
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por número de permiso, solicitante o código catastral..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos Registrados</CardTitle>
          <CardDescription>
            {filteredPermits.length} permisos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando permisos...</div>
          ) : filteredPermits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron permisos
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Permiso</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Propiedad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Área (m²)</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermits.map((permit) => (
                    <TableRow key={permit.id}>
                      <TableCell className="font-medium">
                        {permit.permitNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{permit.applicantName}</p>
                          <p className="text-sm text-gray-500">{permit.applicantPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {permit.property?.cadastralCode || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getProjectTypeLabel(permit.projectType)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(permit.status)}>
                          {getStatusLabel(permit.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {permit.constructionArea ? `${permit.constructionArea} m²` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {permit.status === 'PENDING_REVIEW' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReview(permit.id)}
                              title="Revisar"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {permit.status === 'PENDING_PAYMENT' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApprove(permit.id)}
                                title="Aprobar"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(permit.id)}
                                title="Rechazar"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRegisterPayment(permit.id)}
                                title="Registrar Pago"
                              >
                                <DollarSign className="h-4 w-4 text-blue-600" />
                              </Button>
                            </>
                          )}
                          {permit.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartConstruction(permit.id)}
                              title="Iniciar Construcción"
                            >
                              <Play className="h-4 w-4 text-cyan-600" />
                            </Button>
                          )}
                          {permit.status === 'IN_CONSTRUCTION' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleComplete(permit.id)}
                              title="Completar"
                            >
                              <Flag className="h-4 w-4 text-emerald-600" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPermit(permit);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Construction Permit Dialog */}
      <ConstructionPermitDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        permit={selectedPermit}
      />
    </div>
  );
}
