'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { SignatureTable } from '@/components/modules/documents/SignatureTable';
import api from '@/lib/api';

export default function FirmasPage() {
  // Fetch pending signatures
  const { data: signaturesData, isLoading, refetch } = useQuery({
    queryKey: ['pending-signatures'],
    queryFn: async () => {
      const response = await api.get('/api/documents/signatures/pending');
      return response.data;
    },
  });

  const pendingSignatures = signaturesData?.data || [];
  const myPendingCount = pendingSignatures.filter(s => s.status === 'PENDING').length;
  const signedCount = pendingSignatures.filter(s => s.status === 'SIGNED').length;
  const rejectedCount = pendingSignatures.filter(s => s.status === 'REJECTED').length;

  const statCards = [
    {
      title: 'Pendientes de Firmar',
      value: myPendingCount,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Firmados',
      value: signedCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Rechazados',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total',
      value: pendingSignatures.length,
      icon: FileCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Firmas Electrónicas</h1>
          <p className="text-gray-600 mt-2">
            Documentos pendientes de firma y validación
          </p>
        </div>
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

      {/* Signatures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Pendientes de Firma</CardTitle>
          <CardDescription>
            Revise y firme los documentos asignados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignatureTable
            data={pendingSignatures}
            isLoading={isLoading}
            onRefetch={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
