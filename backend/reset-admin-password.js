import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const admin = await prisma.user.update({
    where: {
      email: 'admin@municipal.gob.ve',
    },
    data: {
      password: hashedPassword,
    },
  });

  console.log('✅ Contraseña del admin actualizada');
  console.log('Email:', admin.email);
  console.log('Nueva contraseña:', newPassword);

  await prisma.$disconnect();
}

resetAdminPassword().catch(console.error);
