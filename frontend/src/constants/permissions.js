/**
 * Constantes de Módulos y Acciones para el Sistema de Permisos
 * @module constants/permissions
 */

/**
 * Módulos del sistema (debe coincidir con el backend)
 */
export const MODULES = {
  // Core
  AUTH: 'auth',
  USERS: 'users',
  DEPARTMENTS: 'departments',
  POSITIONS: 'positions',

  // Proyectos
  PROJECTS: 'projects',
  TASKS: 'tasks',

  // Finanzas
  BUDGETS: 'budgets',
  EXPENSES: 'expenses',
  INCOME: 'income',

  // RRHH
  EMPLOYEES: 'employees',
  PAYROLL: 'payroll',
  ATTENDANCE: 'attendance',

  // Tributario
  TAXES: 'taxes',
  TAX_PAYERS: 'tax_payers',

  // Catastro
  PROPERTIES: 'properties',
  CADASTRE: 'cadastre',

  // Participación
  PETITIONS: 'petitions',
  COMPLAINTS: 'complaints',
  SUGGESTIONS: 'suggestions',

  // Flota
  VEHICLES: 'vehicles',
  MAINTENANCE: 'maintenance',

  // Bienes
  ASSETS: 'assets',
  INVENTORY: 'inventory',

  // Documentos
  DOCUMENTS: 'documents',
  ARCHIVES: 'archives',

  // Servicios
  PUBLIC_SERVICES: 'public_services',
  SERVICE_REQUESTS: 'service_requests',

  // Reportes
  DASHBOARDS: 'dashboards',
  REPORTS: 'reports',
};

/**
 * Acciones disponibles (debe coincidir con el backend)
 */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
  IMPORT: 'import',
  MANAGE: 'manage',
};

/**
 * Mapeo de rutas a módulos
 * Usado para determinar qué módulo corresponde a cada ruta
 */
export const ROUTE_MODULE_MAP = {
  '/': MODULES.DASHBOARDS,
  '/organizacion': MODULES.DEPARTMENTS,
  '/proyectos': MODULES.PROJECTS,
  '/finanzas': MODULES.BUDGETS,
  '/rrhh': MODULES.EMPLOYEES,
  '/tributario': MODULES.TAXES,
  '/catastro': MODULES.PROPERTIES,
  '/participacion': MODULES.PETITIONS,
  '/flota': MODULES.VEHICLES,
  '/bienes': MODULES.ASSETS,
  '/documentos': MODULES.DOCUMENTS,
  '/servicios': MODULES.PUBLIC_SERVICES,
  '/reportes': MODULES.REPORTS,
};

/**
 * Helper para crear nombre de permiso
 * @param {string} module - Módulo
 * @param {string} action - Acción
 * @returns {string} Nombre del permiso (ej: "projects:create")
 */
export function createPermissionKey(module, action) {
  return `${module}:${action}`;
}

/**
 * Helper para parsear nombre de permiso
 * @param {string} permissionKey - Clave del permiso (ej: "projects:create")
 * @returns {Object} { module, action }
 */
export function parsePermissionKey(permissionKey) {
  const [module, action] = permissionKey.split(':');
  return { module, action };
}

/**
 * Descripciones legibles de permisos para UI
 */
export const PERMISSION_LABELS = {
  // Acciones
  create: 'Crear',
  read: 'Ver',
  update: 'Modificar',
  delete: 'Eliminar',
  approve: 'Aprobar',
  reject: 'Rechazar',
  export: 'Exportar',
  import: 'Importar',
  manage: 'Gestionar',

  // Módulos
  auth: 'Autenticación',
  users: 'Usuarios',
  departments: 'Departamentos',
  positions: 'Puestos',
  projects: 'Proyectos',
  tasks: 'Tareas',
  budgets: 'Presupuestos',
  expenses: 'Gastos',
  income: 'Ingresos',
  employees: 'Empleados',
  payroll: 'Nómina',
  attendance: 'Asistencia',
  taxes: 'Impuestos',
  tax_payers: 'Contribuyentes',
  properties: 'Propiedades',
  cadastre: 'Catastro',
  petitions: 'Peticiones',
  complaints: 'Denuncias',
  suggestions: 'Sugerencias',
  vehicles: 'Vehículos',
  maintenance: 'Mantenimiento',
  assets: 'Bienes',
  inventory: 'Inventario',
  documents: 'Documentos',
  archives: 'Archivos',
  public_services: 'Servicios Públicos',
  service_requests: 'Solicitudes',
  dashboards: 'Dashboards',
  reports: 'Reportes',
};

/**
 * Obtener etiqueta legible de un módulo
 * @param {string} module - Módulo
 * @returns {string} Etiqueta legible
 */
export function getModuleLabel(module) {
  return PERMISSION_LABELS[module] || module;
}

/**
 * Obtener etiqueta legible de una acción
 * @param {string} action - Acción
 * @returns {string} Etiqueta legible
 */
export function getActionLabel(action) {
  return PERMISSION_LABELS[action] || action;
}

/**
 * Obtener etiqueta completa de un permiso
 * @param {string} module - Módulo
 * @param {string} action - Acción
 * @returns {string} Etiqueta completa (ej: "Crear Proyectos")
 */
export function getPermissionLabel(module, action) {
  const actionLabel = getActionLabel(action);
  const moduleLabel = getModuleLabel(module);
  return `${actionLabel} ${moduleLabel}`;
}

/**
 * Permisos Granulares del Sistema (formato: module.feature.action)
 * Estos corresponden a los permisos creados en el backend
 */
export const GRANULAR_PERMISSIONS = {
  // FINANZAS
  FINANZAS: {
    CAJAS_CHICAS: {
      VER: 'finanzas.cajas_chicas.ver',
      CREAR: 'finanzas.cajas_chicas.crear',
      MODIFICAR: 'finanzas.cajas_chicas.modificar',
      RENDIR: 'finanzas.cajas_chicas.rendir',
      APROBAR: 'finanzas.cajas_chicas.aprobar',
      REEMBOLSAR: 'finanzas.cajas_chicas.reembolsar',
      CERRAR: 'finanzas.cajas_chicas.cerrar',
      EXPORTAR: 'finanzas.cajas_chicas.exportar',
    },
    ANTICIPOS: {
      VER: 'finanzas.anticipos.ver',
      CREAR: 'finanzas.anticipos.crear',
      APROBAR: 'finanzas.anticipos.aprobar',
      RECHAZAR: 'finanzas.anticipos.rechazar',
      PAGAR: 'finanzas.anticipos.pagar',
      DESCONTAR: 'finanzas.anticipos.descontar',
    },
    CIERRE: {
      VER: 'finanzas.cierre.ver',
      INICIAR: 'finanzas.cierre.iniciar',
      VERIFICAR: 'finanzas.cierre.verificar',
      APROBAR: 'finanzas.cierre.aprobar',
    },
    PRESUPUESTO: {
      VER: 'finanzas.presupuesto.ver',
      MODIFICAR: 'finanzas.presupuesto.modificar',
      EXPORTAR: 'finanzas.presupuesto.exportar',
    },
    CONCILIACION: {
      VER: 'finanzas.conciliacion.ver',
      CREAR: 'finanzas.conciliacion.crear',
      APROBAR: 'finanzas.conciliacion.aprobar',
      EXPORTAR: 'finanzas.conciliacion.exportar',
    },
    TESORERIA: {
      VER_CUENTAS: 'finanzas.tesoreria.ver_cuentas',
      CREAR_CUENTA: 'finanzas.tesoreria.crear_cuenta',
      VER_MOVIMIENTOS: 'finanzas.tesoreria.ver_movimientos',
      REGISTRAR_INGRESO: 'finanzas.tesoreria.registrar_ingreso',
      REGISTRAR_EGRESO: 'finanzas.tesoreria.registrar_egreso',
      APROBAR_MOVIMIENTO: 'finanzas.tesoreria.aprobar_movimiento',
      TRANSFERIR: 'finanzas.tesoreria.transferir',
      EXPORTAR: 'finanzas.tesoreria.exportar',
      VER_SALDOS: 'finanzas.tesoreria.ver_saldos',
      VER_REPORTES: 'finanzas.tesoreria.ver_reportes',
    },
  },

  // RRHH
  RRHH: {
    EMPLEADOS: {
      VER: 'rrhh.empleados.ver',
      CREAR: 'rrhh.empleados.crear',
      MODIFICAR: 'rrhh.empleados.modificar',
      INACTIVAR: 'rrhh.empleados.inactivar',
      EXPORTAR: 'rrhh.empleados.exportar',
    },
    NOMINA: {
      VER: 'rrhh.nomina.ver',
      GENERAR: 'rrhh.nomina.generar',
      APROBAR: 'rrhh.nomina.aprobar',
      EXPORTAR: 'rrhh.nomina.exportar',
      CONCEPTOS: 'rrhh.nomina.conceptos',
    },
    ASISTENCIA: {
      VER: 'rrhh.asistencia.ver',
      REGISTRAR: 'rrhh.asistencia.registrar',
      MODIFICAR: 'rrhh.asistencia.modificar',
    },
    VACACIONES: {
      VER: 'rrhh.vacaciones.ver',
      SOLICITAR: 'rrhh.vacaciones.solicitar',
      APROBAR: 'rrhh.vacaciones.aprobar',
      RECHAZAR: 'rrhh.vacaciones.rechazar',
    },
  },

  // TRIBUTARIO
  TRIBUTARIO: {
    CONTRIBUYENTES: {
      VER: 'tributario.contribuyentes.ver',
      CREAR: 'tributario.contribuyentes.crear',
      MODIFICAR: 'tributario.contribuyentes.modificar',
    },
    PAGOS: {
      VER: 'tributario.pagos.ver',
      REGISTRAR: 'tributario.pagos.registrar',
      ANULAR: 'tributario.pagos.anular',
    },
    SOLVENCIAS: {
      VER: 'tributario.solvencias.ver',
      GENERAR: 'tributario.solvencias.generar',
      APROBAR: 'tributario.solvencias.aprobar',
    },
    NEGOCIOS: {
      VER: 'tributario.negocios.ver',
      CREAR: 'tributario.negocios.crear',
      MODIFICAR: 'tributario.negocios.modificar',
    },
    VEHICULOS: {
      VER: 'tributario.vehiculos.ver',
      CREAR: 'tributario.vehiculos.crear',
      MODIFICAR: 'tributario.vehiculos.modificar',
    },
    PROPIEDADES: {
      VER: 'tributario.propiedades.ver',
      CREAR: 'tributario.propiedades.crear',
      MODIFICAR: 'tributario.propiedades.modificar',
    },
  },

  // PROYECTOS
  PROYECTOS: {
    GASTOS: {
      VER: 'proyectos.gastos.ver',
      CREAR: 'proyectos.gastos.crear',
      APROBAR: 'proyectos.gastos.aprobar',
      EXPORTAR: 'proyectos.gastos.exportar',
    },
    FOTOS: {
      VER: 'proyectos.fotos.ver',
      SUBIR: 'proyectos.fotos.subir',
      ELIMINAR: 'proyectos.fotos.eliminar',
    },
    AVANCES: {
      VER: 'proyectos.avances.ver',
      CREAR: 'proyectos.avances.crear',
      APROBAR: 'proyectos.avances.aprobar',
      REPORTES: 'proyectos.avances.reportes',
    },
  },

  // ADMIN
  ADMIN: {
    USUARIOS: {
      VER: 'admin.usuarios.ver',
      CREAR: 'admin.usuarios.crear',
      MODIFICAR: 'admin.usuarios.modificar',
      INACTIVAR: 'admin.usuarios.inactivar',
      ASIGNAR_ROL: 'admin.usuarios.asignar_rol',
      RESETEAR_CLAVE: 'admin.usuarios.resetear_clave',
    },
    ROLES: {
      VER: 'admin.roles.ver',
      CREAR: 'admin.roles.crear',
      MODIFICAR: 'admin.roles.modificar',
      ELIMINAR: 'admin.roles.eliminar',
      ASIGNAR_PERMISOS: 'admin.roles.asignar_permisos',
    },
    PERMISOS: {
      VER: 'admin.permisos.ver',
      MODIFICAR: 'admin.permisos.modificar',
      EXCEPCIONES: 'admin.permisos.excepciones',
    },
  },
};
