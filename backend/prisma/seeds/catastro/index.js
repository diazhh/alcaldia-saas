import { seedUrbanVariables } from './urban-variables-seed.js';
import { seedProperties } from './properties-seed.js';
import { seedPropertyOwners } from './owners-seed.js';
import { seedPropertyPhotos } from './photos-seed.js';
import { seedConstructionPermits } from './permits-seed.js';
import { seedInspections } from './inspections-seed.js';

/**
 * Seed principal del módulo de Catastro
 * Ejecuta todos los seeds en el orden correcto
 */
async function seedCatastro() {
  console.log('\n🏛️  ========================================');
  console.log('   SEEDING MÓDULO DE CATASTRO');
  console.log('   ========================================\n');

  try {
    // 1. Variables Urbanas (sin dependencias)
    await seedUrbanVariables();

    // 2. Propiedades (depende de variables urbanas)
    await seedProperties();

    // 3. Propietarios (depende de propiedades)
    await seedPropertyOwners();

    // 4. Fotos (depende de propiedades)
    await seedPropertyPhotos();

    // 5. Permisos de Construcción (depende de propiedades)
    await seedConstructionPermits();

    // 6. Inspecciones (depende de permisos y propiedades)
    // TODO: Corregir seed de inspecciones para coincidir con schema
    // await seedInspections();

    console.log('✅ ========================================');
    console.log('   MÓDULO DE CATASTRO SEEDED EXITOSAMENTE');
    console.log('   ========================================\n');
  } catch (error) {
    console.error('❌ Error seeding módulo de catastro:', error);
    throw error;
  }
}

export { seedCatastro };
