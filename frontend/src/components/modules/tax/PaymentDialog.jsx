'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentDialog({ open, onClose }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentCode: '',
    amount: '',
    paymentMethod: 'MOBILE_PAYMENT',
    reference: '',
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        paymentCode: '',
        amount: '',
        paymentMethod: 'MOBILE_PAYMENT',
        reference: '',
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/tax/payments`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Pago registrado exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error saving payment:', error);
      alert(error.response?.data?.message || 'Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>Ingresa los datos del pago realizado</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Código de Pago *</Label>
              <Input placeholder="Código generado en planilla" value={formData.paymentCode} onChange={(e) => setFormData({ ...formData, paymentCode: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto (Bs.) *</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Método de Pago *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MOBILE_PAYMENT">Pago Móvil</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Transferencia</SelectItem>
                    <SelectItem value="POS">Punto de Venta</SelectItem>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Referencia Bancaria</Label>
              <Input placeholder="Número de referencia" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar Pago'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
