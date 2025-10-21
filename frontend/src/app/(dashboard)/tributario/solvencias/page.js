'use client';

import { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SolvencyTable from '@/components/modules/tax/SolvencyTable';
import SolvencyDialog from '@/components/modules/tax/SolvencyDialog';

/**
 * Página de gestión de solvencias
 */
export default function SolvenciasPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSolvency, setSelectedSolvency] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleView = (solvency) => {
    setSelectedSolvency(solvency);
    setDialogOpen(true);
  };

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    setSelectedSolvency(null);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solvencias Municipales</h1>
          <p className="text-muted-foreground mt-2">
            Emisión y verificación de solvencias tributarias
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generar Solvencia
        </Button>
      </div>

      <SolvencyTable 
        key={refreshKey}
        onView={handleView}
      />

      <SolvencyDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        solvency={selectedSolvency}
      />
    </div>
  );
}
