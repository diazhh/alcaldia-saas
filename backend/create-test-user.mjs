import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email: 'test@municipal.gob.ve' }
    });

    if (existing) {
      console.log('Usuario de prueba ya existe. Actualizando contraseña...');
      const hashedPassword = await bcrypt.hash('Test1234', 10);
      await prisma.user.update({
        where: { email: 'test@municipal.gob.ve' },
        data: { password: hashedPassword }
      });
      console.log('✓ Contraseña actualizada');
    } else {
      console.log('Creando usuario de prueba...');
      const hashedPassword = await bcrypt.hash('Test1234', 10);
      
      const user = await prisma.user.create({
        data: {
          email: 'test@municipal.gob.ve',
          password: hashedPassword,
          firstName: 'Usuario',
          lastName: 'Prueba',
          role: 'ADMIN',
          isActive: true
        }
      });
      
      console.log('✓ Usuario creado exitosamente');
    }
    
    console.log('\nCredenciales de prueba:');
    console.log('Email: test@municipal.gob.ve');
    console.log('Password: Test1234');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
