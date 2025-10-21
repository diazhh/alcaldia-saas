'use client';

import { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CollectionTable from '@/components/modules/tax/CollectionTable';
import CollectionDialog from '@/components/modules/tax/CollectionDialog';

/**
 * Página de gestión de cobranza
 */
export default function CobranzaPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleView = (collection) => {
    setSelectedCollection(collection);
    setDialogOpen(true);
  };

  const handleDialogClose = (saved) => {
    setDialogOpen(false);
    setSelectedCollection(null);
    if (saved) {
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Cobranza</h1>
          <p className="text-muted-foreground mt-2">
            Control de morosos y convenios de pago
          </p>
        </div>
        <Button>
          <Send className="w-4 h-4 mr-2" />
          Enviar Notificaciones
        </Button>
      </div>

      <CollectionTable 
        key={refreshKey}
        onView={handleView}
      />

      <CollectionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        collection={selectedCollection}
      />
    </div>
  );
}
