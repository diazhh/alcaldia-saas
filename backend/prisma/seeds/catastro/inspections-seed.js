import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Seed de Inspecciones - Inspecciones de obra e inspecciones urbanas
 */
async function seedInspections() {
  console.log('🔍 Seeding Inspecciones...');

  // Obtener permisos para inspecciones de obra
  const permits = await prisma.constructionPermit.findMany({
    where: {
      status: {
        in: ['IN_CONSTRUCTION', 'COMPLETED'],
      },
    },
    take: 10,
  });

  // Obtener propiedades para inspecciones urbanas
  const properties = await prisma.property.findMany({
    take: 20,
    orderBy: { cadastralCode: 'asc' },
  });

  let createdPermitInspections = 0;
  let createdUrbanInspections = 0;

  // INSPECCIONES DE OBRA (15)
  if (permits.length > 0) {
    const permitInspections = [
      {
        permitId: permits[0]?.id,
        inspectionType: 'FOUNDATION',
        scheduledDate: new Date('2024-01-15'),
        inspectionDate: new Date('2024-01-15'),
        inspector: 'Ing. Pedro Ramírez',
        status: 'APPROVED',
        findings: 'Cimentación ejecutada según planos. Profundidad adecuada.',
        photos: ['/uploads/inspections/foundation-001.jpg'],
        isApproved: true,
      },
      {
        permitId: permits[0]?.id,
        inspectionType: 'STRUCTURE',
        scheduledDate: new Date('2024-02-20'),
        inspectionDate: new Date('2024-02-20'),
        inspector: 'Ing. Carlos López',
        status: 'APPROVED',
        findings: 'Estructura de concreto conforme a especificaciones.',
        photos: ['/uploads/inspections/structure-001.jpg'],
        isApproved: true,
      },
      {
        permitId: permits[0]?.id,
        inspectionType: 'FINAL',
        scheduledDate: new Date('2024-06-28'),
        inspectionDate: new Date('2024-06-30'),
        inspector: 'Ing. Pedro Ramírez',
        status: 'APPROVED',
        findings: 'Obra completada satisfactoriamente. Cumple con planos aprobados.',
        photos: ['/uploads/inspections/final-001.jpg'],
        isApproved: true,
      },
      {
        permitId: permits[1]?.id,
        inspectionType: 'FOUNDATION',
        scheduledDate: new Date('2024-01-20'),
        inspectionDate: new Date('2024-01-22'),
        inspector: 'Ing. Carlos López',
        status: 'CORRECTIONS_REQUIRED',
        findings: 'Profundidad de zapatas insuficiente en sector norte. Requiere corrección.',
        correctiveActions: 'Excavar 30cm adicionales en zapatas del sector norte.',
        photos: ['/uploads/inspections/foundation-002.jpg'],
        isApproved: false,
      },
      {
        permitId: permits[1]?.id,
        inspectionType: 'FOUNDATION',
        scheduledDate: new Date('2024-02-05'),
        inspectionDate: new Date('2024-02-05'),
        inspector: 'Ing. Carlos López',
        status: 'APPROVED',
        findings: 'Correcciones ejecutadas satisfactoriamente.',
        photos: ['/uploads/inspections/foundation-002-corrected.jpg'],
        isApproved: true,
      },
      {
        permitId: permits[1]?.id,
        inspectionType: 'STRUCTURE',
        scheduledDate: new Date('2024-03-15'),
        inspectionDate: new Date('2024-03-15'),
        inspector: 'Ing. Pedro Ramírez',
        status: 'APPROVED',
        findings: 'Estructura conforme. Columnas y vigas según planos.',
        isApproved: true,
      },
      {
        permitId: permits[1]?.id,
        inspectionType: 'INSTALLATIONS',
        scheduledDate: new Date('2024-05-10'),
        inspectionDate: new Date('2024-05-12'),
        inspector: 'Ing. Carlos López',
        status: 'APPROVED',
        findings: 'Instalaciones eléctricas y sanitarias conformes.',
        isApproved: true,
      },
    ];

    for (const inspection of permitInspections) {
      if (!inspection.permitId) continue;

      const created = await prisma.permitInspection.create({
        data: inspection,
      });
      createdPermitInspections++;
      console.log(`   ✅ Inspección de obra: ${inspection.inspectionType} - ${inspection.status}`);
    }
  }

  // INSPECCIONES URBANAS (25)
  if (properties.length > 0) {
    const urbanInspections = [
      // Por denuncias
      {
        inspectionNumber: 'IU-2024-0001',
        propertyId: properties[10]?.id,
        inspectionType: 'ILLEGAL_CONSTRUCTION',
        origin: 'COMPLAINT',
        complaintDate: new Date('2024-01-10'),
        complainantName: 'Anónimo',
        description: 'Construcción sin permiso en segundo piso',
        scheduledDate: new Date('2024-01-15'),
        inspectionDate: new Date('2024-01-15'),
        inspector: 'Ing. Pedro Ramírez',
        status: 'NOTIFIED',
        findings: 'Se constató construcción de segundo piso sin permiso. Área aproximada 60m².',
        hasViolations: true,
        violationType: 'LACK_OF_PERMIT',
        violationDetails: 'Construcción de ampliación sin permiso municipal.',
        photos: ['/uploads/inspections/urban-001.jpg'],
        notificationDate: new Date('2024-01-20'),
        notificationMethod: 'Personal',
        notificationRecipient: 'Propietario',
      },
      {
        inspectionNumber: 'IU-2024-0002',
        propertyId: properties[11]?.id,
        inspectionType: 'ZONING_VIOLATION',
        origin: 'COMPLAINT',
        complaintDate: new Date('2024-02-05'),
        complainantName: 'Junta de Vecinos Sector Norte',
        complainantPhone: '+58 412-9999999',
        description: 'Local comercial en zona residencial',
        scheduledDate: new Date('2024-02-10'),
        inspectionDate: new Date('2024-02-10'),
        inspector: 'Arq. Ana Martínez',
        status: 'PENDING_RESOLUTION',
        findings: 'Vivienda convertida en local comercial (bodega) en zona R1.',
        hasViolations: true,
        violationType: 'ZONING_VIOLATION',
        violationDetails: 'Uso comercial en zona exclusivamente residencial.',
        photos: ['/uploads/inspections/urban-002.jpg'],
        notificationDate: new Date('2024-02-15'),
        notificationMethod: 'Personal',
        sanctionType: 'WARNING',
        sanctionAmount: 0,
        sanctionDate: new Date('2024-02-20'),
        sanctionDetails: 'Primera advertencia. Plazo de 30 días para cesar actividad comercial.',
      },
      {
        inspectionNumber: 'IU-2024-0003',
        propertyId: properties[12]?.id,
        inspectionType: 'INVASION',
        origin: 'COMPLAINT',
        complaintDate: new Date('2024-03-01'),
        complainantName: 'Vecino colindante',
        description: 'Invasión de acera con construcción',
        scheduledDate: new Date('2024-03-05'),
        inspectionDate: new Date('2024-03-05'),
        inspector: 'Ing. Carlos López',
        status: 'RESOLVED',
        findings: 'Rampa de acceso invade 1.5m de acera pública.',
        hasViolations: true,
        violationType: 'INVASION',
        violationDetails: 'Invasión de espacio público (acera).',
        photos: ['/uploads/inspections/urban-003.jpg'],
        notificationDate: new Date('2024-03-08'),
        notificationMethod: 'Personal',
        sanctionType: 'FINE',
        sanctionAmount: 500.00,
        sanctionDate: new Date('2024-03-10'),
        sanctionDetails: 'Multa por invasión. Orden de demolición de rampa.',
        resolutionDate: new Date('2024-03-25'),
        resolutionDetails: 'Rampa demolida. Acera restaurada.',
      },
      // Inspecciones de rutina
      {
        inspectionNumber: 'IU-2024-0010',
        propertyId: properties[13]?.id,
        inspectionType: 'ROUTINE',
        origin: 'ROUTINE',
        description: 'Inspección de rutina sector comercial',
        scheduledDate: new Date('2024-04-10'),
        inspectionDate: new Date('2024-04-10'),
        inspector: 'Ing. Pedro Ramírez',
        status: 'COMPLETED',
        findings: 'Propiedad en buen estado. Cumple normativas.',
        hasViolations: false,
      },
      {
        inspectionNumber: 'IU-2024-0011',
        propertyId: properties[14]?.id,
        inspectionType: 'ROUTINE',
        origin: 'ROUTINE',
        description: 'Inspección de rutina zona residencial',
        scheduledDate: new Date('2024-04-15'),
        inspectionDate: new Date('2024-04-15'),
        inspector: 'Arq. Ana Martínez',
        status: 'COMPLETED',
        findings: 'Sin novedades. Propiedad conforme.',
        hasViolations: false,
      },
      // Inspecciones de seguridad
      {
        inspectionNumber: 'IU-2024-0020',
        propertyId: properties[15]?.id,
        inspectionType: 'SAFETY',
        origin: 'EMERGENCY',
        description: 'Edificación con riesgo de colapso',
        scheduledDate: new Date('2024-05-20'),
        inspectionDate: new Date('2024-05-20'),
        inspector: 'Ing. Carlos López',
        status: 'NOTIFIED',
        findings: 'Grietas estructurales en columnas. Riesgo alto.',
        hasViolations: true,
        violationType: 'SAFETY',
        violationDetails: 'Edificación en riesgo de colapso. Peligro inminente.',
        photos: ['/uploads/inspections/urban-020.jpg', '/uploads/inspections/urban-020-2.jpg'],
        notificationDate: new Date('2024-05-20'),
        notificationMethod: 'Personal y publicación',
        sanctionType: 'STOP_WORK',
        sanctionDate: new Date('2024-05-20'),
        sanctionDetails: 'Desalojo inmediato. Prohibición de uso hasta reparación estructural.',
      },
      // Inspecciones ambientales
      {
        inspectionNumber: 'IU-2024-0025',
        propertyId: properties[16]?.id,
        inspectionType: 'ENVIRONMENTAL',
        origin: 'COMPLAINT',
        complaintDate: new Date('2024-06-01'),
        complainantName: 'Comunidad Organizada',
        description: 'Tala de árboles sin autorización',
        scheduledDate: new Date('2024-06-05'),
        inspectionDate: new Date('2024-06-05'),
        inspector: 'Arq. Ana Martínez',
        status: 'PENDING_RESOLUTION',
        findings: 'Tala de 5 árboles de gran porte sin permiso ambiental.',
        hasViolations: true,
        violationType: 'ENVIRONMENTAL',
        violationDetails: 'Tala no autorizada en área protegida.',
        photos: ['/uploads/inspections/urban-025.jpg'],
        notificationDate: new Date('2024-06-08'),
        sanctionType: 'FINE',
        sanctionAmount: 2000.00,
        sanctionDate: new Date('2024-06-10'),
        sanctionDetails: 'Multa por daño ambiental. Orden de reforestación.',
      },
      // Seguimiento
      {
        inspectionNumber: 'IU-2024-0030',
        propertyId: properties[11]?.id,
        inspectionType: 'FOLLOW_UP',
        origin: 'FOLLOW_UP',
        description: 'Seguimiento a IU-2024-0002',
        scheduledDate: new Date('2024-08-15'),
        inspectionDate: new Date('2024-08-15'),
        inspector: 'Arq. Ana Martínez',
        status: 'RESOLVED',
        findings: 'Actividad comercial cesada. Vivienda restaurada a uso residencial.',
        hasViolations: false,
        resolutionDate: new Date('2024-08-15'),
        resolutionDetails: 'Caso resuelto satisfactoriamente.',
      },
    ];

    for (const inspection of urbanInspections) {
      if (!inspection.propertyId) continue;

      const existing = await prisma.urbanInspection.findFirst({
        where: { inspectionNumber: inspection.inspectionNumber },
      });

      if (!existing) {
        await prisma.urbanInspection.create({
          data: inspection,
        });
        createdUrbanInspections++;
        console.log(`   ✅ ${inspection.inspectionNumber} - ${inspection.inspectionType} - ${inspection.status}`);
      } else {
        console.log(`   ⏭️  ${inspection.inspectionNumber} ya existe`);
      }
    }
  }

  console.log(`✅ ${createdPermitInspections} inspecciones de obra creadas`);
  console.log(`✅ ${createdUrbanInspections} inspecciones urbanas creadas\n`);
  
  return { permitInspections: createdPermitInspections, urbanInspections: createdUrbanInspections };
}

export { seedInspections };
