import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@municipal.gob.ve' }
    });
    
    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }
    
    console.log('Usuario encontrado:', user.email);
    console.log('Hash de contraseña:', user.password.substring(0, 20) + '...');
    
    // Probar varias contraseñas
    const passwords = ['Admin123!', 'Admin123', 'admin123!', 'Admin@123'];
    
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`Contraseña '${pwd}': ${isValid ? 'VÁLIDA ✓' : 'INVÁLIDA ✗'}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
