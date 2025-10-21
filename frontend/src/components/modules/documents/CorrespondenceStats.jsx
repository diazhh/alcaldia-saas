'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox, Send, Clock, CheckCircle, Archive } from 'lucide-react';

export function CorrespondenceStats({ stats }) {
  const statCards = [
    {
      title: 'Entrada Hoy',
      value: stats?.incomingToday || 0,
      icon: Inbox,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Salida Hoy',
      value: stats?.outgoingToday || 0,
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pendientes',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Entregados',
      value: stats?.delivered || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Archivados',
      value: stats?.archived || 0,
      icon: Archive,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
  );
}
