import { PrismaClient } from '@prisma/client';

/**
 * Instancia global de Prisma Client
 * @type {PrismaClient}
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

/**
 * Conectar a la base de datos
 */
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
};

/**
 * Desconectar de la base de datos
 */
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Desconexión de la base de datos exitosa');
  } catch (error) {
    console.error('❌ Error al desconectar de la base de datos:', error);
  }
};

export default prisma;
