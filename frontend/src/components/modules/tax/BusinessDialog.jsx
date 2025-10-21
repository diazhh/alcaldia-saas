'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function BusinessDialog({ open, onClose, business }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taxpayers, setTaxpayers] = useState([]);
  const [formData, setFormData] = useState({
    taxpayerId: '',
    name: '',
    activity: '',
    ciiu: '',
    address: '',
    annualRevenue: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (open) {
      fetchTaxpayers();
    }
  }, [open]);

  useEffect(() => {
    if (business) {
      setFormData({
        taxpayerId: business.taxpayerId || '',
        name: business.name || '',
        activity: business.activity || '',
        ciiu: business.ciiu || '',
        address: business.address || '',
        annualRevenue: business.annualRevenue || '',
        status: business.status || 'ACTIVE',
      });
    } else {
      setFormData({
        taxpayerId: '',
        name: '',
        activity: '',
        ciiu: '',
        address: '',
        annualRevenue: '',
        status: 'ACTIVE',
      });
    }
  }, [business, open]);

  const fetchTaxpayers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tax/taxpayers`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
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
        annualRevenue: parseFloat(formData.annualRevenue) || 0,
      };

      if (business) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tax/businesses/${business.id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tax/businesses`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving business:', error);
      alert(error.response?.data?.message || 'Error al guardar patente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {business ? 'Editar Patente' : 'Nueva Patente Comercial'}
          </DialogTitle>
          <DialogDescription>
            {business 
              ? 'Modifica los datos de la patente comercial' 
              : 'Ingresa los datos de la nueva patente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taxpayerId">Contribuyente *</Label>
              <Select
                value={formData.taxpayerId}
                onValueChange={(value) => setFormData({ ...formData, taxpayerId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un contribuyente" />
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

            <div className="space-y-2">
              <Label htmlFor="name">Nombre Comercial *</Label>
              <Input
                id="name"
                placeholder="Nombre del establecimiento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity">Actividad Económica *</Label>
                <Input
                  id="activity"
                  placeholder="Ej: Comercio al por menor"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciiu">Código CIIU</Label>
                <Input
                  id="ciiu"
                  placeholder="Ej: 4711"
                  value={formData.ciiu}
                  onChange={(e) => setFormData({ ...formData, ciiu: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección del Establecimiento *</Label>
              <Textarea
                id="address"
                placeholder="Dirección completa"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Ingresos Anuales (Bs.)</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activa</SelectItem>
                    <SelectItem value="SUSPENDED">Suspendida</SelectItem>
                    <SelectItem value="EXPIRED">Vencida</SelectItem>
                    <SelectItem value="CLOSED">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
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
