import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedEnhancedProjects() {
  console.log('🌱 Seeding enhanced projects data...');

  // Obtener usuarios para asignar como managers e inspectores
  const users = await prisma.user.findMany({ take: 5 });
  if (users.length === 0) {
    console.log('⚠️  No users found. Skipping enhanced projects seed.');
    return;
  }

  const managerId = users[0].id;
  const inspectorId = users[1]?.id || users[0].id;

  // 1. Crear Contratistas
  console.log('Creating contractors...');
  const contractors = await Promise.all([
    prisma.contractor.upsert({
      where: { rif: 'J-123456789' },
      update: {},
      create: {
        rif: 'J-123456789',
        name: 'Construcciones El Progreso C.A.',
        legalRepresentative: 'Carlos Rodríguez',
        phone: '+58-212-5551234',
        email: 'info@elprogreso.com',
        address: 'Av. Principal, Edificio Centro, Piso 3, Caracas',
        specialty: 'Construcción y Obra Civil',
        yearsExperience: 15,
        isActive: true,
        averageRating: 4.5,
      },
    }),
    prisma.contractor.upsert({
      where: { rif: 'J-987654321' },
      update: {},
      create: {
        rif: 'J-987654321',
        name: 'Ingeniería y Vialidad S.A.',
        legalRepresentative: 'María González',
        phone: '+58-212-5555678',
        email: 'contacto@vialidad.com',
        address: 'Calle Comercio, Centro Empresarial, Caracas',
        specialty: 'Vialidad y Pavimentación',
        yearsExperience: 20,
        isActive: true,
        averageRating: 4.8,
      },
    }),
    prisma.contractor.upsert({
      where: { rif: 'J-456789123' },
      update: {},
      create: {
        rif: 'J-456789123',
        name: 'Servicios Integrales del Municipio',
        legalRepresentative: 'Pedro Martínez',
        phone: '+58-212-5559999',
        email: 'sim@email.com',
        address: 'Zona Industrial, Galpón 5, Caracas',
        specialty: 'Servicios Generales',
        yearsExperience: 8,
        isActive: true,
        averageRating: 3.9,
      },
    }),
  ]);

  console.log(`✅ Created ${contractors.length} contractors`);

  // 2. Crear Proyectos Mejorados
  console.log('Creating enhanced projects...');

  // Proyecto 1: Reparación de Avenida Principal
  const project1 = await prisma.project.upsert({
    where: { code: 'PRO-2025-001' },
    update: {},
    create: {
      code: 'PRO-2025-001',
      name: 'Reparación de Avenida Principal',
      description: 'Proyecto integral de reparación y mejoramiento de la Avenida Principal, incluyendo pavimentación, señalización y drenaje.',
      budget: 850000.00,
      fundingSource: 'Presupuesto Ordinario Municipal + FUS',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectType: 'OBRA_CIVIL',
      origin: 'PLAN_GOBIERNO',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-06-30'),
      actualStartDate: new Date('2025-01-20'),
      location: 'Avenida Principal, desde Plaza Bolívar hasta Redoma El Obelisco',
      latitude: 10.4806,
      longitude: -66.9036,
      sector: 'Centro',
      category: 'Vialidad',
      beneficiaries: 25000,
      managerId,
      justification: 'La Avenida Principal presenta deterioro severo del pavimento que afecta la movilidad de más de 25,000 ciudadanos diariamente y genera riesgos de accidentes vehiculares.',
      generalObjective: 'Mejorar las condiciones de transitabilidad y seguridad vial de la Avenida Principal del municipio.',
      specificObjectives: '1. Reparar 3.5 km de pavimento asfáltico\n2. Instalar nueva señalización horizontal y vertical\n3. Rehabilitar sistema de drenaje\n4. Mejorar iluminación vial',
      quantifiableGoals: '- 3.5 km de vía reparada\n- 120 señales viales instaladas\n- 45 sumideros rehabilitados\n- 80 luminarias LED instaladas',
      technicalDescription: 'Proyecto que contempla fresado de carpeta asfáltica existente, reparación de base granular, aplicación de riego de liga y nueva carpeta asfáltica de 5cm.',
      technicalSpecifications: 'Concreto asfáltico tipo IV, resistencia mínima 280 kg/cm², agregados de calidad certificada, señalización reflectiva grado diamante.',
      plannedProgress: 65,
      actualProgress: 58,
    },
  });

  // Proyecto 2: Construcción de Centro de Salud
  const project2 = await prisma.project.upsert({
    where: { code: 'PRO-2025-002' },
    update: {},
    create: {
      code: 'PRO-2025-002',
      name: 'Construcción de Centro de Salud Comunal',
      description: 'Construcción de centro de atención primaria en salud para la parroquia San José.',
      budget: 1250000.00,
      fundingSource: 'Fontur + Presupuesto Municipal',
      status: 'APPROVED',
      priority: 'CRITICAL',
      projectType: 'SOCIAL',
      origin: 'PRESUPUESTO_PARTICIPATIVO',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-31'),
      location: 'Sector La Esperanza, terreno municipal lote 15',
      latitude: 10.4905,
      longitude: -66.8845,
      sector: 'Norte',
      category: 'Salud',
      beneficiaries: 15000,
      managerId,
      justification: 'La parroquia San José carece de infraestructura de salud adecuada, obligando a los residentes a desplazarse más de 10km para atención médica básica.',
      generalObjective: 'Garantizar el acceso a servicios de salud primaria para la población de la parroquia San José.',
      specificObjectives: '1. Construir edificación de 400m² con consultorios y área de emergencia\n2. Dotar de equipamiento médico básico\n3. Capacitar personal de salud comunitaria',
      quantifiableGoals: '- 400m² de construcción\n- 6 consultorios médicos\n- 1 área de emergencia 24h\n- 20 personas capacitadas',
      technicalDescription: 'Edificación de una planta en concreto armado, techos metálicos, acabados sanitarios de alta calidad.',
      technicalSpecifications: 'Concreto f\'c=210 kg/cm², acero corrugado grado 60, instalaciones eléctricas y sanitarias según normas de salud.',
      plannedProgress: 0,
      actualProgress: 0,
    },
  });

  // Proyecto 3: Sistema de Recolección de Desechos
  const project3 = await prisma.project.upsert({
    where: { code: 'PRO-2025-003' },
    update: {},
    create: {
      code: 'PRO-2025-003',
      name: 'Modernización del Sistema de Recolección de Desechos Sólidos',
      description: 'Adquisición de equipos y modernización del servicio de aseo urbano.',
      budget: 450000.00,
      fundingSource: 'Presupuesto Ordinario',
      status: 'PLANNING',
      priority: 'MEDIUM',
      projectType: 'INSTITUCIONAL',
      origin: 'PLAN_GOBIERNO',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-07-31'),
      location: 'Todo el municipio - Base operativa Zona Industrial',
      latitude: 10.4750,
      longitude: -66.9150,
      sector: 'Municipal',
      category: 'Ambiente',
      beneficiaries: 80000,
      managerId,
      justification: 'El servicio de recolección actual es deficiente debido a la antigüedad de los equipos (más de 15 años), generando acumulación de desechos en vías públicas.',
      generalObjective: 'Mejorar la eficiencia y cobertura del servicio de recolección de desechos sólidos en todo el municipio.',
      specificObjectives: '1. Adquirir 3 camiones compactadores nuevos\n2. Implementar sistema de rutas optimizadas\n3. Capacitar al personal operativo',
      quantifiableGoals: '- 3 camiones compactadores 16m³\n- Cobertura del 95% del municipio\n- Reducción del 40% en tiempo de recolección',
      plannedProgress: 0,
      actualProgress: 0,
    },
  });

  console.log(`✅ Created 3 enhanced projects`);

  // 3. Crear Contratos
  console.log('Creating contracts...');
  const contract1 = await prisma.projectContract.create({
    data: {
      projectId: project1.id,
      contractNumber: 'CONT-2025-001',
      type: 'LICITACION_PUBLICA',
      status: 'EN_EJECUCION',
      description: 'Contrato para ejecución de obras de reparación vial en Avenida Principal según especificaciones técnicas del proyecto.',
      contractAmount: 820000.00,
      bidOpeningDate: new Date('2024-12-10'),
      adjudicationDate: new Date('2024-12-20'),
      signedDate: new Date('2025-01-05'),
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-06-30'),
      contractorId: contractors[1].id,
      advancePayment: 164000.00, // 20% anticipo
      advancePaymentPercent: 20,
      retentionPercent: 10,
      paidAmount: 410000.00, // 50% pagado
    },
  });

  const contract2 = await prisma.projectContract.create({
    data: {
      projectId: project2.id,
      contractNumber: 'CONT-2025-002',
      type: 'LICITACION_PUBLICA',
      status: 'FIRMADO',
      description: 'Construcción de Centro de Salud Comunal incluyendo obra civil, instalaciones y equipamiento.',
      contractAmount: 1200000.00,
      bidOpeningDate: new Date('2025-01-15'),
      adjudicationDate: new Date('2025-02-01'),
      signedDate: new Date('2025-02-15'),
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-31'),
      contractorId: contractors[0].id,
      advancePayment: 240000.00,
      advancePaymentPercent: 20,
      retentionPercent: 10,
      paidAmount: 240000.00,
    },
  });

  console.log(`✅ Created 2 contracts`);

  // 4. Crear Documentos Técnicos
  console.log('Creating technical documents...');
  await Promise.all([
    prisma.projectDocument.create({
      data: {
        projectId: project1.id,
        name: 'Plano de Ubicación General',
        description: 'Plano topográfico con ubicación exacta del proyecto',
        type: 'PLANO',
        fileUrl: '/documents/pro-001-plano-ubicacion.pdf',
        fileSize: 2048000,
        uploadedBy: managerId,
        version: '1.0',
      },
    }),
    prisma.projectDocument.create({
      data: {
        projectId: project1.id,
        name: 'Especificaciones Técnicas de Pavimento',
        description: 'Especificaciones detalladas del concreto asfáltico a utilizar',
        type: 'ESPECIFICACION',
        fileUrl: '/documents/pro-001-especificaciones-pavimento.pdf',
        fileSize: 1024000,
        uploadedBy: managerId,
        version: '2.0',
      },
    }),
    prisma.projectDocument.create({
      data: {
        projectId: project1.id,
        name: 'Presupuesto Detallado',
        description: 'APU y presupuesto desglosado por partidas',
        type: 'PRESUPUESTO',
        fileUrl: '/documents/pro-001-presupuesto.xlsx',
        fileSize: 512000,
        uploadedBy: managerId,
        version: '1.5',
      },
    }),
    prisma.projectDocument.create({
      data: {
        projectId: project2.id,
        name: 'Planos Arquitectónicos',
        description: 'Planos de plantas, cortes y fachadas del centro de salud',
        type: 'PLANO',
        fileUrl: '/documents/pro-002-planos-arquitectonicos.dwg',
        fileSize: 5120000,
        uploadedBy: managerId,
        version: '3.0',
      },
    }),
    prisma.projectDocument.create({
      data: {
        projectId: project2.id,
        name: 'Estudio de Suelos',
        description: 'Análisis geotécnico del terreno',
        type: 'ESTUDIO',
        fileUrl: '/documents/pro-002-estudio-suelos.pdf',
        fileSize: 3072000,
        uploadedBy: managerId,
        version: '1.0',
      },
    }),
  ]);

  console.log('✅ Created 5 technical documents');

  // 5. Crear Inspecciones
  console.log('Creating inspections...');
  await Promise.all([
    prisma.projectInspection.create({
      data: {
        projectId: project1.id,
        inspectionNumber: 'INSP-2025-001',
        type: 'TECNICA',
        status: 'CERRADA',
        result: 'APROBADO',
        scheduledDate: new Date('2025-02-15'),
        completedDate: new Date('2025-02-15'),
        location: 'Tramo 1 - Km 0+000 al 0+500',
        inspectorId,
        observations: 'Avance conforme a planificado. Calidad del pavimento cumple especificaciones. Espesor verificado con testigos.',
        nonConformities: 'Ninguna',
        correctiveActions: 'N/A',
        followUpRequired: false,
      },
    }),
    prisma.projectInspection.create({
      data: {
        projectId: project1.id,
        inspectionNumber: 'INSP-2025-002',
        type: 'CALIDAD',
        status: 'REALIZADA',
        result: 'CON_OBSERVACIONES',
        scheduledDate: new Date('2025-03-01'),
        completedDate: new Date('2025-03-01'),
        location: 'Tramo 2 - Km 1+000 al 1+500',
        inspectorId,
        observations: 'Se detectaron irregularidades menores en juntas de dilatación.',
        nonConformities: 'Juntas de dilatación no cumplen espaciamiento mínimo en 3 puntos',
        correctiveActions: 'Corregir espaciamiento de juntas en los puntos señalados. Plazo: 5 días hábiles.',
        followUpRequired: true,
        followUpDate: new Date('2025-03-08'),
      },
    }),
    prisma.projectInspection.create({
      data: {
        projectId: project1.id,
        inspectionNumber: 'INSP-2025-003',
        type: 'SEGURIDAD',
        status: 'PROGRAMADA',
        scheduledDate: new Date('2025-05-15'),
        location: 'Todo el proyecto',
        inspectorId,
        observations: null,
        followUpRequired: false,
      },
    }),
  ]);

  console.log('✅ Created 3 inspections');

  // 6. Crear Órdenes de Cambio
  console.log('Creating change orders...');
  await Promise.all([
    prisma.changeOrder.create({
      data: {
        projectId: project1.id,
        orderNumber: 'OC-2025-001',
        description: 'Ampliación de alcance: Reparación de 500m adicionales de vía',
        justification: 'Durante la ejecución se detectó que el tramo adyacente requiere reparación urgente para evitar daños mayores.',
        requestedBy: 'CONTRATISTA',
        status: 'APROBADO',
        costImpact: 95000.00,
        timeImpact: 15, // 15 días adicionales
        requestDate: new Date('2025-02-20'),
        reviewDate: new Date('2025-02-25'),
        approvalDate: new Date('2025-03-01'),
        requestedByUserId: managerId,
        reviewedByUserId: managerId,
        approvedByUserId: managerId,
        reviewNotes: 'Revisado y considerado necesario para la integridad del proyecto.',
      },
    }),
    prisma.changeOrder.create({
      data: {
        projectId: project1.id,
        orderNumber: 'OC-2025-002',
        description: 'Modificación del sistema de drenaje por interferencias encontradas',
        justification: 'Se encontraron tuberías de agua potable no registradas en planos que interfieren con el diseño original del drenaje.',
        requestedBy: 'INSPECTOR',
        status: 'EN_REVISION',
        costImpact: 35000.00,
        timeImpact: 8,
        requestDate: new Date('2025-03-15'),
        requestedByUserId: inspectorId,
        reviewNotes: null,
      },
    }),
  ]);

  console.log('✅ Created 2 change orders');

  // 7. Crear Reportes de Avance
  console.log('Creating progress reports...');
  await Promise.all([
    prisma.progressReport.create({
      data: {
        projectId: project1.id,
        reportNumber: 'REP-PRO-2025-001-001',
        reportDate: new Date('2025-02-01'),
        periodStart: new Date('2025-01-20'),
        periodEnd: new Date('2025-01-31'),
        physicalProgress: 15,
        plannedProgress: 18,
        variance: -3,
        executedAmount: 123000.00,
        accumulatedAmount: 123000.00,
        activitiesCompleted: '- Limpieza y preparación del sitio\n- Fresado de 800m de carpeta asfáltica\n- Reparación de base en 500m',
        activitiesInProgress: '- Aplicación de riego de liga\n- Colocación de nueva carpeta asfáltica',
        plannedActivities: '- Completar asfaltado tramo 1\n- Iniciar señalización',
        observations: 'Avance ligeramente por debajo de lo planificado debido a lluvias en la primera semana.',
        issues: 'Retraso de 3 días por condiciones climáticas adversas',
        risks: 'Riesgo de nuevas lluvias en febrero que podrían afectar el cronograma',
        weatherConditions: 'Lluvioso primera semana, soleado resto del período',
        workDays: 8,
        reportedBy: managerId,
      },
    }),
    prisma.progressReport.create({
      data: {
        projectId: project1.id,
        reportNumber: 'REP-PRO-2025-001-002',
        reportDate: new Date('2025-03-01'),
        periodStart: new Date('2025-02-01'),
        periodEnd: new Date('2025-02-28'),
        physicalProgress: 38,
        plannedProgress: 35,
        variance: 3,
        executedAmount: 189000.00,
        accumulatedAmount: 312000.00,
        activitiesCompleted: '- Asfaltado completo tramo 1 (1.2 km)\n- Instalación de 45 señales verticales\n- Pintura de 800m de marcas viales',
        activitiesInProgress: '- Fresado tramo 2\n- Rehabilitación de sumideros',
        plannedActivities: '- Completar tramo 2\n- Instalar iluminación LED',
        observations: 'Excelente avance durante febrero. Se recuperó el retraso del mes anterior.',
        issues: 'Ninguno significativo',
        risks: 'Ninguno identificado',
        weatherConditions: 'Soleado, condiciones óptimas',
        workDays: 20,
        reportedBy: managerId,
      },
    }),
  ]);

  console.log('✅ Created 2 progress reports');

  console.log('✅ Enhanced projects seed completed successfully!');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEnhancedProjects()
    .catch((e) => {
      console.error('❌ Error seeding enhanced projects:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
