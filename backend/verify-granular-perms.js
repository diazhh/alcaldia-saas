import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyGranularPermissions() {
  console.log('🔍 Verificando permisos granulares...\n');

  // Count by category
  const byCategory = await prisma.permission.groupBy({
    by: ['category'],
    _count: true,
  });

  console.log('📊 Permisos por categoría:');
  byCategory.forEach(item => {
    console.log(`   ${item.category || 'SIN_CATEGORIA'}: ${item._count} permisos`);
  });

  // Show some granular permission examples
  console.log('\n📝 Ejemplos de permisos granulares:');

  const granularPerms = await prisma.permission.findMany({
    where: { feature: { not: null } },
    select: { name: true, module: true, feature: true, action: true, displayName: true, category: true },
    orderBy: [{ category: 'asc' }, { module: 'asc' }, { feature: 'asc' }],
    take: 30,
  });

  let currentCategory = null;
  granularPerms.forEach(perm => {
    if (perm.category !== currentCategory) {
      currentCategory = perm.category;
      console.log(`\n   ${currentCategory}:`);
    }
    console.log(`      ✓ ${perm.name} - ${perm.displayName}`);
  });

  await prisma.$disconnect();
}

verifyGranularPermissions().catch(console.error);
