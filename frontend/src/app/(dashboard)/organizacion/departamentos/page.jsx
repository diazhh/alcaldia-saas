'use client';

import { useState } from 'react';
import { Plus, Search, Building2, Users, AlertCircle } from 'lucide-react';
import { useDepartmentTree } from '@/hooks/useDepartments';
import DepartmentTree from '@/components/modules/departments/DepartmentTree';
import DepartmentDetails from '@/components/modules/departments/DepartmentDetails';
import CreateDepartmentModal from '@/components/modules/departments/CreateDepartmentModal';
import ExportMenu from '@/components/modules/departments/ExportMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Página principal de gestión de departamentos
 * Muestra árbol jerárquico a la izquierda y detalles a la derecha
 */
export default function DepartmentsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Obtener árbol de departamentos
  const { data: departments, isLoading, error } = useDepartmentTree();

  // Filtrar departamentos por búsqueda
  const filterDepartments = (depts, search) => {
    if (!search) return depts;

    const searchLower = search.toLowerCase();
    
    const filterRecursive = (dept) => {
      const matches = 
        dept.name.toLowerCase().includes(searchLower) ||
        dept.code.toLowerCase().includes(searchLower);

      const filteredChildren = dept.children
        ? dept.children.map(filterRecursive).filter(Boolean)
        : [];

      if (matches || filteredChildren.length > 0) {
        return {
          ...dept,
          children: filteredChildren,
        };
      }

      return null;
    };

    return depts.map(filterRecursive).filter(Boolean);
  };

  const filteredDepartments = departments ? filterDepartments(departments, searchTerm) : [];

  const handleSelectDepartment = (department) => {
    setSelectedDepartment(department);
  };


  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estructura Organizacional</h1>
          <p className="text-muted-foreground">
            Gestiona la jerarquía de departamentos y asignación de personal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu 
            departments={departments} 
            selectedDepartment={selectedDepartment}
          />
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los departamentos: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Layout principal: Árbol + Detalles */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Panel izquierdo: Árbol jerárquico */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organigrama
            </CardTitle>
            <CardDescription>
              Estructura jerárquica de departamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {/* Búsqueda */}
            <div className="mb-4 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Árbol */}
            <div className="flex-1 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : filteredDepartments.length > 0 ? (
                <DepartmentTree
                  departments={filteredDepartments}
                  selectedId={selectedDepartment?.id}
                  onSelect={handleSelectDepartment}
                />
              ) : searchTerm ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">No se encontraron departamentos</p>
                  <p className="text-xs">Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Building2 className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-sm">No hay departamentos</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer departamento
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel derecho: Detalles del departamento seleccionado */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {selectedDepartment ? 'Detalles del Departamento' : 'Información'}
            </CardTitle>
            <CardDescription>
              {selectedDepartment
                ? `${selectedDepartment.code} - ${selectedDepartment.name}`
                : 'Selecciona un departamento para ver sus detalles'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {selectedDepartment ? (
              <DepartmentDetails department={selectedDepartment} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Building2 className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Selecciona un departamento</p>
                <p className="text-sm">Haz clic en un departamento del árbol para ver sus detalles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de creación */}
      <CreateDepartmentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
