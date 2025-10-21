import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed de la base de datos con datos iniciales
 */
async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Limpiando datos existentes...');
    await prisma.departmentPermission.deleteMany();
    await prisma.userDepartment.deleteMany();
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();
  }

  // Hash de contraseñas
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Crear Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Administrador',
      role: 'SUPER_ADMIN',
      phone: '+58 414 1234567',
      isActive: true,
    },
  });

  console.log('✅ Super Admin creado:', superAdmin.email);

  // Crear Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN',
      phone: '+58 414 7654321',
      isActive: true,
    },
  });

  console.log('✅ Admin creado:', admin.email);

  // Crear Director
  const director = await prisma.user.create({
    data: {
      email: 'director@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Director',
      role: 'DIRECTOR',
      phone: '+58 424 1112233',
      isActive: true,
    },
  });

  console.log('✅ Director creado:', director.email);

  // Crear Coordinador
  const coordinador = await prisma.user.create({
    data: {
      email: 'coordinador@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'Coordinadora',
      role: 'COORDINADOR',
      phone: '+58 412 3334455',
      isActive: true,
    },
  });

  console.log('✅ Coordinador creado:', coordinador.email);

  // Crear Empleado
  const empleado = await prisma.user.create({
    data: {
      email: 'empleado@municipal.gob.ve',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Empleado',
      role: 'EMPLEADO',
      phone: '+58 416 5556677',
      isActive: true,
    },
  });

  console.log('✅ Empleado creado:', empleado.email);

  // Crear Ciudadano
  const ciudadano = await prisma.user.create({
    data: {
      email: 'ciudadano@example.com',
      password: hashedPassword,
      firstName: 'Pedro',
      lastName: 'Ciudadano',
      role: 'CIUDADANO',
      phone: '+58 426 7778899',
      isActive: true,
    },
  });

  console.log('✅ Ciudadano creado:', ciudadano.email);

  // ============================================
  // ESTRUCTURA ORGANIZACIONAL
  // ============================================
  console.log('\n🏢 Creando estructura organizacional...');

  // Crear Direcciones principales
  const dirFinanzas = await prisma.department.create({
    data: {
      code: 'DIR-FIN',
      name: 'Dirección de Finanzas',
      description: 'Gestión financiera y presupuestaria de la alcaldía',
      type: 'DIRECCION',
      phone: '+58 212 5551001',
      email: 'finanzas@municipal.gob.ve',
      location: 'Piso 3, Edificio Principal',
      maxStaff: 50,
      isActive: true,
    },
  });

  const dirRRHH = await prisma.department.create({
    data: {
      code: 'DIR-RRHH',
      name: 'Dirección de Recursos Humanos',
      description: 'Gestión del talento humano y nómina',
      type: 'DIRECCION',
      phone: '+58 212 5551002',
      email: 'rrhh@municipal.gob.ve',
      location: 'Piso 2, Edificio Principal',
      maxStaff: 30,
      isActive: true,
    },
  });

  const dirObras = await prisma.department.create({
    data: {
      code: 'DIR-OBRAS',
      name: 'Dirección de Obras Públicas',
      description: 'Planificación y ejecución de obras públicas',
      type: 'DIRECCION',
      phone: '+58 212 5551003',
      email: 'obras@municipal.gob.ve',
      location: 'Edificio Anexo',
      maxStaff: 80,
      isActive: true,
    },
  });

  const dirServicios = await prisma.department.create({
    data: {
      code: 'DIR-SERV',
      name: 'Dirección de Servicios Públicos',
      description: 'Gestión de servicios públicos municipales',
      type: 'DIRECCION',
      phone: '+58 212 5551004',
      email: 'servicios@municipal.gob.ve',
      location: 'Piso 1, Edificio Principal',
      maxStaff: 100,
      isActive: true,
    },
  });

  console.log('✅ Direcciones principales creadas');

  // Crear Coordinaciones bajo Dirección de Finanzas
  const coordContabilidad = await prisma.department.create({
    data: {
      code: 'COORD-CONT',
      name: 'Coordinación de Contabilidad',
      description: 'Registro y control contable',
      type: 'COORDINACION',
      parentId: dirFinanzas.id,
      phone: '+58 212 5551011',
      email: 'contabilidad@municipal.gob.ve',
      location: 'Piso 3, Oficina 301',
      maxStaff: 15,
      isActive: true,
    },
  });

  const coordPresupuesto = await prisma.department.create({
    data: {
      code: 'COORD-PRES',
      name: 'Coordinación de Presupuesto',
      description: 'Planificación y control presupuestario',
      type: 'COORDINACION',
      parentId: dirFinanzas.id,
      phone: '+58 212 5551012',
      email: 'presupuesto@municipal.gob.ve',
      location: 'Piso 3, Oficina 302',
      maxStaff: 10,
      isActive: true,
    },
  });

  const coordTesoreria = await prisma.department.create({
    data: {
      code: 'COORD-TES',
      name: 'Coordinación de Tesorería',
      description: 'Gestión de pagos y cobros',
      type: 'COORDINACION',
      parentId: dirFinanzas.id,
      phone: '+58 212 5551013',
      email: 'tesoreria@municipal.gob.ve',
      location: 'Piso 3, Oficina 303',
      maxStaff: 12,
      isActive: true,
    },
  });

  console.log('✅ Coordinaciones de Finanzas creadas');

  // Crear Coordinaciones bajo Dirección de RRHH
  const coordNomina = await prisma.department.create({
    data: {
      code: 'COORD-NOM',
      name: 'Coordinación de Nómina',
      description: 'Procesamiento de nómina y beneficios',
      type: 'COORDINACION',
      parentId: dirRRHH.id,
      phone: '+58 212 5551021',
      email: 'nomina@municipal.gob.ve',
      location: 'Piso 2, Oficina 201',
      maxStaff: 8,
      isActive: true,
    },
  });

  const coordCapacitacion = await prisma.department.create({
    data: {
      code: 'COORD-CAP',
      name: 'Coordinación de Capacitación',
      description: 'Formación y desarrollo del personal',
      type: 'COORDINACION',
      parentId: dirRRHH.id,
      phone: '+58 212 5551022',
      email: 'capacitacion@municipal.gob.ve',
      location: 'Piso 2, Oficina 202',
      maxStaff: 5,
      isActive: true,
    },
  });

  console.log('✅ Coordinaciones de RRHH creadas');

  // Crear Departamentos bajo Coordinación de Contabilidad
  const deptoCuentasPagar = await prisma.department.create({
    data: {
      code: 'DEPT-CP',
      name: 'Departamento de Cuentas por Pagar',
      description: 'Gestión de cuentas por pagar',
      type: 'DEPARTAMENTO',
      parentId: coordContabilidad.id,
      phone: '+58 212 5551031',
      location: 'Piso 3, Oficina 301-A',
      maxStaff: 5,
      isActive: true,
    },
  });

  const deptoCuentasCobrar = await prisma.department.create({
    data: {
      code: 'DEPT-CC',
      name: 'Departamento de Cuentas por Cobrar',
      description: 'Gestión de cuentas por cobrar',
      type: 'DEPARTAMENTO',
      parentId: coordContabilidad.id,
      phone: '+58 212 5551032',
      location: 'Piso 3, Oficina 301-B',
      maxStaff: 5,
      isActive: true,
    },
  });

  console.log('✅ Departamentos de Contabilidad creados');

  // Asignar usuarios a departamentos
  console.log('\n👥 Asignando usuarios a departamentos...');

  // Director como jefe de Dirección de Finanzas
  await prisma.userDepartment.create({
    data: {
      userId: director.id,
      departmentId: dirFinanzas.id,
      role: 'HEAD',
      isPrimary: true,
    },
  });

  // Actualizar headUserId en el departamento
  await prisma.department.update({
    where: { id: dirFinanzas.id },
    data: { headUserId: director.id },
  });

  // Coordinador como jefe de Coordinación de Contabilidad
  await prisma.userDepartment.create({
    data: {
      userId: coordinador.id,
      departmentId: coordContabilidad.id,
      role: 'HEAD',
      isPrimary: true,
    },
  });

  await prisma.department.update({
    where: { id: coordContabilidad.id },
    data: { headUserId: coordinador.id },
  });

  // Empleado como miembro de Departamento de Cuentas por Pagar
  await prisma.userDepartment.create({
    data: {
      userId: empleado.id,
      departmentId: deptoCuentasPagar.id,
      role: 'MEMBER',
      isPrimary: true,
    },
  });

  console.log('✅ Usuarios asignados a departamentos');

  // Crear permisos básicos para departamentos
  console.log('\n🔐 Creando permisos de departamentos...');

  const modules = ['proyectos', 'finanzas', 'rrhh', 'tributario'];
  const actions = ['create', 'read', 'update', 'delete'];

  // Dirección de Finanzas tiene permisos completos en finanzas
  for (const action of actions) {
    await prisma.departmentPermission.create({
      data: {
        departmentId: dirFinanzas.id,
        module: 'finanzas',
        action,
      },
    });
  }

  // Coordinación de Contabilidad tiene permisos de lectura y actualización
  for (const action of ['read', 'update']) {
    await prisma.departmentPermission.create({
      data: {
        departmentId: coordContabilidad.id,
        module: 'finanzas',
        action,
      },
    });
  }

  console.log('✅ Permisos de departamentos creados');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log('\n📋 Usuarios creados:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email                              | Rol          | Password');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('superadmin@municipal.gob.ve        | SUPER_ADMIN  | Admin123!');
  console.log('admin@municipal.gob.ve             | ADMIN        | Admin123!');
  console.log('director@municipal.gob.ve          | DIRECTOR     | Admin123!');
  console.log('coordinador@municipal.gob.ve       | COORDINADOR  | Admin123!');
  console.log('empleado@municipal.gob.ve          | EMPLEADO     | Admin123!');
  console.log('ciudadano@example.com              | CIUDADANO    | Admin123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🏢 Estructura Organizacional:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('- 4 Direcciones principales');
  console.log('- 5 Coordinaciones');
  console.log('- 2 Departamentos');
  console.log('- Usuarios asignados con roles específicos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
