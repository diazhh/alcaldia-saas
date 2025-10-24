import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function create2025Payroll() {
  try {
    console.log('\n🌱 Creando nómina para octubre 2025...\n');
    
    // Obtener empleados activos
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      take: 6,
      include: { position: true }
    });
    
    console.log(`📊 Encontrados ${employees.length} empleados activos\n`);
    
    const period = '2025-10';
    const [year, monthNum] = period.split('-');
    
    console.log(`📅 Creando nómina para ${period}...\n`);
    
    // Crear nómina
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
    console.log('👥 Creando detalles de nómina...\n');
    
    // Crear detalles
    for (const employee of employees) {
      const baseSalary = parseFloat(employee.currentSalary);
      const bonuses = 800;
      const deductions = baseSalary * 0.05;
      const employerCost = baseSalary * 0.13;
      const netSalary = baseSalary + bonuses - deductions;
      
      await prisma.payrollDetail.create({
        data: {
          payrollId: payroll.id,
          employeeId: employee.id,
          employeeNumber: employee.employeeNumber,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          position: employee.position?.name || 'Sin cargo',
          grossSalary: baseSalary + bonuses,
          totalDeductions: deductions,
          netSalary: netSalary,
          employerCost: employerCost,
          workedDays: 30,
          absentDays: 0,
          vacationDays: 0,
          status: 'PAID',
        }
      });
      
      console.log(`   ✅ ${employee.firstName} ${employee.lastName} - Neto: $${netSalary.toFixed(2)}`);
    }
    
    // Actualizar totales
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
  } finally {
    await prisma.$disconnect();
  }
}

create2025Payroll();
