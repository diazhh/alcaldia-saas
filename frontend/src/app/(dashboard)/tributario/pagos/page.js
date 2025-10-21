'use client';

import { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentTable from '@/components/modules/tax/PaymentTable';
import PaymentDialog from '@/components/modules/tax/PaymentDialog';

/**
 * Página de gestión de pagos
 */
export default function PagosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registro de Pagos</h1>
          <p className="text-muted-foreground mt-2">
            Consulta y registro de pagos tributarios
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Registrar Pago
        </Button>
      </div>

      <PaymentTable key={refreshKey} />

      <PaymentDialog
        open={dialogOpen}
        onClose={handleDialogClose}
      />
    </div>
  );
}
