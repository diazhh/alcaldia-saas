import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('\n=== VERIFICANDO DATOS DE RRHH EN BASE DE DATOS ===\n');
    
    // Contar registros
    const employeeCount = await prisma.employee.count();
    const positionCount = await prisma.position.count();
    const attendanceCount = await prisma.attendance.count();
    const payrollCount = await prisma.payroll.count();
    const conceptCount = await prisma.payrollConcept.count();
    
    console.log('📊 TOTALES:');
    console.log(`   Empleados: ${employeeCount}`);
    console.log(`   Posiciones: ${positionCount}`);
    console.log(`   Asistencias: ${attendanceCount}`);
    console.log(`   Nóminas: ${payrollCount}`);
    console.log(`   Conceptos de Nómina: ${conceptCount}`);
    
    // Listar empleados
    if (employeeCount > 0) {
      console.log('\n👥 EMPLEADOS:');
      const employees = await prisma.employee.findMany({
        take: 10,
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          position: {
            select: {
              name: true
            }
          }
        }
      });
      
      employees.forEach(emp => {
        console.log(`   - ${emp.employeeNumber}: ${emp.firstName} ${emp.lastName}`);
        console.log(`     Email: ${emp.email || 'N/A'}`);
        console.log(`     Cargo: ${emp.position?.name || 'N/A'}`);
        console.log(`     Estado: ${emp.status}`);
        console.log('');
      });
    } else {
      console.log('\n❌ NO HAY EMPLEADOS EN LA BASE DE DATOS');
    }
    
    // Listar posiciones
    if (positionCount > 0) {
      console.log('\n💼 POSICIONES:');
      const positions = await prisma.position.findMany({
        take: 10,
        select: {
          code: true,
          name: true,
          baseSalary: true,
          _count: {
            select: { employees: true }
          }
        }
      });
      
      positions.forEach(pos => {
        console.log(`   - ${pos.code}: ${pos.name}`);
        console.log(`     Salario Base: ${pos.baseSalary}`);
        console.log(`     Empleados: ${pos._count.employees}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
