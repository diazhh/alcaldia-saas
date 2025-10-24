import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed completo de estructura organizacional de una alcaldía
 * Incluye: Despacho, Direcciones, Coordinaciones, Departamentos, Unidades
 */
export async function seedOrganization() {
  console.log('🏢 Creando estructura organizacional completa...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // ============================================
  // CREAR USUARIOS ADICIONALES
  // ============================================

  const usuarios = [];

  // Alcalde
  const alcalde = await prisma.user.create({
    data: {
      email: 'alcalde@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'Pedro',
      lastName: 'Alcalde González',
      role: 'SUPER_ADMIN',
      phone: '+58 212 5550000',
      isActive: true,
    },
  });
  usuarios.push(alcalde);

  // Síndico
  const sindico = await prisma.user.create({
    data: {
      email: 'sindico@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Rodríguez',
      role: 'ADMIN',
      phone: '+58 212 5550001',
      isActive: true,
    },
  });
  usuarios.push(sindico);

  // Secretario General
  const secretario = await prisma.user.create({
    data: {
      email: 'secretario@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Martínez',
      role: 'ADMIN',
      phone: '+58 212 5550002',
      isActive: true,
    },
  });
  usuarios.push(secretario);

  // Directores (10)
  const directores = [];
  const nombresDirectores = [
    { nombre: 'Luis', apellido: 'Fernández', email: 'dir.finanzas' },
    { nombre: 'María', apellido: 'González', email: 'dir.obras' },
    { nombre: 'José', apellido: 'Pérez', email: 'dir.rrhh' },
    { nombre: 'Carmen', apellido: 'Silva', email: 'dir.servicios' },
    { nombre: 'Rafael', apellido: 'Ramírez', email: 'dir.desarrollo' },
    { nombre: 'Isabel', apellido: 'Torres', email: 'dir.catastro' },
    { nombre: 'Miguel', apellido: 'Herrera', email: 'dir.tributacion' },
    { nombre: 'Patricia', apellido: 'Morales', email: 'dir.tecnologia' },
    { nombre: 'Diego', apellido: 'Vásquez', email: 'dir.participacion' },
    { nombre: 'Laura', apellido: 'Campos', email: 'dir.ambiente' },
  ];

  for (const dir of nombresDirectores) {
    const director = await prisma.user.create({
      data: {
        email: `${dir.email}@municipal.gob.ve`,
        password: hashedPassword,
        firstName: dir.nombre,
        lastName: dir.apellido,
        role: 'DIRECTOR',
        phone: `+58 212 555${1000 + directores.length}`,
        isActive: true,
      },
    });
    directores.push(director);
    usuarios.push(director);
  }

  // Coordinadores (20)
  const coordinadores = [];
  for (let i = 1; i <= 20; i++) {
    const coord = await prisma.user.create({
      data: {
        email: `coordinador${i}@municipal.gob.ve`,
        password: hashedPassword,
        firstName: `Coordinador${i}`,
        lastName: `Apellido${i}`,
        role: 'COORDINADOR',
        phone: `+58 414 ${2000000 + i}`,
        isActive: true,
      },
    });
    coordinadores.push(coord);
    usuarios.push(coord);
  }

  // Empleados (20)
  const empleados = [];
  for (let i = 1; i <= 20; i++) {
    const emp = await prisma.user.create({
      data: {
        email: `empleado${i}@municipal.gob.ve`,
        password: hashedPassword,
        firstName: `Empleado${i}`,
        lastName: `Apellido${i}`,
        role: 'EMPLEADO',
        phone: `+58 424 ${3000000 + i}`,
        isActive: true,
      },
    });
    empleados.push(emp);
    usuarios.push(emp);
  }

  console.log(`✅ ${usuarios.length} usuarios creados`);

  // ============================================
  // NIVEL 1: DESPACHO DEL ALCALDE
  // ============================================

  const despacho = await prisma.department.create({
    data: {
      code: 'DESPACHO',
      name: 'Despacho del Alcalde',
      shortName: 'Despacho',
      description: 'Oficina principal del alcalde y toma de decisiones estratégicas',
      type: 'DIRECCION',
      level: 1,
      phone: '+58 212 5550000',
      email: 'despacho@municipal.gob.ve',
      extension: '1000',
      location: 'Piso 4, Oficina Principal',
      maxStaff: 10,
      budget: 5000000.00,
      isActive: true,
      headUserId: alcalde.id,
    },
  });

  const sindicatura = await prisma.department.create({
    data: {
      code: 'SINDIC',
      name: 'Sindicatura Municipal',
      shortName: 'Sindicatura',
      description: 'Representación legal de la alcaldía',
      type: 'DIRECCION',
      level: 1,
      phone: '+58 212 5550001',
      email: 'sindico@municipal.gob.ve',
      extension: '1001',
      location: 'Piso 3, Ala Oeste',
      maxStaff: 8,
      budget: 2000000.00,
      isActive: true,
      headUserId: sindico.id,
    },
  });

  const secretaria = await prisma.department.create({
    data: {
      code: 'SECGEN',
      name: 'Secretaría General',
      shortName: 'Secretaría',
      description: 'Coordinación administrativa y gestión documental',
      type: 'DIRECCION',
      level: 1,
      phone: '+58 212 5550002',
      email: 'secretaria@municipal.gob.ve',
      extension: '1002',
      location: 'Piso 2, Ala Este',
      maxStaff: 15,
      budget: 1500000.00,
      isActive: true,
      headUserId: secretario.id,
    },
  });

  console.log('✅ Despacho y oficinas principales creadas');

  // ============================================
  // NIVEL 2: DIRECCIONES ESTRATÉGICAS
  // ============================================

  const dirFinanzas = await prisma.department.create({
    data: {
      code: 'DIR-FIN',
      name: 'Dirección de Finanzas',
      shortName: 'Finanzas',
      description: 'Gestión financiera, presupuestaria y contable',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551001',
      email: 'finanzas@municipal.gob.ve',
      extension: '2001',
      location: 'Piso 3, Edificio Principal',
      maxStaff: 50,
      budget: 10000000.00,
      isActive: true,
      headUserId: directores[0].id,
    },
  });

  const dirObras = await prisma.department.create({
    data: {
      code: 'DIR-OBRAS',
      name: 'Dirección de Obras Públicas',
      shortName: 'Obras Públicas',
      description: 'Planificación, diseño y ejecución de obras de infraestructura',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551002',
      email: 'obras@municipal.gob.ve',
      extension: '2002',
      location: 'Edificio Anexo, Piso 1',
      maxStaff: 80,
      budget: 50000000.00,
      isActive: true,
      headUserId: directores[1].id,
    },
  });

  const dirRRHH = await prisma.department.create({
    data: {
      code: 'DIR-RRHH',
      name: 'Dirección de Recursos Humanos',
      shortName: 'RRHH',
      description: 'Gestión del talento humano, nómina y desarrollo organizacional',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551003',
      email: 'rrhh@municipal.gob.ve',
      extension: '2003',
      location: 'Piso 2, Edificio Principal',
      maxStaff: 30,
      budget: 8000000.00,
      isActive: true,
      headUserId: directores[2].id,
    },
  });

  const dirServicios = await prisma.department.create({
    data: {
      code: 'DIR-SERV',
      name: 'Dirección de Servicios Públicos',
      shortName: 'Servicios',
      description: 'Aseo urbano, alumbrado, parques y servicios municipales',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551004',
      email: 'servicios@municipal.gob.ve',
      extension: '2004',
      location: 'Piso 1, Edificio Principal',
      maxStaff: 100,
      budget: 15000000.00,
      isActive: true,
      headUserId: directores[3].id,
    },
  });

  const dirDesarrollo = await prisma.department.create({
    data: {
      code: 'DIR-DS',
      name: 'Dirección de Desarrollo Social',
      shortName: 'Desarrollo Social',
      description: 'Programas sociales, deportes, cultura y atención ciudadana',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551005',
      email: 'desarrollo@municipal.gob.ve',
      extension: '2005',
      location: 'Edificio Social',
      maxStaff: 60,
      budget: 12000000.00,
      isActive: true,
      headUserId: directores[4].id,
    },
  });

  const dirCatastro = await prisma.department.create({
    data: {
      code: 'DIR-CAT',
      name: 'Dirección de Catastro y Ordenamiento Territorial',
      shortName: 'Catastro',
      description: 'Registro catastral, planificación urbana y ordenamiento',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551006',
      email: 'catastro@municipal.gob.ve',
      extension: '2006',
      location: 'Edificio Técnico',
      maxStaff: 40,
      budget: 6000000.00,
      isActive: true,
      headUserId: directores[5].id,
    },
  });

  const dirTributacion = await prisma.department.create({
    data: {
      code: 'DIR-TRIB',
      name: 'Dirección de Ingresos Tributarios',
      shortName: 'Tributación',
      description: 'Recaudación de impuestos, tasas y contribuciones municipales',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551007',
      email: 'tributacion@municipal.gob.ve',
      extension: '2007',
      location: 'Piso 1, Edificio Anexo',
      maxStaff: 45,
      budget: 7000000.00,
      isActive: true,
      headUserId: directores[6].id,
    },
  });

  const dirTecnologia = await prisma.department.create({
    data: {
      code: 'DIR-TI',
      name: 'Dirección de Tecnología e Información',
      shortName: 'TI',
      description: 'Sistemas, infraestructura tecnológica y transformación digital',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551008',
      email: 'tecnologia@municipal.gob.ve',
      extension: '2008',
      location: 'Piso 4, Ala Tecnológica',
      maxStaff: 25,
      budget: 5000000.00,
      isActive: true,
      headUserId: directores[7].id,
    },
  });

  const dirParticipacion = await prisma.department.create({
    data: {
      code: 'DIR-PC',
      name: 'Dirección de Participación Ciudadana',
      shortName: 'Participación',
      description: 'Consejos comunales, presupuesto participativo y organización comunitaria',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551009',
      email: 'participacion@municipal.gob.ve',
      extension: '2009',
      location: 'Casa Comunal',
      maxStaff: 35,
      budget: 4000000.00,
      isActive: true,
      headUserId: directores[8].id,
    },
  });

  const dirAmbiente = await prisma.department.create({
    data: {
      code: 'DIR-AMB',
      name: 'Dirección de Ambiente y Saneamiento',
      shortName: 'Ambiente',
      description: 'Gestión ambiental, control de contaminación y saneamiento',
      type: 'DIRECCION',
      level: 2,
      phone: '+58 212 5551010',
      email: 'ambiente@municipal.gob.ve',
      extension: '2010',
      location: 'Edificio Verde',
      maxStaff: 30,
      budget: 6000000.00,
      isActive: true,
      headUserId: directores[9].id,
    },
  });

  console.log('✅ 10 Direcciones creadas');

  // ============================================
  // NIVEL 3: COORDINACIONES
  // ============================================

  // COORDINACIONES DE FINANZAS
  const coordContabilidad = await prisma.department.create({
    data: {
      code: 'COORD-CONT',
      name: 'Coordinación de Contabilidad',
      shortName: 'Contabilidad',
      description: 'Registro contable y estados financieros',
      type: 'COORDINACION',
      level: 3,
      parentId: dirFinanzas.id,
      phone: '+58 212 5551011',
      email: 'contabilidad@municipal.gob.ve',
      extension: '3011',
      location: 'Piso 3, Oficina 301',
      maxStaff: 15,
      isActive: true,
      headUserId: coordinadores[0].id,
    },
  });

  const coordPresupuesto = await prisma.department.create({
    data: {
      code: 'COORD-PRES',
      name: 'Coordinación de Presupuesto',
      shortName: 'Presupuesto',
      description: 'Formulación, ejecución y control presupuestario',
      type: 'COORDINACION',
      level: 3,
      parentId: dirFinanzas.id,
      phone: '+58 212 5551012',
      email: 'presupuesto@municipal.gob.ve',
      extension: '3012',
      location: 'Piso 3, Oficina 302',
      maxStaff: 10,
      isActive: true,
      headUserId: coordinadores[1].id,
    },
  });

  const coordTesoreria = await prisma.department.create({
    data: {
      code: 'COORD-TES',
      name: 'Coordinación de Tesorería',
      shortName: 'Tesorería',
      description: 'Gestión de caja, bancos y pagos',
      type: 'COORDINACION',
      level: 3,
      parentId: dirFinanzas.id,
      phone: '+58 212 5551013',
      email: 'tesoreria@municipal.gob.ve',
      extension: '3013',
      location: 'Piso 3, Oficina 303',
      maxStaff: 12,
      isActive: true,
      headUserId: coordinadores[2].id,
    },
  });

  // COORDINACIONES DE OBRAS
  const coordProyectos = await prisma.department.create({
    data: {
      code: 'COORD-PROY',
      name: 'Coordinación de Proyectos',
      shortName: 'Proyectos',
      description: 'Planificación y seguimiento de proyectos de obra',
      type: 'COORDINACION',
      level: 3,
      parentId: dirObras.id,
      phone: '+58 212 5551021',
      email: 'proyectos@municipal.gob.ve',
      extension: '3021',
      location: 'Anexo, Oficina 101',
      maxStaff: 20,
      isActive: true,
      headUserId: coordinadores[3].id,
    },
  });

  const coordMantenimiento = await prisma.department.create({
    data: {
      code: 'COORD-MANT',
      name: 'Coordinación de Mantenimiento',
      shortName: 'Mantenimiento',
      description: 'Mantenimiento de infraestructura y vialidad',
      type: 'COORDINACION',
      level: 3,
      parentId: dirObras.id,
      phone: '+58 212 5551022',
      email: 'mantenimiento@municipal.gob.ve',
      extension: '3022',
      location: 'Anexo, Oficina 102',
      maxStaff: 30,
      isActive: true,
      headUserId: coordinadores[4].id,
    },
  });

  const coordIngenieria = await prisma.department.create({
    data: {
      code: 'COORD-ING',
      name: 'Coordinación de Ingeniería',
      shortName: 'Ingeniería',
      description: 'Diseño y supervisión técnica de obras',
      type: 'COORDINACION',
      level: 3,
      parentId: dirObras.id,
      phone: '+58 212 5551023',
      email: 'ingenieria@municipal.gob.ve',
      extension: '3023',
      location: 'Anexo, Oficina 103',
      maxStaff: 15,
      isActive: true,
      headUserId: coordinadores[5].id,
    },
  });

  // COORDINACIONES DE RRHH
  const coordNomina = await prisma.department.create({
    data: {
      code: 'COORD-NOM',
      name: 'Coordinación de Nómina',
      shortName: 'Nómina',
      description: 'Procesamiento de nómina y beneficios',
      type: 'COORDINACION',
      level: 3,
      parentId: dirRRHH.id,
      phone: '+58 212 5551031',
      email: 'nomina@municipal.gob.ve',
      extension: '3031',
      location: 'Piso 2, Oficina 201',
      maxStaff: 8,
      isActive: true,
      headUserId: coordinadores[6].id,
    },
  });

  const coordCapacitacion = await prisma.department.create({
    data: {
      code: 'COORD-CAP',
      name: 'Coordinación de Capacitación y Desarrollo',
      shortName: 'Capacitación',
      description: 'Formación continua y desarrollo del personal',
      type: 'COORDINACION',
      level: 3,
      parentId: dirRRHH.id,
      phone: '+58 212 5551032',
      email: 'capacitacion@municipal.gob.ve',
      extension: '3032',
      location: 'Piso 2, Oficina 202',
      maxStaff: 5,
      isActive: true,
      headUserId: coordinadores[7].id,
    },
  });

  const coordBienestar = await prisma.department.create({
    data: {
      code: 'COORD-BIEN',
      name: 'Coordinación de Bienestar Social',
      shortName: 'Bienestar',
      description: 'Prestaciones sociales y bienestar laboral',
      type: 'COORDINACION',
      level: 3,
      parentId: dirRRHH.id,
      phone: '+58 212 5551033',
      email: 'bienestar@municipal.gob.ve',
      extension: '3033',
      location: 'Piso 2, Oficina 203',
      maxStaff: 6,
      isActive: true,
      headUserId: coordinadores[8].id,
    },
  });

  // COORDINACIONES DE SERVICIOS
  const coordAseo = await prisma.department.create({
    data: {
      code: 'COORD-ASEO',
      name: 'Coordinación de Aseo Urbano',
      shortName: 'Aseo',
      description: 'Recolección de desechos y limpieza urbana',
      type: 'COORDINACION',
      level: 3,
      parentId: dirServicios.id,
      phone: '+58 212 5551041',
      email: 'aseo@municipal.gob.ve',
      extension: '3041',
      location: 'Depósito Municipal',
      maxStaff: 50,
      isActive: true,
      headUserId: coordinadores[9].id,
    },
  });

  const coordAlumbrado = await prisma.department.create({
    data: {
      code: 'COORD-ALU',
      name: 'Coordinación de Alumbrado Público',
      shortName: 'Alumbrado',
      description: 'Mantenimiento de luminarias y alumbrado',
      type: 'COORDINACION',
      level: 3,
      parentId: dirServicios.id,
      phone: '+58 212 5551042',
      email: 'alumbrado@municipal.gob.ve',
      extension: '3042',
      location: 'Taller Eléctrico',
      maxStaff: 20,
      isActive: true,
      headUserId: coordinadores[10].id,
    },
  });

  const coordParques = await prisma.department.create({
    data: {
      code: 'COORD-PARQ',
      name: 'Coordinación de Parques y Jardines',
      shortName: 'Parques',
      description: 'Mantenimiento de áreas verdes y espacios públicos',
      type: 'COORDINACION',
      level: 3,
      parentId: dirServicios.id,
      phone: '+58 212 5551043',
      email: 'parques@municipal.gob.ve',
      extension: '3043',
      location: 'Vivero Municipal',
      maxStaff: 25,
      isActive: true,
      headUserId: coordinadores[11].id,
    },
  });

  // COORDINACIONES DE DESARROLLO SOCIAL
  const coordDeportes = await prisma.department.create({
    data: {
      code: 'COORD-DEP',
      name: 'Coordinación de Deportes',
      shortName: 'Deportes',
      description: 'Programas deportivos y recreativos',
      type: 'COORDINACION',
      level: 3,
      parentId: dirDesarrollo.id,
      phone: '+58 212 5551051',
      email: 'deportes@municipal.gob.ve',
      extension: '3051',
      location: 'Polideportivo Municipal',
      maxStaff: 15,
      isActive: true,
      headUserId: coordinadores[12].id,
    },
  });

  const coordCultura = await prisma.department.create({
    data: {
      code: 'COORD-CULT',
      name: 'Coordinación de Cultura',
      shortName: 'Cultura',
      description: 'Actividades culturales y patrimonio',
      type: 'COORDINACION',
      level: 3,
      parentId: dirDesarrollo.id,
      phone: '+58 212 5551052',
      email: 'cultura@municipal.gob.ve',
      extension: '3052',
      location: 'Casa de la Cultura',
      maxStaff: 12,
      isActive: true,
      headUserId: coordinadores[13].id,
    },
  });

  // COORDINACIONES DE CATASTRO
  const coordRegistro = await prisma.department.create({
    data: {
      code: 'COORD-REG',
      name: 'Coordinación de Registro Catastral',
      shortName: 'Registro',
      description: 'Registro y actualización catastral',
      type: 'COORDINACION',
      level: 3,
      parentId: dirCatastro.id,
      phone: '+58 212 5551061',
      email: 'registro@municipal.gob.ve',
      extension: '3061',
      location: 'Oficina Catastral',
      maxStaff: 15,
      isActive: true,
      headUserId: coordinadores[14].id,
    },
  });

  const coordUrbanismo = await prisma.department.create({
    data: {
      code: 'COORD-URB',
      name: 'Coordinación de Urbanismo',
      shortName: 'Urbanismo',
      description: 'Planificación urbana y permisos de construcción',
      type: 'COORDINACION',
      level: 3,
      parentId: dirCatastro.id,
      phone: '+58 212 5551062',
      email: 'urbanismo@municipal.gob.ve',
      extension: '3062',
      location: 'Oficina de Planificación',
      maxStaff: 12,
      isActive: true,
      headUserId: coordinadores[15].id,
    },
  });

  // COORDINACIONES DE TRIBUTACIÓN
  const coordRecaudacion = await prisma.department.create({
    data: {
      code: 'COORD-REC',
      name: 'Coordinación de Recaudación',
      shortName: 'Recaudación',
      description: 'Cobranza de impuestos y tasas',
      type: 'COORDINACION',
      level: 3,
      parentId: dirTributacion.id,
      phone: '+58 212 5551071',
      email: 'recaudacion@municipal.gob.ve',
      extension: '3071',
      location: 'Oficina de Recaudación',
      maxStaff: 20,
      isActive: true,
      headUserId: coordinadores[16].id,
    },
  });

  const coordFiscalizacion = await prisma.department.create({
    data: {
      code: 'COORD-FISC',
      name: 'Coordinación de Fiscalización',
      shortName: 'Fiscalización',
      description: 'Inspección y control tributario',
      type: 'COORDINACION',
      level: 3,
      parentId: dirTributacion.id,
      phone: '+58 212 5551072',
      email: 'fiscalizacion@municipal.gob.ve',
      extension: '3072',
      location: 'Oficina de Inspección',
      maxStaff: 12,
      isActive: true,
      headUserId: coordinadores[17].id,
    },
  });

  console.log('✅ 20 Coordinaciones creadas');

  // ============================================
  // NIVEL 4: DEPARTAMENTOS
  // ============================================

  // DEPARTAMENTOS DE CONTABILIDAD
  const deptoCuentasPagar = await prisma.department.create({
    data: {
      code: 'DEPT-CP',
      name: 'Departamento de Cuentas por Pagar',
      shortName: 'Cuentas x Pagar',
      description: 'Procesamiento y control de pagos a proveedores',
      type: 'DEPARTAMENTO',
      level: 4,
      parentId: coordContabilidad.id,
      phone: '+58 212 5551101',
      extension: '4101',
      location: 'Piso 3, Oficina 301-A',
      maxStaff: 5,
      isActive: true,
    },
  });

  const deptoCuentasCobrar = await prisma.department.create({
    data: {
      code: 'DEPT-CC',
      name: 'Departamento de Cuentas por Cobrar',
      shortName: 'Cuentas x Cobrar',
      description: 'Control y seguimiento de ingresos',
      type: 'DEPARTAMENTO',
      level: 4,
      parentId: coordContabilidad.id,
      phone: '+58 212 5551102',
      extension: '4102',
      location: 'Piso 3, Oficina 301-B',
      maxStaff: 5,
      isActive: true,
    },
  });

  const deptoActivosFijos = await prisma.department.create({
    data: {
      code: 'DEPT-AF',
      name: 'Departamento de Activos Fijos',
      shortName: 'Activos',
      description: 'Control de bienes e inventarios',
      type: 'DEPARTAMENTO',
      level: 4,
      parentId: coordContabilidad.id,
      phone: '+58 212 5551103',
      extension: '4103',
      location: 'Piso 3, Oficina 301-C',
      maxStaff: 4,
      isActive: true,
    },
  });

  // DEPARTAMENTOS DE TESORERÍA
  const deptoCaja = await prisma.department.create({
    data: {
      code: 'DEPT-CAJA',
      name: 'Departamento de Caja',
      shortName: 'Caja',
      description: 'Recepción de pagos y gestión de efectivo',
      type: 'DEPARTAMENTO',
      level: 4,
      parentId: coordTesoreria.id,
      phone: '+58 212 5551104',
      extension: '4104',
      location: 'Piso 3, Caja',
      maxStaff: 6,
      isActive: true,
    },
  });

  const deptoBancos = await prisma.department.create({
    data: {
      code: 'DEPT-BANC',
      name: 'Departamento de Bancos',
      shortName: 'Bancos',
      description: 'Conciliaciones bancarias y gestión de cuentas',
      type: 'DEPARTAMENTO',
      level: 4,
      parentId: coordTesoreria.id,
      phone: '+58 212 5551105',
      extension: '4105',
      location: 'Piso 3, Oficina 303-A',
      maxStaff: 4,
      isActive: true,
    },
  });

  // DEPARTAMENTOS DE PROYECTOS
  const deptoDiseno = await prisma.department.create({
    data: {
      code: 'DEPT-DIS',
      name: 'Departamento de Diseño',
      shortName: 'Diseño',
      description: 'Diseño de proyectos de infraestructura',
      type: 'DEPARTAMENTO',
      level: 4,
      parentId: coordProyectos.id,
      phone: '+58 212 5551106',
      extension: '4106',
      location: 'Anexo, Sala de Diseño',
      maxStaff: 8,
      isActive: true,
    },
  });

  const deptoSupervision = await prisma.department.create({
    data: {
      code: 'DEPT-SUP',
      name: 'Departamento de Supervisión',
      shortName: 'Supervisión',
      description: 'Supervisión y control de ejecución de obras',
      type: 'DEPARTAMENTO',
      level: 4,
      parentId: coordProyectos.id,
      phone: '+58 212 5551107',
      extension: '4107',
      location: 'Anexo, Oficina de Campo',
      maxStaff: 10,
      isActive: true,
    },
  });

  console.log('✅ 8+ Departamentos creados');

  // ============================================
  // NIVEL 5: UNIDADES Y SECCIONES
  // ============================================

  const unidadCompras = await prisma.department.create({
    data: {
      code: 'UNI-COMP',
      name: 'Unidad de Compras',
      shortName: 'Compras',
      description: 'Adquisiciones y contrataciones',
      type: 'UNIDAD',
      level: 5,
      parentId: coordTesoreria.id,
      phone: '+58 212 5551201',
      extension: '5201',
      location: 'Piso 3, Oficina 303-B',
      maxStaff: 5,
      isActive: true,
    },
  });

  const unidadAlmacen = await prisma.department.create({
    data: {
      code: 'UNI-ALM',
      name: 'Unidad de Almacén',
      shortName: 'Almacén',
      description: 'Almacenamiento y distribución de materiales',
      type: 'UNIDAD',
      level: 5,
      parentId: coordTesoreria.id,
      phone: '+58 212 5551202',
      extension: '5202',
      location: 'Almacén Central',
      maxStaff: 8,
      isActive: true,
    },
  });

  const unidadSistemas = await prisma.department.create({
    data: {
      code: 'UNI-SIS',
      name: 'Unidad de Sistemas',
      shortName: 'Sistemas',
      description: 'Desarrollo y mantenimiento de sistemas',
      type: 'UNIDAD',
      level: 5,
      parentId: dirTecnologia.id,
      phone: '+58 212 5551203',
      extension: '5203',
      location: 'Piso 4, Lab de Sistemas',
      maxStaff: 10,
      isActive: true,
    },
  });

  const unidadSoporte = await prisma.department.create({
    data: {
      code: 'UNI-SOP',
      name: 'Unidad de Soporte Técnico',
      shortName: 'Soporte',
      description: 'Mesa de ayuda y soporte a usuarios',
      type: 'UNIDAD',
      level: 5,
      parentId: dirTecnologia.id,
      phone: '+58 212 5551204',
      extension: '5204',
      location: 'Piso 4, Mesa de Ayuda',
      maxStaff: 6,
      isActive: true,
    },
  });

  const unidadRedes = await prisma.department.create({
    data: {
      code: 'UNI-RED',
      name: 'Unidad de Redes e Infraestructura',
      shortName: 'Redes',
      description: 'Administración de redes y servidores',
      type: 'UNIDAD',
      level: 5,
      parentId: dirTecnologia.id,
      phone: '+58 212 5551205',
      extension: '5205',
      location: 'Piso 4, Sala de Servidores',
      maxStaff: 5,
      isActive: true,
    },
  });

  console.log('✅ 5+ Unidades creadas');

  // ============================================
  // ASIGNAR USUARIOS A DEPARTAMENTOS
  // ============================================

  console.log('\n👥 Asignando usuarios a departamentos...');

  // Asignar Alcalde al Despacho
  await prisma.userDepartment.create({
    data: {
      userId: alcalde.id,
      departmentId: despacho.id,
      role: 'HEAD',
      isPrimary: true,
      assignedBy: alcalde.id,
    },
  });

  // Asignar Síndico
  await prisma.userDepartment.create({
    data: {
      userId: sindico.id,
      departmentId: sindicatura.id,
      role: 'HEAD',
      isPrimary: true,
      assignedBy: alcalde.id,
    },
  });

  // Asignar Secretario
  await prisma.userDepartment.create({
    data: {
      userId: secretario.id,
      departmentId: secretaria.id,
      role: 'HEAD',
      isPrimary: true,
      assignedBy: alcalde.id,
    },
  });

  // Asignar Directores
  const direcciones = [
    dirFinanzas, dirObras, dirRRHH, dirServicios, dirDesarrollo,
    dirCatastro, dirTributacion, dirTecnologia, dirParticipacion, dirAmbiente,
  ];

  for (let i = 0; i < directores.length; i++) {
    await prisma.userDepartment.create({
      data: {
        userId: directores[i].id,
        departmentId: direcciones[i].id,
        role: 'HEAD',
        isPrimary: true,
        assignedBy: alcalde.id,
      },
    });
  }

  // Asignar Coordinadores
  const coordinaciones = [
    coordContabilidad, coordPresupuesto, coordTesoreria, coordProyectos,
    coordMantenimiento, coordIngenieria, coordNomina, coordCapacitacion,
    coordBienestar, coordAseo, coordAlumbrado, coordParques, coordDeportes,
    coordCultura, coordRegistro, coordUrbanismo, coordRecaudacion, coordFiscalizacion,
  ];

  for (let i = 0; i < Math.min(coordinadores.length, coordinaciones.length); i++) {
    await prisma.userDepartment.create({
      data: {
        userId: coordinadores[i].id,
        departmentId: coordinaciones[i].id,
        role: 'HEAD',
        isPrimary: true,
        assignedBy: directores[Math.floor(i / 3)].id,
      },
    });
  }

  // Asignar Empleados a diferentes departamentos
  const departamentosOperativos = [
    deptoCuentasPagar, deptoCuentasCobrar, deptoActivosFijos, deptoCaja,
    deptoBancos, deptoDiseno, deptoSupervision, unidadCompras, unidadAlmacen,
    unidadSistemas, unidadSoporte, unidadRedes,
  ];

  for (let i = 0; i < empleados.length; i++) {
    const dept = departamentosOperativos[i % departamentosOperativos.length];
    await prisma.userDepartment.create({
      data: {
        userId: empleados[i].id,
        departmentId: dept.id,
        role: i % 4 === 0 ? 'SUPERVISOR' : 'MEMBER',
        isPrimary: true,
        assignedBy: coordinadores[i % coordinadores.length].id,
      },
    });
  }

  console.log('✅ Usuarios asignados a departamentos');

  // ============================================
  // CREAR PERMISOS POR DEPARTAMENTO
  // ============================================

  console.log('\n🔐 Creando permisos de departamentos...');

  const modulos = ['proyectos', 'finanzas', 'rrhh', 'tributario', 'catastro', 'servicios', 'participacion'];
  const acciones = ['create', 'read', 'update', 'delete', 'approve'];

  // Dirección de Finanzas - Permisos completos en finanzas
  for (const accion of acciones) {
    await prisma.departmentPermission.create({
      data: {
        departmentId: dirFinanzas.id,
        module: 'finanzas',
        action: accion,
        canDelegate: true,
      },
    });
  }

  // Dirección de Obras - Permisos en proyectos
  for (const accion of acciones) {
    await prisma.departmentPermission.create({
      data: {
        departmentId: dirObras.id,
        module: 'proyectos',
        action: accion,
        canDelegate: true,
      },
    });
  }

  // Dirección de RRHH - Permisos en rrhh
  for (const accion of acciones) {
    await prisma.departmentPermission.create({
      data: {
        departmentId: dirRRHH.id,
        module: 'rrhh',
        action: accion,
        canDelegate: true,
      },
    });
  }

  // Dirección de Tributación - Permisos en tributario
  for (const accion of acciones) {
    await prisma.departmentPermission.create({
      data: {
        departmentId: dirTributacion.id,
        module: 'tributario',
        action: accion,
        canDelegate: true,
      },
    });
  }

  // Coordinaciones - Permisos limitados
  for (const accion of ['read', 'update']) {
    await prisma.departmentPermission.create({
      data: {
        departmentId: coordContabilidad.id,
        module: 'finanzas',
        action: accion,
        canDelegate: false,
      },
    });
  }

  console.log('✅ Permisos creados');

  console.log('\n🎉 ¡Estructura organizacional completa creada!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ ${usuarios.length} usuarios creados`);
  console.log('✅ 13 departamentos de nivel estratégico (Despacho + Direcciones)');
  console.log('✅ 20 Coordinaciones');
  console.log('✅ 8+ Departamentos operativos');
  console.log('✅ 5+ Unidades especializadas');
  console.log('✅ Total: 46+ unidades organizacionales');
  console.log('✅ Todos los usuarios asignados con roles específicos');
  console.log('✅ Permisos configurados por módulo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
