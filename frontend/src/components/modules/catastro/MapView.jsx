'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Layers, Ruler, Download } from 'lucide-react';

// Fix for default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Component to handle map controls and fit bounds
 */
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

/**
 * MapView Component - GIS System for Catastro Module
 * Displays properties, zones, and urban variables on an interactive map
 */
export default function MapView({ 
  properties = [], 
  zones = [], 
  center = [10.4806, -66.9036], // Caracas default
  zoom = 13,
  onPropertyClick,
  onZoneClick,
  showMeasurementTools = false
}) {
  const [activeLayers, setActiveLayers] = useState({
    properties: true,
    zones: true,
    services: false,
    roads: false,
  });
  
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const mapRef = useRef(null);

  // Toggle layer visibility
  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Export map as image
  const exportMap = async () => {
    if (!mapRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const mapElement = mapRef.current;
      const canvas = await html2canvas(mapElement);
      
      const link = document.createElement('a');
      link.download = `mapa-catastro-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting map:', error);
    }
  };

  // Custom icon for properties
  const propertyIcon = (propertyUse) => {
    const colors = {
      RESIDENTIAL: '#3b82f6',
      COMMERCIAL: '#f59e0b',
      INDUSTRIAL: '#8b5cf6',
      VACANT: '#6b7280',
    };
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${colors[propertyUse] || '#3b82f6'}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Zone colors
  const getZoneColor = (zoneType) => {
    const colors = {
      RESIDENTIAL: '#93c5fd',
      COMMERCIAL: '#fde68a',
      INDUSTRIAL: '#c4b5fd',
      PROTECTED: '#86efac',
      MIXED: '#fca5a5',
    };
    return colors[zoneType] || '#d1d5db';
  };

  return (
    <div className="relative h-full w-full" ref={mapRef}>
      {/* Layer Control Panel */}
      <Card className="absolute top-4 right-4 z-[1000] p-4 bg-white/95 backdrop-blur">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <Layers className="h-4 w-4" />
            <span>Capas del Mapa</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="layer-properties" 
                checked={activeLayers.properties}
                onCheckedChange={() => toggleLayer('properties')}
              />
              <Label htmlFor="layer-properties" className="cursor-pointer">
                Propiedades
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="layer-zones" 
                checked={activeLayers.zones}
                onCheckedChange={() => toggleLayer('zones')}
              />
              <Label htmlFor="layer-zones" className="cursor-pointer">
                Zonificación
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="layer-services" 
                checked={activeLayers.services}
                onCheckedChange={() => toggleLayer('services')}
              />
              <Label htmlFor="layer-services" className="cursor-pointer">
                Servicios Públicos
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="layer-roads" 
                checked={activeLayers.roads}
                onCheckedChange={() => toggleLayer('roads')}
              />
              <Label htmlFor="layer-roads" className="cursor-pointer">
                Vialidad
              </Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Map Tools */}
      {showMeasurementTools && (
        <Card className="absolute top-4 left-4 z-[1000] p-2 bg-white/95 backdrop-blur">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={measurementMode ? 'default' : 'outline'}
              onClick={() => setMeasurementMode(!measurementMode)}
            >
              <Ruler className="h-4 w-4 mr-2" />
              Medir
            </Button>
            <Button size="sm" variant="outline" onClick={exportMap}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </Card>
      )}

      {/* Map Container */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />
        
        {/* Base Map Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zones Layer */}
        {activeLayers.zones && zones.map((zone) => {
          if (!zone.coordinates || zone.coordinates.length === 0) return null;
          
          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: getZoneColor(zone.zoneType),
                fillColor: getZoneColor(zone.zoneType),
                fillOpacity: 0.3,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onZoneClick && onZoneClick(zone),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{zone.zoneName}</h3>
                  <p className="text-sm text-gray-600">Código: {zone.zoneCode}</p>
                  <p className="text-sm">Tipo: {zone.zoneType}</p>
                  {zone.allowedUses && (
                    <p className="text-sm">Usos: {zone.allowedUses.join(', ')}</p>
                  )}
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Properties Layer */}
        {activeLayers.properties && properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;
          
          return (
            <Marker
              key={property.id}
              position={[property.latitude, property.longitude]}
              icon={propertyIcon(property.propertyUse)}
              eventHandlers={{
                click: () => onPropertyClick && onPropertyClick(property),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold">{property.cadastralCode}</h3>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Uso:</strong> {property.propertyUse}</p>
                    {property.landArea && (
                      <p><strong>Área Terreno:</strong> {property.landArea} m²</p>
                    )}
                    {property.constructionArea && (
                      <p><strong>Área Construcción:</strong> {property.constructionArea} m²</p>
                    )}
                    {property.taxpayer && (
                      <p><strong>Propietario:</strong> {property.taxpayer.name}</p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <Card className="absolute bottom-4 left-4 z-[1000] p-3 bg-white/95 backdrop-blur">
        <div className="space-y-2">
          <p className="font-semibold text-sm">Leyenda</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Residencial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>Comercial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Industrial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Baldío</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
