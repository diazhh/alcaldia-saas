'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createMovement, getAssets } from '@/services/assets.service';

export default function MovementDialog({ open, onClose, movement }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: '',
    type: 'ASSIGNMENT',
    movementDate: new Date().toISOString().split('T')[0],
    fromLocation: '',
    toLocation: '',
    reason: '',
    observations: '',
  });

  useEffect(() => {
    if (open && !movement) {
      fetchAssets();
    }
  }, [open]);

  useEffect(() => {
    if (movement) {
      setFormData({
        assetId: movement.assetId || '',
        type: movement.type || 'ASSIGNMENT',
        movementDate: movement.movementDate
          ? new Date(movement.movementDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        fromLocation: movement.fromLocation || '',
        toLocation: movement.toLocation || '',
        reason: movement.reason || '',
        observations: movement.observations || '',
      });
    } else {
      setFormData({
        assetId: '',
        type: 'ASSIGNMENT',
        movementDate: new Date().toISOString().split('T')[0],
        fromLocation: '',
        toLocation: '',
        reason: '',
        observations: '',
      });
    }
  }, [movement, open]);

  const fetchAssets = async () => {
    try {
      const response = await getAssets({ limit: 100, status: 'ACTIVE' });
      setAssets(response.data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createMovement(formData);
      toast.success('Movimiento creado exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error saving movement:', error);
      toast.error(error.response?.data?.message || 'Error al guardar movimiento');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = !!movement;

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Detalle del Movimiento' : 'Nuevo Movimiento'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode ? 'Información del movimiento de bien' : 'Registra un nuevo movimiento de bien'}
          </DialogDescription>
        </DialogHeader>

        {isViewMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Acta</Label>
                <p className="text-sm font-mono">{movement.actNumber}</p>
              </div>
              <div>
                <Label>Tipo</Label>
                <p className="text-sm">{movement.type}</p>
              </div>
              <div className="col-span-2">
                <Label>Bien</Label>
                <p className="text-sm">{movement.asset?.name || '-'}</p>
              </div>
              <div>
                <Label>Fecha</Label>
                <p className="text-sm">
                  {movement.movementDate ? new Date(movement.movementDate).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <Label>Estado</Label>
                <p className="text-sm">{movement.status}</p>
              </div>
              <div>
                <Label>Desde</Label>
                <p className="text-sm">{movement.fromLocation || '-'}</p>
              </div>
              <div>
                <Label>Hacia</Label>
                <p className="text-sm">{movement.toLocation || '-'}</p>
              </div>
              <div className="col-span-2">
                <Label>Motivo</Label>
                <p className="text-sm">{movement.reason || '-'}</p>
              </div>
              <div className="col-span-2">
                <Label>Observaciones</Label>
                <p className="text-sm">{movement.observations || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="assetId">Bien *</Label>
                <Select value={formData.assetId} onValueChange={(value) => handleChange('assetId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un bien" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.code} - {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Tipo de Movimiento *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSIGNMENT">Asignación</SelectItem>
                    <SelectItem value="TRANSFER">Traspaso</SelectItem>
                    <SelectItem value="LOAN">Préstamo</SelectItem>
                    <SelectItem value="REPAIR">Reparación</SelectItem>
                    <SelectItem value="DISPOSAL">Baja</SelectItem>
                    <SelectItem value="DONATION">Donación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="movementDate">Fecha *</Label>
                <Input
                  id="movementDate"
                  type="date"
                  value={formData.movementDate}
                  onChange={(e) => handleChange('movementDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fromLocation">Desde</Label>
                <Input
                  id="fromLocation"
                  value={formData.fromLocation}
                  onChange={(e) => handleChange('fromLocation', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="toLocation">Hacia</Label>
                <Input
                  id="toLocation"
                  value={formData.toLocation}
                  onChange={(e) => handleChange('toLocation', e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="reason">Motivo *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => handleChange('observations', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Crear Movimiento'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {isViewMode && (
          <DialogFooter>
            <Button onClick={() => onClose(false)}>Cerrar</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
