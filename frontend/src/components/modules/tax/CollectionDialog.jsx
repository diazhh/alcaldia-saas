'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CollectionDialog({ open, onClose, collection }) {
  if (!collection) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalle de Caso de Cobranza</DialogTitle>
          <DialogDescription>Información del contribuyente moroso</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Contribuyente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="font-medium">{collection.taxpayer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RIF/CI:</span>
                <span className="font-medium">{collection.taxpayer?.taxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deuda Total:</span>
                <span className="font-bold text-red-600">{formatCurrency(collection.totalDebt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Antigüedad:</span>
                <span className="font-medium">{collection.daysOverdue} días</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collection.actions && collection.actions.length > 0 ? (
                  collection.actions.map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{action.type}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(action.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No hay acciones registradas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
