'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createInventoryItem, updateInventoryItem } from '@/services/assets.service';

export default function InventoryItemDialog({ open, onClose, item }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: 'UND',
    unitCost: 0,
    minimumStock: 10,
    maximumStock: 100,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        unit: item.unit || 'UND',
        unitCost: item.unitCost || 0,
        minimumStock: item.minimumStock || 10,
        maximumStock: item.maximumStock || 100,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        unit: 'UND',
        unitCost: 0,
        minimumStock: 10,
        maximumStock: 100,
      });
    }
  }, [item, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        unitCost: parseFloat(formData.unitCost),
        minimumStock: parseInt(formData.minimumStock),
        maximumStock: parseInt(formData.maximumStock),
      };

      if (item) {
        await updateInventoryItem(item.id, data);
        toast.success('Item actualizado exitosamente');
      } else {
        await createInventoryItem(data);
        toast.success('Item creado exitosamente');
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.message || 'Error al guardar item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Nuevo Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Actualiza la información del item' : 'Registra un nuevo item de inventario'}
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
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="unit">Unidad de Medida *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="UND, KG, LT, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="unitCost">Costo Unitario *</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => handleChange('unitCost', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="minimumStock">Stock Mínimo *</Label>
              <Input
                id="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={(e) => handleChange('minimumStock', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="maximumStock">Stock Máximo *</Label>
              <Input
                id="maximumStock"
                type="number"
                value={formData.maximumStock}
                onChange={(e) => handleChange('maximumStock', e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : item ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
