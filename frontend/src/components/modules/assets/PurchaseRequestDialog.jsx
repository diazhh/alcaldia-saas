'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { createPurchaseRequest } from '@/services/assets.service';
import { Plus, Trash2 } from 'lucide-react';

export default function PurchaseRequestDialog({ open, onClose, request }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    justification: '',
    priority: 'MEDIUM',
    requestDate: new Date().toISOString().split('T')[0],
    requiredDate: '',
  });
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'UND', estimatedCost: 0 }
  ]);

  useEffect(() => {
    if (request) {
      setFormData({
        description: request.description || '',
        justification: request.justification || '',
        priority: request.priority || 'MEDIUM',
        requestDate: request.requestDate
          ? new Date(request.requestDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        requiredDate: request.requiredDate
          ? new Date(request.requiredDate).toISOString().split('T')[0]
          : '',
      });
      if (request.items && request.items.length > 0) {
        setItems(request.items.map(item => ({
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'UND',
          estimatedCost: item.estimatedCost || 0,
        })));
      }
    } else {
      setFormData({
        description: '',
        justification: '',
        priority: 'MEDIUM',
        requestDate: new Date().toISOString().split('T')[0],
        requiredDate: '',
      });
      setItems([{ description: '', quantity: 1, unit: 'UND', estimatedCost: 0 }]);
    }
  }, [request, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'UND', estimatedCost: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (parseFloat(item.estimatedCost) || 0) * (parseInt(item.quantity) || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        items: items.map(item => ({
          description: item.description,
          quantity: parseInt(item.quantity),
          unit: item.unit,
          estimatedCost: parseFloat(item.estimatedCost),
        })),
      };

      await createPurchaseRequest(data);
      toast.success('Solicitud creada exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error saving request:', error);
      toast.error(error.response?.data?.message || 'Error al guardar solicitud');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = !!request;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
    }).format(value || 0);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode ? 'Detalle de Solicitud' : 'Nueva Solicitud de Compra'}
          </DialogTitle>
          <DialogDescription>
            {isViewMode ? 'Información de la solicitud de compra' : 'Crea una nueva solicitud de compra'}
          </DialogDescription>
        </DialogHeader>

        {isViewMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número</Label>
                <p className="text-sm font-mono">{request.requestNumber}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <p className="text-sm">{request.status}</p>
              </div>
              <div>
                <Label>Prioridad</Label>
                <p className="text-sm">{request.priority}</p>
              </div>
              <div>
                <Label>Fecha de Solicitud</Label>
                <p className="text-sm">
                  {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <Label>Descripción</Label>
                <p className="text-sm">{request.description}</p>
              </div>
              <div className="col-span-2">
                <Label>Justificación</Label>
                <p className="text-sm">{request.justification || '-'}</p>
              </div>
            </div>

            <div>
              <Label>Items Solicitados</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Costo Est.</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{formatCurrency(item.estimatedCost)}</TableCell>
                      <TableCell>{formatCurrency(item.estimatedCost * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right mt-2 font-bold">
                Total: {formatCurrency(request.estimatedTotal)}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="description">Descripción *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="justification">Justificación *</Label>
                <Textarea
                  id="justification"
                  value={formData.justification}
                  onChange={(e) => handleChange('justification', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioridad *</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baja</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requiredDate">Fecha Requerida</Label>
                <Input
                  id="requiredDate"
                  type="date"
                  value={formData.requiredDate}
                  onChange={(e) => handleChange('requiredDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Items a Solicitar *</Label>
                <Button type="button" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Item
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Costo Est.</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          required
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          required
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.estimatedCost}
                          onChange={(e) => handleItemChange(index, 'estimatedCost', e.target.value)}
                          required
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency((item.estimatedCost || 0) * (item.quantity || 0))}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="text-right mt-2 font-bold">
                Total Estimado: {formatCurrency(calculateTotal())}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Crear Solicitud'}
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
