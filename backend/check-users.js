import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
    },
    take: 5,
  });

  console.log('Usuarios en la base de datos:');
  console.table(users);

  await prisma.$disconnect();
}

checkUsers().catch(console.error);
