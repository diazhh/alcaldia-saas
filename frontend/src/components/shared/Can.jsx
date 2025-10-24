'use client';

import { usePermissions } from '@/hooks/usePermissions';

/**
 * Componente para renderizado condicional basado en permisos
 * Muestra el contenido solo si el usuario tiene el permiso especificado
 *
 * @param {Object} props
 * @param {string} props.module - Módulo del sistema
 * @param {string} props.action - Acción requerida
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene permiso
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si NO tiene permiso
 * @returns {React.ReactNode}
 *
 * @example
 * <Can module="projects" action="create">
 *   <Button>Crear Proyecto</Button>
 * </Can>
 *
 * @example
 * <Can module="projects" action="delete" fallback={<span>No autorizado</span>}>
 *   <Button variant="destructive">Eliminar</Button>
 * </Can>
 */
export function Can({ module, action, children, fallback = null }) {
  const { can, loading } = usePermissions();

  // Mientras carga, no mostrar nada (o podrías mostrar un skeleton)
  if (loading) {
    return null;
  }

  // Verificar permiso
  if (!can(module, action)) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Componente para verificar múltiples permisos (OR logic)
 * Muestra el contenido si el usuario tiene AL MENOS UNO de los permisos
 *
 * @param {Object} props
 * @param {Array<string>} props.permissions - Array de permisos en formato "module:action"
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene algún permiso
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si NO tiene ningún permiso
 * @returns {React.ReactNode}
 *
 * @example
 * <CanAny permissions={['projects:create', 'projects:update']}>
 *   <Button>Gestionar Proyecto</Button>
 * </CanAny>
 */
export function CanAny({ permissions, children, fallback = null }) {
  const { canAny, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!canAny(permissions)) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Componente para verificar múltiples permisos (AND logic)
 * Muestra el contenido solo si el usuario tiene TODOS los permisos
 *
 * @param {Object} props
 * @param {Array<string>} props.permissions - Array de permisos en formato "module:action"
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene todos los permisos
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si NO tiene todos
 * @returns {React.ReactNode}
 *
 * @example
 * <CanAll permissions={['budgets:approve', 'budgets:update']}>
 *   <Button>Aprobar Presupuesto</Button>
 * </CanAll>
 */
export function CanAll({ permissions, children, fallback = null }) {
  const { canAll, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!canAll(permissions)) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Componente para verificar acceso a módulo
 * Muestra el contenido si el usuario tiene acceso al módulo (al menos READ)
 *
 * @param {Object} props
 * @param {string} props.module - Módulo del sistema
 * @param {React.ReactNode} props.children - Contenido a renderizar si tiene acceso
 * @param {React.ReactNode} props.fallback - Contenido a renderizar si NO tiene acceso
 * @returns {React.ReactNode}
 *
 * @example
 * <CanAccessModule module="projects">
 *   <ProjectsList />
 * </CanAccessModule>
 */
export function CanAccessModule({ module, children, fallback = null }) {
  const { canAccessModule, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (!canAccessModule(module)) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * HOC (Higher-Order Component) para proteger componentes con permisos
 *
 * @param {React.Component} Component - Componente a proteger
 * @param {string} module - Módulo requerido
 * @param {string} action - Acción requerida
 * @returns {React.Component} Componente protegido
 *
 * @example
 * const ProtectedComponent = withPermission(MyComponent, 'projects', 'create');
 */
export function withPermission(Component, module, action) {
  return function ProtectedComponent(props) {
    return (
      <Can
        module={module}
        action={action}
        fallback={
          <div className="p-6 text-center">
            <p className="text-gray-600">
              No tienes permiso para acceder a esta sección
            </p>
          </div>
        }
      >
        <Component {...props} />
      </Can>
    );
  };
}

/**
 * Componente para mostrar contenido solo si es Admin
 *
 * @example
 * <IsAdmin>
 *   <AdminPanel />
 * </IsAdmin>
 */
export function IsAdmin({ children, fallback = null }) {
  const { isAdmin, loading } = usePermissions();

  if (loading) return null;
  if (!isAdmin()) return fallback;

  return <>{children}</>;
}

/**
 * Componente para mostrar contenido solo si es Super Admin
 *
 * @example
 * <IsSuperAdmin>
 *   <SystemSettings />
 * </IsSuperAdmin>
 */
export function IsSuperAdmin({ children, fallback = null }) {
  const { isSuperAdmin, loading } = usePermissions();

  if (loading) return null;
  if (!isSuperAdmin()) return fallback;

  return <>{children}</>;
}
