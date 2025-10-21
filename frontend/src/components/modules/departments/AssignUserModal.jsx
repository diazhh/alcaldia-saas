'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PropTypes from 'prop-types';
import { useAssignUserToDepartment } from '@/hooks/useDepartments';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const assignUserSchema = z.object({
  userId: z.string().min(1, 'Debes seleccionar un usuario'),
  departmentRole: z.enum(['JEFE', 'SUBJEFE', 'COORDINADOR', 'EMPLEADO']),
  isPrimary: z.boolean(),
});

export default function AssignUserModal({ open, onOpenChange, departmentId }) {
  const { toast } = useToast();
  const assignUser = useAssignUserToDepartment();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(assignUserSchema),
    defaultValues: {
      userId: '',
      departmentRole: 'EMPLEADO',
      isPrimary: false,
    },
  });

  // Obtener lista de usuarios disponibles
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.data || data;
    },
    enabled: open,
  });

  const selectedUserId = watch('userId');
  const selectedRole = watch('departmentRole');
  const isPrimary = watch('isPrimary');

  const filteredUsers = users?.filter((user) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(search) ||
      user.lastName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const onSubmit = async (data) => {
    try {
      await assignUser.mutateAsync({
        departmentId,
        userId: data.userId,
        role: data.departmentRole,
        isPrimary: data.isPrimary,
      });

      toast({
        title: 'Usuario asignado',
        description: 'El usuario ha sido asignado al departamento exitosamente.',
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'No se pudo asignar el usuario',
        variant: 'destructive',
      });
    }
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      reset();
      setSearchTerm('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asignar Empleado al Departamento</DialogTitle>
          <DialogDescription>
            Selecciona un usuario y asígnale un rol en este departamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Búsqueda y selección de usuario */}
          <div className="space-y-2">
            <Label>Buscar Usuario</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">
              Usuario <span className="text-red-500">*</span>
            </Label>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select
                value={selectedUserId}
                onValueChange={(value) => setValue('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {user.firstName} {user.lastName} - {user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No se encontraron usuarios
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
            {errors.userId && (
              <p className="text-sm text-red-500">{errors.userId.message}</p>
            )}
          </div>

          {/* Vista previa del usuario seleccionado */}
          {selectedUser && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Usuario seleccionado:</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-xs text-muted-foreground">Rol: {selectedUser.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rol en el departamento */}
          <div className="space-y-2">
            <Label htmlFor="departmentRole">
              Rol en el Departamento <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('departmentRole', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JEFE">Jefe</SelectItem>
                <SelectItem value="SUBJEFE">Subjefe</SelectItem>
                <SelectItem value="COORDINADOR">Coordinador</SelectItem>
                <SelectItem value="EMPLEADO">Empleado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define el rol que tendrá el usuario dentro de este departamento
            </p>
          </div>

          {/* Marcar como departamento principal */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrimary"
              {...register('isPrimary')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isPrimary" className="cursor-pointer">
              Marcar como departamento principal del usuario
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Si está marcado, este será el departamento principal del usuario
          </p>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={assignUser.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={assignUser.isPending}>
              {assignUser.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Asignar Usuario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

AssignUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  departmentId: PropTypes.string.isRequired,
};
