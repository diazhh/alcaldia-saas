'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileStack, FolderOpen, FolderCheck, Archive } from 'lucide-react';
import { DigitalFileTable } from '@/components/modules/documents/DigitalFileTable';
import { DigitalFileForm } from '@/components/modules/documents/DigitalFileForm';
import api from '@/lib/api';

export default function ExpedientesPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch files
  const { data: filesData, isLoading, refetch } = useQuery({
    queryKey: ['digital-files'],
    queryFn: async () => {
      const response = await api.get('/api/documents/files');
      return response.data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['files-stats'],
    queryFn: async () => {
      const response = await api.get('/api/documents/files/stats');
      return response.data;
    },
  });

  const handleNew = () => {
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleEdit = (file) => {
    setSelectedFile(file);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedFile(null);
    refetch();
  };

  const statCards = [
    {
      title: 'Total Expedientes',
      value: stats?.data?.total || 0,
      icon: FileStack,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Abiertos',
      value: stats?.data?.open || 0,
      icon: FolderOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Cerrados',
      value: stats?.data?.closed || 0,
      icon: FolderCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Archivados',
      value: stats?.data?.archived || 0,
      icon: Archive,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expedientes Digitales</h1>
          <p className="text-gray-600 mt-2">
            Gestión de expedientes y agrupación de documentos por asunto
          </p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Expediente
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.title}</CardDescription>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Expedientes</CardTitle>
          <CardDescription>
            Gestione los expedientes digitales del municipio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DigitalFileTable
            data={filesData?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefetch={refetch}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <DigitalFileForm
          file={selectedFile}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
