'use client';

import { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BusinessTable from '@/components/modules/tax/BusinessTable';
import BusinessDialog from '@/components/modules/tax/BusinessDialog';

/**
 * Página de gestión de patentes comerciales
 */
export default function PatentesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    setDialogOpen(true);
  };

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    setSelectedBusiness(null);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patentes Comerciales</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de licencias de actividades económicas
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Patente
        </Button>
      </div>

      <BusinessTable 
        key={refreshKey}
        onEdit={handleEdit}
      />

      <BusinessDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        business={selectedBusiness}
      />
    </div>
  );
}
