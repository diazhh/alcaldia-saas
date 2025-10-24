import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPayrolls() {
  try {
    console.log('\n🌱 Creando nóminas de prueba...\n');
    
    // Obtener empleados
    const employees = await prisma.employee.findMany({
      take: 3,
      include: { position: true }
    });
    
    if (employees.length === 0) {
      console.log('❌ No hay empleados para crear nóminas');
      return;
    }
    
    // Crear nóminas para los últimos 3 meses
    const months = ['2024-10', '2024-11', '2024-12'];
    
    for (const month of months) {
      console.log(`\n📅 Creando nóminas para ${month}...`);
      
      for (const employee of employees) {
        const baseSalary = parseFloat(employee.currentSalary);
        const bonuses = 800; // Bonos fijos
        const deductions = baseSalary * 0.05; // 5% deducciones
        const netSalary = baseSalary + bonuses - deductions;
        
        const reference = `NOM-${month}-${employee.employeeNumber}`;
        const [year, monthNum] = month.split('-');
        
        const payroll = await prisma.payroll.create({
          data: {
            reference: reference,
            employeeId: employee.id,
            year: parseInt(year),
            month: parseInt(monthNum),
            periodNumber: parseInt(monthNum),
            period: month,
            startDate: new Date(`${month}-01`),
            endDate: new Date(`${month}-28`),
            paymentDate: new Date(`${month}-28`),
            baseSalary: baseSalary,
            bonuses: bonuses,
            deductions: deductions,
            grossSalary: baseSalary + bonuses,
            netSalary: netSalary,
            status: 'PAID',
            paymentMethod: 'BANK_TRANSFER',
          }
        });
        
        console.log(`   ✅ Nómina creada para ${employee.firstName} ${employee.lastName} - ${month}`);
      }
    }
    
    const total = await prisma.payroll.count();
    console.log(`\n✅ Total de nóminas creadas: ${total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPayrolls();
