import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Permisos Granulares del Sistema
 * Formato: module.feature.action
 */

const GRANULAR_PERMISSIONS = [
  // ============================================
  // FINANZAS
  // ============================================

  // Dashboard Financiero
  { name: 'finanzas.dashboard.ver', module: 'finanzas', feature: 'dashboard', action: 'ver', displayName: 'Ver Dashboard Financiero', category: 'FINANZAS' },
  { name: 'finanzas.dashboard.exportar', module: 'finanzas', feature: 'dashboard', action: 'exportar', displayName: 'Exportar Dashboard Financiero', category: 'FINANZAS' },

  // Presupuesto
  { name: 'finanzas.presupuesto.ver', module: 'finanzas', feature: 'presupuesto', action: 'ver', displayName: 'Ver Presupuesto', category: 'FINANZAS' },
  { name: 'finanzas.presupuesto.crear', module: 'finanzas', feature: 'presupuesto', action: 'crear', displayName: 'Crear Partida Presupuestaria', category: 'FINANZAS' },
  { name: 'finanzas.presupuesto.modificar', module: 'finanzas', feature: 'presupuesto', action: 'modificar', displayName: 'Modificar Presupuesto', category: 'FINANZAS' },
  { name: 'finanzas.presupuesto.eliminar', module: 'finanzas', feature: 'presupuesto', action: 'eliminar', displayName: 'Eliminar Partida', category: 'FINANZAS' },
  { name: 'finanzas.presupuesto.exportar', module: 'finanzas', feature: 'presupuesto', action: 'exportar', displayName: 'Exportar Presupuesto', category: 'FINANZAS' },

  // Cajas Chicas
  { name: 'finanzas.cajas_chicas.ver', module: 'finanzas', feature: 'cajas_chicas', action: 'ver', displayName: 'Ver Cajas Chicas', category: 'FINANZAS' },
  { name: 'finanzas.cajas_chicas.crear', module: 'finanzas', feature: 'cajas_chicas', action: 'crear', displayName: 'Crear Caja Chica', category: 'FINANZAS' },
  { name: 'finanzas.cajas_chicas.modificar', module: 'finanzas', feature: 'cajas_chicas', action: 'modificar', displayName: 'Modificar Caja Chica', category: 'FINANZAS' },
  { name: 'finanzas.cajas_chicas.rendir', module: 'finanzas', feature: 'cajas_chicas', action: 'rendir', displayName: 'Rendir Caja Chica', category: 'FINANZAS' },
  { name: 'finanzas.cajas_chicas.aprobar', module: 'finanzas', feature: 'cajas_chicas', action: 'aprobar', displayName: 'Aprobar Rendición', category: 'FINANZAS' },
  { name: 'finanzas.cajas_chicas.reembolsar', module: 'finanzas', feature: 'cajas_chicas', action: 'reembolsar', displayName: 'Aprobar Reembolso', category: 'FINANZAS' },
  { name: 'finanzas.cajas_chicas.cerrar', module: 'finanzas', feature: 'cajas_chicas', action: 'cerrar', displayName: 'Cerrar Caja Chica', category: 'FINANZAS' },
  { name: 'finanzas.cajas_chicas.exportar', module: 'finanzas', feature: 'cajas_chicas', action: 'exportar', displayName: 'Exportar Cajas Chicas', category: 'FINANZAS' },

  // Modificaciones Presupuestarias
  { name: 'finanzas.modificaciones.ver', module: 'finanzas', feature: 'modificaciones', action: 'ver', displayName: 'Ver Modificaciones', category: 'FINANZAS' },
  { name: 'finanzas.modificaciones.crear', module: 'finanzas', feature: 'modificaciones', action: 'crear', displayName: 'Crear Modificación', category: 'FINANZAS' },
  { name: 'finanzas.modificaciones.aprobar', module: 'finanzas', feature: 'modificaciones', action: 'aprobar', displayName: 'Aprobar Modificación', category: 'FINANZAS' },
  { name: 'finanzas.modificaciones.rechazar', module: 'finanzas', feature: 'modificaciones', action: 'rechazar', displayName: 'Rechazar Modificación', category: 'FINANZAS' },
  { name: 'finanzas.modificaciones.exportar', module: 'finanzas', feature: 'modificaciones', action: 'exportar', displayName: 'Exportar Modificaciones', category: 'FINANZAS' },

  // Conciliación Bancaria
  { name: 'finanzas.conciliacion.ver', module: 'finanzas', feature: 'conciliacion', action: 'ver', displayName: 'Ver Conciliaciones', category: 'FINANZAS' },
  { name: 'finanzas.conciliacion.crear', module: 'finanzas', feature: 'conciliacion', action: 'crear', displayName: 'Crear Conciliación', category: 'FINANZAS' },
  { name: 'finanzas.conciliacion.aprobar', module: 'finanzas', feature: 'conciliacion', action: 'aprobar', displayName: 'Aprobar Conciliación', category: 'FINANZAS' },
  { name: 'finanzas.conciliacion.exportar', module: 'finanzas', feature: 'conciliacion', action: 'exportar', displayName: 'Exportar Conciliación', category: 'FINANZAS' },

  // Anticipos
  { name: 'finanzas.anticipos.ver', module: 'finanzas', feature: 'anticipos', action: 'ver', displayName: 'Ver Anticipos', category: 'FINANZAS' },
  { name: 'finanzas.anticipos.crear', module: 'finanzas', feature: 'anticipos', action: 'crear', displayName: 'Crear Anticipo', category: 'FINANZAS' },
  { name: 'finanzas.anticipos.aprobar', module: 'finanzas', feature: 'anticipos', action: 'aprobar', displayName: 'Aprobar Anticipo', category: 'FINANZAS' },
  { name: 'finanzas.anticipos.rechazar', module: 'finanzas', feature: 'anticipos', action: 'rechazar', displayName: 'Rechazar Anticipo', category: 'FINANZAS' },
  { name: 'finanzas.anticipos.pagar', module: 'finanzas', feature: 'anticipos', action: 'pagar', displayName: 'Registrar Pago', category: 'FINANZAS' },
  { name: 'finanzas.anticipos.descontar', module: 'finanzas', feature: 'anticipos', action: 'descontar', displayName: 'Descontar en Nómina', category: 'FINANZAS' },

  // Cierre Contable
  { name: 'finanzas.cierre.ver', module: 'finanzas', feature: 'cierre', action: 'ver', displayName: 'Ver Cierres', category: 'FINANZAS' },
  { name: 'finanzas.cierre.iniciar', module: 'finanzas', feature: 'cierre', action: 'iniciar', displayName: 'Iniciar Cierre', category: 'FINANZAS' },
  { name: 'finanzas.cierre.verificar', module: 'finanzas', feature: 'cierre', action: 'verificar', displayName: 'Verificar Cierre', category: 'FINANZAS' },
  { name: 'finanzas.cierre.aprobar', module: 'finanzas', feature: 'cierre', action: 'aprobar', displayName: 'Aprobar Cierre', category: 'FINANZAS' },
  { name: 'finanzas.cierre.rechazar', module: 'finanzas', feature: 'cierre', action: 'rechazar', displayName: 'Rechazar Cierre', category: 'FINANZAS' },

  // ============================================
  // RECURSOS HUMANOS
  // ============================================

  // Dashboard RRHH
  { name: 'rrhh.dashboard.ver', module: 'rrhh', feature: 'dashboard', action: 'ver', displayName: 'Ver Dashboard RRHH', category: 'RRHH' },
  { name: 'rrhh.dashboard.exportar', module: 'rrhh', feature: 'dashboard', action: 'exportar', displayName: 'Exportar Dashboard RRHH', category: 'RRHH' },

  // Empleados
  { name: 'rrhh.empleados.ver', module: 'rrhh', feature: 'empleados', action: 'ver', displayName: 'Ver Empleados', category: 'RRHH' },
  { name: 'rrhh.empleados.ver_detalle', module: 'rrhh', feature: 'empleados', action: 'ver_detalle', displayName: 'Ver Expediente Completo', category: 'RRHH' },
  { name: 'rrhh.empleados.crear', module: 'rrhh', feature: 'empleados', action: 'crear', displayName: 'Registrar Empleado', category: 'RRHH' },
  { name: 'rrhh.empleados.modificar', module: 'rrhh', feature: 'empleados', action: 'modificar', displayName: 'Modificar Empleado', category: 'RRHH' },
  { name: 'rrhh.empleados.inactivar', module: 'rrhh', feature: 'empleados', action: 'inactivar', displayName: 'Inactivar Empleado', category: 'RRHH' },
  { name: 'rrhh.empleados.exportar', module: 'rrhh', feature: 'empleados', action: 'exportar', displayName: 'Exportar Empleados', category: 'RRHH' },

  // Nómina
  { name: 'rrhh.nomina.ver', module: 'rrhh', feature: 'nomina', action: 'ver', displayName: 'Ver Nóminas', category: 'RRHH' },
  { name: 'rrhh.nomina.generar', module: 'rrhh', feature: 'nomina', action: 'generar', displayName: 'Generar Nómina', category: 'RRHH' },
  { name: 'rrhh.nomina.calcular', module: 'rrhh', feature: 'nomina', action: 'calcular', displayName: 'Calcular Deducciones', category: 'RRHH' },
  { name: 'rrhh.nomina.aprobar', module: 'rrhh', feature: 'nomina', action: 'aprobar', displayName: 'Aprobar Nómina', category: 'RRHH' },
  { name: 'rrhh.nomina.procesar_pago', module: 'rrhh', feature: 'nomina', action: 'procesar_pago', displayName: 'Procesar Pago', category: 'RRHH' },
  { name: 'rrhh.nomina.revertir', module: 'rrhh', feature: 'nomina', action: 'revertir', displayName: 'Revertir Nómina', category: 'RRHH' },
  { name: 'rrhh.nomina.exportar', module: 'rrhh', feature: 'nomina', action: 'exportar', displayName: 'Exportar Nómina', category: 'RRHH' },

  // Asistencia
  { name: 'rrhh.asistencia.ver', module: 'rrhh', feature: 'asistencia', action: 'ver', displayName: 'Ver Asistencia', category: 'RRHH' },
  { name: 'rrhh.asistencia.registrar', module: 'rrhh', feature: 'asistencia', action: 'registrar', displayName: 'Registrar Asistencia', category: 'RRHH' },
  { name: 'rrhh.asistencia.modificar', module: 'rrhh', feature: 'asistencia', action: 'modificar', displayName: 'Modificar Asistencia', category: 'RRHH' },
  { name: 'rrhh.asistencia.aprobar', module: 'rrhh', feature: 'asistencia', action: 'aprobar', displayName: 'Aprobar Modificaciones', category: 'RRHH' },
  { name: 'rrhh.asistencia.exportar', module: 'rrhh', feature: 'asistencia', action: 'exportar', displayName: 'Exportar Asistencia', category: 'RRHH' },

  // Vacaciones
  { name: 'rrhh.vacaciones.ver', module: 'rrhh', feature: 'vacaciones', action: 'ver', displayName: 'Ver Vacaciones', category: 'RRHH' },
  { name: 'rrhh.vacaciones.solicitar', module: 'rrhh', feature: 'vacaciones', action: 'solicitar', displayName: 'Solicitar Vacaciones', category: 'RRHH' },
  { name: 'rrhh.vacaciones.aprobar', module: 'rrhh', feature: 'vacaciones', action: 'aprobar', displayName: 'Aprobar Vacaciones', category: 'RRHH' },
  { name: 'rrhh.vacaciones.rechazar', module: 'rrhh', feature: 'vacaciones', action: 'rechazar', displayName: 'Rechazar Vacaciones', category: 'RRHH' },
  { name: 'rrhh.vacaciones.cancelar', module: 'rrhh', feature: 'vacaciones', action: 'cancelar', displayName: 'Cancelar Vacaciones', category: 'RRHH' },

  // ============================================
  // TRIBUTARIO
  // ============================================

  // Dashboard
  { name: 'tributario.dashboard.ver', module: 'tributario', feature: 'dashboard', action: 'ver', displayName: 'Ver Dashboard Tributario', category: 'TRIBUTARIO' },

  // Contribuyentes
  { name: 'tributario.contribuyentes.ver', module: 'tributario', feature: 'contribuyentes', action: 'ver', displayName: 'Ver Contribuyentes', category: 'TRIBUTARIO' },
  { name: 'tributario.contribuyentes.crear', module: 'tributario', feature: 'contribuyentes', action: 'crear', displayName: 'Registrar Contribuyente', category: 'TRIBUTARIO' },
  { name: 'tributario.contribuyentes.modificar', module: 'tributario', feature: 'contribuyentes', action: 'modificar', displayName: 'Modificar Contribuyente', category: 'TRIBUTARIO' },
  { name: 'tributario.contribuyentes.exportar', module: 'tributario', feature: 'contribuyentes', action: 'exportar', displayName: 'Exportar Contribuyentes', category: 'TRIBUTARIO' },

  // Inmuebles
  { name: 'tributario.inmuebles.ver', module: 'tributario', feature: 'inmuebles', action: 'ver', displayName: 'Ver Inmuebles', category: 'TRIBUTARIO' },
  { name: 'tributario.inmuebles.crear', module: 'tributario', feature: 'inmuebles', action: 'crear', displayName: 'Registrar Inmueble', category: 'TRIBUTARIO' },
  { name: 'tributario.inmuebles.modificar', module: 'tributario', feature: 'inmuebles', action: 'modificar', displayName: 'Modificar Catastro', category: 'TRIBUTARIO' },
  { name: 'tributario.inmuebles.valorar', module: 'tributario', feature: 'inmuebles', action: 'valorar', displayName: 'Actualizar Avalúo', category: 'TRIBUTARIO' },
  { name: 'tributario.inmuebles.exportar', module: 'tributario', feature: 'inmuebles', action: 'exportar', displayName: 'Exportar Inmuebles', category: 'TRIBUTARIO' },

  // Pagos
  { name: 'tributario.pagos.ver', module: 'tributario', feature: 'pagos', action: 'ver', displayName: 'Ver Pagos', category: 'TRIBUTARIO' },
  { name: 'tributario.pagos.registrar', module: 'tributario', feature: 'pagos', action: 'registrar', displayName: 'Registrar Pago', category: 'TRIBUTARIO' },
  { name: 'tributario.pagos.anular', module: 'tributario', feature: 'pagos', action: 'anular', displayName: 'Anular Pago', category: 'TRIBUTARIO' },
  { name: 'tributario.pagos.exportar', module: 'tributario', feature: 'pagos', action: 'exportar', displayName: 'Exportar Pagos', category: 'TRIBUTARIO' },

  // Solvencias
  { name: 'tributario.solvencias.ver', module: 'tributario', feature: 'solvencias', action: 'ver', displayName: 'Ver Solvencias', category: 'TRIBUTARIO' },
  { name: 'tributario.solvencias.generar', module: 'tributario', feature: 'solvencias', action: 'generar', displayName: 'Generar Solvencia', category: 'TRIBUTARIO' },
  { name: 'tributario.solvencias.aprobar', module: 'tributario', feature: 'solvencias', action: 'aprobar', displayName: 'Aprobar Solvencia', category: 'TRIBUTARIO' },
  { name: 'tributario.solvencias.exportar', module: 'tributario', feature: 'solvencias', action: 'exportar', displayName: 'Exportar Solvencias', category: 'TRIBUTARIO' },

  // ============================================
  // PROYECTOS
  // ============================================

  // Dashboard
  { name: 'proyectos.dashboard.ver', module: 'proyectos', feature: 'dashboard', action: 'ver', displayName: 'Ver Dashboard de Proyectos', category: 'PROYECTOS' },

  // Lista de Proyectos
  { name: 'proyectos.lista.ver', module: 'proyectos', feature: 'lista', action: 'ver', displayName: 'Ver Proyectos', category: 'PROYECTOS' },
  { name: 'proyectos.lista.crear', module: 'proyectos', feature: 'lista', action: 'crear', displayName: 'Crear Proyecto', category: 'PROYECTOS' },
  { name: 'proyectos.lista.modificar', module: 'proyectos', feature: 'lista', action: 'modificar', displayName: 'Modificar Proyecto', category: 'PROYECTOS' },
  { name: 'proyectos.lista.eliminar', module: 'proyectos', feature: 'lista', action: 'eliminar', displayName: 'Eliminar Proyecto', category: 'PROYECTOS' },
  { name: 'proyectos.lista.exportar', module: 'proyectos', feature: 'lista', action: 'exportar', displayName: 'Exportar Proyectos', category: 'PROYECTOS' },

  // Detalle
  { name: 'proyectos.detalle.ver', module: 'proyectos', feature: 'detalle', action: 'ver', displayName: 'Ver Detalle', category: 'PROYECTOS' },
  { name: 'proyectos.detalle.modificar_estado', module: 'proyectos', feature: 'detalle', action: 'modificar_estado', displayName: 'Cambiar Estado', category: 'PROYECTOS' },
  { name: 'proyectos.detalle.asignar_responsable', module: 'proyectos', feature: 'detalle', action: 'asignar_responsable', displayName: 'Asignar Responsable', category: 'PROYECTOS' },
  { name: 'proyectos.detalle.cargar_documentos', module: 'proyectos', feature: 'detalle', action: 'cargar_documentos', displayName: 'Subir Documentos', category: 'PROYECTOS' },
  { name: 'proyectos.detalle.cargar_fotos', module: 'proyectos', feature: 'detalle', action: 'cargar_fotos', displayName: 'Subir Fotos', category: 'PROYECTOS' },

  // ============================================
  // ADMINISTRACIÓN
  // ============================================

  // Usuarios
  { name: 'admin.usuarios.ver', module: 'admin', feature: 'usuarios', action: 'ver', displayName: 'Ver Usuarios', category: 'ADMIN' },
  { name: 'admin.usuarios.crear', module: 'admin', feature: 'usuarios', action: 'crear', displayName: 'Crear Usuario', category: 'ADMIN' },
  { name: 'admin.usuarios.modificar', module: 'admin', feature: 'usuarios', action: 'modificar', displayName: 'Modificar Usuario', category: 'ADMIN' },
  { name: 'admin.usuarios.inactivar', module: 'admin', feature: 'usuarios', action: 'inactivar', displayName: 'Inactivar Usuario', category: 'ADMIN' },
  { name: 'admin.usuarios.resetear_clave', module: 'admin', feature: 'usuarios', action: 'resetear_clave', displayName: 'Resetear Contraseña', category: 'ADMIN' },
  { name: 'admin.usuarios.asignar_rol', module: 'admin', feature: 'usuarios', action: 'asignar_rol', displayName: 'Asignar Rol', category: 'ADMIN' },

  // Roles
  { name: 'admin.roles.ver', module: 'admin', feature: 'roles', action: 'ver', displayName: 'Ver Roles', category: 'ADMIN' },
  { name: 'admin.roles.crear', module: 'admin', feature: 'roles', action: 'crear', displayName: 'Crear Rol', category: 'ADMIN' },
  { name: 'admin.roles.modificar', module: 'admin', feature: 'roles', action: 'modificar', displayName: 'Modificar Rol', category: 'ADMIN' },
  { name: 'admin.roles.eliminar', module: 'admin', feature: 'roles', action: 'eliminar', displayName: 'Eliminar Rol', category: 'ADMIN' },
  { name: 'admin.roles.asignar_permisos', module: 'admin', feature: 'roles', action: 'asignar_permisos', displayName: 'Asignar Permisos', category: 'ADMIN' },

  // Permisos
  { name: 'admin.permisos.ver', module: 'admin', feature: 'permisos', action: 'ver', displayName: 'Ver Permisos', category: 'ADMIN' },
  { name: 'admin.permisos.modificar', module: 'admin', feature: 'permisos', action: 'modificar', displayName: 'Modificar Permisos', category: 'ADMIN' },
  { name: 'admin.permisos.excepciones', module: 'admin', feature: 'permisos', action: 'excepciones', displayName: 'Crear Excepciones', category: 'ADMIN' },
];

async function seedGranularPermissions() {
  console.log('🔐 Iniciando seed de permisos granulares...\n');

  try {
    // Limpiar permisos anteriores (opcional - comentar si quieres mantener ambos sistemas)
    // await prisma.permission.deleteMany();

    let created = 0;
    let skipped = 0;

    for (const perm of GRANULAR_PERMISSIONS) {
      try {
        await prisma.permission.upsert({
          where: { name: perm.name },
          update: {
            feature: perm.feature,
            displayName: perm.displayName,
            category: perm.category,
            description: perm.description,
          },
          create: perm,
        });
        created++;
      } catch (error) {
        console.error(`Error creando permiso ${perm.name}:`, error.message);
        skipped++;
      }
    }

    console.log(`✅ ${created} permisos granulares creados/actualizados`);
    console.log(`⏭️  ${skipped} permisos omitidos (ya existían)\n`);

    // Estadísticas
    const stats = await prisma.permission.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    console.log('📊 Estadísticas por categoría:');
    stats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat._count.id} permisos`);
    });

    console.log('\n✅ Seed de permisos granulares completado!');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGranularPermissions();
}

export default seedGranularPermissions;
