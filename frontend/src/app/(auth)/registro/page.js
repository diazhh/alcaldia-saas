'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormError } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

export default function RegistroPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta ha sido creada correctamente',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al registrarse',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-xl">
              SM
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p className="text-gray-600 mt-2">Sistema Integral de Gestión Municipal</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error general */}
            {registerError && (
              <FormError
                message={registerError.response?.data?.message || 'Error al registrarse'}
              />
            )}

            {/* First Name */}
            <FormField label="Nombre" error={errors.firstName?.message} required>
              <Input
                type="text"
                placeholder="Juan"
                {...register('firstName')}
                disabled={isRegistering}
              />
            </FormField>

            {/* Last Name */}
            <FormField label="Apellido" error={errors.lastName?.message} required>
              <Input
                type="text"
                placeholder="Pérez"
                {...register('lastName')}
                disabled={isRegistering}
              />
            </FormField>

            {/* Email */}
            <FormField label="Email" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email')}
                disabled={isRegistering}
              />
            </FormField>

            {/* Phone */}
            <FormField label="Teléfono" error={errors.phone?.message}>
              <Input
                type="tel"
                placeholder="+58 412 1234567"
                {...register('phone')}
                disabled={isRegistering}
              />
            </FormField>

            {/* Password */}
            <FormField label="Contraseña" error={errors.password?.message} required>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isRegistering}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 6 caracteres, una mayúscula y un número
              </p>
            </FormField>

            {/* Confirm Password */}
            <FormField
              label="Confirmar Contraseña"
              error={errors.confirmPassword?.message}
              required
            >
              <Input
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                disabled={isRegistering}
              />
            </FormField>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isRegistering}>
              {isRegistering ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
