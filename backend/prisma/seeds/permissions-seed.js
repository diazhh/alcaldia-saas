import { PrismaClient } from '@prisma/client';
import { MODULES, ACTIONS, PERMISSIONS, ROLES } from '../../src/shared/constants/permissions.js';

const prisma = new PrismaClient();

/**
 * Seed de Permisos del Sistema
 * Crea todos los permisos y los asigna a roles según la matriz de permisos
 */
async function seedPermissions() {
  console.log('🔐 Iniciando seed de permisos...');

  try {
    // ============================================
    // 1. CREAR TODOS LOS PERMISOS
    // ============================================
    console.log('\n📝 Creando permisos...');

    const permissionsToCreate = [];

    // Iterar sobre todos los módulos
    for (const [moduleName, moduleKey] of Object.entries(MODULES)) {
      // Iterar sobre todas las acciones posibles
      for (const [actionName, actionKey] of Object.entries(ACTIONS)) {
        const permissionName = `${moduleKey}:${actionKey}`;
        const description = getPermissionDescription(moduleKey, actionKey);

        permissionsToCreate.push({
          name: permissionName,
          module: moduleKey,
          action: actionKey,
          description,
          isActive: true,
        });
      }
    }

    // Crear permisos en batch
    const createdPermissions = await prisma.permission.createMany({
      data: permissionsToCreate,
      skipDuplicates: true, // Evitar errores si ya existen
    });

    console.log(`✅ ${createdPermissions.count} permisos creados`);

    // ============================================
    // 2. ASIGNAR PERMISOS A ROLES
    // ============================================
    console.log('\n👥 Asignando permisos a roles...');

    // Obtener todos los permisos creados
    const allPermissions = await prisma.permission.findMany({
      select: {
        id: true,
        module: true,
        action: true,
      },
    });

    // Crear un mapa para búsqueda rápida
    const permissionMap = new Map();
    allPermissions.forEach(perm => {
      const key = `${perm.module}:${perm.action}`;
      permissionMap.set(key, perm.id);
    });

    const rolePermissionsToCreate = [];

    // Para cada módulo en PERMISSIONS
    for (const [module, roleActions] of Object.entries(PERMISSIONS)) {
      // Para cada rol en ese módulo
      for (const [role, actions] of Object.entries(roleActions)) {
        // Para cada acción que tiene ese rol
        for (const action of actions) {
          const permissionKey = `${module}:${action}`;
          const permissionId = permissionMap.get(permissionKey);

          if (permissionId) {
            rolePermissionsToCreate.push({
              role: role,
              permissionId: permissionId,
              canDelegate: role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN,
            });
          }
        }
      }
    }

    // Crear relaciones rol-permiso en batch
    const createdRolePermissions = await prisma.rolePermission.createMany({
      data: rolePermissionsToCreate,
      skipDuplicates: true,
    });

    console.log(`✅ ${createdRolePermissions.count} permisos de rol asignados`);

    // ============================================
    // 3. ESTADÍSTICAS
    // ============================================
    console.log('\n📊 Estadísticas de permisos:');

    for (const role of Object.values(ROLES)) {
      const count = await prisma.rolePermission.count({
        where: { role },
      });
      console.log(`   ${role}: ${count} permisos`);
    }

    console.log('\n✅ Seed de permisos completado exitosamente!');
  } catch (error) {
    console.error('❌ Error en seed de permisos:', error);
    throw error;
  }
}

/**
 * Obtiene la descripción de un permiso
 * @param {string} module - Módulo
 * @param {string} action - Acción
 * @returns {string} Descripción del permiso
 */
function getPermissionDescription(module, action) {
  const actionDescriptions = {
    create: 'Crear',
    read: 'Ver',
    update: 'Modificar',
    delete: 'Eliminar',
    approve: 'Aprobar',
    reject: 'Rechazar',
    export: 'Exportar',
    import: 'Importar',
    manage: 'Gestionar',
  };

  const moduleDescriptions = {
    // Core
    auth: 'Autenticación',
    users: 'Usuarios',
    departments: 'Departamentos',
    positions: 'Puestos',

    // Operativos
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

    // Participación
    petitions: 'Peticiones',
    complaints: 'Denuncias',
    suggestions: 'Sugerencias',

    // Servicios
    vehicles: 'Vehículos',
    maintenance: 'Mantenimiento',
    assets: 'Bienes',
    inventory: 'Inventario',
    documents: 'Documentos',
    archives: 'Archivos',
    public_services: 'Servicios Públicos',
    service_requests: 'Solicitudes de Servicio',

    // Reportes
    dashboards: 'Dashboards',
    reports: 'Reportes',
  };

  const actionDesc = actionDescriptions[action] || action;
  const moduleDesc = moduleDescriptions[module] || module;

  return `${actionDesc} ${moduleDesc}`;
}

/**
 * Limpiar permisos (opcional, para reiniciar)
 */
async function cleanPermissions() {
  console.log('🧹 Limpiando permisos existentes...');

  await prisma.userPermission.deleteMany({});
  console.log('   ✅ User permissions eliminados');

  await prisma.rolePermission.deleteMany({});
  console.log('   ✅ Role permissions eliminados');

  await prisma.permission.deleteMany({});
  console.log('   ✅ Permissions eliminados');

  console.log('✅ Limpieza completada');
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes('--clean');

  if (shouldClean) {
    await cleanPermissions();
  }

  await seedPermissions();
}

// Ejecutar seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedPermissions, cleanPermissions };
