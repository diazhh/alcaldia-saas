'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function FeeDialog({ open, onClose, fee }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taxpayers, setTaxpayers] = useState([]);
  const [formData, setFormData] = useState({
    taxpayerId: '',
    feeType: 'URBAN_CLEANING',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (open) fetchTaxpayers();
  }, [open]);

  useEffect(() => {
    if (fee) {
      setFormData({
        taxpayerId: fee.taxpayerId || '',
        feeType: fee.feeType || 'URBAN_CLEANING',
        amount: fee.amount || '',
        description: fee.description || '',
      });
    } else {
      setFormData({
        taxpayerId: '',
        feeType: 'URBAN_CLEANING',
        amount: '',
        description: '',
      });
    }
  }, [fee, open]);

  const fetchTaxpayers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tax/taxpayers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaxpayers(response.data);
    } catch (error) {
      console.error('Error fetching taxpayers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/tax/fees`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose(true);
    } catch (error) {
      console.error('Error saving fee:', error);
      alert(error.response?.data?.message || 'Error al guardar factura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Factura de Tasa</DialogTitle>
          <DialogDescription>Ingresa los datos de la factura</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Contribuyente *</Label>
              <Select value={formData.taxpayerId} onValueChange={(value) => setFormData({ ...formData, taxpayerId: value })} required>
                <SelectTrigger><SelectValue placeholder="Selecciona un contribuyente" /></SelectTrigger>
                <SelectContent>
                  {taxpayers.map((taxpayer) => (
                    <SelectItem key={taxpayer.id} value={taxpayer.id}>{taxpayer.name} ({taxpayer.taxId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Tasa *</Label>
                <Select value={formData.feeType} onValueChange={(value) => setFormData({ ...formData, feeType: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URBAN_CLEANING">Aseo Urbano</SelectItem>
                    <SelectItem value="ADMINISTRATIVE">Administrativa</SelectItem>
                    <SelectItem value="SPACE_USE">Uso de Espacios</SelectItem>
                    <SelectItem value="CEMETERY">Cementerio</SelectItem>
                    <SelectItem value="PUBLIC_EVENTS">Espectáculos Públicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monto (Bs.) *</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea placeholder="Detalles de la tasa" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
