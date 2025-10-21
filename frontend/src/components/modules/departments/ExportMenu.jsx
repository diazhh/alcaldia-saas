'use client';

import PropTypes from 'prop-types';
import { Download, FileSpreadsheet, FileText, Image } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  exportDepartmentPersonnel,
  exportPhoneDirectory,
  exportOrganizationalStructure,
} from '@/lib/exportUtils';

/**
 * Menú de exportación para departamentos
 */
export default function ExportMenu({ departments, selectedDepartment }) {
  const handleExportStructure = () => {
    if (!departments || departments.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    exportOrganizationalStructure(departments);
  };

  const handleExportDirectory = () => {
    if (!departments || departments.length === 0) {
      alert('No hay datos para exportar');
      return;
    }
    exportPhoneDirectory(departments);
  };

  const handleExportPersonnel = () => {
    if (!selectedDepartment) {
      alert('Selecciona un departamento primero');
      return;
    }
    exportDepartmentPersonnel(selectedDepartment);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar Reportes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleExportStructure}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Estructura Completa (Excel)
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportDirectory}>
          <FileText className="h-4 w-4 mr-2" />
          Directorio Telefónico (Excel)
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleExportPersonnel}
          disabled={!selectedDepartment}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Personal del Departamento
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => alert('Exportación de organigrama disponible en la vista de organigrama')}>
          <Image className="h-4 w-4 mr-2" />
          Organigrama (SVG)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

ExportMenu.propTypes = {
  departments: PropTypes.array,
  selectedDepartment: PropTypes.object,
};
