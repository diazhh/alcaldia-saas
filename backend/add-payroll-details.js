import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDetails() {
  try {
    console.log('\n🌱 Agregando detalles a nómina existente...\n');
    
    // Obtener la nómina existente
    const payroll = await prisma.payroll.findFirst({
      where: { reference: 'NOM-2024-10' }
    });
    
    if (!payroll) {
      console.log('❌ No se encontró la nómina');
      return;
    }
    
    console.log(`✅ Nómina encontrada: ${payroll.reference}\n`);
    
    // Obtener empleados activos con su posición
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      take: 6,
      include: { position: true }
    });
    
    console.log(`📊 Encontrados ${employees.length} empleados activos\n`);
    console.log('👥 Creando detalles de nómina...\n');
    
    for (const employee of employees) {
      const baseSalary = parseFloat(employee.currentSalary);
      const bonuses = 800;
      const deductions = baseSalary * 0.05;
      const employerCost = baseSalary * 0.13; // 13% costo patronal (SSO, FAOV, INCES)
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

addDetails();
