import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si ya existe un usuario admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    if (existingAdmin) {
      // Actualizar el usuario existente
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: 'admin@municipal.gob.ve',
          password: hashedPassword,
          isActive: true,
        },
      });
      
      console.log('✅ Usuario administrador actualizado exitosamente');
      console.log(`Email: ${updatedAdmin.email}`);
      console.log('Password: Admin123!');
      return;
    }

    // Crear usuario administrador
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@municipal.gob.ve',
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Usuario administrador creado exitosamente');
    console.log(`Email: ${admin.email}`);
    console.log('Password: Admin123!');
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar función
createAdminUser();
