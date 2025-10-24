import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countRolePermissions() {
  const roles = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'COORDINADOR', 'EMPLEADO', 'CIUDADANO'];

  console.log('📊 Contando permisos por rol:\n');

  for (const role of roles) {
    const count = await prisma.rolePermission.count({
      where: { role },
    });
    console.log(`${role}: ${count} permisos`);
  }

  const total = await prisma.rolePermission.count();
  console.log(`\nTotal: ${total} permisos de rol`);

  const totalPermissions = await prisma.permission.count();
  console.log(`Total de permisos en el sistema: ${totalPermissions}`);

  await prisma.$disconnect();
}

countRolePermissions().catch(console.error);
