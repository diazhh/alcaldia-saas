'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getPropertyByCadastralCode, 
  getUrbanVariableByZoneCode,
  getPermitByNumber 
} from '@/services/catastro.service';

export default function PublicConsultationPage() {
  const [loading, setLoading] = useState(false);
  
  // Property search
  const [cadastralCode, setCadastralCode] = useState('');
  const [propertyData, setPropertyData] = useState(null);
  
  // Zone search
  const [zoneCode, setZoneCode] = useState('');
  const [zoneData, setZoneData] = useState(null);
  
  // Permit search
  const [permitNumber, setPermitNumber] = useState('');
  const [permitData, setPermitData] = useState(null);

  const handlePropertySearch = async () => {
    if (!cadastralCode.trim()) {
      toast.error('Ingresa un código catastral');
      return;
    }
    
    setLoading(true);
    try {
      const data = await getPropertyByCadastralCode(cadastralCode);
      setPropertyData(data);
      toast.success('Propiedad encontrada');
    } catch (error) {
      console.error('Error searching property:', error);
      toast.error('No se encontró la propiedad');
      setPropertyData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneSearch = async () => {
    if (!zoneCode.trim()) {
      toast.error('Ingresa un código de zona');
      return;
    }
    
    setLoading(true);
    try {
      const data = await getUrbanVariableByZoneCode(zoneCode);
      setZoneData(data);
      toast.success('Zona encontrada');
    } catch (error) {
      console.error('Error searching zone:', error);
      toast.error('No se encontró la zona');
      setZoneData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePermitSearch = async () => {
    if (!permitNumber.trim()) {
      toast.error('Ingresa un número de permiso');
      return;
    }
    
    setLoading(true);
    try {
      const data = await getPermitByNumber(permitNumber);
      setPermitData(data);
      toast.success('Permiso encontrado');
    } catch (error) {
      console.error('Error searching permit:', error);
      toast.error('No se encontró el permiso');
      setPermitData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING_REVIEW: 'Pendiente de Revisión',
      UNDER_REVIEW: 'En Revisión',
      REQUIRES_CORRECTIONS: 'Requiere Correcciones',
      PENDING_PAYMENT: 'Pendiente de Pago',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      IN_CONSTRUCTION: 'En Construcción',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Portal de Consulta Pública</h1>
        <p className="text-gray-600 mt-2">
          Consulta información catastral, normativas urbanas y estado de trámites
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Portal de Consulta Ciudadana</h3>
              <p className="text-sm text-blue-800 mt-1">
                Este portal permite a los ciudadanos consultar información sobre propiedades, 
                normativas urbanísticas y el estado de sus trámites de permisos de construcción.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas Disponibles</CardTitle>
          <CardDescription>
            Selecciona el tipo de consulta que deseas realizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="property">Propiedad</TabsTrigger>
              <TabsTrigger value="zone">Zonificación</TabsTrigger>
              <TabsTrigger value="permit">Permiso</TabsTrigger>
            </TabsList>
            
            {/* Property Tab */}
            <TabsContent value="property" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Código Catastral</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ej: 01-02-03-004"
                      value={cadastralCode}
                      onChange={(e) => setCadastralCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePropertySearch()}
                    />
                    <Button onClick={handlePropertySearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>
                
                {propertyData && (
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Información de la Propiedad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Código Catastral</p>
                          <p className="font-semibold">{propertyData.cadastralCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Uso</p>
                          <p className="font-semibold">{propertyData.propertyUse}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Dirección</p>
                          <p className="font-semibold">{propertyData.address}</p>
                        </div>
                        {propertyData.landArea && (
                          <div>
                            <p className="text-sm text-gray-600">Área de Terreno</p>
                            <p className="font-semibold">{propertyData.landArea} m²</p>
                          </div>
                        )}
                        {propertyData.constructionArea && (
                          <div>
                            <p className="text-sm text-gray-600">Área de Construcción</p>
                            <p className="font-semibold">{propertyData.constructionArea} m²</p>
                          </div>
                        )}
                        {propertyData.parish && (
                          <div>
                            <p className="text-sm text-gray-600">Parroquia</p>
                            <p className="font-semibold">{propertyData.parish}</p>
                          </div>
                        )}
                        {propertyData.sector && (
                          <div>
                            <p className="text-sm text-gray-600">Sector</p>
                            <p className="font-semibold">{propertyData.sector}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Zone Tab */}
            <TabsContent value="zone" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Código de Zona</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ej: R1, C2, I1"
                      value={zoneCode}
                      onChange={(e) => setZoneCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleZoneSearch()}
                    />
                    <Button onClick={handleZoneSearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>
                
                {zoneData && (
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Normativas Urbanísticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Código de Zona</p>
                            <p className="font-semibold">{zoneData.zoneCode}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tipo de Zona</p>
                            <p className="font-semibold">{zoneData.zoneType}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Nombre</p>
                            <p className="font-semibold">{zoneData.zoneName}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 font-semibold mb-2">Retiros Requeridos</p>
                          <div className="grid grid-cols-4 gap-2">
                            {zoneData.frontSetback && (
                              <div className="bg-white p-2 rounded border">
                                <p className="text-xs text-gray-600">Frontal</p>
                                <p className="font-semibold">{zoneData.frontSetback} m</p>
                              </div>
                            )}
                            {zoneData.rearSetback && (
                              <div className="bg-white p-2 rounded border">
                                <p className="text-xs text-gray-600">Posterior</p>
                                <p className="font-semibold">{zoneData.rearSetback} m</p>
                              </div>
                            )}
                            {zoneData.leftSetback && (
                              <div className="bg-white p-2 rounded border">
                                <p className="text-xs text-gray-600">Izquierdo</p>
                                <p className="font-semibold">{zoneData.leftSetback} m</p>
                              </div>
                            )}
                            {zoneData.rightSetback && (
                              <div className="bg-white p-2 rounded border">
                                <p className="text-xs text-gray-600">Derecho</p>
                                <p className="font-semibold">{zoneData.rightSetback} m</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {zoneData.maxHeight && (
                          <div>
                            <p className="text-sm text-gray-600">Altura Máxima Permitida</p>
                            <p className="font-semibold">{zoneData.maxHeight} metros</p>
                          </div>
                        )}
                        
                        {zoneData.allowedUses && zoneData.allowedUses.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Usos Permitidos</p>
                            <div className="flex flex-wrap gap-2">
                              {zoneData.allowedUses.map((use, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  {use}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Permit Tab */}
            <TabsContent value="permit" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Número de Permiso</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ej: CP-2024-001"
                      value={permitNumber}
                      onChange={(e) => setPermitNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePermitSearch()}
                    />
                    <Button onClick={handlePermitSearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>
                
                {permitData && (
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-lg">Estado del Permiso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Número de Permiso</p>
                            <p className="font-semibold">{permitData.permitNumber}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Estado</p>
                            <p className="font-semibold">{getStatusLabel(permitData.status)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Solicitante</p>
                            <p className="font-semibold">{permitData.applicantName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Tipo de Proyecto</p>
                            <p className="font-semibold">{permitData.projectType}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-600">Descripción</p>
                            <p className="font-semibold">{permitData.projectDescription}</p>
                          </div>
                          {permitData.constructionArea && (
                            <div>
                              <p className="text-sm text-gray-600">Área a Construir</p>
                              <p className="font-semibold">{permitData.constructionArea} m²</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-600">Fecha de Solicitud</p>
                            <p className="font-semibold">
                              {new Date(permitData.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {permitData.observations && (
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                            <p className="text-sm text-gray-600 mb-1">Observaciones</p>
                            <p className="text-sm">{permitData.observations}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Download Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Formularios y Documentos</CardTitle>
          <CardDescription>
            Descarga los formularios necesarios para tus trámites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Solicitud de Permiso de Construcción
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Constancia Catastral
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Consulta de Variables Urbanas
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Requisitos para Permisos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
