import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPayrolls() {
  try {
    console.log('\n🌱 Creando nóminas de prueba...\n');
    
    // Obtener empleados activos
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      take: 6
    });
    
    if (employees.length === 0) {
      console.log('❌ No hay empleados activos');
      return;
    }
    
    console.log(`📊 Encontrados ${employees.length} empleados activos\n`);
    
    // Crear nómina para octubre 2024
    const period = '2024-10';
    const [year, monthNum] = period.split('-');
    
    console.log(`📅 Creando nómina para ${period}...\n`);
    
    const payroll = await prisma.payroll.create({
      data: {
        reference: `NOM-${period}`,
        year: parseInt(year),
        month: parseInt(monthNum),
        periodNumber: parseInt(monthNum),
        period: 'MONTHLY',
        startDate: new Date(`${period}-01`),
        endDate: new Date(`${period}-31`),
        paymentDate: new Date(`${period}-28`),
        status: 'PAID',
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        totalEmployer: 0,
      }
    });
    
    console.log(`✅ Nómina creada: ${payroll.reference}\n`);
    
    // Crear detalles para cada empleado
    console.log('👥 Creando detalles de nómina por empleado...\n');
    
    for (const employee of employees) {
      const baseSalary = parseFloat(employee.currentSalary);
      const bonuses = 800;
      const deductions = baseSalary * 0.05;
      const netSalary = baseSalary + bonuses - deductions;
      
      const detail = await prisma.payrollDetail.create({
        data: {
          payrollId: payroll.id,
          employeeId: employee.id,
          employeeNumber: employee.employeeNumber,
          baseSalary: baseSalary,
          totalAssignments: bonuses,
          totalDeductions: deductions,
          grossSalary: baseSalary + bonuses,
          netSalary: netSalary,
          workedDays: 30,
          absenceDays: 0,
        }
      });
      
      console.log(`   ✅ ${employee.firstName} ${employee.lastName} - Neto: $${netSalary.toFixed(2)}`);
    }
    
    // Actualizar totales de la nómina
    const totals = await prisma.payrollDetail.aggregate({
      where: { payrollId: payroll.id },
      _sum: {
        grossSalary: true,
        totalDeductions: true,
        netSalary: true,
      }
    });
    
    await prisma.payroll.update({
      where: { id: payroll.id },
      data: {
        totalGross: totals._sum.grossSalary || 0,
        totalDeductions: totals._sum.totalDeductions || 0,
        totalNet: totals._sum.netSalary || 0,
      }
    });
    
    console.log(`\n✅ Nómina completada con ${employees.length} empleados`);
    console.log(`   Total Bruto: $${totals._sum.grossSalary}`);
    console.log(`   Total Neto: $${totals._sum.netSalary}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createPayrolls();
