'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, User, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS, REPORT_TYPE_LABELS } from '@/constants';
import { getReportByTicket } from '@/services/participation.service';

/**
 * Componente para rastrear el estado de un reporte
 */
export default function ReportTracker({ initialTicket = '' }) {
  const [ticketNumber, setTicketNumber] = useState(initialTicket);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  /**
   * Buscar reporte por número de ticket
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setReport(null);

    if (!ticketNumber.trim()) {
      setError('Por favor ingresa un número de ticket');
      return;
    }

    try {
      setLoading(true);
      const response = await getReportByTicket(ticketNumber);
      setReport(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(
        err.response?.status === 404
          ? 'No se encontró ningún reporte con ese número de ticket'
          : 'Error al buscar el reporte. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Renderizar timeline de estados
   */
  const renderTimeline = () => {
    if (!report?.statusHistory || report.statusHistory.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Historial de estados</h3>
        <div className="space-y-4">
          {report.statusHistory.map((history, index) => (
            <div key={history.id} className="flex gap-4">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
                {index < report.statusHistory.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={REPORT_STATUS_COLORS[history.status]}>
                    {REPORT_STATUS_LABELS[history.status]}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(history.createdAt)}
                  </span>
                </div>
                {history.notes && (
                  <p className="text-sm text-gray-600 mt-2">{history.notes}</p>
                )}
                {history.changedBy && (
                  <p className="text-xs text-gray-500 mt-1">
                    Por: {history.changedBy.firstName} {history.changedBy.lastName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Renderizar comentarios
   */
  const renderComments = () => {
    if (!report?.comments || report.comments.length === 0) {
      return null;
    }

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios
        </h3>
        <div className="space-y-4">
          {report.comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">
                  {comment.author?.firstName} {comment.author?.lastName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Formulario de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Consultar estado de reporte</CardTitle>
          <CardDescription>
            Ingresa tu número de ticket para ver el estado de tu reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="ticket" className="sr-only">
                Número de ticket
              </Label>
              <Input
                id="ticket"
                placeholder="Ej: REP-2024-001234"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detalles del reporte */}
      {report && (
        <div className="space-y-6">
          {/* Información general */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Reporte #{report.ticketNumber}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {REPORT_TYPE_LABELS[report.type]}
                  </CardDescription>
                </div>
                <Badge className={REPORT_STATUS_COLORS[report.status]}>
                  {REPORT_STATUS_LABELS[report.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Descripción */}
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-gray-700">{report.description}</p>
              </div>

              <Separator />

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Fecha de reporte</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-sm text-gray-600">
                      {report.address || 'No especificada'}
                    </p>
                    {report.latitude && report.longitude && (
                      <p className="text-xs text-gray-500">
                        {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                {report.assignedTo && (
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Asignado a</p>
                      <p className="text-sm text-gray-600">
                        {report.assignedTo.firstName} {report.assignedTo.lastName}
                      </p>
                    </div>
                  </div>
                )}

                {report.department && (
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Departamento</p>
                      <p className="text-sm text-gray-600">
                        {report.department.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Imágenes */}
              {report.images && report.images.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Fotografías</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {report.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Calificación */}
              {report.rating && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">Calificación:</span>
                    <span className="text-gray-600">
                      {report.rating}/5 estrellas
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <Card>
              <CardContent className="pt-6">{renderTimeline()}</CardContent>
            </Card>
          )}

          {/* Comentarios */}
          {report.comments && report.comments.length > 0 && (
            <Card>
              <CardContent className="pt-6">{renderComments()}</CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
