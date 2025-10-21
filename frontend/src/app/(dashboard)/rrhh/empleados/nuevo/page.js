'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateEmployee } from '@/hooks/hr/useEmployees';
import { useToast } from '@/hooks/use-toast';
import EmployeeForm from '@/components/modules/hr/EmployeeForm';

/**
 * Página para crear un nuevo empleado
 */
export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createEmployee = useCreateEmployee();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const result = await createEmployee.mutateAsync(data);
      
      toast({
        title: 'Empleado creado',
        description: `El empleado ${result.firstName} ${result.lastName} ha sido registrado exitosamente.`,
      });
      
      router.push(`/rrhh/empleados/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el empleado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/rrhh/empleados">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Empleado</h1>
          <p className="text-muted-foreground mt-1">
            Registrar un nuevo empleado en el sistema
          </p>
        </div>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Empleado</CardTitle>
          <CardDescription>
            Complete todos los campos requeridos para registrar al empleado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Crear Empleado"
          />
        </CardContent>
      </Card>
    </div>
  );
}
