'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Inbox, Send, Search, Filter } from 'lucide-react';
import { CorrespondenceTable } from '@/components/modules/documents/CorrespondenceTable';
import { CorrespondenceForm } from '@/components/modules/documents/CorrespondenceForm';
import { CorrespondenceStats } from '@/components/modules/documents/CorrespondenceStats';
import { CorrespondenceTracker } from '@/components/modules/documents/CorrespondenceTracker';
import api from '@/lib/api';

export default function MesaEntradaPage() {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('incoming'); // 'incoming' or 'outgoing'
  const [selectedCorrespondence, setSelectedCorrespondence] = useState(null);

  // Fetch correspondence data
  const { data: correspondenceData, isLoading, refetch } = useQuery({
    queryKey: ['correspondence'],
    queryFn: async () => {
      const response = await api.get('/api/documents/correspondence');
      return response.data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['correspondence-stats'],
    queryFn: async () => {
      const response = await api.get('/api/documents/correspondence/stats');
      return response.data;
    },
  });

  const handleNewIncoming = () => {
    setFormType('incoming');
    setSelectedCorrespondence(null);
    setShowForm(true);
  };

  const handleNewOutgoing = () => {
    setFormType('outgoing');
    setSelectedCorrespondence(null);
    setShowForm(true);
  };

  const handleEdit = (correspondence) => {
    setSelectedCorrespondence(correspondence);
    setFormType(correspondence.type);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedCorrespondence(null);
    refetch();
  };

  const incomingCorrespondence = correspondenceData?.data?.filter(c => c.type === 'INCOMING') || [];
  const outgoingCorrespondence = correspondenceData?.data?.filter(c => c.type === 'OUTGOING') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mesa de Entrada</h1>
          <p className="text-gray-600 mt-2">
            Registro y seguimiento de correspondencia entrante y saliente
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewIncoming} className="gap-2">
            <Inbox className="h-4 w-4" />
            Nueva Entrada
          </Button>
          <Button onClick={handleNewOutgoing} variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Nueva Salida
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && <CorrespondenceStats stats={stats.data} />}

      {/* Tracker Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rastreo de Correspondencia
          </CardTitle>
          <CardDescription>
            Ingrese el número de referencia para rastrear el estado de la correspondencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CorrespondenceTracker />
        </CardContent>
      </Card>

      {/* Correspondence Tables */}
      <Tabs defaultValue="incoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incoming" className="gap-2">
            <Inbox className="h-4 w-4" />
            Correspondencia Entrante
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-2">
            <Send className="h-4 w-4" />
            Correspondencia Saliente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-4">
          <CorrespondenceTable
            data={incomingCorrespondence}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefetch={refetch}
            type="incoming"
          />
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          <CorrespondenceTable
            data={outgoingCorrespondence}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefetch={refetch}
            type="outgoing"
          />
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <CorrespondenceForm
          type={formType}
          correspondence={selectedCorrespondence}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
