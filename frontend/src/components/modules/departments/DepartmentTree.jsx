'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, ChevronDown, Building2, Users, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * Componente recursivo para mostrar un nodo del árbol de departamentos
 */
const TreeNode = ({ department, level = 0, selectedId, onSelect, expandedIds, onToggle }) => {
  const isExpanded = expandedIds.has(department.id);
  const isSelected = selectedId === department.id;
  const hasChildren = department.children && department.children.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(department.id);
    }
  };

  const handleSelect = () => {
    onSelect(department);
  };

  // Iconos según el tipo de departamento
  const getTypeIcon = (type) => {
    switch (type) {
      case 'DIRECCION':
        return <Building2 className="h-4 w-4" />;
      case 'COORDINACION':
        return <Folder className="h-4 w-4" />;
      case 'DEPARTAMENTO':
        return <Folder className="h-4 w-4" />;
      default:
        return <Folder className="h-4 w-4" />;
    }
  };

  // Colores según el tipo
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'DIRECCION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'COORDINACION':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'DEPARTAMENTO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'UNIDAD':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'SECCION':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      case 'OFICINA':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer hover:bg-accent transition-colors',
          isSelected && 'bg-accent border-l-2 border-primary',
          !department.isActive && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={handleSelect}
      >
        {/* Botón expandir/colapsar */}
        <button
          onClick={handleToggle}
          className={cn(
            'flex items-center justify-center h-5 w-5 rounded hover:bg-accent-foreground/10',
            !hasChildren && 'invisible'
          )}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          )}
        </button>

        {/* Icono del tipo */}
        <div className="flex-shrink-0">
          {isExpanded && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-primary" />
          ) : (
            getTypeIcon(department.type)
          )}
        </div>

        {/* Información del departamento */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="font-medium text-sm truncate">{department.name}</span>
          <span className="text-xs text-muted-foreground">({department.code})</span>
        </div>

        {/* Badge de tipo */}
        <Badge variant="outline" className={cn('text-xs', getTypeBadgeColor(department.type))}>
          {department.type}
        </Badge>

        {/* Contador de empleados */}
        {department._count?.users > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{department._count.users}</span>
          </div>
        )}

        {/* Estado inactivo */}
        {!department.isActive && (
          <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
            Inactivo
          </Badge>
        )}
      </div>

      {/* Hijos (recursivo) */}
      {hasChildren && isExpanded && (
        <div>
          {department.children.map((child) => (
            <TreeNode
              key={child.id}
              department={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

TreeNode.propTypes = {
  department: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    isActive: PropTypes.bool,
    children: PropTypes.array,
    _count: PropTypes.shape({
      users: PropTypes.number,
    }),
  }).isRequired,
  level: PropTypes.number,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  expandedIds: PropTypes.instanceOf(Set).isRequired,
  onToggle: PropTypes.func.isRequired,
};

/**
 * Componente principal del árbol jerárquico de departamentos
 */
export default function DepartmentTree({ departments, selectedId, onSelect, className }) {
  // Estado para controlar qué nodos están expandidos
  const [expandedIds, setExpandedIds] = useState(new Set());

  const handleToggle = (id) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set();
    const collectIds = (depts) => {
      depts.forEach((dept) => {
        if (dept.children && dept.children.length > 0) {
          allIds.add(dept.id);
          collectIds(dept.children);
        }
      });
    };
    collectIds(departments);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">No hay departamentos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Controles de expandir/colapsar */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <button
          onClick={expandAll}
          className="text-xs text-primary hover:underline"
        >
          Expandir todo
        </button>
        <span className="text-muted-foreground">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-primary hover:underline"
        >
          Colapsar todo
        </button>
      </div>

      {/* Árbol de departamentos */}
      <div className="space-y-1">
        {departments.map((department) => (
          <TreeNode
            key={department.id}
            department={department}
            selectedId={selectedId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}

DepartmentTree.propTypes = {
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      isActive: PropTypes.bool,
      children: PropTypes.array,
    })
  ).isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  className: PropTypes.string,
};
