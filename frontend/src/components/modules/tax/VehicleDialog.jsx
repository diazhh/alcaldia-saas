'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

export default function VehicleDialog({ open, onClose, vehicle }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taxpayers, setTaxpayers] = useState([]);
  const [formData, setFormData] = useState({
    taxpayerId: '',
    plate: '',
    brand: '',
    model: '',
    year: '',
    vehicleType: 'CAR',
    appraisedValue: '',
  });

  useEffect(() => {
    if (open) fetchTaxpayers();
  }, [open]);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        taxpayerId: vehicle.taxpayerId || '',
        plate: vehicle.plate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        vehicleType: vehicle.vehicleType || 'CAR',
        appraisedValue: vehicle.appraisedValue || '',
      });
    } else {
      setFormData({
        taxpayerId: '',
        plate: '',
        brand: '',
        model: '',
        year: '',
        vehicleType: 'CAR',
        appraisedValue: '',
      });
    }
  }, [vehicle, open]);

  const fetchTaxpayers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tax/taxpayers`, {
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
        year: parseInt(formData.year) || new Date().getFullYear(),
        appraisedValue: parseFloat(formData.appraisedValue) || 0,
      };

      if (vehicle) {
        await axios.put(`${API_BASE_URL}/api/tax/vehicles/${vehicle.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/tax/vehicles`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert(error.response?.data?.message || 'Error al guardar vehículo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}</DialogTitle>
          <DialogDescription>{vehicle ? 'Modifica los datos del vehículo' : 'Ingresa los datos del nuevo vehículo'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Propietario *</Label>
              <Select value={formData.taxpayerId} onValueChange={(value) => setFormData({ ...formData, taxpayerId: value })} required>
                <SelectTrigger><SelectValue placeholder="Selecciona un propietario" /></SelectTrigger>
                <SelectContent>
                  {taxpayers.map((taxpayer) => (
                    <SelectItem key={taxpayer.id} value={taxpayer.id}>{taxpayer.name} ({taxpayer.taxId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placa *</Label>
                <Input placeholder="Ej: ABC123" value={formData.plate} onChange={(e) => setFormData({ ...formData, plate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Automóvil</SelectItem>
                    <SelectItem value="MOTORCYCLE">Motocicleta</SelectItem>
                    <SelectItem value="TRUCK">Camión</SelectItem>
                    <SelectItem value="BUS">Autobús</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Marca *</Label>
                <Input placeholder="Ej: Toyota" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Modelo *</Label>
                <Input placeholder="Ej: Corolla" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Año *</Label>
                <Input type="number" placeholder="2020" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor de Avalúo (Bs.)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={formData.appraisedValue} onChange={(e) => setFormData({ ...formData, appraisedValue: e.target.value })} />
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
