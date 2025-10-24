import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Seed de Propietarios - Asigna propietarios a las propiedades creadas
 */
async function seedPropertyOwners() {
  console.log('👥 Seeding Propietarios...');

  // Obtener todas las propiedades
  const properties = await prisma.property.findMany({
    take: 50,
    orderBy: { cadastralCode: 'asc' },
  });

  if (properties.length === 0) {
    console.log('   ⚠️  No hay propiedades para asignar propietarios');
    return [];
  }

  const owners = [
    // Propietarios para apartamentos
    {
      propertyId: properties[0]?.id,
      ownerType: 'NATURAL',
      ownerName: 'María Fernanda González Pérez',
      ownerIdNumber: 'V-12345678',
      startDate: new Date('2018-03-15'),
      isCurrent: true,
      deedNumber: 'PRO-2018-1234',
      deedDate: new Date('2018-03-15'),
    },
    {
      propertyId: properties[1]?.id,
      ownerType: 'NATURAL',
      ownerName: 'Carlos Alberto Rodríguez Silva',
      ownerIdNumber: 'V-23456789',
      startDate: new Date('2015-07-20'),
      isCurrent: true,
      deedNumber: 'PRO-2015-5678',
      deedDate: new Date('2015-07-20'),
    },
    {
      propertyId: properties[2]?.id,
      ownerType: 'NATURAL',
      ownerName: 'Ana Patricia Martínez López',
      ownerIdNumber: 'V-34567890',
      startDate: new Date('2020-11-10'),
      isCurrent: true,
      deedNumber: 'PRO-2020-9012',
      deedDate: new Date('2020-11-10'),
      notes: 'Copropietaria 50%',
    },
    {
      propertyId: properties[2]?.id,
      ownerType: 'NATURAL',
      ownerName: 'José Luis Martínez López',
      ownerIdNumber: 'V-34567891',
      startDate: new Date('2020-11-10'),
      isCurrent: true,
      deedNumber: 'PRO-2020-9012',
      deedDate: new Date('2020-11-10'),
      notes: 'Copropietario 50%, cónyuge de Ana Patricia Martínez',
    },
    // Propietarios para casas
    {
      propertyId: properties[3]?.id,
      ownerType: 'NATURAL',
      ownerName: 'Roberto José Hernández Díaz',
      ownerIdNumber: 'V-45678901',
      startDate: new Date('2010-05-12'),
      isCurrent: true,
      deedNumber: 'PRO-2010-3456',
      deedDate: new Date('2010-05-12'),
    },
    {
      propertyId: properties[4]?.id,
      ownerType: 'NATURAL',
      ownerName: 'Luisa Elena Ramírez Sánchez',
      ownerIdNumber: 'V-56789012',
      startDate: new Date('2012-09-25'),
      isCurrent: true,
      deedNumber: 'PRO-2012-7890',
      deedDate: new Date('2012-09-25'),
    },
    // Propietario anterior de una casa (histórico)
    {
      propertyId: properties[3]?.id,
      ownerType: 'NATURAL',
      ownerName: 'Pedro Antonio Gómez Ruiz',
      ownerIdNumber: 'V-11223344',
      startDate: new Date('2005-03-10'),
      endDate: new Date('2010-05-12'),
      isCurrent: false,
      deedNumber: 'PRO-2005-1122',
      deedDate: new Date('2005-03-10'),
      notes: 'Propietario anterior, vendió en 2010',
    },
    // Propietarios para locales comerciales
    {
      propertyId: properties[5]?.id,
      ownerType: 'LEGAL',
      ownerName: 'Inversiones La Esperanza C.A.',
      ownerIdNumber: 'J-40123456-7',
      startDate: new Date('2016-04-10'),
      isCurrent: true,
      deedNumber: 'PRO-2016-4012',
      deedDate: new Date('2016-04-10'),
    },
    {
      propertyId: properties[6]?.id,
      ownerType: 'LEGAL',
      ownerName: 'Comercializadora del Centro S.R.L.',
      ownerIdNumber: 'J-40234567-8',
      startDate: new Date('2019-08-15'),
      isCurrent: true,
      deedNumber: 'PRO-2019-4023',
      deedDate: new Date('2019-08-15'),
    },
    // Propietarios para industriales
    {
      propertyId: properties[7]?.id,
      ownerType: 'LEGAL',
      ownerName: 'Manufacturas Industriales del Este C.A.',
      ownerIdNumber: 'J-40345678-9',
      startDate: new Date('2008-02-20'),
      isCurrent: true,
      deedNumber: 'PRO-2008-4034',
      deedDate: new Date('2008-02-20'),
    },
    // Propietarios para terrenos baldíos
    {
      propertyId: properties[8]?.id,
      ownerType: 'NATURAL',
      ownerName: 'Francisco Javier Morales Torres',
      ownerIdNumber: 'V-67890123',
      startDate: new Date('2022-06-10'),
      isCurrent: true,
      deedNumber: 'PRO-2022-6789',
      deedDate: new Date('2022-06-10'),
      notes: 'Terreno para futura construcción',
    },
    // Propietarios para uso mixto
    {
      propertyId: properties[9]?.id,
      ownerType: 'LEGAL',
      ownerName: 'Desarrollos Inmobiliarios San Rafael C.A.',
      ownerIdNumber: 'J-40456789-0',
      startDate: new Date('2014-11-30'),
      isCurrent: true,
      deedNumber: 'PRO-2014-4045',
      deedDate: new Date('2014-11-30'),
    },
  ];

  const created = [];
  for (const owner of owners) {
    if (!owner.propertyId) continue;

    const existing = await prisma.propertyOwner.findFirst({
      where: {
        propertyId: owner.propertyId,
        ownerIdNumber: owner.ownerIdNumber,
      },
    });

    if (!existing) {
      const created_owner = await prisma.propertyOwner.create({
        data: owner,
      });
      created.push(created_owner);
      console.log(`   ✅ ${owner.ownerName} - ${owner.ownerIdNumber}`);
    } else {
      console.log(`   ⏭️  ${owner.ownerName} ya existe`);
    }
  }

  console.log(`✅ ${created.length} propietarios creados\n`);
  return created;
}

export { seedPropertyOwners };
