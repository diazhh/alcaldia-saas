'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  FileText, 
  AlertCircle, 
  Download,
  Calculator,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import ComplaintForm from '@/components/modules/catastro/ComplaintForm';
import { 
  getPermitByNumber, 
  getUrbanVariableByZoneCode,
  createUrbanInspection 
} from '@/services/catastro.service';

export default function PublicCatastroConsultationPage() {
  const [permitNumber, setPermitNumber] = useState('');
  const [permitData, setPermitData] = useState(null);
  const [permitLoading, setPermitLoading] = useState(false);

  const [zoneCode, setZoneCode] = useState('');
  const [zoneData, setZoneData] = useState(null);
  const [zoneLoading, setZoneLoading] = useState(false);

  const handlePermitSearch = async () => {
    if (!permitNumber.trim()) {
      toast.error('Ingrese un número de permiso');
      return;
    }

    try {
      setPermitLoading(true);
      const data = await getPermitByNumber(permitNumber);
      setPermitData(data);
      toast.success('Permiso encontrado');
    } catch (error) {
      console.error('Error searching permit:', error);
      toast.error('Permiso no encontrado');
      setPermitData(null);
    } finally {
      setPermitLoading(false);
    }
  };

  const handleZoneSearch = async () => {
    if (!zoneCode.trim()) {
      toast.error('Ingrese un código de zona');
      return;
    }

    try {
      setZoneLoading(true);
      const data = await getUrbanVariableByZoneCode(zoneCode.toUpperCase());
      setZoneData(data);
      toast.success('Zona encontrada');
    } catch (error) {
      console.error('Error searching zone:', error);
      toast.error('Zona no encontrada');
      setZoneData(null);
    } finally {
      setZoneLoading(false);
    }
  };

  const handleComplaintSubmit = async (formData) => {
    try {
      // Convertir FormData a objeto
      const data = {};
      for (let [key, value] of formData.entries()) {
        if (key.startsWith('photo_')) {
          // Manejar fotos (por ahora solo guardamos las URLs)
          continue;
        }
        data[key] = value;
      }

      await createUrbanInspection(data);
      toast.success('Denuncia enviada exitosamente. Recibirá un número de seguimiento por email.');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      IN_CONSTRUCTION: 'bg-cyan-100 text-cyan-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      SUBMITTED: 'Presentado',
      UNDER_REVIEW: 'En Revisión',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      IN_CONSTRUCTION: 'En Construcción',
      COMPLETED: 'Completado',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Portal de Consultas de Catastro
          </h1>
          <p className="text-lg text-gray-600">
            Consulte información sobre permisos, zonificación y realice denuncias ciudadanas
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="permits" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="permits">
              <FileText className="h-4 w-4 mr-2" />
              Permisos
            </TabsTrigger>
            <TabsTrigger value="zoning">
              <MapPin className="h-4 w-4 mr-2" />
              Zonificación
            </TabsTrigger>
            <TabsTrigger value="complaint">
              <AlertCircle className="h-4 w-4 mr-2" />
              Denuncias
            </TabsTrigger>
            <TabsTrigger value="help">
              <HelpCircle className="h-4 w-4 mr-2" />
              Ayuda
            </TabsTrigger>
          </TabsList>

          {/* Permits Tab */}
          <TabsContent value="permits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultar Estado de Permiso de Construcción</CardTitle>
                <CardDescription>
                  Ingrese el número de permiso para consultar su estado actual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Ej: PC-2024-0001"
                      value={permitNumber}
                      onChange={(e) => setPermitNumber(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePermitSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handlePermitSearch} disabled={permitLoading}>
                    {permitLoading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                {permitData && (
                  <div className="mt-6 p-6 border rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{permitData.permitNumber}</h3>
                      <Badge className={getStatusColor(permitData.status)}>
                        {getStatusLabel(permitData.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Solicitante</p>
                        <p className="font-medium">{permitData.applicantName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Obra</p>
                        <p className="font-medium">{permitData.permitType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Solicitud</p>
                        <p className="font-medium">
                          {new Date(permitData.applicationDate).toLocaleDateString('es-VE')}
                        </p>
                      </div>
                      {permitData.approvalDate && (
                        <div>
                          <p className="text-sm text-gray-600">Fecha de Aprobación</p>
                          <p className="font-medium">
                            {new Date(permitData.approvalDate).toLocaleDateString('es-VE')}
                          </p>
                        </div>
                      )}
                    </div>

                    {permitData.technicalReview && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Observaciones Técnicas
                        </p>
                        <p className="text-sm text-blue-800">{permitData.technicalReview}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Formularios Descargables</CardTitle>
                <CardDescription>
                  Descargue los formularios necesarios para sus trámites
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Solicitud de Permiso de Construcción</p>
                      <p className="text-sm text-gray-500">PDF - 2 páginas</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Requisitos para Permiso de Construcción</p>
                      <p className="text-sm text-gray-500">PDF - 1 página</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Solicitud de Solvencia Catastral</p>
                      <p className="text-sm text-gray-500">PDF - 1 página</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zoning Tab */}
          <TabsContent value="zoning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultar Variables Urbanas por Zona</CardTitle>
                <CardDescription>
                  Ingrese el código de zona para conocer las normativas aplicables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Ej: R1, C1, I1"
                      value={zoneCode}
                      onChange={(e) => setZoneCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleZoneSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleZoneSearch} disabled={zoneLoading}>
                    {zoneLoading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                {zoneData && (
                  <div className="mt-6 p-6 border rounded-lg bg-white">
                    <h3 className="text-xl font-semibold mb-4">
                      {zoneData.zoneName} ({zoneData.zoneCode})
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Zona</p>
                        <p className="font-medium">{zoneData.zoneType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Altura Máxima</p>
                        <p className="font-medium">{zoneData.maxHeight} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pisos Máximos</p>
                        <p className="font-medium">{zoneData.maxFloors}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Cobertura Máxima</p>
                        <p className="font-medium">{zoneData.maxCoverage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Retiro Frontal</p>
                        <p className="font-medium">{zoneData.frontSetback} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Retiro Posterior</p>
                        <p className="font-medium">{zoneData.rearSetback} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Retiro Lateral Izq.</p>
                        <p className="font-medium">{zoneData.leftSetback} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Retiro Lateral Der.</p>
                        <p className="font-medium">{zoneData.rightSetback} m</p>
                      </div>
                    </div>

                    {zoneData.regulations && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Regulaciones
                        </p>
                        <p className="text-sm text-blue-800">{zoneData.regulations}</p>
                      </div>
                    )}

                    {zoneData.parkingRequired && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">
                          Estacionamiento Requerido
                        </p>
                        <p className="text-sm text-green-800">{zoneData.parkingRatio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculadora de Retiros
                </CardTitle>
                <CardDescription>
                  Calcule los retiros requeridos para su proyecto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Funcionalidad en desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complaint Tab */}
          <TabsContent value="complaint">
            <ComplaintForm 
              onSubmit={handleComplaintSubmit}
              onCancel={() => {}}
            />
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">¿Cómo solicito un permiso de construcción?</h3>
                  <p className="text-sm text-gray-600">
                    Debe presentar la solicitud con los planos arquitectónicos, estructurales, 
                    documento de propiedad y pagar las tasas correspondientes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">¿Cuánto tiempo tarda la aprobación?</h3>
                  <p className="text-sm text-gray-600">
                    El tiempo de aprobación varía según el tipo de obra, pero generalmente 
                    toma entre 15 y 30 días hábiles.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">¿Qué es una variable urbana?</h3>
                  <p className="text-sm text-gray-600">
                    Las variables urbanas son las normativas que regulan la construcción en 
                    cada zona (retiros, alturas, densidad, etc.).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">¿Cómo hago una denuncia?</h3>
                  <p className="text-sm text-gray-600">
                    Use la pestaña "Denuncias" para reportar construcciones ilegales u otras 
                    irregularidades. Puede hacerlo de forma anónima.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
