import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

/**
 * Hook para gestión de permisos en el frontend
 * Proporciona funciones para verificar permisos del usuario
 *
 * @returns {Object} Objeto con permisos y funciones de verificación
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuthStore();
  const [permissions, setPermissions] = useState({});

  // Cargar permisos del usuario desde el backend
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      const response = await api.get('/permissions/me');
      return response.data?.data || {};
    },
    enabled: !!user && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
  });

  // Actualizar permissions cuando cambie la data
  useEffect(() => {
    if (data) {
      console.log('[usePermissions] Permisos cargados:', Object.keys(data).length, 'módulos');
      setPermissions(data);
    }
  }, [data]);

  /**
   * Verificar si el usuario tiene un permiso específico
   * Soporta formato antiguo (module, action) y nuevo (permissionName)
   * @param {string} moduleOrPermission - Módulo del sistema o nombre completo del permiso
   * @param {string} action - Acción a verificar (opcional para formato granular)
   * @returns {boolean} true si tiene permiso, false en caso contrario
   *
   * @example
   * // Formato antiguo
   * can('finanzas', 'ver')
   *
   * // Formato granular (recomendado)
   * can('finanzas.cajas_chicas.aprobar')
   */
  const can = (moduleOrPermission, action = null) => {
    // Si no hay usuario, no tiene permisos
    if (!user) return false;

    // SUPER_ADMIN tiene acceso a todo
    if (user.role === 'SUPER_ADMIN') return true;

    // Si se proporciona action, usar formato antiguo
    if (action) {
      return permissions[moduleOrPermission]?.includes(action) || false;
    }

    // Formato granular: buscar en todos los módulos
    // El permiso puede estar como "finanzas.cajas_chicas.aprobar" en el array de finanzas
    const parts = moduleOrPermission.split('.');
    if (parts.length >= 2) {
      const [module] = parts;
      // Buscar el permiso completo en el módulo correspondiente
      return permissions[module]?.includes(moduleOrPermission) || false;
    }

    // Si no tiene puntos, asumir que es un módulo y verificar acceso básico
    return permissions[moduleOrPermission]?.length > 0 || false;
  };

  /**
   * Verificar si tiene alguno de los permisos especificados (OR logic)
   * Soporta formato antiguo "module:action" y nuevo "module.feature.action"
   * @param {Array<string>} permissionsArray - Array de permisos
   * @returns {boolean} true si tiene al menos uno
   *
   * @example
   * // Formato antiguo
   * canAny(['projects:create', 'projects:update'])
   *
   * // Formato granular
   * canAny(['finanzas.cajas_chicas.aprobar', 'finanzas.cajas_chicas.crear'])
   */
  const canAny = (permissionsArray) => {
    if (!Array.isArray(permissionsArray)) return false;

    return permissionsArray.some(perm => {
      // Si tiene ':', es formato antiguo
      if (perm.includes(':')) {
        const [module, action] = perm.split(':');
        return can(module, action);
      }
      // Si tiene '.', es formato granular
      return can(perm);
    });
  };

  /**
   * Verificar si tiene todos los permisos especificados (AND logic)
   * Soporta formato antiguo "module:action" y nuevo "module.feature.action"
   * @param {Array<string>} permissionsArray - Array de permisos
   * @returns {boolean} true si tiene todos
   *
   * @example
   * // Formato antiguo
   * canAll(['projects:create', 'projects:update'])
   *
   * // Formato granular
   * canAll(['finanzas.cajas_chicas.aprobar', 'finanzas.cajas_chicas.crear'])
   */
  const canAll = (permissionsArray) => {
    if (!Array.isArray(permissionsArray)) return false;

    return permissionsArray.every(perm => {
      // Si tiene ':', es formato antiguo
      if (perm.includes(':')) {
        const [module, action] = perm.split(':');
        return can(module, action);
      }
      // Si tiene '.', es formato granular
      return can(perm);
    });
  };

  /**
   * Verificar si tiene acceso a un módulo (al menos READ)
   * @param {string} module - Módulo del sistema
   * @returns {boolean} true si tiene acceso
   *
   * @example
   * canAccessModule('projects')
   */
  const canAccessModule = (module) => {
    if (!user) {
      console.log('[canAccessModule] No user');
      return false;
    }
    if (user.role === 'SUPER_ADMIN') return true;

    const hasAccess = can(module, 'read') || can(module, 'manage');
    console.log(`[canAccessModule] ${module}:`, hasAccess, '| perms:', permissions[module]);
    return hasAccess;
  };

  /**
   * Obtener todas las acciones permitidas para un módulo
   * @param {string} module - Módulo del sistema
   * @returns {Array<string>} Array de acciones permitidas
   *
   * @example
   * getModuleActions('projects') // ['create', 'read', 'update']
   */
  const getModuleActions = (module) => {
    if (!user) return [];
    if (user.role === 'SUPER_ADMIN') {
      return ['create', 'read', 'update', 'delete', 'export', 'approve', 'manage'];
    }

    return permissions[module] || [];
  };

  /**
   * Verificar si tiene permiso de crear
   * @param {string} module - Módulo del sistema
   * @returns {boolean}
   */
  const canCreate = (module) => can(module, 'create');

  /**
   * Verificar si tiene permiso de leer
   * @param {string} module - Módulo del sistema
   * @returns {boolean}
   */
  const canRead = (module) => can(module, 'read');

  /**
   * Verificar si tiene permiso de actualizar
   * @param {string} module - Módulo del sistema
   * @returns {boolean}
   */
  const canUpdate = (module) => can(module, 'update');

  /**
   * Verificar si tiene permiso de eliminar
   * @param {string} module - Módulo del sistema
   * @returns {boolean}
   */
  const canDelete = (module) => can(module, 'delete');

  /**
   * Verificar si tiene permiso de exportar
   * @param {string} module - Módulo del sistema
   * @returns {boolean}
   */
  const canExport = (module) => can(module, 'export');

  /**
   * Verificar si tiene permiso de aprobar
   * @param {string} module - Módulo del sistema
   * @returns {boolean}
   */
  const canApprove = (module) => can(module, 'approve');

  /**
   * Verificar si puede gestionar el módulo completo
   * @param {string} module - Módulo del sistema
   * @returns {boolean}
   */
  const canManage = (module) => can(module, 'manage');

  /**
   * Verificar si es administrador
   * @returns {boolean}
   */
  const isAdmin = () => {
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
  };

  /**
   * Verificar si es super admin
   * @returns {boolean}
   */
  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN';
  };

  /**
   * Refrescar permisos desde el servidor
   */
  const refreshPermissions = () => {
    refetch();
  };

  return {
    // Estado
    permissions,
    loading: isLoading,
    error,

    // Funciones de verificación
    can,
    canAny,
    canAll,
    canAccessModule,
    getModuleActions,

    // Shortcuts para acciones comunes
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canExport,
    canApprove,
    canManage,

    // Verificaciones de rol
    isAdmin,
    isSuperAdmin,

    // Utilidades
    refreshPermissions,
  };
}
