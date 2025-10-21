'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

const statusColors = {
  PLANNING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  PAUSED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completado',
  PAUSED: 'Pausado',
  CANCELLED: 'Cancelado',
};

/**
 * Componente de mapa para visualizar proyectos
 * @param {Array} projects - Lista de proyectos con coordenadas
 * @param {Object} center - Centro del mapa {lat, lng}
 * @param {number} zoom - Nivel de zoom inicial
 */
export default function ProjectMap({ projects, center = { lat: 10.5, lng: -66.9 }, zoom = 10 }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [MapContainer, setMapContainer] = useState(null);
  const [TileLayer, setTileLayer] = useState(null);
  const [Marker, setMarker] = useState(null);
  const [Popup, setPopup] = useState(null);
  const [L, setL] = useState(null);

  useEffect(() => {
    setIsClient(true);
    
    // Importar Leaflet y react-leaflet solo en el cliente
    Promise.all([
      import('leaflet'),
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css')
    ]).then(([leaflet, reactLeaflet]) => {
      setL(leaflet.default);
      setMapContainer(reactLeaflet.MapContainer);
      setTileLayer(reactLeaflet.TileLayer);
      setMarker(reactLeaflet.Marker);
      setPopup(reactLeaflet.Popup);
      
      // Fix para los iconos de Leaflet
      delete leaflet.default.Icon.Default.prototype._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }).catch((error) => {
      console.error('Error loading map libraries:', error);
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filtrar proyectos con coordenadas válidas
  const projectsWithCoords = projects?.filter(
    (p) => p.latitude && p.longitude
  ) || [];

  if (!isClient || !MapContainer || !TileLayer || !Marker || !Popup || !L) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Cargando mapa...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {projectsWithCoords.map((project) => (
          <Marker
            key={project.id}
            position={[project.latitude, project.longitude]}
          >
            <Popup>
              <Card className="border-0 shadow-none">
                <CardContent className="p-3 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-mono">{project.code}</p>
                    <h3 className="font-semibold text-sm mt-1">{project.name}</h3>
                  </div>
                  
                  <Badge className={statusColors[project.status]}>
                    {statusLabels[project.status]}
                  </Badge>
                  
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-600">
                      <span className="font-semibold">Presupuesto:</span>{' '}
                      {formatCurrency(project.budget)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Sector:</span> {project.sector}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Ubicación:</span> {project.location}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => router.push(`/proyectos/${project.id}`)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

ProjectMap.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      status: PropTypes.string.isRequired,
      budget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      sector: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
    })
  ),
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  zoom: PropTypes.number,
};
