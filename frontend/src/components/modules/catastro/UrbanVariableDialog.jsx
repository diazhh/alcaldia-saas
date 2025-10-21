'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createUrbanVariable, updateUrbanVariable } from '@/services/catastro.service';

export default function UrbanVariableDialog({ open, onClose, urbanVariable }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    zoneCode: '',
    zoneName: '',
    zoneType: 'RESIDENTIAL',
    frontSetback: '',
    rearSetback: '',
    leftSetback: '',
    rightSetback: '',
    maxHeight: '',
    maxDensity: '',
    maxConstructionPercentage: '',
    minLotArea: '',
    allowedUses: [],
    parkingSpaces: '',
    description: '',
  });
  
  const [allowedUseInput, setAllowedUseInput] = useState('');

  useEffect(() => {
    if (urbanVariable) {
      setFormData({
        zoneCode: urbanVariable.zoneCode || '',
        zoneName: urbanVariable.zoneName || '',
        zoneType: urbanVariable.zoneType || 'RESIDENTIAL',
        frontSetback: urbanVariable.frontSetback || '',
        rearSetback: urbanVariable.rearSetback || '',
        leftSetback: urbanVariable.leftSetback || '',
        rightSetback: urbanVariable.rightSetback || '',
        maxHeight: urbanVariable.maxHeight || '',
        maxDensity: urbanVariable.maxDensity || '',
        maxConstructionPercentage: urbanVariable.maxConstructionPercentage || '',
        minLotArea: urbanVariable.minLotArea || '',
        allowedUses: urbanVariable.allowedUses || [],
        parkingSpaces: urbanVariable.parkingSpaces || '',
        description: urbanVariable.description || '',
      });
    } else {
      resetForm();
    }
  }, [urbanVariable, open]);

  const resetForm = () => {
    setFormData({
      zoneCode: '',
      zoneName: '',
      zoneType: 'RESIDENTIAL',
      frontSetback: '',
      rearSetback: '',
      leftSetback: '',
      rightSetback: '',
      maxHeight: '',
      maxDensity: '',
      maxConstructionPercentage: '',
      minLotArea: '',
      allowedUses: [],
      parkingSpaces: '',
      description: '',
    });
    setAllowedUseInput('');
  };

  const addAllowedUse = () => {
    if (allowedUseInput.trim() && !formData.allowedUses.includes(allowedUseInput.trim())) {
      setFormData({
        ...formData,
        allowedUses: [...formData.allowedUses, allowedUseInput.trim()]
      });
      setAllowedUseInput('');
    }
  };

  const removeAllowedUse = (use) => {
    setFormData({
      ...formData,
      allowedUses: formData.allowedUses.filter(u => u !== use)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        frontSetback: formData.frontSetback ? parseFloat(formData.frontSetback) : null,
        rearSetback: formData.rearSetback ? parseFloat(formData.rearSetback) : null,
        leftSetback: formData.leftSetback ? parseFloat(formData.leftSetback) : null,
        rightSetback: formData.rightSetback ? parseFloat(formData.rightSetback) : null,
        maxHeight: formData.maxHeight ? parseFloat(formData.maxHeight) : null,
        maxDensity: formData.maxDensity ? parseFloat(formData.maxDensity) : null,
        maxConstructionPercentage: formData.maxConstructionPercentage ? parseFloat(formData.maxConstructionPercentage) : null,
        minLotArea: formData.minLotArea ? parseFloat(formData.minLotArea) : null,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : null,
      };

      if (urbanVariable) {
        await updateUrbanVariable(urbanVariable.id, payload);
        toast.success('Variable urbana actualizada exitosamente');
      } else {
        await createUrbanVariable(payload);
        toast.success('Variable urbana creada exitosamente');
      }
      
      onClose(true);
    } catch (error) {
      console.error('Error saving urban variable:', error);
      toast.error(error.response?.data?.message || 'Error al guardar variable urbana');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {urbanVariable ? 'Editar Variable Urbana' : 'Nueva Variable Urbana'}
          </DialogTitle>
          <DialogDescription>
            Define las normativas urbanísticas para una zona específica
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código de Zona *</Label>
                <Input 
                  placeholder="Ej: R1, C2, I1" 
                  value={formData.zoneCode} 
                  onChange={(e) => setFormData({ ...formData, zoneCode: e.target.value })} 
                  required 
                  disabled={!!urbanVariable}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Zona *</Label>
                <Select 
                  value={formData.zoneType} 
                  onValueChange={(value) => setFormData({ ...formData, zoneType: value })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIDENTIAL">Residencial</SelectItem>
                    <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                    <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                    <SelectItem value="MIXED">Mixto</SelectItem>
                    <SelectItem value="PROTECTED">Protegida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Nombre de la Zona *</Label>
              <Input 
                placeholder="Ej: Zona Residencial 1" 
                value={formData.zoneName} 
                onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })} 
                required 
              />
            </div>
            
            {/* Setbacks */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Retiros (metros)</Label>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Frontal</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.frontSetback} 
                    onChange={(e) => setFormData({ ...formData, frontSetback: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Posterior</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.rearSetback} 
                    onChange={(e) => setFormData({ ...formData, rearSetback: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Izquierdo</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.leftSetback} 
                    onChange={(e) => setFormData({ ...formData, leftSetback: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Derecho</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={formData.rightSetback} 
                    onChange={(e) => setFormData({ ...formData, rightSetback: e.target.value })} 
                  />
                </div>
              </div>
            </div>
            
            {/* Construction Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Altura Máxima (m)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.maxHeight} 
                  onChange={(e) => setFormData({ ...formData, maxHeight: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Densidad Máxima (hab/ha)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.maxDensity} 
                  onChange={(e) => setFormData({ ...formData, maxDensity: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>% Máximo de Construcción</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="70" 
                  value={formData.maxConstructionPercentage} 
                  onChange={(e) => setFormData({ ...formData, maxConstructionPercentage: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Área Mínima de Lote (m²)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.minLotArea} 
                  onChange={(e) => setFormData({ ...formData, minLotArea: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Estacionamientos Requeridos</Label>
              <Input 
                type="number" 
                placeholder="Número de estacionamientos por unidad" 
                value={formData.parkingSpaces} 
                onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })} 
              />
            </div>
            
            {/* Allowed Uses */}
            <div className="space-y-2">
              <Label>Usos Permitidos</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ej: Vivienda unifamiliar" 
                  value={allowedUseInput} 
                  onChange={(e) => setAllowedUseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllowedUse())}
                />
                <Button type="button" onClick={addAllowedUse}>Agregar</Button>
              </div>
              {formData.allowedUses.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allowedUses.map((use, index) => (
                    <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {use}
                      <button 
                        type="button" 
                        onClick={() => removeAllowedUse(use)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                placeholder="Descripción adicional de la zona" 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                rows={3} 
              />
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
