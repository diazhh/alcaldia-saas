'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getProperties, getUrbanVariables } from '@/services/catastro.service';

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import('@/components/modules/catastro/MapView'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p>Cargando mapa...</p>
      </div>
    )
  }
);

export default function MapPage() {
  const [properties, setProperties] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesData, zonesData] = await Promise.all([
        getProperties(),
        getUrbanVariables()
      ]);
      
      // Filter properties with coordinates
      const propertiesWithCoords = propertiesData.filter(
        p => p.latitude && p.longitude
      );
      
      setProperties(propertiesWithCoords);
      setZones(zonesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos del mapa');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    setSelectedZone(null);
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
    setSelectedProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sistema de Información Geográfica (SIG)</h1>
        <p className="text-gray-600 mt-2">
          Visualización georreferenciada del catastro municipal
        </p>
      </div>

      {/* Map Container */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa Catastral</CardTitle>
          <CardDescription>
            {properties.length} propiedades georreferenciadas | {zones.length} zonas definidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg overflow-hidden border">
            {!loading && (
              <MapView
                properties={properties}
                zones={zones}
                onPropertyClick={handlePropertyClick}
                onZoneClick={handleZoneClick}
                showMeasurementTools={true}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      {selectedProperty && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Propiedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Código Catastral</p>
                <p className="font-semibold">{selectedProperty.cadastralCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Uso</p>
                <p className="font-semibold">{selectedProperty.propertyUse}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Dirección</p>
                <p className="font-semibold">{selectedProperty.address}</p>
              </div>
              {selectedProperty.landArea && (
                <div>
                  <p className="text-sm text-gray-600">Área de Terreno</p>
                  <p className="font-semibold">{selectedProperty.landArea} m²</p>
                </div>
              )}
              {selectedProperty.constructionArea && (
                <div>
                  <p className="text-sm text-gray-600">Área de Construcción</p>
                  <p className="font-semibold">{selectedProperty.constructionArea} m²</p>
                </div>
              )}
              {selectedProperty.taxpayer && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Propietario</p>
                  <p className="font-semibold">{selectedProperty.taxpayer.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zone Details */}
      {selectedZone && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Zona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Código de Zona</p>
                <p className="font-semibold">{selectedZone.zoneCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-semibold">{selectedZone.zoneType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold">{selectedZone.zoneName}</p>
              </div>
              {selectedZone.maxHeight && (
                <div>
                  <p className="text-sm text-gray-600">Altura Máxima</p>
                  <p className="font-semibold">{selectedZone.maxHeight} m</p>
                </div>
              )}
              {selectedZone.allowedUses && selectedZone.allowedUses.length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Usos Permitidos</p>
                  <p className="font-semibold">{selectedZone.allowedUses.join(', ')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
