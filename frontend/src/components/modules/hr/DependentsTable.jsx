'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Tabla de dependientes
 * TODO: Implementar funcionalidad completa
 */
export default function DependentsTable({ data = [], pagination, isLoading, onPageChange }) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay dependientes registrados
      </div>
    );
  }

  const getRelationshipLabel = (relationship) => {
    const labels = {
      CHILD: 'Hijo/a',
      SPOUSE: 'Cónyuge',
      PARENT: 'Padre/Madre',
      SIBLING: 'Hermano/a',
    };
    return labels[relationship] || relationship;
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empleado</TableHead>
              <TableHead>Relación</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Beneficios</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((dependent) => (
              <TableRow key={dependent.id}>
                <TableCell className="font-medium">
                  {dependent.firstName} {dependent.lastName}
                </TableCell>
                <TableCell>
                  {dependent.employee?.firstName} {dependent.employee?.lastName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getRelationshipLabel(dependent.relationship)}
                  </Badge>
                </TableCell>
                <TableCell>{calculateAge(dependent.birthDate)} años</TableCell>
                <TableCell>{dependent.gender === 'MALE' ? 'M' : 'F'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {dependent.receivesHealthInsurance && (
                      <Badge variant="success" className="text-xs">Seguro</Badge>
                    )}
                    {dependent.receivesSchoolSupplies && (
                      <Badge variant="default" className="text-xs">Útiles</Badge>
                    )}
                    {dependent.receivesToys && (
                      <Badge variant="secondary" className="text-xs">Juguetes</Badge>
                    )}
                    {dependent.receivesChildBonus && (
                      <Badge variant="warning" className="text-xs">Prima</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
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
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
