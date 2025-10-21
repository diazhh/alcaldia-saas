'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, X } from 'lucide-react';

// Importar componentes de Leaflet dinámicamente
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

/**
 * Componente interno que maneja los eventos del mapa
 */
function LocationMarker({ position, setPosition }) {
  const [L, setL] = useState(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  const map = useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  useEffect(() => {
    if (position && map) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} />
  );
}

LocationMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  setPosition: PropTypes.func.isRequired,
};

/**
 * Componente selector de ubicación en mapa
 * @param {Object} initialPosition - Posición inicial {lat, lng}
 * @param {Function} onSelect - Callback al seleccionar ubicación
 * @param {Function} onClose - Callback al cerrar
 */
export default function LocationSelector({ initialPosition, onSelect, onClose }) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState(null);
  const [position, setPosition] = useState(
    initialPosition || { lat: 10.5, lng: -66.9 }
  );

  useEffect(() => {
    setIsClient(true);
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      // Fix para los iconos de Leaflet
      delete leaflet.default.Icon.Default.prototype._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  const handleConfirm = () => {
    if (onSelect && position) {
      onSelect(position.lat, position.lng);
    }
  };

  if (!isClient || !L) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Cargando mapa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seleccionar Ubicación
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Haz clic en el mapa para seleccionar la ubicación del proyecto
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full h-[400px] rounded-lg overflow-hidden border">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        {position && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Latitud:</span>
              <span className="font-mono font-semibold">{position.lat.toFixed(6)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Longitud:</span>
              <span className="font-mono font-semibold">{position.lng.toFixed(6)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button onClick={handleConfirm} className="flex-1">
            Confirmar Ubicación
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

LocationSelector.propTypes = {
  initialPosition: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};
