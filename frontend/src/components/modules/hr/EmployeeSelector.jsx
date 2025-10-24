'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEmployees } from '@/hooks/hr/useEmployees';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Componente selector de empleados con búsqueda
 * @param {Object} props
 * @param {string} props.value - ID del empleado seleccionado
 * @param {Function} props.onValueChange - Callback cuando cambia la selección
 * @param {string} props.placeholder - Texto placeholder
 * @param {string} props.status - Filtrar por estado (ACTIVE, INACTIVE, etc.)
 * @param {boolean} props.disabled - Deshabilitar selector
 */
export default function EmployeeSelector({ 
  value, 
  onValueChange, 
  placeholder = "Seleccionar empleado...",
  status = "ACTIVE",
  disabled = false 
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: employeesData, isLoading } = useEmployees({
    page: 1,
    limit: 100,
    search,
    status,
  });

  const employees = employeesData?.data || [];
  const selectedEmployee = employees.find((emp) => emp.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedEmployee ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedEmployee.employeeNumber}</span>
              <span>-</span>
              <span>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar empleado..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <CommandEmpty>No se encontraron empleados.</CommandEmpty>
                <CommandGroup>
                  {employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={employee.id}
                      onSelect={(currentValue) => {
                        onValueChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === employee.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {employee.employeeNumber} - {employee.firstName} {employee.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {employee.position?.name || 'Sin cargo'} - {employee.department?.name || 'Sin departamento'}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
