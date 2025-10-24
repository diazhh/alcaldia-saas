/**
 * Seed Simplificado para el Módulo Tributario
 *
 * Crea datos básicos de prueba para demostración
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedTaxModule() {
  console.log('🏛️  Iniciando seed del módulo tributario...');

  try {
    // 1. Crear contribuyentes
    console.log('👥 Creando contribuyentes...');

    const taxpayer1 = await prisma.taxpayer.create({
      data: {
        taxpayerType: 'NATURAL',
        taxId: 'V-12345678',
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@email.com',
        phone: '0414-1234567',
        address: 'Av. Bolívar, Casa 123, Sector Centro',
        parish: 'Centro',
        status: 'ACTIVE'
      }
    });

    const taxpayer2 = await prisma.taxpayer.create({
      data: {
        taxpayerType: 'LEGAL',
        taxId: 'J-30123456-7',
        businessName: 'Supermercado El Ahorro C.A.',
        email: 'info@elahorro.com',
        phone: '0212-1234567',
        address: 'Av. Principal, Local Comercial',
        parish: 'Centro',
        status: 'ACTIVE'
      }
    });

    console.log(`   ✓ ${taxpayer1.taxId} - ${taxpayer1.firstName} ${taxpayer1.lastName}`);
    console.log(`   ✓ ${taxpayer2.taxId} - ${taxpayer2.businessName}`);

    // 2. Crear negocio/patente
    console.log('\n🏪 Creando negocios/patentes...');

    const business = await prisma.business.create({
      data: {
        taxpayerId: taxpayer2.id,
        licenseNumber: 'PAT-2024-001',
        businessName: 'Supermercado El Ahorro',
        tradeName: 'El Ahorro Express',
        activityCode: '4711',
        activityName: 'Venta al por menor de productos alimenticios',
        category: 'COMERCIO',
        address: 'Av. Principal, Local Comercial',
        parish: 'Centro',
        annualIncome: 500000.00,
        taxRate: 1.50,
        openingDate: new Date('2020-01-15'),
        licenseDate: new Date('2024-01-15'),
        expiryDate: new Date('2024-12-31'),
        status: 'ACTIVE'
      }
    });

    console.log(`   ✓ ${business.licenseNumber} - ${business.businessName}`);

    // 3. Crear inmueble
    console.log('\n🏘️  Creando inmuebles...');

    const property = await prisma.property.create({
      data: {
        taxpayerId: taxpayer1.id,
        cadastralCode: 'CAT-001-2024',
        propertyType: 'HOUSE',
        propertyUse: 'RESIDENTIAL',
        address: 'Av. Bolívar, Casa 123',
        parish: 'Centro',
        landArea: 200.00,
        buildingArea: 150.00,
        landValue: 40000.00,
        buildingValue: 40000.00,
        totalValue: 80000.00,
        taxRate: 0.50,
        status: 'ACTIVE'
      }
    });

    console.log(`   ✓ ${property.cadastralCode} - ${property.address}`);

    // 4. Crear vehículo
    console.log('\n🚗 Creando vehículos...');

    const vehicle = await prisma.vehicle.create({
      data: {
        taxpayerId: taxpayer1.id,
        plate: 'ABC123',
        vehicleType: 'CAR',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Blanco',
        assessedValue: 15000.00,
        taxRate: 1.50,
        status: 'ACTIVE'
      }
    });

    console.log(`   ✓ ${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`);

    // 5. Generar facturas de impuestos
    console.log('\n💰 Generando facturas...');

    const billBusiness = await prisma.taxBill.create({
      data: {
        taxpayerId: taxpayer2.id,
        businessId: business.id,
        taxType: 'BUSINESS_TAX',
        billNumber: 'FB-2024-000001',
        fiscalYear: 2024,
        concept: 'Impuesto de Actividades Económicas 2024',
        taxRate: 1.50,
        baseAmount: 500000.00,
        taxAmount: 7500.00,
        totalAmount: 7500.00,
        balanceAmount: 7500.00,
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-12-31'),
        status: 'PENDING'
      }
    });

    const billProperty = await prisma.taxBill.create({
      data: {
        taxpayerId: taxpayer1.id,
        propertyId: property.id,
        taxType: 'PROPERTY_TAX',
        billNumber: 'FB-2024-000002',
        fiscalYear: 2024,
        concept: 'Impuesto sobre Inmuebles 2024',
        taxRate: 0.50,
        baseAmount: 80000.00,
        taxAmount: 400.00,
        totalAmount: 400.00,
        balanceAmount: 0,
        paidAmount: 400.00,
        issueDate: new Date('2024-01-10'),
        dueDate: new Date('2024-12-31'),
        status: 'PAID'
      }
    });

    const billVehicle = await prisma.taxBill.create({
      data: {
        taxpayerId: taxpayer1.id,
        vehicleId: vehicle.id,
        taxType: 'VEHICLE_TAX',
        billNumber: 'FB-2024-000003',
        fiscalYear: 2024,
        concept: 'Impuesto sobre Vehículos 2024',
        taxRate: 1.50,
        baseAmount: 15000.00,
        taxAmount: 225.00,
        totalAmount: 225.00,
        balanceAmount: 0,
        paidAmount: 225.00,
        issueDate: new Date('2024-01-10'),
        dueDate: new Date('2024-12-31'),
        status: 'PAID'
      }
    });

    console.log(`   ✓ ${billBusiness.billNumber} - ${billBusiness.totalAmount} (${billBusiness.status})`);
    console.log(`   ✓ ${billProperty.billNumber} - ${billProperty.totalAmount} (${billProperty.status})`);
    console.log(`   ✓ ${billVehicle.billNumber} - ${billVehicle.totalAmount} (${billVehicle.status})`);

    // 6. Generar pagos
    console.log('\n💵 Generando pagos...');

    const payment1 = await prisma.taxPayment.create({
      data: {
        taxpayerId: taxpayer1.id,
        taxBillId: billProperty.id,
        receiptNumber: 'REC-2024-000001',
        amount: 400.00,
        paymentMethod: 'TRANSFER',
        paymentDate: new Date('2024-06-15'),
        referenceNumber: 'REF-ABC123',
        bankName: 'Banco Nacional'
      }
    });

    const payment2 = await prisma.taxPayment.create({
      data: {
        taxpayerId: taxpayer1.id,
        taxBillId: billVehicle.id,
        receiptNumber: 'REC-2024-000002',
        amount: 225.00,
        paymentMethod: 'CASH',
        paymentDate: new Date('2024-07-20'),
        referenceNumber: 'CAJA-001'
      }
    });

    console.log(`   ✓ ${payment1.receiptNumber} - ${payment1.amount} (${payment1.paymentMethod})`);
    console.log(`   ✓ ${payment2.receiptNumber} - ${payment2.amount} (${payment2.paymentMethod})`);

    // Completado: contribuyentes, negocios, inmuebles, vehículos, facturas y pagos

    console.log('\n✅ Seed del módulo tributario completado exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - 2 contribuyentes`);
    console.log(`   - 1 negocio/patente`);
    console.log(`   - 1 inmueble`);
    console.log(`   - 1 vehículo`);
    console.log(`   - 3 facturas`);
    console.log(`   - 2 pagos`);

  } catch (error) {
    console.error('❌ Error en seed tributario:', error);
    throw error;
  }
}

export { seedTaxModule };

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTaxModule()
    .then(() => {
      console.log('✓ Seed ejecutado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Error ejecutando seed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
