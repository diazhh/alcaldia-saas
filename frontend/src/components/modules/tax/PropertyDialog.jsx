'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import { useAuth } from '@/hooks/useAuth';

export default function PropertyDialog({ open, onClose, property }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taxpayers, setTaxpayers] = useState([]);
  const [formData, setFormData] = useState({
    taxpayerId: '',
    cadastralCode: '',
    address: '',
    propertyUse: 'RESIDENTIAL',
    landArea: '',
    constructionArea: '',
    cadastralValue: '',
  });

  useEffect(() => {
    if (open) fetchTaxpayers();
  }, [open]);

  useEffect(() => {
    if (property) {
      setFormData({
        taxpayerId: property.taxpayerId || '',
        cadastralCode: property.cadastralCode || '',
        address: property.address || '',
        propertyUse: property.propertyUse || 'RESIDENTIAL',
        landArea: property.landArea || '',
        constructionArea: property.constructionArea || '',
        cadastralValue: property.cadastralValue || '',
      });
    } else {
      setFormData({
        taxpayerId: '',
        cadastralCode: '',
        address: '',
        propertyUse: 'RESIDENTIAL',
        landArea: '',
        constructionArea: '',
        cadastralValue: '',
      });
    }
  }, [property, open]);

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
        landArea: parseFloat(formData.landArea) || 0,
        constructionArea: parseFloat(formData.constructionArea) || 0,
        cadastralValue: parseFloat(formData.cadastralValue) || 0,
      };

      if (property) {
        await axios.put(`${API_BASE_URL}/api/tax/properties/${property.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/api/tax/properties`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onClose(true);
    } catch (error) {
      console.error('Error saving property:', error);
      alert(error.response?.data?.message || 'Error al guardar inmueble');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{property ? 'Editar Inmueble' : 'Nuevo Inmueble'}</DialogTitle>
          <DialogDescription>{property ? 'Modifica los datos del inmueble' : 'Ingresa los datos del nuevo inmueble'}</DialogDescription>
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
                <Label>Código Catastral *</Label>
                <Input placeholder="Ej: 01-02-03-004" value={formData.cadastralCode} onChange={(e) => setFormData({ ...formData, cadastralCode: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Uso *</Label>
                <Select value={formData.propertyUse} onValueChange={(value) => setFormData({ ...formData, propertyUse: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESIDENTIAL">Residencial</SelectItem>
                    <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                    <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                    <SelectItem value="VACANT">Baldío</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección *</Label>
              <Textarea placeholder="Dirección completa" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Área Terreno (m²)</Label>
                <Input type="number" step="0.01" value={formData.landArea} onChange={(e) => setFormData({ ...formData, landArea: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Área Construcción (m²)</Label>
                <Input type="number" step="0.01" value={formData.constructionArea} onChange={(e) => setFormData({ ...formData, constructionArea: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valor Catastral (Bs.)</Label>
                <Input type="number" step="0.01" value={formData.cadastralValue} onChange={(e) => setFormData({ ...formData, cadastralValue: e.target.value })} />
              </div>
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
