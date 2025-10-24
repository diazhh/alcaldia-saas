import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRolePermissions() {
  console.log('Verificando permisos del rol ADMIN...\n');

  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: 'ADMIN' },
    include: {
      permission: true,
    },
    take: 10,
  });

  console.log(`Total de permisos del rol ADMIN: ${rolePermissions.length}`);
  console.log('\nPrimeros 10 permisos:');
  console.table(rolePermissions.map(rp => ({
    module: rp.permission.module,
    action: rp.permission.action,
    name: rp.permission.name,
  })));

  // Agrupar por módulo
  const grouped = {};
  rolePermissions.forEach(rp => {
    if (!grouped[rp.permission.module]) {
      grouped[rp.permission.module] = [];
    }
    grouped[rp.permission.module].push(rp.permission.action);
  });

  console.log('\n📊 Permisos agrupados por módulo:');
  console.log(JSON.stringify(grouped, null, 2));

  await prisma.$disconnect();
}

checkRolePermissions().catch(console.error);
