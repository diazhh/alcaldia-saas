'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Users,
  Receipt,
  MapPin,
  MessageSquare,
  Truck,
  Package,
  FileText,
  Wrench,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULES } from '@/constants/permissions';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    module: MODULES.DASHBOARDS,
  },
  {
    title: 'Organización',
    icon: Users,
    href: '/organizacion',
    module: MODULES.DEPARTMENTS,
  },
  {
    title: 'Proyectos',
    icon: FolderKanban,
    href: '/proyectos',
    module: MODULES.PROJECTS,
    submenu: [
      { title: 'Lista de Proyectos', href: '/proyectos', requiredAction: 'read' },
      { title: 'Dashboard', href: '/proyectos/dashboard', requiredAction: 'read' },
      { title: 'Mapa', href: '/proyectos/mapa', requiredAction: 'read' },
      { title: 'Nuevo Proyecto', href: '/proyectos/nuevo', requiredAction: 'create' },
    ],
  },
  {
    title: 'Finanzas',
    icon: DollarSign,
    href: '/finanzas',
    module: MODULES.BUDGETS,
    submenu: [
      { title: 'Dashboard Financiero', href: '/finanzas', requiredAction: 'read' },
      { title: 'Presupuesto', href: '/finanzas/presupuesto', requiredAction: 'read' },
      { title: 'Modificaciones Presupuestarias', href: '/finanzas/modificaciones', requiredAction: 'update' },
      { title: 'Ejecución del Gasto', href: '/finanzas/ejecucion', requiredAction: 'read' },
      { title: 'Tesorería', href: '/finanzas/tesoreria', requiredAction: 'read' },
      { title: 'Conciliación Bancaria', href: '/finanzas/conciliacion', requiredAction: 'update' },
      { title: 'Programación de Pagos', href: '/finanzas/programacion-pagos', requiredAction: 'read' },
      { title: 'Proyección de Flujo de Caja', href: '/finanzas/flujo-caja', requiredAction: 'read' },
      { title: 'Cajas Chicas', href: '/finanzas/cajas-chicas', requiredAction: 'read' },
      { title: 'Anticipos a Empleados', href: '/finanzas/anticipos', requiredAction: 'read' },
      { title: 'Contabilidad', href: '/finanzas/contabilidad', requiredAction: 'read' },
      { title: 'Cierre Contable', href: '/finanzas/cierre-contable', requiredAction: 'approve' },
      { title: 'Reportes', href: '/finanzas/reportes', requiredAction: 'read' },
    ],
  },
  {
    title: 'RRHH',
    icon: Users,
    href: '/rrhh',
    module: MODULES.EMPLOYEES,
    submenu: [
      { title: 'Empleados', href: '/rrhh/empleados', requiredAction: 'read' },
      { title: 'Nómina', href: '/rrhh/nomina', requiredAction: 'read' },
      { title: 'Asistencia', href: '/rrhh/asistencia', requiredAction: 'read' },
    ],
  },
  {
    title: 'Tributario',
    icon: Receipt,
    href: '/tributario',
    module: MODULES.TAXES,
    submenu: [
      { title: 'Dashboard', href: '/tributario', requiredAction: 'read' },
      { title: 'Contribuyentes', href: '/tributario/contribuyentes', requiredAction: 'read' },
      { title: 'Inmuebles', href: '/tributario/inmuebles', requiredAction: 'read' },
      { title: 'Actividades Económicas', href: '/tributario/actividades', requiredAction: 'read' },
      { title: 'Vehículos', href: '/tributario/vehiculos', requiredAction: 'read' },
      { title: 'Declaraciones', href: '/tributario/declaraciones', requiredAction: 'read' },
      { title: 'Pagos', href: '/tributario/pagos', requiredAction: 'read' },
      { title: 'Fiscalización', href: '/tributario/fiscalizacion', requiredAction: 'update' },
    ],
  },
  {
    title: 'Catastro',
    icon: MapPin,
    href: '/catastro',
    module: MODULES.PROPERTIES,
    submenu: [
      { title: 'Propiedades', href: '/catastro/propiedades', requiredAction: 'read' },
      { title: 'Variables Urbanas', href: '/catastro/variables-urbanas', requiredAction: 'read' },
      { title: 'Permisos de Construcción', href: '/catastro/permisos', requiredAction: 'read' },
      { title: 'Control Urbano', href: '/catastro/control-urbano', requiredAction: 'read' },
      { title: 'Mapa Catastral', href: '/catastro/mapa', requiredAction: 'read' },
      { title: 'Consulta Pública', href: '/catastro/consulta-publica', requiredAction: 'read' },
    ],
  },
  {
    title: 'Participación',
    icon: MessageSquare,
    href: '/participacion',
    module: MODULES.PETITIONS,
    submenu: [
      { title: 'Mesa de Control', href: '/participacion/reportes', requiredAction: 'read' },
      { title: 'Presupuesto Participativo', href: '/participacion/presupuesto', requiredAction: 'read' },
      { title: 'Portal de Transparencia', href: '/participacion/transparencia', requiredAction: 'read' },
    ],
  },
  {
    title: 'Flota',
    icon: Truck,
    href: '/flota',
    module: MODULES.VEHICLES,
    submenu: [
      { title: 'Vehículos', href: '/flota/vehiculos', requiredAction: 'read' },
      { title: 'Bitácora de Viajes', href: '/flota/bitacora', requiredAction: 'read' },
      { title: 'Control de Combustible', href: '/flota/combustible', requiredAction: 'read' },
      { title: 'Mantenimiento', href: '/flota/mantenimiento', requiredAction: 'read' },
      { title: 'Costo Total (TCO)', href: '/flota/tco', requiredAction: 'read' },
      { title: 'Dashboard', href: '/flota/dashboard', requiredAction: 'read' },
    ],
  },
  {
    title: 'Bienes',
    icon: Package,
    href: '/bienes',
    module: MODULES.ASSETS,
    submenu: [
      { title: 'Gestión de Bienes', href: '/bienes/activos', requiredAction: 'read' },
      { title: 'Movimientos', href: '/bienes/movimientos', requiredAction: 'read' },
      { title: 'Mantenimientos', href: '/bienes/mantenimientos', requiredAction: 'read' },
      { title: 'Almacén', href: '/bienes/almacen', requiredAction: 'read' },
      { title: 'Solicitudes de Compra', href: '/bienes/compras', requiredAction: 'create' },
      { title: 'Reportes', href: '/bienes/reportes', requiredAction: 'read' },
    ],
  },
  {
    title: 'Documentos',
    icon: FileText,
    href: '/documentos',
    module: MODULES.DOCUMENTS,
    submenu: [
      { title: 'Mesa de Entrada', href: '/documentos/mesa-entrada', requiredAction: 'read' },
      { title: 'Oficios Internos', href: '/documentos/oficios', requiredAction: 'read' },
      { title: 'Expedientes', href: '/documentos/expedientes', requiredAction: 'read' },
      { title: 'Ordenanzas', href: '/documentos/ordenanzas', requiredAction: 'read' },
      { title: 'Firmas Pendientes', href: '/documentos/firmas', requiredAction: 'approve' },
      { title: 'Búsqueda', href: '/documentos/busqueda', requiredAction: 'read' },
      { title: 'Workflows', href: '/documentos/workflows', requiredAction: 'manage' },
    ],
  },
  {
    title: 'Servicios',
    icon: Wrench,
    href: '/servicios',
    module: MODULES.PUBLIC_SERVICES,
  },
  {
    title: 'Reportes',
    icon: BarChart3,
    href: '/reportes',
    module: MODULES.REPORTS,
  },
  {
    title: 'Administración',
    icon: Settings,
    href: '/administracion',
    module: MODULES.USERS,
    submenu: [
      { title: 'Usuarios', href: '/administracion/usuarios', requiredAction: 'read' },
      { title: 'Roles y Permisos', href: '/administracion/permisos', requiredAction: 'manage' },
    ],
  },
];

export function Sidebar({ mobileOpen = false, onMobileClose }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { canAccessModule, can, loading } = usePermissions();

  const toggleSubmenu = (title) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Filtrar items del menú según permisos
  const filteredMenuItems = menuItems.filter(item => {
    // Si no tiene módulo definido, mostrar siempre (ej: Dashboard)
    if (!item.module) return true;

    // Verificar si tiene acceso al módulo
    return canAccessModule(item.module);
  });

  // Filtrar submenús según permisos
  const getFilteredSubmenu = (submenu, parentModule) => {
    if (!submenu) return null;

    return submenu.filter(subitem => {
      // Si no tiene acción requerida, mostrar si tiene acceso al módulo
      if (!subitem.requiredAction) {
        return canAccessModule(parentModule);
      }

      // Verificar si tiene el permiso específico
      return can(parentModule, subitem.requiredAction);
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen border-r bg-white transition-all duration-300',
          // Desktop
          'hidden lg:block',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile - slide in from left
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0 block w-64' : '-translate-x-full'
        )}
      >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
              SM
            </div>
            <span className="font-semibold text-gray-900">Sistema Municipal</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 h-[calc(100vh-8rem)]">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const filteredSubmenu = getFilteredSubmenu(item.submenu, item.module);
            const hasSubmenu = filteredSubmenu && filteredSubmenu.length > 0;
            const isExpanded = expandedMenus[item.title];

            return (
              <div key={item.title}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (hasSubmenu && !collapsed) {
                      e.preventDefault();
                      toggleSubmenu(item.title);
                    } else if (onMobileClose) {
                      onMobileClose();
                    }
                  }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="flex-1">{item.title}</span>}
                {!collapsed && hasSubmenu && (
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                )}
              </Link>

              {/* Submenu */}
              {hasSubmenu && !collapsed && isExpanded && (
                <div className="ml-8 mt-1 space-y-1">
                  {filteredSubmenu.map((subitem) => {
                    const isSubActive = pathname === subitem.href;
                    return (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        onClick={() => onMobileClose?.()}
                        className={cn(
                          'block rounded-lg px-3 py-2 text-sm transition-colors',
                          isSubActive
                            ? 'bg-primary-50 text-primary-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        {subitem.title}
                      </Link>
                    );
                  })}
                </div>
              )}
              </div>
            );
          })
        )}
      </nav>

      {/* Footer - Removed to avoid duplication with Administración menu */}
    </aside>
    </>
  );
}
