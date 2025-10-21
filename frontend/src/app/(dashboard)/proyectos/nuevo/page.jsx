'use client';

import { useRouter } from 'next/navigation';
import { useCreateProject } from '@/hooks/useProjects';
import { useToast } from '@/components/ui/toast';
import ProjectForm from '@/components/modules/projects/ProjectForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createProject = useCreateProject();

  const handleSubmit = async (data) => {
    try {
      await createProject.mutateAsync(data);
      toast({
        title: 'Proyecto creado',
        description: 'El proyecto ha sido creado exitosamente',
      });
      router.push('/proyectos');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al crear el proyecto',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    router.push('/proyectos');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/proyectos')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Proyecto</h1>
          <p className="text-gray-600 mt-1">
            Crea un nuevo proyecto municipal
          </p>
        </div>
      </div>

      {/* Formulario */}
      <ProjectForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createProject.isPending}
      />
    </div>
  );
}
