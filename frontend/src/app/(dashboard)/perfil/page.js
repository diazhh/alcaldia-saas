'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Bell, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, isUpdatingProfile, isChangingPassword } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form para editar perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Form para cambiar contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'U';

  const onSubmitProfile = async (data) => {
    try {
      await updateProfile(data);
      toast.success('Perfil actualizado exitosamente');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Contraseña actualizada exitosamente');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} alt={user?.firstName} />
              <AvatarFallback className="bg-primary-600 text-white text-2xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {user?.role}
                </span>
                {user?.isActive && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Información Personal
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        {/* Información Personal */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <Input
                      {...registerProfile('firstName', { required: 'El nombre es requerido' })}
                      disabled={!isEditingProfile}
                      placeholder="Juan"
                    />
                    {profileErrors.firstName && (
                      <p className="text-sm text-red-600 mt-1">
                        {profileErrors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <Input
                      {...registerProfile('lastName', { required: 'El apellido es requerido' })}
                      disabled={!isEditingProfile}
                      placeholder="Pérez"
                    />
                    {profileErrors.lastName && (
                      <p className="text-sm text-red-600 mt-1">
                        {profileErrors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    {...registerProfile('email', {
                      required: 'El email es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido',
                      },
                    })}
                    disabled={!isEditingProfile}
                    type="email"
                    placeholder="juan.perez@ejemplo.com"
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {profileErrors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    {...registerProfile('phone')}
                    disabled={!isEditingProfile}
                    placeholder="+58 412 1234567"
                  />
                </div>

                <div className="flex gap-3">
                  {!isEditingProfile ? (
                    <Button type="button" onClick={() => setIsEditingProfile(true)}>
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button type="submit" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingProfile(false);
                          resetProfile();
                        }}
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seguridad */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <Input
                    {...registerPassword('currentPassword', {
                      required: 'La contraseña actual es requerida',
                    })}
                    type="password"
                    placeholder="••••••••"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <Input
                    {...registerPassword('newPassword', {
                      required: 'La nueva contraseña es requerida',
                      minLength: {
                        value: 8,
                        message: 'La contraseña debe tener al menos 8 caracteres',
                      },
                    })}
                    type="password"
                    placeholder="••••••••"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <Input
                    {...registerPassword('confirmPassword', {
                      required: 'Debes confirmar la contraseña',
                    })}
                    type="password"
                    placeholder="••••••••"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
