'use client';

import { useState } from 'react';
import { MapPin, Calendar, User, MessageSquare, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  REPORT_STATUS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  REPORT_TYPE_LABELS,
} from '@/constants';
import { updateReportStatus, addComment } from '@/services/participation.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente de detalle de reporte con gestión
 */
export default function ReportDetail({ report, onUpdate }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(report.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

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
   * Actualizar estado del reporte
   */
  const handleUpdateStatus = async () => {
    if (newStatus === report.status) {
      setEditing(false);
      return;
    }

    try {
      setLoading(true);
      await updateReportStatus(report.id, {
        status: newStatus,
        notes: statusNotes,
      });

      toast({
        title: 'Estado actualizado',
        description: 'El estado del reporte ha sido actualizado correctamente',
      });

      setEditing(false);
      setStatusNotes('');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Agregar comentario
   */
  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setLoading(true);
      await addComment(report.id, { content: comment });

      toast({
        title: 'Comentario agregado',
        description: 'El comentario ha sido agregado correctamente',
      });

      setComment('');
      onUpdate?.();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo agregar el comentario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderizar timeline de estados
   */
  const renderTimeline = () => {
    if (!report.statusHistory || report.statusHistory.length === 0) {
      return null;
    }

    return (
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
    );
  };

  return (
    <div className="space-y-6">
      {/* Información general */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                Reporte #{report.ticketNumber}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {REPORT_TYPE_LABELS[report.type]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setNewStatus(report.status);
                      setStatusNotes('');
                    }}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateStatus}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </>
              ) : (
                <>
                  <Badge className={REPORT_STATUS_COLORS[report.status]}>
                    {REPORT_STATUS_LABELS[report.status]}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Cambiar estado
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editor de estado */}
          {editing && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <Label>Nuevo estado</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  placeholder="Agrega notas sobre este cambio de estado..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

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

          {/* Información del reportero */}
          <Separator />
          <div>
            <h3 className="font-semibold mb-3">Información de contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {report.reporterName && (
                <div>
                  <p className="text-gray-500">Nombre</p>
                  <p className="font-medium">{report.reporterName}</p>
                </div>
              )}
              {report.reporterEmail && (
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{report.reporterEmail}</p>
                </div>
              )}
              {report.reporterPhone && (
                <div>
                  <p className="text-gray-500">Teléfono</p>
                  <p className="font-medium">{report.reporterPhone}</p>
                </div>
              )}
            </div>
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
        </CardContent>
      </Card>

      {/* Timeline de estados */}
      {report.statusHistory && report.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de estados</CardTitle>
          </CardHeader>
          <CardContent>{renderTimeline()}</CardContent>
        </Card>
      )}

      {/* Comentarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentarios internos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lista de comentarios */}
          {report.comments && report.comments.length > 0 && (
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
          )}

          {/* Agregar comentario */}
          <div className="space-y-2">
            <Label>Agregar comentario</Label>
            <Textarea
              placeholder="Escribe un comentario interno sobre este reporte..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim() || loading}
              >
                Agregar comentario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
