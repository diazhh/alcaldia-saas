'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createProperty, updateProperty } from '@/services/catastro.service';
import api from '@/lib/api';

export default function PropertyCadastralDialog({ open, onClose, property }) {
  const [loading, setLoading] = useState(false);
  const [taxpayers, setTaxpayers] = useState([]);
  const [formData, setFormData] = useState({
    // Basic Info
    taxpayerId: '',
    cadastralCode: '',
    address: '',
    propertyUse: 'RESIDENTIAL',
    
    // Location
    latitude: '',
    longitude: '',
    parish: '',
    sector: '',
    
    // Areas
    landArea: '',
    constructionArea: '',
    floors: '',
    rooms: '',
    bathrooms: '',
    
    // Construction Details
    constructionYear: '',
    conservationState: 'GOOD',
    
    // Services
    hasWater: true,
    hasElectricity: true,
    hasSewerage: true,
    hasGas: false,
    
    // Boundaries
    frontBoundary: '',
    rearBoundary: '',
    leftBoundary: '',
    rightBoundary: '',
    
    // Value
    cadastralValue: '',
    
    // Additional
    observations: '',
  });

  useEffect(() => {
    if (open) fetchTaxpayers();
  }, [open]);

  useEffect(() => {
    if (property) {
      setFormData({
        taxpayerId: property.taxpayerId || '',
        cadastralCode: property.cadastralCode || '',
        address: property.address || '',
        propertyUse: property.propertyUse || 'RESIDENTIAL',
        latitude: property.latitude || '',
        longitude: property.longitude || '',
        parish: property.parish || '',
        sector: property.sector || '',
        landArea: property.landArea || '',
        constructionArea: property.constructionArea || '',
        floors: property.floors || '',
        rooms: property.rooms || '',
        bathrooms: property.bathrooms || '',
        constructionYear: property.constructionYear || '',
        conservationState: property.conservationState || 'GOOD',
        hasWater: property.hasWater ?? true,
        hasElectricity: property.hasElectricity ?? true,
        hasSewerage: property.hasSewerage ?? true,
        hasGas: property.hasGas ?? false,
        frontBoundary: property.frontBoundary || '',
        rearBoundary: property.rearBoundary || '',
        leftBoundary: property.leftBoundary || '',
        rightBoundary: property.rightBoundary || '',
        cadastralValue: property.cadastralValue || '',
        observations: property.observations || '',
      });
    } else {
      resetForm();
    }
  }, [property, open]);

  const resetForm = () => {
    setFormData({
      taxpayerId: '',
      cadastralCode: '',
      address: '',
      propertyUse: 'RESIDENTIAL',
      latitude: '',
      longitude: '',
      parish: '',
      sector: '',
      landArea: '',
      constructionArea: '',
      floors: '',
      rooms: '',
      bathrooms: '',
      constructionYear: '',
      conservationState: 'GOOD',
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: false,
      frontBoundary: '',
      rearBoundary: '',
      leftBoundary: '',
      rightBoundary: '',
      cadastralValue: '',
      observations: '',
    });
  };

  const fetchTaxpayers = async () => {
    try {
      const response = await api.get('/api/tax/taxpayers');
      setTaxpayers(response.data);
    } catch (error) {
      console.error('Error fetching taxpayers:', error);
      toast.error('Error al cargar contribuyentes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        landArea: formData.landArea ? parseFloat(formData.landArea) : null,
        constructionArea: formData.constructionArea ? parseFloat(formData.constructionArea) : null,
        floors: formData.floors ? parseInt(formData.floors) : null,
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        constructionYear: formData.constructionYear ? parseInt(formData.constructionYear) : null,
        cadastralValue: formData.cadastralValue ? parseFloat(formData.cadastralValue) : null,
      };

      if (property) {
        await updateProperty(property.id, payload);
        toast.success('Ficha catastral actualizada exitosamente');
      } else {
        await createProperty(payload);
        toast.success('Ficha catastral creada exitosamente');
      }
      
      onClose(true);
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(error.response?.data?.message || 'Error al guardar ficha catastral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? 'Editar Ficha Catastral' : 'Nueva Ficha Catastral'}
          </DialogTitle>
          <DialogDescription>
            {property ? 'Modifica los datos de la ficha catastral' : 'Ingresa los datos completos del inmueble'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="boundaries">Linderos</TabsTrigger>
              <TabsTrigger value="services">Servicios</TabsTrigger>
            </TabsList>
            
            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label>Propietario *</Label>
                <Select 
                  value={formData.taxpayerId} 
                  onValueChange={(value) => setFormData({ ...formData, taxpayerId: value })} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un propietario" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxpayers.map((taxpayer) => (
                      <SelectItem key={taxpayer.id} value={taxpayer.id}>
                        {taxpayer.name} ({taxpayer.taxId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código Catastral *</Label>
                  <Input 
                    placeholder="Ej: 01-02-03-004" 
                    value={formData.cadastralCode} 
                    onChange={(e) => setFormData({ ...formData, cadastralCode: e.target.value })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Uso *</Label>
                  <Select 
                    value={formData.propertyUse} 
                    onValueChange={(value) => setFormData({ ...formData, propertyUse: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RESIDENTIAL">Residencial</SelectItem>
                      <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                      <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                      <SelectItem value="VACANT">Baldío</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dirección *</Label>
                <Textarea 
                  placeholder="Dirección completa" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  rows={2} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parroquia</Label>
                  <Input 
                    value={formData.parish} 
                    onChange={(e) => setFormData({ ...formData, parish: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Input 
                    value={formData.sector} 
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitud</Label>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="10.480594" 
                    value={formData.latitude} 
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitud</Label>
                  <Input 
                    type="number" 
                    step="0.000001" 
                    placeholder="-66.903606" 
                    value={formData.longitude} 
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} 
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Área de Terreno (m²)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.landArea} 
                    onChange={(e) => setFormData({ ...formData, landArea: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Área de Construcción (m²)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.constructionArea} 
                    onChange={(e) => setFormData({ ...formData, constructionArea: e.target.value })} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Plantas</Label>
                  <Input 
                    type="number" 
                    value={formData.floors} 
                    onChange={(e) => setFormData({ ...formData, floors: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Habitaciones</Label>
                  <Input 
                    type="number" 
                    value={formData.rooms} 
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Baños</Label>
                  <Input 
                    type="number" 
                    value={formData.bathrooms} 
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Año de Construcción</Label>
                  <Input 
                    type="number" 
                    placeholder="2020" 
                    value={formData.constructionYear} 
                    onChange={(e) => setFormData({ ...formData, constructionYear: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado de Conservación</Label>
                  <Select 
                    value={formData.conservationState} 
                    onValueChange={(value) => setFormData({ ...formData, conservationState: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXCELLENT">Excelente</SelectItem>
                      <SelectItem value="GOOD">Bueno</SelectItem>
                      <SelectItem value="REGULAR">Regular</SelectItem>
                      <SelectItem value="BAD">Malo</SelectItem>
                      <SelectItem value="RUINOUS">Ruinoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Valor Catastral (Bs.)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.cadastralValue} 
                  onChange={(e) => setFormData({ ...formData, cadastralValue: e.target.value })} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea 
                  placeholder="Observaciones adicionales" 
                  value={formData.observations} 
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })} 
                  rows={3} 
                />
              </div>
            </TabsContent>
            
            {/* Boundaries Tab */}
            <TabsContent value="boundaries" className="space-y-4">
              <div className="space-y-2">
                <Label>Lindero Frontal</Label>
                <Textarea 
                  placeholder="Descripción del lindero frontal" 
                  value={formData.frontBoundary} 
                  onChange={(e) => setFormData({ ...formData, frontBoundary: e.target.value })} 
                  rows={2} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Lindero Posterior</Label>
                <Textarea 
                  placeholder="Descripción del lindero posterior" 
                  value={formData.rearBoundary} 
                  onChange={(e) => setFormData({ ...formData, rearBoundary: e.target.value })} 
                  rows={2} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Lindero Izquierdo</Label>
                <Textarea 
                  placeholder="Descripción del lindero izquierdo" 
                  value={formData.leftBoundary} 
                  onChange={(e) => setFormData({ ...formData, leftBoundary: e.target.value })} 
                  rows={2} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Lindero Derecho</Label>
                <Textarea 
                  placeholder="Descripción del lindero derecho" 
                  value={formData.rightBoundary} 
                  onChange={(e) => setFormData({ ...formData, rightBoundary: e.target.value })} 
                  rows={2} 
                />
              </div>
            </TabsContent>
            
            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Agua Potable</Label>
                  <input 
                    type="checkbox" 
                    checked={formData.hasWater} 
                    onChange={(e) => setFormData({ ...formData, hasWater: e.target.checked })} 
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Electricidad</Label>
                  <input 
                    type="checkbox" 
                    checked={formData.hasElectricity} 
                    onChange={(e) => setFormData({ ...formData, hasElectricity: e.target.checked })} 
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Cloacas</Label>
                  <input 
                    type="checkbox" 
                    checked={formData.hasSewerage} 
                    onChange={(e) => setFormData({ ...formData, hasSewerage: e.target.checked })} 
                    className="h-4 w-4"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label>Gas</Label>
                  <input 
                    type="checkbox" 
                    checked={formData.hasGas} 
                    onChange={(e) => setFormData({ ...formData, hasGas: e.target.checked })} 
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
