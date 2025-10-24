import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed de proyectos municipales
 */
export async function seedProjects() {
  console.log('🏗️  Creando proyectos de prueba...');

  // Obtener un usuario admin para asignar como manager
  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'SUPER_ADMIN' },
        { role: 'ADMIN' },
        { role: 'DIRECTOR' }
      ]
    }
  });

  if (!admin) {
    console.log('⚠️  No se encontró un usuario admin. Creando uno...');
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@municipal.gob.ve',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Municipal',
        role: 'ADMIN',
        phone: '+58 414 1234567',
        isActive: true,
      },
    });
    
    console.log('✅ Usuario admin creado:', newAdmin.email);
    return seedProjects(); // Reintentar
  }

  const managerId = admin.id;

  // Proyectos de ejemplo
  const projects = [
    {
      code: 'PRO-2025-001',
      name: 'Reparación de Avenida Principal',
      description: 'Proyecto de rehabilitación y asfaltado de la Avenida Principal del municipio, incluyendo señalización vial y aceras.',
      budget: 250000.00,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-06-30'),
      actualStartDate: new Date('2025-01-20'),
      location: 'Avenida Principal, Centro',
      latitude: 10.4806,
      longitude: -66.9036,
      sector: 'Centro',
      category: 'Vialidad',
      beneficiaries: 15000,
      objectives: 'Mejorar la infraestructura vial del centro de la ciudad',
      scope: 'Asfaltado de 2.5 km de vía, construcción de aceras y señalización',
      managerId,
    },
    {
      code: 'PRO-2025-002',
      name: 'Construcción de Plaza Recreativa',
      description: 'Construcción de una nueva plaza recreativa con áreas verdes, juegos infantiles y espacios deportivos.',
      budget: 180000.00,
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-09-30'),
      location: 'Sector Norte, Urbanización Los Pinos',
      latitude: 10.4906,
      longitude: -66.8936,
      sector: 'Norte',
      category: 'Recreación',
      beneficiaries: 8000,
      objectives: 'Crear espacios de recreación para la comunidad',
      scope: 'Construcción de plaza de 5000 m² con áreas verdes y equipamiento',
      managerId,
    },
    {
      code: 'PRO-2025-003',
      name: 'Rehabilitación de Ambulatorio Municipal',
      description: 'Proyecto de rehabilitación integral del ambulatorio municipal, incluyendo remodelación de consultorios y actualización de equipos.',
      budget: 320000.00,
      status: 'APPROVED',
      priority: 'CRITICAL',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-08-31'),
      location: 'Calle 5, Sector Sur',
      latitude: 10.4706,
      longitude: -66.9136,
      sector: 'Sur',
      category: 'Salud',
      beneficiaries: 25000,
      objectives: 'Mejorar la infraestructura de salud pública',
      scope: 'Remodelación de 15 consultorios, actualización de equipos médicos',
      managerId,
    },
    {
      code: 'PRO-2025-004',
      name: 'Ampliación de Escuela Básica',
      description: 'Ampliación de la Escuela Básica Municipal con construcción de nuevas aulas y laboratorios.',
      budget: 280000.00,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-07-15'),
      actualStartDate: new Date('2025-01-15'),
      location: 'Avenida Educación, Sector Este',
      latitude: 10.4856,
      longitude: -66.8886,
      sector: 'Este',
      category: 'Educación',
      beneficiaries: 1200,
      objectives: 'Ampliar la capacidad educativa del municipio',
      scope: 'Construcción de 8 nuevas aulas y 2 laboratorios',
      managerId,
    },
    {
      code: 'PRO-2025-005',
      name: 'Sistema de Alumbrado Público LED',
      description: 'Instalación de sistema de alumbrado público LED en todo el municipio para mejorar la seguridad y reducir el consumo energético.',
      budget: 450000.00,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-05-31'),
      actualStartDate: new Date('2024-11-05'),
      location: 'Todo el municipio',
      latitude: 10.4806,
      longitude: -66.9036,
      sector: 'Todos',
      category: 'Servicios Públicos',
      beneficiaries: 50000,
      objectives: 'Mejorar la iluminación pública y reducir costos energéticos',
      scope: 'Instalación de 2500 luminarias LED en todas las calles',
      managerId,
    },
    {
      code: 'PRO-2025-006',
      name: 'Parque Ecológico Municipal',
      description: 'Creación de un parque ecológico con senderos, áreas de picnic y centro de educación ambiental.',
      budget: 200000.00,
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2025-12-31'),
      location: 'Zona Oeste, Terreno Municipal',
      latitude: 10.4756,
      longitude: -66.9236,
      sector: 'Oeste',
      category: 'Ambiente',
      beneficiaries: 30000,
      objectives: 'Crear un espacio de conservación y educación ambiental',
      scope: 'Desarrollo de parque de 10 hectáreas con senderos y centro educativo',
      managerId,
    },
    {
      code: 'PRO-2024-015',
      name: 'Mercado Municipal Modernizado',
      description: 'Remodelación completa del mercado municipal con nuevos puestos y áreas de servicio.',
      budget: 350000.00,
      status: 'COMPLETED',
      priority: 'HIGH',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-11-30'),
      actualStartDate: new Date('2024-03-05'),
      actualEndDate: new Date('2024-11-25'),
      location: 'Calle Comercio, Centro',
      latitude: 10.4816,
      longitude: -66.9046,
      sector: 'Centro',
      category: 'Comercio',
      beneficiaries: 20000,
      objectives: 'Modernizar la infraestructura comercial del municipio',
      scope: 'Remodelación de 150 puestos comerciales y áreas comunes',
      managerId,
    },
    {
      code: 'PRO-2025-007',
      name: 'Red de Cloacas Sector Norte',
      description: 'Construcción de red de cloacas en el Sector Norte para mejorar el saneamiento.',
      budget: 420000.00,
      status: 'APPROVED',
      priority: 'CRITICAL',
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-10-31'),
      location: 'Sector Norte, Varias calles',
      latitude: 10.4906,
      longitude: -66.8936,
      sector: 'Norte',
      category: 'Saneamiento',
      beneficiaries: 12000,
      objectives: 'Mejorar el sistema de saneamiento en el sector norte',
      scope: 'Construcción de 8 km de red de cloacas',
      managerId,
    },
  ];

  // Crear proyectos
  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: projectData,
    });

    console.log(`✅ Proyecto creado: ${project.code} - ${project.name}`);

    // Crear hitos para proyectos en progreso o completados
    if (project.status === 'IN_PROGRESS' || project.status === 'COMPLETED') {
      const milestones = [
        {
          projectId: project.id,
          name: 'Fase de Planificación',
          description: 'Elaboración de planos y especificaciones técnicas',
          dueDate: new Date(project.startDate.getTime() + 15 * 24 * 60 * 60 * 1000),
          completedAt: new Date(project.startDate.getTime() + 12 * 24 * 60 * 60 * 1000),
          progress: 100,
          status: 'COMPLETED',
          order: 1,
        },
        {
          projectId: project.id,
          name: 'Adquisición de Materiales',
          description: 'Compra y recepción de materiales necesarios',
          dueDate: new Date(project.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          completedAt: project.status === 'COMPLETED' ? new Date(project.startDate.getTime() + 28 * 24 * 60 * 60 * 1000) : null,
          progress: project.status === 'COMPLETED' ? 100 : 85,
          status: project.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          order: 2,
        },
        {
          projectId: project.id,
          name: 'Ejecución de Obra',
          description: 'Construcción y desarrollo del proyecto',
          dueDate: new Date(project.endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          completedAt: project.status === 'COMPLETED' ? new Date(project.endDate.getTime() - 35 * 24 * 60 * 60 * 1000) : null,
          progress: project.status === 'COMPLETED' ? 100 : 60,
          status: project.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          order: 3,
        },
        {
          projectId: project.id,
          name: 'Inspección Final',
          description: 'Revisión y aprobación de la obra ejecutada',
          dueDate: project.endDate,
          completedAt: project.status === 'COMPLETED' ? project.actualEndDate : null,
          progress: project.status === 'COMPLETED' ? 100 : 0,
          status: project.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
          order: 4,
        },
      ];

      for (const milestoneData of milestones) {
        await prisma.milestone.create({
          data: milestoneData,
        });
      }

      // Crear gastos
      const expenses = [
        {
          projectId: project.id,
          concept: 'Materiales de construcción',
          description: 'Cemento, arena, cabillas y otros materiales',
          amount: parseFloat(project.budget) * 0.35,
          date: new Date(project.startDate.getTime() + 20 * 24 * 60 * 60 * 1000),
          category: 'Materiales',
          invoice: `INV-${Math.floor(Math.random() * 10000)}`,
          supplier: 'Ferretería Central C.A.',
        },
        {
          projectId: project.id,
          concept: 'Mano de obra',
          description: 'Pago de personal técnico y obreros',
          amount: parseFloat(project.budget) * 0.40,
          date: new Date(project.startDate.getTime() + 45 * 24 * 60 * 60 * 1000),
          category: 'Personal',
          invoice: `INV-${Math.floor(Math.random() * 10000)}`,
          supplier: 'Nómina Municipal',
        },
        {
          projectId: project.id,
          concept: 'Equipos y maquinaria',
          description: 'Alquiler de maquinaria pesada',
          amount: parseFloat(project.budget) * 0.15,
          date: new Date(project.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          category: 'Equipos',
          invoice: `INV-${Math.floor(Math.random() * 10000)}`,
          supplier: 'Maquinarias del Centro',
        },
      ];

      for (const expenseData of expenses) {
        await prisma.projectExpense.create({
          data: expenseData,
        });
      }

      console.log(`  ✅ Hitos y gastos creados para: ${project.code}`);
    }
  }

  console.log('✅ Seed de proyectos completado');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProjects()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('❌ Error en seed de proyectos:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
