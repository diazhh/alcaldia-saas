'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaxpayerTable from '@/components/modules/tax/TaxpayerTable';
import TaxpayerDialog from '@/components/modules/tax/TaxpayerDialog';

/**
 * Página de gestión de contribuyentes
 */
export default function ContribuyentesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTaxpayer, setSelectedTaxpayer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (taxpayer) => {
    setSelectedTaxpayer(taxpayer);
    setDialogOpen(true);
  };

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    setSelectedTaxpayer(null);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contribuyentes</h1>
          <p className="text-muted-foreground mt-2">
            Gestión del registro único de contribuyentes
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Contribuyente
        </Button>
      </div>

      <TaxpayerTable 
        key={refreshKey}
        onEdit={handleEdit}
      />

      <TaxpayerDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        taxpayer={selectedTaxpayer}
      />
    </div>
  );
}
