'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createConstructionPermit, updateConstructionPermit } from '@/services/catastro.service';
import { getProperties } from '@/services/catastro.service';

export default function ConstructionPermitDialog({ open, onClose, permit }) {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    applicantName: '',
    applicantPhone: '',
    applicantEmail: '',
    projectType: 'NEW_CONSTRUCTION',
    projectDescription: '',
    constructionArea: '',
    estimatedCost: '',
    startDate: '',
    endDate: '',
    engineerName: '',
    engineerLicense: '',
    architectName: '',
    architectLicense: '',
  });

  useEffect(() => {
    if (open) fetchProperties();
  }, [open]);

  useEffect(() => {
    if (permit) {
      setFormData({
        propertyId: permit.propertyId || '',
        applicantName: permit.applicantName || '',
        applicantPhone: permit.applicantPhone || '',
        applicantEmail: permit.applicantEmail || '',
        projectType: permit.projectType || 'NEW_CONSTRUCTION',
        projectDescription: permit.projectDescription || '',
        constructionArea: permit.constructionArea || '',
        estimatedCost: permit.estimatedCost || '',
        startDate: permit.startDate ? permit.startDate.split('T')[0] : '',
        endDate: permit.endDate ? permit.endDate.split('T')[0] : '',
        engineerName: permit.engineerName || '',
        engineerLicense: permit.engineerLicense || '',
        architectName: permit.architectName || '',
        architectLicense: permit.architectLicense || '',
      });
    } else {
      resetForm();
    }
  }, [permit, open]);

  const resetForm = () => {
    setFormData({
      propertyId: '',
      applicantName: '',
      applicantPhone: '',
      applicantEmail: '',
      projectType: 'NEW_CONSTRUCTION',
      projectDescription: '',
      constructionArea: '',
      estimatedCost: '',
      startDate: '',
      endDate: '',
      engineerName: '',
      engineerLicense: '',
      architectName: '',
      architectLicense: '',
    });
  };

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error al cargar propiedades');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        constructionArea: formData.constructionArea ? parseFloat(formData.constructionArea) : null,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      if (permit) {
        await updateConstructionPermit(permit.id, payload);
        toast.success('Permiso actualizado exitosamente');
      } else {
        await createConstructionPermit(payload);
        toast.success('Solicitud de permiso creada exitosamente');
      }
      
      onClose(true);
    } catch (error) {
      console.error('Error saving permit:', error);
      toast.error(error.response?.data?.message || 'Error al guardar permiso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {permit ? 'Editar Permiso de Construcción' : 'Nueva Solicitud de Permiso'}
          </DialogTitle>
          <DialogDescription>
            {permit ? 'Modifica los datos del permiso' : 'Ingresa los datos para solicitar un permiso de construcción'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label>Propiedad *</Label>
              <Select 
                value={formData.propertyId} 
                onValueChange={(value) => setFormData({ ...formData, propertyId: value })} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una propiedad" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.cadastralCode} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Applicant Info */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Datos del Solicitante</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Nombre Completo *</Label>
              <Input 
                placeholder="Nombre del solicitante" 
                value={formData.applicantName} 
                onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono *</Label>
                <Input 
                  placeholder="0414-1234567" 
                  value={formData.applicantPhone} 
                  onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="email@ejemplo.com" 
                  value={formData.applicantEmail} 
                  onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })} 
                />
              </div>
            </div>
            
            {/* Project Info */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Datos del Proyecto</Label>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Proyecto *</Label>
              <Select 
                value={formData.projectType} 
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW_CONSTRUCTION">Construcción Nueva</SelectItem>
                  <SelectItem value="EXPANSION">Ampliación</SelectItem>
                  <SelectItem value="REMODELING">Remodelación</SelectItem>
                  <SelectItem value="DEMOLITION">Demolición</SelectItem>
                  <SelectItem value="REPAIR">Reparación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Descripción del Proyecto *</Label>
              <Textarea 
                placeholder="Describe el proyecto a realizar" 
                value={formData.projectDescription} 
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })} 
                rows={3} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Área a Construir (m²) *</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.constructionArea} 
                  onChange={(e) => setFormData({ ...formData, constructionArea: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Costo Estimado (Bs.)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.estimatedCost} 
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Inicio Estimada</Label>
                <Input 
                  type="date" 
                  value={formData.startDate} 
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Fin Estimada</Label>
                <Input 
                  type="date" 
                  value={formData.endDate} 
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} 
                />
              </div>
            </div>
            
            {/* Professional Info */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Profesionales Responsables</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ingeniero Responsable</Label>
                <Input 
                  placeholder="Nombre del ingeniero" 
                  value={formData.engineerName} 
                  onChange={(e) => setFormData({ ...formData, engineerName: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>CIV del Ingeniero</Label>
                <Input 
                  placeholder="Número de colegiatura" 
                  value={formData.engineerLicense} 
                  onChange={(e) => setFormData({ ...formData, engineerLicense: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arquitecto Responsable</Label>
                <Input 
                  placeholder="Nombre del arquitecto" 
                  value={formData.architectName} 
                  onChange={(e) => setFormData({ ...formData, architectName: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>CAV del Arquitecto</Label>
                <Input 
                  placeholder="Número de colegiatura" 
                  value={formData.architectLicense} 
                  onChange={(e) => setFormData({ ...formData, architectLicense: e.target.value })} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
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
