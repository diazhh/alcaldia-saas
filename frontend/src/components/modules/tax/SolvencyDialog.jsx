'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function SolvencyDialog({ open, onClose, solvency }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [taxpayers, setTaxpayers] = useState([]);
  const [formData, setFormData] = useState({
    taxpayerId: '',
  });

  useEffect(() => {
    if (open && !solvency) fetchTaxpayers();
  }, [open, solvency]);

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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/tax/solvencies`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Solvencia generada exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error generating solvency:', error);
      alert(error.response?.data?.message || 'Error al generar solvencia');
    } finally {
      setLoading(false);
    }
  };

  if (solvency) {
    return (
      <Dialog open={open} onOpenChange={() => onClose(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle de Solvencia</DialogTitle>
            <DialogDescription>Información de la solvencia emitida</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">N° Solvencia:</span>
              <span className="font-medium">{solvency.solvencyNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contribuyente:</span>
              <span className="font-medium">{solvency.taxpayer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha Emisión:</span>
              <span className="font-medium">{new Date(solvency.issueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha Vencimiento:</span>
              <span className="font-medium">{new Date(solvency.expiryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código QR:</span>
              <span className="font-mono text-sm">{solvency.qrCode}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => onClose(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generar Solvencia</DialogTitle>
          <DialogDescription>Selecciona el contribuyente para generar la solvencia</DialogDescription>
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
              <p className="text-sm text-muted-foreground">
                Se verificará que el contribuyente esté al día con sus obligaciones tributarias
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Generando...' : 'Generar Solvencia'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
