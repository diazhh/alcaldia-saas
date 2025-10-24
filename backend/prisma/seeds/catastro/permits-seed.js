import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Seed de Permisos de Construcción - 20 permisos con diferentes estados
 */
async function seedConstructionPermits() {
  console.log('📋 Seeding Permisos de Construcción...');

  // Obtener propiedades para asignar permisos
  const properties = await prisma.property.findMany({
    take: 20,
    orderBy: { cadastralCode: 'asc' },
  });

  if (properties.length === 0) {
    console.log('   ⚠️  No hay propiedades para asignar permisos');
    return [];
  }

  const permits = [
    // APROBADOS (5)
    {
      permitNumber: 'PC-2024-0001',
      propertyId: properties[0]?.id,
      applicantName: 'María Fernanda González Pérez',
      applicantId: 'V-12345678',
      applicantPhone: '+58 412-1234567',
      applicantEmail: 'mfgonzalez@email.com',
      permitType: 'REMODELING',
      projectDescription: 'Remodelación de cocina y baños, cambio de pisos',
      constructionArea: 45.0,
      estimatedCost: 15000.00,
      status: 'APPROVED',
      applicationDate: new Date('2024-01-15'),
      approvalDate: new Date('2024-02-10'),
      expiryDate: new Date('2025-02-10'),
      reviewFee: 150.00,
      permitFee: 500.00,
      totalFee: 650.00,
      isPaid: true,
      paymentDate: new Date('2024-02-12'),
      paymentReference: 'PAG-2024-0001',
      reviewNotes: 'Revisado y aprobado. Cumple con variables urbanas.',
      reviewDate: new Date('2024-02-08'),
      complianceCheck: true,
      approvedBy: 'Arq. Ana Martínez',
    },
    {
      permitNumber: 'PC-2024-0002',
      propertyId: properties[3]?.id,
      applicantName: 'Roberto José Hernández Díaz',
      applicantId: 'V-45678901',
      applicantPhone: '+58 412-4567890',
      applicantEmail: 'rjhernandez@email.com',
      permitType: 'EXPANSION',
      projectDescription: 'Ampliación de segunda planta, 2 habitaciones adicionales',
      constructionArea: 80.0,
      estimatedCost: 35000.00,
      status: 'APPROVED',
      applicationDate: new Date('2024-02-20'),
      approvalDate: new Date('2024-03-25'),
      expiryDate: new Date('2025-03-25'),
      reviewFee: 200.00,
      permitFee: 1200.00,
      totalFee: 1400.00,
      isPaid: true,
      paymentDate: new Date('2024-03-26'),
      paymentReference: 'PAG-2024-0002',
      architecturalPlans: '/uploads/permits/pc-2024-0002-plans.pdf',
      structuralPlans: '/uploads/permits/pc-2024-0002-structural.pdf',
      reviewNotes: 'Aprobado con observación: verificar retiros laterales durante construcción.',
      reviewDate: new Date('2024-03-20'),
      complianceCheck: true,
      approvedBy: 'Arq. Ana Martínez',
    },

    // EN REVISIÓN (3)
    {
      permitNumber: 'PC-2024-0010',
      propertyId: properties[8]?.id,
      applicantName: 'Francisco Javier Morales Torres',
      applicantId: 'V-67890123',
      applicantPhone: '+58 414-6789012',
      applicantEmail: 'fjmorales@email.com',
      permitType: 'NEW_CONSTRUCTION',
      projectDescription: 'Construcción de vivienda unifamiliar de 2 plantas',
      constructionArea: 200.0,
      estimatedCost: 80000.00,
      status: 'UNDER_REVIEW',
      applicationDate: new Date('2024-09-15'),
      reviewFee: 300.00,
      permitFee: 2500.00,
      totalFee: 2800.00,
      isPaid: true,
      paymentDate: new Date('2024-09-16'),
      paymentReference: 'PAG-2024-0010',
      architecturalPlans: '/uploads/permits/pc-2024-0010-plans.pdf',
      structuralPlans: '/uploads/permits/pc-2024-0010-structural.pdf',
      reviewNotes: 'En proceso de revisión técnica.',
      reviewDate: new Date('2024-09-20'),
    },
    {
      permitNumber: 'PC-2024-0011',
      propertyId: properties[5]?.id,
      applicantName: 'Inversiones La Esperanza C.A.',
      applicantId: 'J-40123456-7',
      applicantPhone: '+58 212-9876543',
      applicantEmail: 'info@laesperanza.com',
      permitType: 'REMODELING',
      projectDescription: 'Remodelación de local comercial, nueva fachada',
      constructionArea: 120.0,
      estimatedCost: 25000.00,
      status: 'UNDER_REVIEW',
      applicationDate: new Date('2024-10-01'),
      reviewFee: 200.00,
      permitFee: 800.00,
      totalFee: 1000.00,
      isPaid: true,
      paymentDate: new Date('2024-10-02'),
      paymentReference: 'PAG-2024-0011',
      architecturalPlans: '/uploads/permits/pc-2024-0011-plans.pdf',
    },

    // EN CONSTRUCCIÓN (2)
    {
      permitNumber: 'PC-2023-0045',
      propertyId: properties[4]?.id,
      applicantName: 'Luisa Elena Ramírez Sánchez',
      applicantId: 'V-56789012',
      applicantPhone: '+58 424-5678901',
      applicantEmail: 'leramirez@email.com',
      permitType: 'EXPANSION',
      projectDescription: 'Ampliación de área de servicio y lavandero',
      constructionArea: 30.0,
      estimatedCost: 12000.00,
      status: 'IN_CONSTRUCTION',
      applicationDate: new Date('2023-11-10'),
      approvalDate: new Date('2023-12-15'),
      expiryDate: new Date('2024-12-15'),
      constructionStartDate: new Date('2024-01-08'),
      reviewFee: 150.00,
      permitFee: 400.00,
      totalFee: 550.00,
      isPaid: true,
      paymentDate: new Date('2023-12-18'),
      paymentReference: 'PAG-2023-0045',
      reviewNotes: 'Aprobado. Obra en ejecución.',
      reviewDate: new Date('2023-12-10'),
      complianceCheck: true,
      approvedBy: 'Arq. Ana Martínez',
    },

    // COMPLETADOS (5)
    {
      permitNumber: 'PC-2023-0020',
      propertyId: properties[1]?.id,
      applicantName: 'Carlos Alberto Rodríguez Silva',
      applicantId: 'V-23456789',
      applicantPhone: '+58 424-2345678',
      applicantEmail: 'carodriguez@email.com',
      permitType: 'REPAIR',
      projectDescription: 'Reparación de impermeabilización de techo',
      constructionArea: 72.0,
      estimatedCost: 8000.00,
      status: 'COMPLETED',
      applicationDate: new Date('2023-05-10'),
      approvalDate: new Date('2023-05-25'),
      expiryDate: new Date('2024-05-25'),
      constructionStartDate: new Date('2023-06-01'),
      constructionEndDate: new Date('2023-06-28'),
      reviewFee: 100.00,
      permitFee: 300.00,
      totalFee: 400.00,
      isPaid: true,
      paymentDate: new Date('2023-05-26'),
      paymentReference: 'PAG-2023-0020',
      reviewNotes: 'Aprobado.',
      reviewDate: new Date('2023-05-22'),
      complianceCheck: true,
      approvedBy: 'Arq. Ana Martínez',
    },

    // RECHAZADOS (3)
    {
      permitNumber: 'PC-2024-0015',
      propertyId: properties[7]?.id,
      applicantName: 'Manufacturas Industriales del Este C.A.',
      applicantId: 'J-40345678-9',
      applicantPhone: '+58 212-7654321',
      applicantEmail: 'admin@manueste.com',
      permitType: 'EXPANSION',
      projectDescription: 'Ampliación de galpón industrial',
      constructionArea: 300.0,
      estimatedCost: 120000.00,
      status: 'REJECTED',
      applicationDate: new Date('2024-07-10'),
      reviewFee: 400.00,
      permitFee: 0,
      totalFee: 400.00,
      isPaid: true,
      paymentDate: new Date('2024-07-11'),
      paymentReference: 'PAG-2024-0015',
      reviewNotes: 'No cumple con retiros mínimos establecidos en zona I1. Excede cobertura máxima permitida.',
      reviewDate: new Date('2024-08-01'),
      complianceCheck: false,
      approvedBy: 'Arq. Ana Martínez',
    },

    // VENCIDOS (2)
    {
      permitNumber: 'PC-2022-0088',
      propertyId: properties[6]?.id,
      applicantName: 'Comercializadora del Centro S.R.L.',
      applicantId: 'J-40234567-8',
      applicantPhone: '+58 212-8765432',
      applicantEmail: 'contacto@comcentro.com',
      permitType: 'REMODELING',
      projectDescription: 'Remodelación de local comercial',
      constructionArea: 85.0,
      estimatedCost: 18000.00,
      status: 'EXPIRED',
      applicationDate: new Date('2022-08-15'),
      approvalDate: new Date('2022-09-20'),
      expiryDate: new Date('2023-09-20'),
      reviewFee: 150.00,
      permitFee: 600.00,
      totalFee: 750.00,
      isPaid: true,
      paymentDate: new Date('2022-09-22'),
      paymentReference: 'PAG-2022-0088',
      reviewNotes: 'Aprobado.',
      reviewDate: new Date('2022-09-18'),
      complianceCheck: true,
      approvedBy: 'Arq. Ana Martínez',
    },
  ];

  const created = [];
  for (const permit of permits) {
    if (!permit.propertyId) continue;

    const existing = await prisma.constructionPermit.findFirst({
      where: { permitNumber: permit.permitNumber },
    });

    if (!existing) {
      const created_permit = await prisma.constructionPermit.create({
        data: permit,
      });
      created.push(created_permit);
      console.log(`   ✅ ${permit.permitNumber} - ${permit.permitType} - ${permit.status}`);
    } else {
      console.log(`   ⏭️  ${permit.permitNumber} ya existe`);
    }
  }

  console.log(`✅ ${created.length} permisos de construcción creados\n`);
  return created;
}

export { seedConstructionPermits };
