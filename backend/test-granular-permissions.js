import { PrismaClient } from '@prisma/client';
import permissionService from './src/shared/services/permission.service.js';

const prisma = new PrismaClient();

async function testGranularPermissions() {
  console.log('🧪 Probando sistema de permisos granulares...\n');

  // Obtener usuarios de prueba
  const testUsers = [
    { email: 'director@municipal.gob.ve', label: 'Director' },
    { email: 'coordinador19@municipal.gob.ve', label: 'Coordinador' },
    { email: 'empleado16@municipal.gob.ve', label: 'Empleado' },
  ];

  for (const testUser of testUsers) {
    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        customRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`❌ Usuario no encontrado: ${testUser.email}\n`);
      continue;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`👤 ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`${'='.repeat(80)}`);

    // Mostrar roles personalizados
    console.log('\n📋 Roles Personalizados:');
    if (user.customRoles.length === 0) {
      console.log('   (ninguno)');
    } else {
      user.customRoles.forEach(ucr => {
        console.log(`   • ${ucr.role.name}`);
      });
    }

    // Obtener permisos del usuario
    const permissions = await permissionService.getUserPermissions(user.id);

    console.log('\n🔐 Permisos por Módulo:');
    const modules = Object.keys(permissions).sort();

    for (const module of modules) {
      const perms = permissions[module];
      const granularPerms = perms.filter(p => p.includes('.'));
      const legacyPerms = perms.filter(p => !p.includes('.'));

      console.log(`\n   ${module.toUpperCase()}:`);

      if (granularPerms.length > 0) {
        console.log('      Permisos granulares:');
        granularPerms.slice(0, 5).forEach(p => {
          console.log(`         ✓ ${p}`);
        });
        if (granularPerms.length > 5) {
          console.log(`         ... y ${granularPerms.length - 5} más`);
        }
      }

      if (legacyPerms.length > 0) {
        console.log('      Permisos legacy:');
        legacyPerms.forEach(p => {
          console.log(`         • ${p}`);
        });
      }
    }

    // Probar verificación de permisos específicos
    console.log('\n🔍 Pruebas de verificación de permisos:');

    const permissionsToTest = [
      { name: 'finanzas.cajas_chicas.aprobar', expected: testUser.label === 'Director' || testUser.label === 'Coordinador' },
      { name: 'finanzas.anticipos.descontar', expected: testUser.label === 'Director' },
      { name: 'rrhh.empleados.ver', expected: true }, // Todos deberían tenerlo por rol estándar
      { name: 'admin.usuarios.crear', expected: false }, // Solo admin debería tenerlo
    ];

    for (const test of permissionsToTest) {
      const hasPermission = await permissionService.hasPermission(user.id, test.name);
      const icon = hasPermission ? '✅' : '❌';
      const match = hasPermission === test.expected ? '✓' : '✗';
      console.log(`   ${icon} ${test.name} ${match}`);
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('✅ Prueba de permisos granulares completada');
  console.log('='.repeat(80));
}

testGranularPermissions()
  .catch((error) => {
    console.error('❌ Error en prueba:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
