'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Calendar, User, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function CorrespondenceTracker() {
  const [reference, setReference] = useState('');
  const [tracking, setTracking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrack = async () => {
    if (!reference.trim()) {
      toast.error('Ingrese un número de referencia');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/api/documents/correspondence/track/${reference}`);
      setTracking(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se encontró la correspondencia');
      setTracking(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Pendiente', variant: 'secondary', icon: Clock },
      IN_TRANSIT: { label: 'En Tránsito', variant: 'default', icon: Package },
      DELIVERED: { label: 'Entregado', variant: 'success', icon: CheckCircle },
      DISPATCHED: { label: 'Despachado', variant: 'success', icon: CheckCircle },
      ARCHIVED: { label: 'Archivado', variant: 'outline', icon: Package },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ej: ENT-2024-001234"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
        />
        <Button onClick={handleTrack} disabled={isLoading} className="gap-2">
          <Search className="h-4 w-4" />
          {isLoading ? 'Buscando...' : 'Rastrear'}
        </Button>
      </div>

      {/* Tracking Result */}
      {tracking && (
        <Card className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{tracking.reference}</h3>
                <p className="text-sm text-gray-600">{tracking.subject}</p>
              </div>
              {getStatusBadge(tracking.status)}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tipo</p>
                  <p className="text-sm text-gray-600">
                    {tracking.type === 'INCOMING' ? 'Entrada' : 'Salida'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Fecha de Registro</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(tracking.registrationDate), 'PPP', { locale: es })}
                  </p>
                </div>
              </div>

              {tracking.type === 'INCOMING' && tracking.sender && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Remitente</p>
                    <p className="text-sm text-gray-600">{tracking.sender}</p>
                  </div>
                </div>
              )}

              {tracking.type === 'INCOMING' && tracking.destination && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <MapPin className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Destino</p>
                    <p className="text-sm text-gray-600">
                      {tracking.destination.name || 'No asignado'}
                    </p>
                  </div>
                </div>
              )}

              {tracking.type === 'OUTGOING' && tracking.recipient && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Destinatario</p>
                    <p className="text-sm text-gray-600">{tracking.recipient}</p>
                  </div>
                </div>
              )}

              {tracking.deliveredAt && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fecha de Entrega</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(tracking.deliveredAt), 'PPP', { locale: es })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {tracking.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Observaciones</p>
                <p className="text-sm text-gray-600">{tracking.notes}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
