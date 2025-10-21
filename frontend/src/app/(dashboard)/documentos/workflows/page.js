'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Workflow, Clock, CheckCircle, XCircle } from 'lucide-react';
import { WorkflowInstanceTable } from '@/components/modules/documents/WorkflowInstanceTable';
import { WorkflowStepsTable } from '@/components/modules/documents/WorkflowStepsTable';
import api from '@/lib/api';

export default function WorkflowsPage() {
  // Fetch workflow instances
  const { data: instancesData, isLoading: instancesLoading, refetch: refetchInstances } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: async () => {
      const response = await api.get('/api/documents/workflows/instances');
      return response.data;
    },
  });

  // Fetch pending steps
  const { data: stepsData, isLoading: stepsLoading, refetch: refetchSteps } = useQuery({
    queryKey: ['workflow-pending-steps'],
    queryFn: async () => {
      const response = await api.get('/api/documents/workflows/steps/pending');
      return response.data;
    },
  });

  const instances = instancesData?.data || [];
  const pendingSteps = stepsData?.data || [];

  const activeInstances = instances.filter(i => i.status === 'IN_PROGRESS').length;
  const completedInstances = instances.filter(i => i.status === 'COMPLETED').length;
  const cancelledInstances = instances.filter(i => i.status === 'CANCELLED').length;

  const statCards = [
    {
      title: 'Mis Tareas Pendientes',
      value: pendingSteps.length,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Workflows Activos',
      value: activeInstances,
      icon: Workflow,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Completados',
      value: completedInstances,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Cancelados',
      value: cancelledInstances,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflows de Aprobación</h1>
          <p className="text-gray-600 mt-2">
            Gestión de flujos de aprobación y tareas pendientes
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

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Mis Tareas Pendientes
          </TabsTrigger>
          <TabsTrigger value="instances" className="gap-2">
            <Workflow className="h-4 w-4" />
            Instancias de Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tareas Pendientes de Aprobación</CardTitle>
              <CardDescription>
                Revise y procese las tareas asignadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowStepsTable
                data={pendingSteps}
                isLoading={stepsLoading}
                onRefetch={refetchSteps}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instancias de Workflow</CardTitle>
              <CardDescription>
                Seguimiento de todos los workflows en curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowInstanceTable
                data={instances}
                isLoading={instancesLoading}
                onRefetch={refetchInstances}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
