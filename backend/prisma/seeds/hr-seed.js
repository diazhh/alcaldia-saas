import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHR() {
  console.log('🌱 Seeding HR module...');

  // 1. Crear cargos
  console.log('Creating positions...');
  const positions = await Promise.all([
    prisma.position.create({
      data: {
        code: 'DIR-001',
        name: 'Director de Recursos Humanos',
        description: 'Responsable de la gestión integral de RRHH',
        level: 'Directivo',
        category: 'Gerencial',
        minSalary: 5000,
        maxSalary: 8000,
        requirements: 'Licenciatura en RRHH, mínimo 5 años de experiencia',
        responsibilities: 'Planificación estratégica, gestión de personal, nómina',
      },
    }),
    prisma.position.create({
      data: {
        code: 'COORD-001',
        name: 'Coordinador de Nómina',
        description: 'Coordinación del proceso de nómina',
        level: 'Coordinación',
        category: 'Administrativa',
        minSalary: 3000,
        maxSalary: 4500,
        requirements: 'Licenciatura en Administración o Contaduría',
        responsibilities: 'Procesamiento de nómina, cálculo de prestaciones',
      },
    }),
    prisma.position.create({
      data: {
        code: 'ANAL-001',
        name: 'Analista de RRHH',
        description: 'Análisis y gestión de procesos de RRHH',
        level: 'Profesional',
        category: 'Administrativa',
        minSalary: 2000,
        maxSalary: 3000,
        requirements: 'Licenciatura en RRHH o Psicología',
        responsibilities: 'Reclutamiento, selección, evaluación de desempeño',
      },
    }),
    prisma.position.create({
      data: {
        code: 'ASIST-001',
        name: 'Asistente Administrativo',
        description: 'Apoyo administrativo general',
        level: 'Asistencial',
        category: 'Administrativa',
        minSalary: 1200,
        maxSalary: 1800,
        requirements: 'Bachiller, conocimientos de office',
        responsibilities: 'Archivo, atención al público, gestión documental',
      },
    }),
  ]);

  console.log(`✅ Created ${positions.length} positions`);

  // 2. Crear empleados
  console.log('Creating employees...');
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        employeeNumber: 'EMP-2024-0001',
        firstName: 'María',
        lastName: 'González',
        idType: 'V',
        idNumber: '12345678',
        birthDate: new Date('1985-05-15'),
        gender: 'FEMALE',
        maritalStatus: 'MARRIED',
        email: 'maria.gonzalez@municipio.gob.ve',
        phone: '0414-1234567',
        address: 'Av. Principal, Edificio Municipal',
        city: 'Caracas',
        state: 'Distrito Capital',
        positionId: positions[0].id,
        hireDate: new Date('2020-01-15'),
        contractType: 'PERMANENT',
        employmentType: 'FULL_TIME',
        currentSalary: 6000,
        status: 'ACTIVE',
        educationLevel: 'MASTERS',
      },
    }),
    prisma.employee.create({
      data: {
        employeeNumber: 'EMP-2024-0002',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        idType: 'V',
        idNumber: '23456789',
        birthDate: new Date('1990-08-20'),
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        email: 'carlos.rodriguez@municipio.gob.ve',
        phone: '0424-2345678',
        address: 'Calle 5, Quinta María',
        city: 'Caracas',
        state: 'Distrito Capital',
        positionId: positions[1].id,
        hireDate: new Date('2021-03-10'),
        contractType: 'PERMANENT',
        employmentType: 'FULL_TIME',
        currentSalary: 3500,
        status: 'ACTIVE',
        educationLevel: 'BACHELORS',
      },
    }),
    prisma.employee.create({
      data: {
        employeeNumber: 'EMP-2024-0003',
        firstName: 'Ana',
        lastName: 'Martínez',
        idType: 'V',
        idNumber: '34567890',
        birthDate: new Date('1992-11-30'),
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        email: 'ana.martinez@municipio.gob.ve',
        phone: '0412-3456789',
        address: 'Urbanización Los Pinos',
        city: 'Caracas',
        state: 'Distrito Capital',
        positionId: positions[2].id,
        hireDate: new Date('2022-06-01'),
        contractType: 'PERMANENT',
        employmentType: 'FULL_TIME',
        currentSalary: 2500,
        status: 'ACTIVE',
        educationLevel: 'BACHELORS',
      },
    }),
  ]);

  console.log(`✅ Created ${employees.length} employees`);

  // 3. Crear conceptos de nómina
  console.log('Creating payroll concepts...');
  const concepts = await Promise.all([
    prisma.payrollConcept.create({
      data: {
        code: 'SUEL-BASE',
        name: 'Sueldo Base',
        description: 'Salario base del empleado',
        type: 'ASSIGNMENT',
        calculationType: 'FIXED',
        value: 0,
        order: 1,
        isActive: true,
        isTaxable: true,
      },
    }),
    prisma.payrollConcept.create({
      data: {
        code: 'BONO-ALIM',
        name: 'Bono de Alimentación',
        description: 'Bono de alimentación mensual',
        type: 'ASSIGNMENT',
        calculationType: 'FIXED',
        value: 500,
        order: 2,
        isActive: true,
        isTaxable: false,
      },
    }),
    prisma.payrollConcept.create({
      data: {
        code: 'BONO-TRANS',
        name: 'Bono de Transporte',
        description: 'Ayuda de transporte',
        type: 'ASSIGNMENT',
        calculationType: 'FIXED',
        value: 300,
        order: 3,
        isActive: true,
        isTaxable: false,
      },
    }),
    prisma.payrollConcept.create({
      data: {
        code: 'DED-SSO',
        name: 'Seguro Social Obligatorio',
        description: 'Deducción SSO (4%)',
        type: 'DEDUCTION',
        calculationType: 'PERCENTAGE',
        value: 4,
        order: 10,
        isActive: true,
        isTaxable: false,
      },
    }),
    prisma.payrollConcept.create({
      data: {
        code: 'DED-FAOV',
        name: 'FAOV',
        description: 'Fondo de Ahorro Obligatorio para la Vivienda (1%)',
        type: 'DEDUCTION',
        calculationType: 'PERCENTAGE',
        value: 1,
        order: 11,
        isActive: true,
        isTaxable: false,
      },
    }),
    prisma.payrollConcept.create({
      data: {
        code: 'PAT-SSO',
        name: 'Aporte Patronal SSO',
        description: 'Aporte patronal SSO (9%)',
        type: 'EMPLOYER',
        calculationType: 'PERCENTAGE',
        value: 9,
        order: 20,
        isActive: true,
        isTaxable: false,
      },
    }),
    prisma.payrollConcept.create({
      data: {
        code: 'PAT-FAOV',
        name: 'Aporte Patronal FAOV',
        description: 'Aporte patronal FAOV (2%)',
        type: 'EMPLOYER',
        calculationType: 'PERCENTAGE',
        value: 2,
        order: 21,
        isActive: true,
        isTaxable: false,
      },
    }),
    prisma.payrollConcept.create({
      data: {
        code: 'PAT-INCES',
        name: 'INCES',
        description: 'Aporte INCES (2%)',
        type: 'EMPLOYER',
        calculationType: 'PERCENTAGE',
        value: 2,
        order: 22,
        isActive: true,
        isTaxable: false,
      },
    }),
  ]);

  console.log(`✅ Created ${concepts.length} payroll concepts`);

  // 4. Crear registros de asistencia (últimos 7 días)
  console.log('Creating attendance records...');
  const today = new Date();
  const attendanceRecords = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const employee of employees) {
      const checkIn = new Date(date);
      checkIn.setHours(8, Math.floor(Math.random() * 30), 0); // 8:00-8:30
      
      const checkOut = new Date(date);
      checkOut.setHours(17, Math.floor(Math.random() * 30), 0); // 17:00-17:30

      const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
      const status = checkIn.getHours() > 8 || checkIn.getMinutes() > 15 ? 'LATE' : 'PRESENT';

      attendanceRecords.push(
        prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date,
            checkIn,
            checkOut,
            hoursWorked,
            type: 'REGULAR',
            status,
          },
        })
      );
    }
  }

  await Promise.all(attendanceRecords);
  console.log(`✅ Created ${attendanceRecords.length} attendance records`);

  // 5. Crear solicitud de vacaciones
  console.log('Creating vacation requests...');
  await prisma.vacationRequest.create({
    data: {
      employeeId: employees[2].id,
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-29'),
      daysRequested: 10,
      reason: 'Vacaciones de fin de año',
      status: 'PENDING',
    },
  });

  console.log('✅ Created vacation request');

  // 6. Crear capacitación
  console.log('Creating training...');
  const training = await prisma.training.create({
    data: {
      code: 'CAP-2024-001',
      name: 'Gestión del Talento Humano',
      description: 'Curso de actualización en gestión de RRHH',
      type: 'COURSE',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-15'),
      duration: 40,
      instructor: 'Dr. Pedro Pérez',
      location: 'Sala de Capacitación - Edificio Municipal',
      maxParticipants: 20,
      status: 'SCHEDULED',
    },
  });

  // Inscribir empleados
  await Promise.all([
    prisma.employeeTraining.create({
      data: {
        trainingId: training.id,
        employeeId: employees[0].id,
        status: 'ENROLLED',
      },
    }),
    prisma.employeeTraining.create({
      data: {
        trainingId: training.id,
        employeeId: employees[1].id,
        status: 'ENROLLED',
      },
    }),
  ]);

  console.log('✅ Created training with participants');

  console.log('✅ HR module seeded successfully!');
}

export default seedHR;
