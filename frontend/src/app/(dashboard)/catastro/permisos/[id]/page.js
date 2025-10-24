'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  FileText, 
  MapPin, 
  User, 
  Calendar, 
  DollarSign,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getConstructionPermitById } from '@/services/catastro.service';
import PermitTimeline from '@/components/modules/catastro/PermitTimeline';
import PermitReviewForm from '@/components/modules/catastro/PermitReviewForm';

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [permit, setPermit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPermit();
    }
  }, [params.id]);

  const fetchPermit = async () => {
    try {
      setLoading(true);
      const data = await getConstructionPermitById(params.id);
      setPermit(data);
    } catch (error) {
      console.error('Error fetching permit:', error);
      toast.error('Error al cargar el permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      // Implementar llamada a API de revisión
      toast.success('Revisión enviada exitosamente');
      setShowReviewForm(false);
      fetchPermit();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error al enviar revisión');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      CORRECTIONS_REQUIRED: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_CONSTRUCTION: 'bg-cyan-100 text-cyan-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      SUBMITTED: 'Presentado',
      UNDER_REVIEW: 'En Revisión',
      CORRECTIONS_REQUIRED: 'Requiere Correcciones',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      IN_CONSTRUCTION: 'En Construcción',
      COMPLETED: 'Completado',
      EXPIRED: 'Vencido',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getPermitTypeLabel = (type) => {
    const labels = {
      NUEVA_CONSTRUCCION: 'Nueva Construcción',
      AMPLIACION: 'Ampliación',
      REMODELACION: 'Remodelación',
      DEMOLICION: 'Demolición',
      REPARACION: 'Reparación',
      REGULARIZACION: 'Regularización',
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando permiso...</p>
        </div>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Permiso no encontrado</h2>
          <Button onClick={() => router.back()}>Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{permit.permitNumber}</h1>
            <p className="text-gray-600 mt-1">
              Permiso de {getPermitTypeLabel(permit.permitType)}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(permit.status)}>
          {getStatusLabel(permit.status)}
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="inspections">Inspecciones</TabsTrigger>
        </TabsList>

        {/* General Information Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium">{permit.applicantName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Documento</p>
                <p className="font-medium">{permit.applicantDocument}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{permit.applicantPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{permit.applicantEmail || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de la Propiedad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {permit.property && (
                <>
                  <div>
                    <p className="text-sm text-gray-600">Código Catastral</p>
                    <p className="font-medium">{permit.property.cadastralCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{permit.property.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Zona</p>
                      <p className="font-medium">{permit.property.zoneCode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Uso</p>
                      <p className="font-medium">{permit.property.propertyUse || 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Descripción de la Obra</p>
                <p className="font-medium">{permit.workDescription}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Área Estimada</p>
                  <p className="font-medium">{permit.estimatedArea} m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo Estimado</p>
                  <p className="font-medium">{formatCurrency(permit.estimatedCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración Estimada</p>
                  <p className="font-medium">{permit.estimatedDuration} días</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates and Fees */}
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fechas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Solicitud</p>
                  <p className="font-medium">{formatDate(permit.applicationDate)}</p>
                </div>
                {permit.approvalDate && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Aprobación</p>
                    <p className="font-medium">{formatDate(permit.approvalDate)}</p>
                  </div>
                )}
                {permit.expirationDate && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                    <p className="font-medium">{formatDate(permit.expirationDate)}</p>
                  </div>
                )}
                {permit.constructionStartDate && (
                  <div>
                    <p className="text-sm text-gray-600">Inicio de Construcción</p>
                    <p className="font-medium">{formatDate(permit.constructionStartDate)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Tasas y Pagos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tasa de Revisión</p>
                  <p className="font-medium">{formatCurrency(permit.reviewFee)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de Permiso</p>
                  <p className="font-medium">{formatCurrency(permit.permitFee)}</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold">{formatCurrency(permit.totalFee)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {permit.isPaid ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Pagado
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </div>
                {permit.paymentDate && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Pago</p>
                    <p className="font-medium">{formatDate(permit.paymentDate)}</p>
                  </div>
                )}
                {permit.paymentReference && (
                  <div>
                    <p className="text-sm text-gray-600">Referencia</p>
                    <p className="font-medium">{permit.paymentReference}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Technical Review */}
          {permit.technicalReview && (
            <Card>
              <CardHeader>
                <CardTitle>Revisión Técnica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Observaciones</p>
                  <p className="font-medium">{permit.technicalReview}</p>
                </div>
                {permit.reviewedBy && (
                  <div>
                    <p className="text-sm text-gray-600">Revisado por</p>
                    <p className="font-medium">{permit.reviewedBy}</p>
                  </div>
                )}
                {permit.reviewDate && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Revisión</p>
                    <p className="font-medium">{formatDate(permit.reviewDate)}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {permit.meetsCompliance ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Cumple con Normativas
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3 mr-1" />
                      No Cumple
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {permit.status === 'UNDER_REVIEW' && (
            <Card>
              <CardContent className="pt-6">
                <Button onClick={() => setShowReviewForm(!showReviewForm)} className="w-full">
                  {showReviewForm ? 'Ocultar Formulario' : 'Realizar Revisión Técnica'}
                </Button>
                {showReviewForm && (
                  <div className="mt-4">
                    <PermitReviewForm
                      permit={permit}
                      onSubmit={handleReviewSubmit}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Historial del Permiso</CardTitle>
              <CardDescription>
                Seguimiento cronológico del estado del permiso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermitTimeline permit={permit} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Adjuntos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {permit.architecturalPlansUrl && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Planos Arquitectónicos</p>
                      <p className="text-sm text-gray-500">PDF</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {permit.structuralPlansUrl && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Planos Estructurales</p>
                      <p className="text-sm text-gray-500">PDF</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {permit.propertyDeedUrl && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Documento de Propiedad</p>
                      <p className="text-sm text-gray-500">PDF</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!permit.architecturalPlansUrl && !permit.structuralPlansUrl && !permit.propertyDeedUrl && (
                <p className="text-center text-gray-500 py-8">
                  No hay documentos adjuntos
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections">
          <Card>
            <CardHeader>
              <CardTitle>Inspecciones de Obra</CardTitle>
              <CardDescription>
                Registro de inspecciones realizadas durante la construcción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Funcionalidad de inspecciones en desarrollo
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
