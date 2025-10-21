'use client';

import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeeTable from '@/components/modules/tax/FeeTable';
import FeeDialog from '@/components/modules/tax/FeeDialog';

/**
 * Página de facturación de tasas municipales
 */
export default function TasasPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (fee) => {
    setSelectedFee(fee);
    setDialogOpen(true);
  };

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    setSelectedFee(null);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasas y Servicios</h1>
          <p className="text-muted-foreground mt-2">
            Facturación de tasas municipales y servicios
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      <FeeTable 
        key={refreshKey}
        onEdit={handleEdit}
      />

      <FeeDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fee={selectedFee}
      />
    </div>
  );
}
