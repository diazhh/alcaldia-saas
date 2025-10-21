'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createInventoryExit, getInventoryItems } from '@/services/assets.service';

export default function InventoryExitDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 0,
    exitDate: new Date().toISOString().split('T')[0],
    requestedBy: '',
    purpose: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchItems();
      setFormData({
        itemId: '',
        quantity: 0,
        exitDate: new Date().toISOString().split('T')[0],
        requestedBy: '',
        purpose: '',
        notes: '',
      });
    }
  }, [open]);

  const fetchItems = async () => {
    try {
      const response = await getInventoryItems({ limit: 100 });
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity),
      };

      await createInventoryExit(data);
      toast.success('Salida registrada exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error saving exit:', error);
      toast.error(error.response?.data?.message || 'Error al registrar salida');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = items.find(item => item.id === formData.itemId);

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Salida</DialogTitle>
          <DialogDescription>
            Registra una nueva salida de inventario del almacén
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="itemId">Item *</Label>
              <Select value={formData.itemId} onValueChange={(value) => handleChange('itemId', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.code} - {item.name} (Stock: {item.currentStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedItem && (
                <p className="text-sm text-gray-600 mt-1">
                  Stock disponible: {selectedItem.currentStock} {selectedItem.unit}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                max={selectedItem?.currentStock || 999999}
                required
              />
            </div>

            <div>
              <Label htmlFor="exitDate">Fecha *</Label>
              <Input
                id="exitDate"
                type="date"
                value={formData.exitDate}
                onChange={(e) => handleChange('exitDate', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="requestedBy">Solicitado por *</Label>
              <Input
                id="requestedBy"
                value={formData.requestedBy}
                onChange={(e) => handleChange('requestedBy', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="purpose">Propósito *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Salida'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
