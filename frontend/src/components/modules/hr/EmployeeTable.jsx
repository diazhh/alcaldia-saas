'use client';

import { Eye, Edit, MoreVertical, UserX, UserCheck } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/**
 * Componente de tabla de empleados
 */
export default function EmployeeTable({ data, pagination, isLoading, onPageChange }) {
  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: { label: 'Activo', variant: 'default', className: 'bg-green-500' },
      INACTIVE: { label: 'Inactivo', variant: 'secondary' },
      SUSPENDED: { label: 'Suspendido', variant: 'destructive' },
      RETIRED: { label: 'Retirado', variant: 'outline' },
    };

    const config = variants[status] || variants.INACTIVE;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron empleados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empleado</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{employee.employeeNumber}</TableCell>
              <TableCell>{employee.idNumber}</TableCell>
              <TableCell>{employee.position?.name || '-'}</TableCell>
              <TableCell>{employee.department?.name || '-'}</TableCell>
              <TableCell>{getStatusBadge(employee.status)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/rrhh/empleados/${employee.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Expediente
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/rrhh/empleados/${employee.id}/editar`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {employee.status === 'ACTIVE' ? (
                      <DropdownMenuItem className="text-destructive">
                        <UserX className="w-4 h-4 mr-2" />
                        Dar de Baja
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Reactivar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} empleados
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
