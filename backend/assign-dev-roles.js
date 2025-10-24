import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de usuarios de desarrollo a roles personalizados
const USER_ROLE_ASSIGNMENTS = [
  {
    email: 'superadmin@municipal.gob.ve',
    customRoles: ['Administrador de Sistema'],
  },
  {
    email: 'admin@municipal.gob.ve',
    customRoles: ['Administrador de Sistema'],
  },
  {
    email: 'director@municipal.gob.ve',
    customRoles: [
      'Director de Finanzas',
      'Director de RRHH',
      'Director Tributario',
      'Director de Proyectos',
    ],
  },
  {
    email: 'coordinador19@municipal.gob.ve',
    customRoles: [
      'Supervisor de Finanzas',
      'Supervisor de Nómina',
      'Supervisor de Obras',
    ],
  },
  {
    email: 'empleado16@municipal.gob.ve',
    customRoles: [
      'Analista Financiero Senior',
      'Analista de RRHH',
      'Analista Tributario',
    ],
  },
  {
    email: 'ciudadano@example.com',
    customRoles: [], // Sin roles personalizados
  },
];

async function assignRolesToUsers() {
  console.log('🎭 Asignando roles personalizados a usuarios de desarrollo...\n');

  let totalAssignments = 0;

  for (const assignment of USER_ROLE_ASSIGNMENTS) {
    const { email, customRoles } = assignment;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    if (!user) {
      console.log(`   ⚠️  Usuario no encontrado: ${email}`);
      continue;
    }

    console.log(`\n👤 ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`   Email: ${email}`);

    if (customRoles.length === 0) {
      console.log('   ℹ️  Sin roles personalizados asignados');
      continue;
    }

    // Asignar cada rol personalizado
    for (const roleName of customRoles) {
      // Buscar el rol
      const role = await prisma.customRole.findUnique({
        where: { name: roleName },
        select: { id: true },
      });

      if (!role) {
        console.log(`      ⚠️  Rol no encontrado: ${roleName}`);
        continue;
      }

      // Verificar si ya tiene el rol asignado
      const existing = await prisma.userCustomRole.findUnique({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
      });

      if (existing) {
        console.log(`      ✓ ${roleName} (ya asignado)`);
        continue;
      }

      // Asignar el rol
      await prisma.userCustomRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
          assignedBy: user.id, // Auto-asignado para usuarios de desarrollo
        },
      });

      console.log(`      ✅ ${roleName}`);
      totalAssignments++;
    }
  }

  console.log(`\n\n✅ ${totalAssignments} roles asignados exitosamente\n`);

  // Mostrar resumen
  console.log('📊 Resumen de asignaciones:');
  for (const assignment of USER_ROLE_ASSIGNMENTS) {
    const user = await prisma.user.findUnique({
      where: { email: assignment.email },
      select: {
        firstName: true,
        lastName: true,
        customRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) continue;

    console.log(`\n   ${user.firstName} ${user.lastName}:`);
    if (user.customRoles.length === 0) {
      console.log('      (sin roles personalizados)');
    } else {
      user.customRoles.forEach(ur => {
        console.log(`      • ${ur.role.name}`);
      });
    }
  }

  console.log('\n✅ Asignación de roles completada!');
}

assignRolesToUsers()
  .catch((error) => {
    console.error('❌ Error asignando roles:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
