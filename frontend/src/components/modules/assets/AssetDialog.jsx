'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createAsset, updateAsset } from '@/services/assets.service';

export default function AssetDialog({ open, onClose, asset }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'EQUIPMENT',
    serialNumber: '',
    brand: '',
    model: '',
    acquisitionDate: '',
    acquisitionValue: 0,
    usefulLife: 60,
    location: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        description: asset.description || '',
        type: asset.type || 'EQUIPMENT',
        serialNumber: asset.serialNumber || '',
        brand: asset.brand || '',
        model: asset.model || '',
        acquisitionDate: asset.acquisitionDate
          ? new Date(asset.acquisitionDate).toISOString().split('T')[0]
          : '',
        acquisitionValue: asset.acquisitionValue || 0,
        usefulLife: asset.usefulLife || 60,
        location: asset.location || '',
        status: asset.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'EQUIPMENT',
        serialNumber: '',
        brand: '',
        model: '',
        acquisitionDate: '',
        acquisitionValue: 0,
        usefulLife: 60,
        location: '',
        status: 'ACTIVE',
      });
    }
  }, [asset, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        acquisitionValue: parseFloat(formData.acquisitionValue),
        usefulLife: parseInt(formData.usefulLife),
      };

      if (asset) {
        await updateAsset(asset.id, data);
        toast.success('Bien actualizado exitosamente');
      } else {
        await createAsset(data);
        toast.success('Bien creado exitosamente');
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error(error.response?.data?.message || 'Error al guardar bien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{asset ? 'Editar Bien' : 'Nuevo Bien'}</DialogTitle>
          <DialogDescription>
            {asset ? 'Actualiza la información del bien' : 'Registra un nuevo bien municipal'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Bien *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REAL_ESTATE">Inmueble</SelectItem>
                  <SelectItem value="VEHICLE">Vehículo</SelectItem>
                  <SelectItem value="FURNITURE">Mobiliario</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipo</SelectItem>
                  <SelectItem value="COMPUTER">Computadora</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Estado *</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="IN_USE">En Uso</SelectItem>
                  <SelectItem value="IN_MAINTENANCE">En Mantenimiento</SelectItem>
                  <SelectItem value="DAMAGED">Dañado</SelectItem>
                  <SelectItem value="DISPOSED">Dado de Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serialNumber">Número de Serie</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleChange('serialNumber', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="acquisitionDate">Fecha de Adquisición *</Label>
              <Input
                id="acquisitionDate"
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleChange('acquisitionDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="acquisitionValue">Valor de Adquisición *</Label>
              <Input
                id="acquisitionValue"
                type="number"
                step="0.01"
                value={formData.acquisitionValue}
                onChange={(e) => handleChange('acquisitionValue', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="usefulLife">Vida Útil (meses) *</Label>
              <Input
                id="usefulLife"
                type="number"
                value={formData.usefulLife}
                onChange={(e) => handleChange('usefulLife', e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : asset ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
