import { PrismaClient } from '@prisma/client';
import { ROLES } from './src/shared/constants/permissions.js';

const prisma = new PrismaClient();

async function testPermissionService() {
  // Obtener el usuario admin
  const user = await prisma.user.findUnique({
    where: { email: 'admin@municipal.gob.ve' },
    select: { id: true, role: true, email: true },
  });

  console.log('Usuario:', user);

  // Obtener permisos del ROL (simulando lo que hace el servicio)
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: user.role },
    include: {
      permission: {
        where: { isActive: true },
        select: { id: true, module: true, action: true },
      },
    },
  });

  console.log(`\nTotal permisos encontrados para ${user.role}: ${rolePermissions.length}`);

  // Filtrar null permissions
  const validPermissions = rolePermissions.filter(rp => rp.permission !== null);
  console.log(`Permisos válidos (no null): ${validPermissions.length}`);

  // Agrupar por módulo
  const grouped = {};
  validPermissions.forEach(rp => {
    if (rp.permission) {
      const perm = rp.permission;
      if (!grouped[perm.module]) {
        grouped[perm.module] = [];
      }
      if (!grouped[perm.module].includes(perm.action)) {
        grouped[perm.module].push(perm.action);
      }
    }
  });

  console.log('\n📊 Permisos agrupados:');
  console.log(JSON.stringify(grouped, null, 2));

  await prisma.$disconnect();
}

testPermissionService().catch(console.error);
