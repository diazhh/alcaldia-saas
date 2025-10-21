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

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    title: 'Organización',
    icon: Users,
    href: '/organizacion',
  },
  {
    title: 'Proyectos',
    icon: FolderKanban,
    href: '/proyectos',
    submenu: [
      { title: 'Lista de Proyectos', href: '/proyectos' },
      { title: 'Dashboard', href: '/proyectos/dashboard' },
      { title: 'Mapa', href: '/proyectos/mapa' },
      { title: 'Nuevo Proyecto', href: '/proyectos/nuevo' },
    ],
  },
  {
    title: 'Finanzas',
    icon: DollarSign,
    href: '/finanzas',
    submenu: [
      { title: 'Dashboard Financiero', href: '/finanzas' },
      { title: 'Presupuesto', href: '/finanzas/presupuesto' },
      { title: 'Ejecución del Gasto', href: '/finanzas/ejecucion' },
      { title: 'Tesorería', href: '/finanzas/tesoreria' },
      { title: 'Contabilidad', href: '/finanzas/contabilidad' },
      { title: 'Reportes', href: '/finanzas/reportes' },
    ],
  },
  {
    title: 'RRHH',
    icon: Users,
    href: '/rrhh',
    submenu: [
      { title: 'Empleados', href: '/rrhh/empleados' },
      { title: 'Nómina', href: '/rrhh/nomina' },
      { title: 'Asistencia', href: '/rrhh/asistencia' },
    ],
  },
  {
    title: 'Tributario',
    icon: Receipt,
    href: '/tributario',
    submenu: [
      { title: 'Dashboard', href: '/tributario' },
      { title: 'Contribuyentes', href: '/tributario/contribuyentes' },
      { title: 'Inmuebles', href: '/tributario/inmuebles' },
      { title: 'Actividades Económicas', href: '/tributario/actividades' },
      { title: 'Vehículos', href: '/tributario/vehiculos' },
      { title: 'Declaraciones', href: '/tributario/declaraciones' },
      { title: 'Pagos', href: '/tributario/pagos' },
      { title: 'Fiscalización', href: '/tributario/fiscalizacion' },
    ],
  },
  {
    title: 'Catastro',
    icon: MapPin,
    href: '/catastro',
    submenu: [
      { title: 'Parcelas', href: '/catastro/parcelas' },
      { title: 'Edificaciones', href: '/catastro/edificaciones' },
      { title: 'Propietarios', href: '/catastro/propietarios' },
      { title: 'Mapa Catastral', href: '/catastro/mapa' },
      { title: 'Valuación', href: '/catastro/valuacion' },
    ],
  },
  {
    title: 'Participación',
    icon: MessageSquare,
    href: '/participacion',
    submenu: [
      { title: 'Mesa de Control', href: '/participacion/reportes' },
      { title: 'Presupuesto Participativo', href: '/participacion/presupuesto' },
      { title: 'Portal de Transparencia', href: '/participacion/transparencia' },
    ],
  },
  {
    title: 'Flota',
    icon: Truck,
    href: '/flota',
    submenu: [
      { title: 'Vehículos', href: '/flota/vehiculos' },
      { title: 'Bitácora de Viajes', href: '/flota/bitacora' },
      { title: 'Control de Combustible', href: '/flota/combustible' },
      { title: 'Mantenimiento', href: '/flota/mantenimiento' },
      { title: 'Costo Total (TCO)', href: '/flota/tco' },
      { title: 'Dashboard', href: '/flota/dashboard' },
    ],
  },
  {
    title: 'Bienes',
    icon: Package,
    href: '/bienes',
    submenu: [
      { title: 'Gestión de Bienes', href: '/bienes/activos' },
      { title: 'Movimientos', href: '/bienes/movimientos' },
      { title: 'Mantenimientos', href: '/bienes/mantenimientos' },
      { title: 'Almacén', href: '/bienes/almacen' },
      { title: 'Solicitudes de Compra', href: '/bienes/compras' },
      { title: 'Reportes', href: '/bienes/reportes' },
    ],
  },
  {
    title: 'Documentos',
    icon: FileText,
    href: '/documentos',
    submenu: [
      { title: 'Mesa de Entrada', href: '/documentos/mesa-entrada' },
      { title: 'Oficios Internos', href: '/documentos/oficios' },
      { title: 'Expedientes', href: '/documentos/expedientes' },
      { title: 'Ordenanzas', href: '/documentos/ordenanzas' },
      { title: 'Firmas Pendientes', href: '/documentos/firmas' },
      { title: 'Búsqueda', href: '/documentos/busqueda' },
      { title: 'Workflows', href: '/documentos/workflows' },
    ],
  },
  {
    title: 'Servicios',
    icon: Wrench,
    href: '/servicios',
  },
  {
    title: 'Reportes',
    icon: BarChart3,
    href: '/reportes',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (title) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
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
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus[item.title];

          return (
            <div key={item.title}>
              <Link
                href={item.href}
                onClick={(e) => {
                  if (hasSubmenu && !collapsed) {
                    e.preventDefault();
                    toggleSubmenu(item.title);
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
                  {item.submenu.map((subitem) => {
                    const isSubActive = pathname === subitem.href;
                    return (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
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
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Link
          href="/configuracion"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Configuración' : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Configuración</span>}
        </Link>
      </div>
    </aside>
  );
}
