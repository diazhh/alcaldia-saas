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

/**
 * Diálogo para crear/editar contribuyentes
 */
export default function TaxpayerDialog({ open, onClose, taxpayer }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    taxId: '',
    name: '',
    type: 'NATURAL',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (taxpayer) {
      setFormData({
        taxId: taxpayer.taxId || '',
        name: taxpayer.name || '',
        type: taxpayer.type || 'NATURAL',
        email: taxpayer.email || '',
        phone: taxpayer.phone || '',
        address: taxpayer.address || '',
      });
    } else {
      setFormData({
        taxId: '',
        name: '',
        type: 'NATURAL',
        email: '',
        phone: '',
        address: '',
      });
    }
  }, [taxpayer, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (taxpayer) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tax/taxpayers/${taxpayer.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tax/taxpayers`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving taxpayer:', error);
      alert(error.response?.data?.message || 'Error al guardar contribuyente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {taxpayer ? 'Editar Contribuyente' : 'Nuevo Contribuyente'}
          </DialogTitle>
          <DialogDescription>
            {taxpayer 
              ? 'Modifica los datos del contribuyente' 
              : 'Ingresa los datos del nuevo contribuyente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">RIF / Cédula *</Label>
                <Input
                  id="taxId"
                  placeholder="V-12345678"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NATURAL">Persona Natural</SelectItem>
                    <SelectItem value="LEGAL">Persona Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre / Razón Social *</Label>
              <Input
                id="name"
                placeholder="Nombre completo o razón social"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="0414-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                placeholder="Dirección completa"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
