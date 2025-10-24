import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findUsersByRole() {
  const roles = ['DIRECTOR', 'COORDINADOR', 'EMPLEADO', 'CIUDADANO'];

  console.log('📋 Buscando usuarios por rol:\n');

  for (const role of roles) {
    const users = await prisma.user.findMany({
      where: { role },
      select: { email: true, firstName: true, lastName: true },
      take: 3,
    });

    console.log(`\n${role}:`);
    if (users.length === 0) {
      console.log('  ❌ No hay usuarios con este rol');
    } else {
      users.forEach(u => {
        console.log(`  ✓ ${u.email}`);
      });
    }
  }

  await prisma.$disconnect();
}

findUsersByRole().catch(console.error);
