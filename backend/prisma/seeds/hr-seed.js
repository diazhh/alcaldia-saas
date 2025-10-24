import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHR() {
  console.log('🌱 Seeding HR module...');

  // 1. Crear cargos
  console.log('Creating positions...');
  const positions = await Promise.all([
    prisma.position.upsert({
      where: { code: 'DIR-RRHH-001' },
      update: {},
      create: {
        code: 'DIR-RRHH-001',
        name: 'Director de Recursos Humanos',
        description: 'Responsable de la gestión integral de RRHH',
        level: 'Directivo',
        category: 'Gerencial',
        baseSalary: 6500,
        salaryGrade: 'DIR-1',
        requirements: 'Licenciatura en RRHH, mínimo 5 años de experiencia',
        responsibilities: 'Planificación estratégica, gestión de personal, nómina',
      },
    }),
    prisma.position.upsert({
      where: { code: 'COORD-RRHH-001' },
      update: {},
      create: {
        code: 'COORD-RRHH-001',
        name: 'Coordinador de Nómina',
        description: 'Coordinación del proceso de nómina',
        level: 'Coordinación',
        category: 'Administrativa',
        baseSalary: 3750,
        salaryGrade: 'COORD-1',
        requirements: 'Licenciatura en Administración o Contaduría',
        responsibilities: 'Procesamiento de nómina, cálculo de prestaciones',
      },
    }),
    prisma.position.upsert({
      where: { code: 'ANAL-RRHH-001' },
      update: {},
      create: {
        code: 'ANAL-RRHH-001',
        name: 'Analista de RRHH',
        description: 'Análisis y gestión de procesos de RRHH',
        level: 'Profesional',
        category: 'Administrativa',
        baseSalary: 2500,
        salaryGrade: 'PROF-1',
        requirements: 'Licenciatura en RRHH o Psicología',
        responsibilities: 'Reclutamiento, selección, evaluación de desempeño',
      },
    }),
    prisma.position.upsert({
      where: { code: 'ASIST-RRHH-001' },
      update: {},
      create: {
        code: 'ASIST-RRHH-001',
        name: 'Asistente Administrativo',
        description: 'Apoyo administrativo general',
        level: 'Asistencial',
        category: 'Administrativa',
        baseSalary: 1500,
        salaryGrade: 'ASIST-1',
        requirements: 'Bachiller, conocimientos de office',
        responsibilities: 'Archivo, atención al público, gestión documental',
      },
    }),
  ]);

  console.log(`✅ Created ${positions.length} positions`);

  // 2. Crear empleados
  console.log('Creating employees...');
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { employeeNumber: 'EMP-2025-0001' },
      update: {},
      create: {
        employeeNumber: 'EMP-2025-0001',
        firstName: 'María',
        lastName: 'González',
        idNumber: 'V-15678901',
        rif: 'V-15678901-1',
        birthDate: new Date('1985-05-15'),
        birthPlace: 'Caracas, Distrito Capital',
        gender: 'FEMALE',
        maritalStatus: 'MARRIED',
        bloodType: 'O+',
        email: 'maria.gonzalez@municipio.gob.ve',
        phone: '0414-1234567',
        emergencyContact: 'Pedro González',
        emergencyPhone: '0414-9876543',
        address: 'Av. Principal, Edificio Municipal, Caracas, Distrito Capital',
        positionId: positions[0].id,
        hireDate: new Date('2020-01-15'),
        contractType: 'PERMANENT',
        employmentType: 'EMPLOYEE',
        currentSalary: 6000,
        status: 'ACTIVE',
        educationLevel: 'MASTER',
        degree: 'Maestría en Gestión de RRHH',
        institution: 'Universidad Central de Venezuela',
        graduationYear: 2015,
        bankAccount: '01020123456789012345',
        bankName: 'Banco de Venezuela',
      },
    }),
    prisma.employee.upsert({
      where: { employeeNumber: 'EMP-2025-0002' },
      update: {},
      create: {
        employeeNumber: 'EMP-2025-0002',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        idNumber: 'V-26789012',
        rif: 'V-26789012-2',
        birthDate: new Date('1990-08-20'),
        birthPlace: 'Maracay, Aragua',
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        bloodType: 'A+',
        email: 'carlos.rodriguez@municipio.gob.ve',
        phone: '0424-2345678',
        emergencyContact: 'Rosa Rodríguez',
        emergencyPhone: '0424-8765432',
        address: 'Calle 5, Quinta María, Caracas',
        positionId: positions[1].id,
        hireDate: new Date('2021-03-10'),
        contractType: 'PERMANENT',
        employmentType: 'EMPLOYEE',
        currentSalary: 3500,
        status: 'ACTIVE',
        educationLevel: 'UNIVERSITY',
        degree: 'Licenciatura en Administración',
        institution: 'Universidad Simón Bolívar',
        graduationYear: 2018,
        bankAccount: '01020987654321098765',
        bankName: 'Banesco',
      },
    }),
    prisma.employee.upsert({
      where: { employeeNumber: 'EMP-2025-0003' },
      update: {},
      create: {
        employeeNumber: 'EMP-2025-0003',
        firstName: 'Ana',
        lastName: 'Martínez',
        idNumber: 'V-37890123',
        rif: 'V-37890123-3',
        birthDate: new Date('1992-11-30'),
        birthPlace: 'Valencia, Carabobo',
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        bloodType: 'B+',
        email: 'ana.martinez@municipio.gob.ve',
        phone: '0412-3456789',
        emergencyContact: 'Luis Martínez',
        emergencyPhone: '0412-7654321',
        address: 'Urbanización Los Pinos, Caracas',
        positionId: positions[2].id,
        hireDate: new Date('2022-06-01'),
        contractType: 'PERMANENT',
        employmentType: 'EMPLOYEE',
        currentSalary: 2500,
        status: 'ACTIVE',
        educationLevel: 'UNIVERSITY',
        degree: 'Licenciatura en Psicología',
        institution: 'Universidad Católica Andrés Bello',
        graduationYear: 2020,
        bankAccount: '01021122334455667788',
        bankName: 'Mercantil',
      },
    }),
  ]);

  console.log(`✅ Created ${employees.length} employees`);

  // 3. Crear conceptos de nómina
  console.log('Creating payroll concepts...');
  const concepts = await Promise.all([
    prisma.payrollConcept.upsert({
      where: { code: 'SUEL-BASE' },
      update: {},
      create: {
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
    prisma.payrollConcept.upsert({
      where: { code: 'BONO-ALIM' },
      update: {},
      create: {
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
    prisma.payrollConcept.upsert({
      where: { code: 'BONO-TRANS' },
      update: {},
      create: {
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
    prisma.payrollConcept.upsert({
      where: { code: 'DED-SSO' },
      update: {},
      create: {
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
    prisma.payrollConcept.upsert({
      where: { code: 'DED-FAOV' },
      update: {},
      create: {
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
    prisma.payrollConcept.upsert({
      where: { code: 'PAT-SSO' },
      update: {},
      create: {
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
    prisma.payrollConcept.upsert({
      where: { code: 'PAT-FAOV' },
      update: {},
      create: {
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
    prisma.payrollConcept.upsert({
      where: { code: 'PAT-INCES' },
      update: {},
      create: {
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

      const workedHours = (checkOut - checkIn) / (1000 * 60 * 60);
      const lateMinutes = checkIn.getHours() > 8 ? (checkIn.getHours() - 8) * 60 + checkIn.getMinutes() : (checkIn.getMinutes() > 15 ? checkIn.getMinutes() - 15 : 0);
      const status = lateMinutes > 0 ? 'LATE' : 'PRESENT';

      attendanceRecords.push(
        prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date,
            checkIn,
            checkOut,
            workedHours,
            lateMinutes,
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

  // 7. Crear cuentas de caja de ahorro
  console.log('Creating savings bank accounts...');
  const savingsAccounts = await Promise.all([
    prisma.savingsBank.create({
      data: {
        employeeId: employees[0].id,
        employeeRate: 5.0, // 5%
        employerRate: 5.0, // 5%
        totalBalance: 3600,
        availableBalance: 3600,
        isActive: true,
        joinedAt: new Date('2020-02-01'),
      },
    }),
    prisma.savingsBank.create({
      data: {
        employeeId: employees[1].id,
        employeeRate: 5.0,
        employerRate: 5.0,
        totalBalance: 2100,
        availableBalance: 2100,
        isActive: true,
        joinedAt: new Date('2021-04-01'),
      },
    }),
    prisma.savingsBank.create({
      data: {
        employeeId: employees[2].id,
        employeeRate: 5.0,
        employerRate: 5.0,
        totalBalance: 1500,
        availableBalance: 500, // Tiene préstamo activo
        isActive: true,
        joinedAt: new Date('2022-07-01'),
      },
    }),
  ]);

  console.log(`✅ Created ${savingsAccounts.length} savings bank accounts`);

  // 8. Crear aportes mensuales
  console.log('Creating savings contributions...');
  const currentYear = new Date().getFullYear();
  const contributions = [];

  for (let month = 1; month <= 6; month++) {
    contributions.push(
      prisma.savingsContribution.create({
        data: {
          savingsBankId: savingsAccounts[0].id,
          year: currentYear,
          month,
          employeeAmount: 300,
          employerAmount: 300,
          totalAmount: 600,
        },
      }),
      prisma.savingsContribution.create({
        data: {
          savingsBankId: savingsAccounts[1].id,
          year: currentYear,
          month,
          employeeAmount: 175,
          employerAmount: 175,
          totalAmount: 350,
        },
      }),
      prisma.savingsContribution.create({
        data: {
          savingsBankId: savingsAccounts[2].id,
          year: currentYear,
          month,
          employeeAmount: 125,
          employerAmount: 125,
          totalAmount: 250,
        },
      })
    );
  }

  await Promise.all(contributions);
  console.log(`✅ Created ${contributions.length} savings contributions`);

  // 9. Crear préstamos
  console.log('Creating savings loans...');
  const loans = await Promise.all([
    prisma.savingsLoan.create({
      data: {
        savingsBankId: savingsAccounts[2].id,
        loanNumber: 'LOAN-2024-001',
        type: 'PERSONAL',
        amount: 1000,
        interestRate: 8.0,
        installments: 10,
        installmentAmount: 108.33,
        paidInstallments: 3,
        balance: 758.31,
        status: 'ACTIVE',
        requestDate: new Date('2024-08-01'),
        approvedDate: new Date('2024-08-05'),
        approvedBy: employees[0].id,
        firstPaymentDate: new Date('2024-09-01'),
        purpose: 'Gastos médicos familiares',
      },
    }),
    prisma.savingsLoan.create({
      data: {
        savingsBankId: savingsAccounts[1].id,
        loanNumber: 'LOAN-2024-002',
        type: 'EMERGENCY',
        amount: 500,
        interestRate: 6.0,
        installments: 6,
        installmentAmount: 86.67,
        paidInstallments: 0,
        balance: 500,
        status: 'PENDING',
        requestDate: new Date(),
        purpose: 'Emergencia familiar',
      },
    }),
  ]);

  console.log(`✅ Created ${loans.length} savings loans`);

  // 10. Crear dependientes
  console.log('Creating employee dependents...');
  const dependents = await Promise.all([
    // Dependientes de María González
    prisma.employeeDependent.create({
      data: {
        employeeId: employees[0].id,
        firstName: 'Juan',
        lastName: 'González',
        idNumber: 'V-30123456',
        birthDate: new Date('2010-03-15'),
        relationship: 'CHILD',
        gender: 'MALE',
        receivesHealthInsurance: true,
        receivesSchoolSupplies: true,
        receivesToys: true,
        receivesChildBonus: true,
      },
    }),
    prisma.employeeDependent.create({
      data: {
        employeeId: employees[0].id,
        firstName: 'Sofía',
        lastName: 'González',
        birthDate: new Date('2015-07-20'),
        relationship: 'CHILD',
        gender: 'FEMALE',
        receivesHealthInsurance: true,
        receivesSchoolSupplies: true,
        receivesToys: true,
        receivesChildBonus: true,
      },
    }),
    prisma.employeeDependent.create({
      data: {
        employeeId: employees[0].id,
        firstName: 'Pedro',
        lastName: 'González',
        idNumber: 'V-8765432',
        birthDate: new Date('1983-11-10'),
        relationship: 'SPOUSE',
        gender: 'MALE',
        receivesHealthInsurance: true,
        receivesSchoolSupplies: false,
        receivesToys: false,
        receivesChildBonus: false,
      },
    }),
    // Dependiente de Ana Martínez
    prisma.employeeDependent.create({
      data: {
        employeeId: employees[2].id,
        firstName: 'Rosa',
        lastName: 'Martínez',
        idNumber: 'V-5432109',
        birthDate: new Date('1965-05-15'),
        relationship: 'PARENT',
        gender: 'FEMALE',
        receivesHealthInsurance: true,
        receivesSchoolSupplies: false,
        receivesToys: false,
        receivesChildBonus: false,
        notes: 'Madre del empleado, requiere atención médica especial',
      },
    }),
  ]);

  console.log(`✅ Created ${dependents.length} employee dependents`);

  // 11. Crear acciones disciplinarias
  console.log('Creating disciplinary actions...');
  const disciplinaryActions = await Promise.all([
    prisma.disciplinaryAction.create({
      data: {
        employeeId: employees[1].id,
        actionNumber: 'DISC-2024-001',
        type: 'VERBAL_WARNING',
        severity: 'LOW',
        reason: 'Retardos reiterados',
        description: 'El empleado ha llegado tarde en 3 ocasiones durante el mes de septiembre',
        evidence: 'Registros de asistencia del sistema biométrico',
        notifiedAt: new Date('2024-09-15'),
        notificationMethod: 'Reunión presencial',
        responseDeadline: new Date('2024-09-20'),
        employeeResponse: 'Acepto la amonestación y me comprometo a mejorar mi puntualidad',
        decision: 'Amonestación verbal registrada. Se hará seguimiento durante los próximos 3 meses',
        decidedAt: new Date('2024-09-21'),
        decidedBy: employees[0].id,
        status: 'CLOSED',
        createdBy: employees[0].id,
      },
    }),
    prisma.disciplinaryAction.create({
      data: {
        employeeId: employees[2].id,
        actionNumber: 'DISC-2024-002',
        type: 'WRITTEN_WARNING',
        severity: 'MEDIUM',
        reason: 'Incumplimiento de procedimientos administrativos',
        description: 'No siguió el protocolo establecido para el manejo de documentos confidenciales',
        evidence: 'Reporte de auditoría interna del 05/10/2024',
        witnesses: 'Coordinador de Auditoría Interna',
        notifiedAt: new Date('2024-10-10'),
        notificationMethod: 'Notificación escrita entregada en mano',
        responseDeadline: new Date('2024-10-17'),
        employeeResponse: 'Reconozco el error y solicito capacitación adicional en manejo de documentos',
        decision: 'Amonestación escrita. Se programará capacitación en gestión documental',
        decidedAt: new Date('2024-10-18'),
        decidedBy: employees[0].id,
        status: 'CLOSED',
        createdBy: employees[0].id,
      },
    }),
    prisma.disciplinaryAction.create({
      data: {
        employeeId: employees[1].id,
        actionNumber: 'DISC-2024-003',
        type: 'SUSPENSION',
        severity: 'HIGH',
        reason: 'Falta grave: Ausencia injustificada por 3 días consecutivos',
        description: 'El empleado no asistió a laborar los días 15, 16 y 17 de octubre sin notificar',
        evidence: 'Registros de asistencia, intentos de contacto telefónico',
        notifiedAt: new Date('2024-10-20'),
        notificationMethod: 'Notificación escrita y correo electrónico',
        responseDeadline: new Date('2024-10-25'),
        suspensionDays: 2,
        suspensionStart: new Date('2024-10-28'),
        suspensionEnd: new Date('2024-10-29'),
        withPay: false,
        status: 'IN_PROCESS',
        createdBy: employees[0].id,
        notes: 'Pendiente de respuesta del empleado',
      },
    }),
  ]);

  console.log(`✅ Created ${disciplinaryActions.length} disciplinary actions`);

  // 12. Crear evaluaciones de desempeño
  console.log('Creating performance evaluations...');
  await Promise.all([
    prisma.performanceEvaluation.create({
      data: {
        employeeId: employees[1].id,
        evaluatorId: employees[0].id,
        period: 'SEMESTRAL',
        year: currentYear,
        semester: 1,
        technicalSkills: 4,
        productivity: 4,
        teamwork: 5,
        initiative: 4,
        finalScore: 4.25,
        rating: 'VERY_GOOD',
        strengths: 'Excelente trabajo en equipo, alta productividad',
        areasOfImprovement: 'Mejorar puntualidad',
        goals: 'Completar certificación en nómina, reducir errores a menos del 1%',
        comments: 'Empleado con buen desempeño general',
        evaluationDate: new Date('2024-07-15'),
        status: 'COMPLETED',
      },
    }),
    prisma.performanceEvaluation.create({
      data: {
        employeeId: employees[2].id,
        evaluatorId: employees[0].id,
        period: 'SEMESTRAL',
        year: currentYear,
        semester: 1,
        technicalSkills: 5,
        productivity: 5,
        teamwork: 4,
        initiative: 5,
        finalScore: 4.75,
        rating: 'EXCELLENT',
        strengths: 'Excelente iniciativa, alta calidad de trabajo, proactividad',
        areasOfImprovement: 'Mejorar comunicación con otras áreas',
        goals: 'Liderar proyecto de digitalización de expedientes',
        comments: 'Empleada destacada con gran potencial',
        evaluationDate: new Date('2024-07-15'),
        status: 'COMPLETED',
      },
    }),
  ]);

  console.log('✅ Created performance evaluations');

  console.log('✅ HR module seeded successfully with all new features!');
  console.log('📊 Summary:');
  console.log(`   - ${positions.length} positions`);
  console.log(`   - ${employees.length} employees`);
  console.log(`   - ${concepts.length} payroll concepts`);
  console.log(`   - ${attendanceRecords.length} attendance records`);
  console.log(`   - ${savingsAccounts.length} savings bank accounts`);
  console.log(`   - ${contributions.length} savings contributions`);
  console.log(`   - ${loans.length} savings loans`);
  console.log(`   - ${dependents.length} employee dependents`);
  console.log(`   - ${disciplinaryActions.length} disciplinary actions`);
}

export default seedHR;
