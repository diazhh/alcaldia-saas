'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProjectMap from '@/components/modules/projects/ProjectMap';
import { ArrowLeft, MapPin, Filter } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'PLANNING', label: 'Planificación' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export default function ProjectsMapPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: '',
    sector: '',
  });

  // Obtener todos los proyectos sin paginación para el mapa
  const { data, isLoading, error } = useProjects(filters, 1, 1000);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const projectsWithCoords = data?.projects?.filter(
    (p) => p.latitude && p.longitude
  ) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/proyectos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-8 w-8" />
              Mapa de Proyectos
            </h1>
            <p className="text-gray-600 mt-1">
              Visualización geográfica de proyectos municipales
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {projectsWithCoords.length} proyectos con ubicación
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa */}
      {error ? (
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            Error al cargar proyectos: {error.message}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Skeleton className="h-[600px] w-full rounded-lg" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ProjectMap projects={data?.projects} />
          </CardContent>
        </Card>
      )}

      {/* Leyenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-400"></div>
              <span className="text-sm">Planificación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span className="text-sm">En Progreso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
              <span className="text-sm">Completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-400"></div>
              <span className="text-sm">Pausado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-400"></div>
              <span className="text-sm">Cancelado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
