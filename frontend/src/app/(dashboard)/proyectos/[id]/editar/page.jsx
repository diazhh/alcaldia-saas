'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useToast } from '@/components/ui/toast';
import ProjectForm from '@/components/modules/projects/ProjectForm';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.id;

  const { data: project, isLoading, error } = useProject(projectId);
  const updateProject = useUpdateProject();

  const handleSubmit = async (data) => {
    try {
      await updateProject.mutateAsync({ projectId, data });
      toast({
        title: 'Proyecto actualizado',
        description: 'El proyecto ha sido actualizado exitosamente',
      });
      router.push(`/proyectos/${projectId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al actualizar el proyecto',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push(`/proyectos/${projectId}`);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Error al cargar el proyecto: {error.message}</p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/proyectos')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Proyectos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/proyectos/${projectId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Proyecto</h1>
          <p className="text-gray-600 mt-1">{project.name}</p>
        </div>
      </div>

      {/* Formulario */}
      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateProject.isPending}
      />
    </div>
  );
}
