'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormError } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { login, isLoggingIn, loginError } = useAuth();
  const { toast } = useToast();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data, event) => {
    // Prevenir comportamiento por defecto del formulario
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    try {
      await login(data);
      // Solo se ejecuta si login fue exitoso
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente',
        variant: 'success',
      });
    } catch (error) {
      // Se ejecuta solo si login falló
      toast({
        title: 'Error de autenticación',
        description: error.response?.data?.message || 'Credenciales inválidas. Verifica tu email y contraseña.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-xl">
              SM
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">Sistema Integral de Gestión Municipal</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} method="POST" action="#" className="space-y-6">
            {/* Error general */}
            {loginError && (
              <FormError
                message={loginError.response?.data?.message || 'Error al iniciar sesión'}
              />
            )}

            {/* Email */}
            <FormField label="Email" error={errors.email?.message} required>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email')}
                disabled={isLoggingIn}
              />
            </FormField>

            {/* Password */}
            <FormField label="Contraseña" error={errors.password?.message} required>
              <Input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoggingIn}
              />
            </FormField>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isLoggingIn}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Mantenerme logueado
                </label>
              </div>
              <Link
                href="/recuperar-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/registro" className="text-primary-600 hover:text-primary-700 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Test Credentials */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-3">🔐 Credenciales de Desarrollo</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <p className="font-semibold text-purple-700">SUPER_ADMIN:</p>
              <p className="text-blue-800">superadmin@municipal.gob.ve</p>
              <p className="text-blue-800 mb-2">admin123</p>

              <p className="font-semibold text-pink-700">ADMIN:</p>
              <p className="text-blue-800">admin@municipal.gob.ve</p>
              <p className="text-blue-800 mb-2">admin123</p>

              <p className="font-semibold text-orange-700">DIRECTOR:</p>
              <p className="text-blue-800">director@municipal.gob.ve</p>
              <p className="text-blue-800 mb-2">password123</p>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-green-700">COORDINADOR:</p>
              <p className="text-blue-800">coordinador19@municipal.gob.ve</p>
              <p className="text-blue-800 mb-2">password123</p>

              <p className="font-semibold text-teal-700">EMPLEADO:</p>
              <p className="text-blue-800">empleado16@municipal.gob.ve</p>
              <p className="text-blue-800 mb-2">password123</p>

              <p className="font-semibold text-gray-700">CIUDADANO:</p>
              <p className="text-blue-800">ciudadano@example.com</p>
              <p className="text-blue-800">password123</p>
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-3 italic">Todos los permisos están configurados según el rol</p>
        </div>
      </div>
    </div>
  );
}
