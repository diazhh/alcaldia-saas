'use client';

import { useState } from 'react';
import { Plus, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VehicleTable from '@/components/modules/tax/VehicleTable';
import VehicleDialog from '@/components/modules/tax/VehicleDialog';

/**
 * Página de gestión de impuesto sobre vehículos
 */
export default function VehiculosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    setSelectedVehicle(null);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impuesto sobre Vehículos</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de impuestos vehiculares municipales
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      <VehicleTable 
        key={refreshKey}
        onEdit={handleEdit}
      />

      <VehicleDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        vehicle={selectedVehicle}
      />
    </div>
  );
}
