/**
 * Prisma helper para tests
 * Gestiona una única instancia de PrismaClient compartida entre tests
 */

import { PrismaClient } from '@prisma/client';

let prismaInstance = null;

/**
 * Obtiene una instancia singleton de PrismaClient para tests
 */
export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://municipal_user:municipal_password@172.18.0.2:5432/municipal_db?schema=public',
        },
      },
      log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

/**
 * Desconecta Prisma (solo llamar al final de todos los tests)
 */
export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

/**
 * Limpia datos de test de forma segura
 */
export async function cleanupTestData(prisma, options = {}) {
  const {
    workflowDefinitionId,
    documentId,
    userId,
  } = options;

  try {
    // Limpiar en orden correcto respetando foreign keys
    if (workflowDefinitionId) {
      // 1. Eliminar workflow steps
      const instances = await prisma.workflowInstance.findMany({
        where: { workflowDefinitionId },
        select: { id: true },
      });

      if (instances.length > 0) {
        const instanceIds = instances.map(i => i.id);
        await prisma.workflowStep.deleteMany({
          where: { instanceId: { in: instanceIds } },
        });
      }

      // 2. Eliminar workflow instances
      await prisma.workflowInstance.deleteMany({
        where: { workflowDefinitionId },
      });

      // 3. Eliminar workflow definition
      await prisma.workflowDefinition.delete({
        where: { id: workflowDefinitionId },
      }).catch(() => {}); // Ignorar si ya fue eliminado
    }

    if (documentId) {
      // Eliminar signatures primero
      await prisma.signature.deleteMany({
        where: { documentId },
      });

      // Eliminar document
      await prisma.document.delete({
        where: { id: documentId },
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Error en cleanup:', error.message);
    // No lanzar error, solo logear
  }
}
