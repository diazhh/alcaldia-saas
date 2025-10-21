'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Send, CheckCircle, Clock, Archive } from 'lucide-react';
import { InternalMemoTable } from '@/components/modules/documents/InternalMemoTable';
import { InternalMemoForm } from '@/components/modules/documents/InternalMemoForm';
import api from '@/lib/api';

export default function OficiosPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);

  // Fetch memos
  const { data: memosData, isLoading, refetch } = useQuery({
    queryKey: ['internal-memos'],
    queryFn: async () => {
      const response = await api.get('/api/documents/memos');
      return response.data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['memos-stats'],
    queryFn: async () => {
      const response = await api.get('/api/documents/memos/stats');
      return response.data;
    },
  });

  const handleNew = () => {
    setSelectedMemo(null);
    setShowForm(true);
  };

  const handleEdit = (memo) => {
    setSelectedMemo(memo);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedMemo(null);
    refetch();
  };

  const statCards = [
    {
      title: 'Total Oficios',
      value: stats?.data?.total || 0,
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pendientes',
      value: stats?.data?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Aprobados',
      value: stats?.data?.approved || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
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
          <h1 className="text-3xl font-bold">Oficios Internos</h1>
          <p className="text-gray-600 mt-2">
            Comunicaciones y memorandos entre dependencias
          </p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Oficio
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

      {/* Memos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Oficios</CardTitle>
          <CardDescription>
            Gestione los oficios y comunicaciones internas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InternalMemoTable
            data={memosData?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onRefetch={refetch}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <InternalMemoForm
          memo={selectedMemo}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
