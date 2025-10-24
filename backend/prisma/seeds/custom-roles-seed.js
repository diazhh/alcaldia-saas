import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definición de roles personalizados con sus permisos
const CUSTOM_ROLES = [
  // ==================== ROLES DE FINANZAS ====================
  {
    name: 'Director de Finanzas',
    description: 'Acceso completo al módulo de finanzas con capacidad de aprobación',
    category: 'FINANZAS',
    isSystem: true,
    permissions: [
      // Cajas Chicas - todos
      'finanzas.cajas_chicas.ver',
      'finanzas.cajas_chicas.crear',
      'finanzas.cajas_chicas.modificar',
      'finanzas.cajas_chicas.rendir',
      'finanzas.cajas_chicas.aprobar',
      'finanzas.cajas_chicas.reembolsar',
      'finanzas.cajas_chicas.cerrar',
      'finanzas.cajas_chicas.exportar',
      // Anticipos - todos
      'finanzas.anticipos.ver',
      'finanzas.anticipos.crear',
      'finanzas.anticipos.aprobar',
      'finanzas.anticipos.rechazar',
      'finanzas.anticipos.pagar',
      'finanzas.anticipos.descontar',
      // Cierre Contable - todos
      'finanzas.cierre.ver',
      'finanzas.cierre.iniciar',
      'finanzas.cierre.verificar',
      'finanzas.cierre.aprobar',
      'finanzas.cierre.reabrir',
      // Presupuesto - todos
      'finanzas.presupuesto.ver',
      'finanzas.presupuesto.modificar',
      'finanzas.presupuesto.aprobar',
      'finanzas.presupuesto.ejecutar',
      'finanzas.presupuesto.reportes',
      // Conciliación - todos
      'finanzas.conciliacion.ver',
      'finanzas.conciliacion.crear',
      'finanzas.conciliacion.conciliar',
      'finanzas.conciliacion.aprobar',
      // Programación de Pagos
      'finanzas.programacion.ver',
      'finanzas.programacion.crear',
      'finanzas.programacion.modificar',
      'finanzas.programacion.aprobar',
      // Flujo de Caja
      'finanzas.flujo_caja.ver',
      'finanzas.flujo_caja.proyectar',
      'finanzas.flujo_caja.exportar',
    ],
  },
  {
    name: 'Supervisor de Finanzas',
    description: 'Puede ver, crear y aprobar operaciones de nivel medio en finanzas',
    category: 'FINANZAS',
    isSystem: true,
    permissions: [
      // Cajas Chicas - supervisión
      'finanzas.cajas_chicas.ver',
      'finanzas.cajas_chicas.crear',
      'finanzas.cajas_chicas.rendir',
      'finanzas.cajas_chicas.aprobar',
      'finanzas.cajas_chicas.exportar',
      // Anticipos - supervisión
      'finanzas.anticipos.ver',
      'finanzas.anticipos.crear',
      'finanzas.anticipos.aprobar',
      'finanzas.anticipos.pagar',
      // Presupuesto - consulta
      'finanzas.presupuesto.ver',
      'finanzas.presupuesto.reportes',
      // Conciliación - consulta
      'finanzas.conciliacion.ver',
      'finanzas.conciliacion.crear',
      // Flujo de Caja
      'finanzas.flujo_caja.ver',
      'finanzas.flujo_caja.exportar',
    ],
  },
  {
    name: 'Analista Financiero Senior',
    description: 'Puede crear y gestionar transacciones pero requiere aprobación superior',
    category: 'FINANZAS',
    isSystem: true,
    permissions: [
      'finanzas.cajas_chicas.ver',
      'finanzas.cajas_chicas.crear',
      'finanzas.cajas_chicas.modificar',
      'finanzas.cajas_chicas.rendir',
      'finanzas.cajas_chicas.exportar',
      'finanzas.anticipos.ver',
      'finanzas.anticipos.crear',
      'finanzas.presupuesto.ver',
      'finanzas.presupuesto.reportes',
      'finanzas.conciliacion.ver',
      'finanzas.conciliacion.crear',
      'finanzas.programacion.ver',
      'finanzas.programacion.crear',
      'finanzas.flujo_caja.ver',
      'finanzas.flujo_caja.proyectar',
    ],
  },
  {
    name: 'Cajero',
    description: 'Manejo de cajas chicas y registro de transacciones diarias',
    category: 'FINANZAS',
    isSystem: true,
    permissions: [
      'finanzas.cajas_chicas.ver',
      'finanzas.cajas_chicas.crear',
      'finanzas.cajas_chicas.rendir',
      'finanzas.anticipos.ver',
      'finanzas.anticipos.pagar',
    ],
  },
  {
    name: 'Tesorero',
    description: 'Gestión de tesorería, pagos y conciliaciones bancarias',
    category: 'FINANZAS',
    isSystem: true,
    permissions: [
      'finanzas.cajas_chicas.ver',
      'finanzas.cajas_chicas.aprobar',
      'finanzas.cajas_chicas.reembolsar',
      'finanzas.anticipos.ver',
      'finanzas.anticipos.aprobar',
      'finanzas.anticipos.pagar',
      'finanzas.conciliacion.ver',
      'finanzas.conciliacion.crear',
      'finanzas.conciliacion.conciliar',
      'finanzas.programacion.ver',
      'finanzas.programacion.crear',
      'finanzas.programacion.modificar',
      'finanzas.flujo_caja.ver',
      'finanzas.flujo_caja.proyectar',
    ],
  },

  // ==================== ROLES DE RRHH ====================
  {
    name: 'Director de RRHH',
    description: 'Acceso completo al módulo de recursos humanos',
    category: 'RRHH',
    isSystem: true,
    permissions: [
      // Empleados
      'rrhh.empleados.ver',
      'rrhh.empleados.crear',
      'rrhh.empleados.modificar',
      'rrhh.empleados.inactivar',
      'rrhh.empleados.exportar',
      // Nómina
      'rrhh.nomina.ver',
      'rrhh.nomina.generar',
      'rrhh.nomina.aprobar',
      'rrhh.nomina.procesar',
      'rrhh.nomina.exportar',
      // Asistencia
      'rrhh.asistencia.ver',
      'rrhh.asistencia.registrar',
      'rrhh.asistencia.modificar',
      'rrhh.asistencia.reportes',
      // Vacaciones
      'rrhh.vacaciones.ver',
      'rrhh.vacaciones.solicitar',
      'rrhh.vacaciones.aprobar',
      'rrhh.vacaciones.rechazar',
      // Permisos
      'rrhh.permisos.ver',
      'rrhh.permisos.solicitar',
      'rrhh.permisos.aprobar',
      'rrhh.permisos.rechazar',
      // Evaluaciones
      'rrhh.evaluaciones.ver',
      'rrhh.evaluaciones.crear',
      'rrhh.evaluaciones.evaluar',
      // Capacitación
      'rrhh.capacitacion.ver',
      'rrhh.capacitacion.crear',
      'rrhh.capacitacion.inscribir',
    ],
  },
  {
    name: 'Supervisor de Nómina',
    description: 'Gestión y procesamiento de nóminas',
    category: 'RRHH',
    isSystem: true,
    permissions: [
      'rrhh.empleados.ver',
      'rrhh.nomina.ver',
      'rrhh.nomina.generar',
      'rrhh.nomina.aprobar',
      'rrhh.nomina.procesar',
      'rrhh.nomina.exportar',
      'rrhh.asistencia.ver',
      'rrhh.asistencia.reportes',
    ],
  },
  {
    name: 'Analista de RRHH',
    description: 'Gestión de expedientes, asistencia y evaluaciones',
    category: 'RRHH',
    isSystem: true,
    permissions: [
      'rrhh.empleados.ver',
      'rrhh.empleados.crear',
      'rrhh.empleados.modificar',
      'rrhh.asistencia.ver',
      'rrhh.asistencia.registrar',
      'rrhh.asistencia.reportes',
      'rrhh.vacaciones.ver',
      'rrhh.permisos.ver',
      'rrhh.evaluaciones.ver',
      'rrhh.evaluaciones.crear',
      'rrhh.capacitacion.ver',
      'rrhh.capacitacion.crear',
      'rrhh.capacitacion.inscribir',
    ],
  },

  // ==================== ROLES DE TRIBUTARIO ====================
  {
    name: 'Director Tributario',
    description: 'Acceso completo al módulo tributario',
    category: 'TRIBUTARIO',
    isSystem: true,
    permissions: [
      'tributario.contribuyentes.ver',
      'tributario.contribuyentes.crear',
      'tributario.contribuyentes.modificar',
      'tributario.tributos.ver',
      'tributario.tributos.crear',
      'tributario.tributos.modificar',
      'tributario.liquidaciones.ver',
      'tributario.liquidaciones.generar',
      'tributario.liquidaciones.anular',
      'tributario.pagos.ver',
      'tributario.pagos.registrar',
      'tributario.pagos.anular',
      'tributario.solvencias.ver',
      'tributario.solvencias.generar',
      'tributario.solvencias.aprobar',
      'tributario.reportes.ver',
      'tributario.reportes.exportar',
      'tributario.estadisticas.ver',
    ],
  },
  {
    name: 'Analista Tributario',
    description: 'Gestión de contribuyentes y liquidaciones',
    category: 'TRIBUTARIO',
    isSystem: true,
    permissions: [
      'tributario.contribuyentes.ver',
      'tributario.contribuyentes.crear',
      'tributario.contribuyentes.modificar',
      'tributario.tributos.ver',
      'tributario.liquidaciones.ver',
      'tributario.liquidaciones.generar',
      'tributario.pagos.ver',
      'tributario.pagos.registrar',
      'tributario.solvencias.ver',
      'tributario.solvencias.generar',
      'tributario.reportes.ver',
      'tributario.estadisticas.ver',
    ],
  },

  // ==================== ROLES DE PROYECTOS ====================
  {
    name: 'Director de Proyectos',
    description: 'Gestión completa de proyectos municipales',
    category: 'PROYECTOS',
    isSystem: true,
    permissions: [
      'proyectos.proyectos.ver',
      'proyectos.proyectos.crear',
      'proyectos.proyectos.modificar',
      'proyectos.proyectos.cerrar',
      'proyectos.presupuesto.ver',
      'proyectos.presupuesto.modificar',
      'proyectos.presupuesto.aprobar',
      'proyectos.avances.ver',
      'proyectos.avances.registrar',
      'proyectos.inspecciones.ver',
      'proyectos.inspecciones.realizar',
      'proyectos.reportes.ver',
    ],
  },
  {
    name: 'Supervisor de Obras',
    description: 'Supervisión de avances e inspecciones de obras',
    category: 'PROYECTOS',
    isSystem: true,
    permissions: [
      'proyectos.proyectos.ver',
      'proyectos.presupuesto.ver',
      'proyectos.avances.ver',
      'proyectos.avances.registrar',
      'proyectos.inspecciones.ver',
      'proyectos.inspecciones.realizar',
      'proyectos.reportes.ver',
    ],
  },

  // ==================== ROLES DE ADMINISTRACIÓN ====================
  {
    name: 'Administrador de Sistema',
    description: 'Gestión completa de usuarios, roles y permisos',
    category: 'ADMIN',
    isSystem: true,
    permissions: [
      'admin.usuarios.ver',
      'admin.usuarios.crear',
      'admin.usuarios.modificar',
      'admin.usuarios.inactivar',
      'admin.usuarios.asignar_rol',
      'admin.usuarios.resetear_clave',
      'admin.roles.ver',
      'admin.roles.crear',
      'admin.roles.modificar',
      'admin.roles.eliminar',
      'admin.roles.asignar_permisos',
      'admin.permisos.ver',
      'admin.permisos.modificar',
      'admin.permisos.excepciones',
    ],
  },
];

async function seedCustomRoles() {
  console.log('🎭 Iniciando seed de roles personalizados...\n');

  let rolesCreated = 0;
  let permissionsAssigned = 0;

  for (const roleData of CUSTOM_ROLES) {
    const { name, description, category, isSystem, permissions } = roleData;

    // Crear o actualizar el rol
    const role = await prisma.customRole.upsert({
      where: { name },
      update: {
        description,
        isSystem,
        isActive: true,
      },
      create: {
        name,
        description,
        isSystem,
        isActive: true,
      },
    });

    console.log(`   ✓ Rol: ${name} (${category})`);
    rolesCreated++;

    // Asignar permisos al rol
    for (const permissionName of permissions) {
      // Buscar el permiso
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        console.log(`      ⚠️  Permiso no encontrado: ${permissionName}`);
        continue;
      }

      // Crear la relación rol-permiso
      await prisma.customRolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      permissionsAssigned++;
    }

    console.log(`      ${permissions.length} permisos asignados\n`);
  }

  console.log(`\n✅ ${rolesCreated} roles personalizados creados`);
  console.log(`✅ ${permissionsAssigned} permisos asignados a roles\n`);

  // Mostrar resumen por categoría
  console.log('📊 Resumen por categoría:');
  const byCategory = {};
  CUSTOM_ROLES.forEach(role => {
    if (!byCategory[role.category]) {
      byCategory[role.category] = 0;
    }
    byCategory[role.category]++;
  });

  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} roles`);
  });

  console.log('\n✅ Seed de roles personalizados completado!');
}

seedCustomRoles()
  .catch((error) => {
    console.error('❌ Error en seed de roles:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
