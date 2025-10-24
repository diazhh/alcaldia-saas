import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Seed de Fotos de Propiedades - Fotos adicionales para las propiedades
 */
async function seedPropertyPhotos() {
  console.log('📸 Seeding Fotos de Propiedades...');

  // Obtener propiedades
  const properties = await prisma.property.findMany({
    take: 20,
    orderBy: { cadastralCode: 'asc' },
  });

  if (properties.length === 0) {
    console.log('   ⚠️  No hay propiedades para asignar fotos');
    return [];
  }

  const photos = [];

  // Generar fotos para las primeras 15 propiedades
  for (let i = 0; i < Math.min(15, properties.length); i++) {
    const property = properties[i];
    const photoTypes = ['INTERIOR', 'FRONT', 'REAR', 'AERIAL', 'OTHER'];
    const numPhotos = Math.floor(Math.random() * 4) + 2; // 2-5 fotos por propiedad

    for (let j = 0; j < numPhotos; j++) {
      const photoType = photoTypes[j % photoTypes.length];
      photos.push({
        propertyId: property.id,
        url: `/uploads/properties/${property.cadastralCode.toLowerCase()}-${photoType.toLowerCase()}-${j + 1}.jpg`,
        description: `Foto ${photoType} de ${property.address.substring(0, 30)}`,
        photoType: photoType,
      });
    }
  }

  const created = [];
  for (const photo of photos) {
    const existing = await prisma.propertyPhoto.findFirst({
      where: {
        propertyId: photo.propertyId,
        url: photo.url,
      },
    });

    if (!existing) {
      const created_photo = await prisma.propertyPhoto.create({
        data: photo,
      });
      created.push(created_photo);
    }
  }

  console.log(`✅ ${created.length} fotos de propiedades creadas\n`);
  return created;
}

export { seedPropertyPhotos };
