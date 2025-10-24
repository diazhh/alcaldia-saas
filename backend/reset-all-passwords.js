import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAllPasswords() {
  console.log('🔐 Reseteando contraseñas de usuarios de desarrollo...\n');

  const users = [
    { email: 'superadmin@municipal.gob.ve', password: 'admin123' },
    { email: 'admin@municipal.gob.ve', password: 'admin123' },
    { email: 'director@municipal.gob.ve', password: 'password123' },
    { email: 'coordinador19@municipal.gob.ve', password: 'password123' },
    { email: 'empleado16@municipal.gob.ve', password: 'password123' },
    { email: 'ciudadano@example.com', password: 'password123' },
  ];

  for (const { email, password } of users) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      console.log(`✅ ${email.padEnd(35)} → ${password}`);
    } catch (error) {
      console.log(`❌ ${email.padEnd(35)} → Usuario no encontrado`);
    }
  }

  console.log('\n✅ Proceso completado!');
  await prisma.$disconnect();
}

resetAllPasswords().catch(console.error);
