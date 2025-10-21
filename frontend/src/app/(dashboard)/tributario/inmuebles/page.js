'use client';

import { useState } from 'react';
import { Plus, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyTable from '@/components/modules/tax/PropertyTable';
import PropertyDialog from '@/components/modules/tax/PropertyDialog';

/**
 * Página de gestión de impuesto sobre inmuebles
 */
export default function InmueblesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setDialogOpen(true);
  };

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    setSelectedProperty(null);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impuesto sobre Inmuebles</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de impuestos sobre inmuebles urbanos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Inmueble
        </Button>
      </div>

      <PropertyTable 
        key={refreshKey}
        onEdit={handleEdit}
      />

      <PropertyDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        property={selectedProperty}
      />
    </div>
  );
}
