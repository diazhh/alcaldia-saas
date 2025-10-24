import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAdmin() {
  const admins = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'SUPER_ADMIN' },
        { role: 'ADMIN' },
      ],
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
    },
  });

  console.log('Usuarios ADMIN/SUPER_ADMIN:');
  console.table(admins);

  if (admins.length === 0) {
    console.log('\n⚠️  No hay usuarios ADMIN o SUPER_ADMIN');
    console.log('Buscando cualquier usuario...');

    const anyUser = await prisma.user.findFirst();
    console.table([anyUser]);
  }

  await prisma.$disconnect();
}

findAdmin().catch(console.error);
