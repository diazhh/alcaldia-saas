/**
 * Seed para el Módulo Tributario
 *
 * Este seed crea datos de prueba para:
 * - Contribuyentes (personas naturales y jurídicas)
 * - Negocios/Patentes
 * - Inmuebles
 * - Vehículos
 * - Facturas de impuestos y tasas
 * - Pagos
 * - Casos de cobranza
 * - Solvencias
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Datos de contribuyentes de prueba
 */
const TAXPAYERS_DATA = [
  // Personas Naturales
  {
    taxpayerType: 'NATURAL',
    taxId: 'V-12345678',
    firstName: 'Juan',
    lastName: 'Pérez García',
    email: 'juan.perez@email.com',
    phone: '0414-1234567',
    address: 'Av. Bolívar, Casa 123, Sector Centro',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'NATURAL',
    taxId: 'V-23456789',
    firstName: 'María',
    lastName: 'González Rodríguez',
    email: 'maria.gonzalez@email.com',
    phone: '0424-2345678',
    address: 'Calle Principal, Quinta María, Urbanización Los Jardines',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'NATURAL',
    taxId: 'V-34567890',
    firstName: 'Carlos',
    lastName: 'Ramírez Silva',
    email: 'carlos.ramirez@email.com',
    phone: '0412-3456789',
    address: 'Sector La Esperanza, Casa 45',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'NATURAL',
    taxId: 'V-45678901',
    firstName: 'Ana',
    lastName: 'Martínez López',
    email: 'ana.martinez@email.com',
    phone: '0416-4567890',
    address: 'Urbanización Vista Hermosa, Torre A, Apto 5-B',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'NATURAL',
    taxId: 'V-56789012',
    firstName: 'Luis',
    lastName: 'Fernández Castro',
    email: 'luis.fernandez@email.com',
    phone: '0426-5678901',
    address: 'Calle Miranda, Edificio Los Pinos, PB',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  // Personas Jurídicas
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30123456-7',
    businessName: 'Supermercado El Ahorro C.A.',
    email: 'info@elahorro.com',
    phone: '0212-1234567',
    address: 'Av. Principal, Local Comercial, Zona Centro',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30234567-8',
    businessName: 'Farmacia San Rafael C.A.',
    email: 'contacto@sanrafael.com',
    phone: '0212-2345678',
    address: 'Calle Comercio, Local 12, Centro Comercial Plaza',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30345678-9',
    businessName: 'Restaurante La Buena Mesa C.A.',
    email: 'reservas@labuenamesa.com',
    phone: '0212-3456789',
    address: 'Zona Turística, Local 5',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30456789-0',
    businessName: 'Ferretería Industrial El Tornillo C.A.',
    email: 'ventas@eltornillo.com',
    phone: '0212-4567890',
    address: 'Zona Industrial, Galpón 8',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30567890-1',
    businessName: 'Panadería y Pastelería Don Pan C.A.',
    email: 'pedidos@donpan.com',
    phone: '0212-5678901',
    address: 'Calle Las Flores, Local 3',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30678901-2',
    businessName: 'Clínica Médica Integral C.A.',
    email: 'info@clinicaintegral.com',
    phone: '0212-6789012',
    address: 'Av. Los Médicos, Edificio Salud, Piso 2',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30789012-3',
    businessName: 'Autorepuestos Veloz C.A.',
    email: 'contacto@veloz.com',
    phone: '0212-7890123',
    address: 'Carretera Principal Km 5',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30890123-4',
    businessName: 'Hotel Plaza Mayor C.A.',
    email: 'reservaciones@plazamayor.com',
    phone: '0212-8901234',
    address: 'Plaza Bolívar, Edificio Hotel',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-30901234-5',
    businessName: 'Licorería Premium C.A.',
    email: 'ventas@licoreriapremium.com',
    phone: '0212-9012345',
    address: 'Centro Comercial, Local 45',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  },
  {
    taxpayerType: 'LEGAL',
    taxId: 'J-31012345-6',
    businessName: 'Taller Mecánico El Experto C.A.',
    email: 'servicio@elexperto.com',
    phone: '0212-0123456',
    address: 'Zona Industrial, Galpón 15',
    parish: 'Municipio',
    sector: 'Estado',
    status: 'ACTIVE'
  }
];

/**
 * Datos de negocios/patentes
 */
const BUSINESSES_DATA = [
  {
    taxpayerTaxId: 'J-30123456-7',
    licenseNumber: 'PAT-2024-001',
    businessName: 'Supermercado El Ahorro',
    tradeName: 'El Ahorro Express',
    activityCode: '4711',
    activityName: 'Venta al por menor de productos alimenticios',
    category: 'COMERCIO',
    address: 'Av. Principal, Local Comercial, Zona Centro',
    parish: 'Centro',
    annualIncome: 500000.00,
    taxRate: 1.50,
    openingDate: new Date('2020-01-15'),
    licenseDate: new Date('2024-01-15'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30234567-8',
    licenseNumber: 'PAT-2024-002',
    businessName: 'Farmacia San Rafael',
    tradeName: 'Farmacia San Rafael',
    activityCode: '4772',
    activityName: 'Venta al por menor de productos farmacéuticos',
    category: 'COMERCIO',
    address: 'Calle Comercio, Local 12',
    parish: 'Centro',
    annualIncome: 350000.00,
    taxRate: 1.20,
    openingDate: new Date('2019-05-01'),
    licenseDate: new Date('2024-02-01'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30345678-9',
    licenseNumber: 'PAT-2024-003',
    businessName: 'Restaurante La Buena Mesa',
    tradeName: 'La Buena Mesa',
    activityCode: '5610',
    activityName: 'Actividades de restaurantes y servicios de comida',
    category: 'SERVICIOS',
    address: 'Zona Turística, Local 5',
    parish: 'Centro',
    annualIncome: 280000.00,
    taxRate: 1.80,
    openingDate: new Date('2021-03-20'),
    licenseDate: new Date('2024-01-20'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30456789-0',
    licenseNumber: 'PAT-2024-004',
    businessName: 'Ferretería Industrial El Tornillo',
    tradeName: 'El Tornillo',
    activityCode: '4663',
    activityName: 'Venta al por mayor de materiales de construcción',
    category: 'COMERCIO',
    address: 'Zona Industrial, Galpón 8',
    parish: 'Zona Industrial',
    annualIncome: 450000.00,
    taxRate: 1.50,
    openingDate: new Date('2018-03-01'),
    licenseDate: new Date('2024-03-01'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30567890-1',
    licenseNumber: 'PAT-2024-005',
    businessName: 'Panadería Don Pan',
    tradeName: 'Don Pan',
    activityCode: '1071',
    activityName: 'Elaboración de productos de panadería',
    category: 'INDUSTRIA',
    address: 'Calle Las Flores, Local 3',
    parish: 'Norte',
    annualIncome: 180000.00,
    taxRate: 1.00,
    openingDate: new Date('2017-01-10'),
    licenseDate: new Date('2024-01-10'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30678901-2',
    licenseNumber: 'PAT-2024-006',
    businessName: 'Clínica Médica Integral',
    tradeName: 'Clínica Integral',
    activityCode: '8610',
    activityName: 'Actividades de hospitales y clínicas',
    category: 'SERVICIOS',
    address: 'Av. Los Médicos, Edificio Salud, Piso 2',
    parish: 'Centro',
    annualIncome: 600000.00,
    taxRate: 2.00,
    openingDate: new Date('2015-01-05'),
    licenseDate: new Date('2024-01-05'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30789012-3',
    licenseNumber: 'PAT-2024-007',
    businessName: 'Autorepuestos Veloz',
    tradeName: 'Veloz',
    activityCode: '4530',
    activityName: 'Venta de repuestos y accesorios para vehículos',
    category: 'COMERCIO',
    address: 'Carretera Principal Km 5',
    parish: 'Sur',
    annualIncome: 320000.00,
    taxRate: 1.50,
    openingDate: new Date('2019-02-15'),
    licenseDate: new Date('2024-02-15'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30890123-4',
    licenseNumber: 'PAT-2024-008',
    businessName: 'Hotel Plaza Mayor',
    tradeName: 'Plaza Mayor',
    activityCode: '5510',
    activityName: 'Actividades de alojamiento en hoteles',
    category: 'SERVICIOS',
    address: 'Plaza Bolívar, Edificio Hotel',
    parish: 'Centro',
    annualIncome: 750000.00,
    taxRate: 2.50,
    openingDate: new Date('2010-01-01'),
    licenseDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30901234-5',
    licenseNumber: 'PAT-2024-009',
    businessName: 'Licorería Premium',
    tradeName: 'Premium Licores',
    activityCode: '4725',
    activityName: 'Venta al por menor de bebidas alcohólicas',
    category: 'COMERCIO',
    address: 'Centro Comercial, Local 45',
    parish: 'Centro',
    annualIncome: 280000.00,
    taxRate: 2.00,
    openingDate: new Date('2022-03-10'),
    licenseDate: new Date('2024-03-10'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-31012345-6',
    licenseNumber: 'PAT-2024-010',
    businessName: 'Taller Mecánico El Experto',
    tradeName: 'El Experto',
    activityCode: '4520',
    activityName: 'Mantenimiento y reparación de vehículos',
    category: 'SERVICIOS',
    address: 'Zona Industrial, Galpón 15',
    parish: 'Zona Industrial',
    annualIncome: 220000.00,
    taxRate: 1.50,
    openingDate: new Date('2020-02-20'),
    licenseDate: new Date('2024-02-20'),
    expiryDate: new Date('2024-12-31'),
    status: 'ACTIVE'
  }
];

/**
 * Datos de inmuebles
 */
const PROPERTIES_DATA = [
  {
    taxpayerTaxId: 'V-12345678',
    cadastralCode: 'CAT-001-2024',
    address: 'Av. Bolívar, Casa 123, Sector Centro',
    zone: 'CENTRO',
    propertyUse: 'RESIDENTIAL',
    propertyType: 'HOUSE',
    landArea: 200.00,
    buildingArea: 150.00,
    constructionYear: 2015,
    floors: 1,
    cadastralValue: 80000.00,
    taxRate: 0.50,
    taxAmount: 400.00,
    hasWater: true,
    hasElectriparish: true,
    hasSewer: true,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'V-23456789',
    cadastralCode: 'CAT-002-2024',
    address: 'Calle Principal, Quinta María, Urbanización Los Jardines',
    zone: 'LOS JARDINES',
    propertyUse: 'RESIDENTIAL',
    propertyType: 'HOUSE',
    landArea: 350.00,
    buildingArea: 280.00,
    constructionYear: 2018,
    floors: 2,
    cadastralValue: 150000.00,
    taxRate: 0.50,
    taxAmount: 750.00,
    hasWater: true,
    hasElectriparish: true,
    hasSewer: true,
    exemptionPercentage: 0,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'V-34567890',
    cadastralCode: 'CAT-003-2024',
    address: 'Sector La Esperanza, Casa 45',
    zone: 'LA ESPERANZA',
    propertyUse: 'RESIDENTIAL',
    propertyType: 'HOUSE',
    landArea: 180.00,
    buildingArea: 120.00,
    constructionYear: 2010,
    floors: 1,
    cadastralValue: 60000.00,
    taxRate: 0.50,
    taxAmount: 300.00,
    hasWater: true,
    hasElectriparish: true,
    hasSewer: false,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'V-45678901',
    cadastralCode: 'CAT-004-2024',
    address: 'Urbanización Vista Hermosa, Torre A, Apto 5-B',
    zone: 'VISTA HERMOSA',
    propertyUse: 'RESIDENTIAL',
    propertyType: 'APARTMENT',
    landArea: 0,
    buildingArea: 95.00,
    constructionYear: 2020,
    floors: 1,
    cadastralValue: 90000.00,
    taxRate: 0.50,
    taxAmount: 450.00,
    hasWater: true,
    hasElectriparish: true,
    hasSewer: true,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30123456-7',
    cadastralCode: 'CAT-005-2024',
    address: 'Av. Principal, Local Comercial, Zona Centro',
    zone: 'CENTRO',
    propertyUse: 'COMMERCIAL',
    propertyType: 'LOCAL',
    landArea: 0,
    buildingArea: 250.00,
    constructionYear: 2016,
    floors: 1,
    cadastralValue: 180000.00,
    taxRate: 1.00,
    taxAmount: 1800.00,
    hasWater: true,
    hasElectriparish: true,
    hasSewer: true,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30456789-0',
    cadastralCode: 'CAT-006-2024',
    address: 'Zona Industrial, Galpón 8',
    zone: 'INDUSTRIAL',
    propertyUse: 'INDUSTRIAL',
    propertyType: 'WAREHOUSE',
    landArea: 500.00,
    buildingArea: 400.00,
    constructionYear: 2012,
    floors: 1,
    cadastralValue: 200000.00,
    taxRate: 1.20,
    taxAmount: 2400.00,
    hasWater: true,
    hasElectriparish: true,
    hasSewer: true,
    status: 'ACTIVE'
  }
];

/**
 * Datos de vehículos
 */
const VEHICLES_DATA = [
  {
    taxpayerTaxId: 'V-12345678',
    plateNumber: 'ABC123',
    vehicleType: 'CAR',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Blanco',
    assessedValue: 15000.00,
    taxRate: 1.50,
    taxAmount: 225.00,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'V-23456789',
    plateNumber: 'DEF456',
    vehicleType: 'CAR',
    brand: 'Chevrolet',
    model: 'Spark',
    year: 2019,
    color: 'Rojo',
    assessedValue: 8000.00,
    taxRate: 1.50,
    taxAmount: 120.00,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'V-34567890',
    plateNumber: 'GHI789',
    vehicleType: 'MOTORCYCLE',
    brand: 'Yamaha',
    model: 'FZ16',
    year: 2021,
    color: 'Negro',
    assessedValue: 2500.00,
    taxRate: 1.00,
    taxAmount: 25.00,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'V-45678901',
    plateNumber: 'JKL012',
    vehicleType: 'CAR',
    brand: 'Ford',
    model: 'Fiesta',
    year: 2018,
    color: 'Azul',
    assessedValue: 10000.00,
    taxRate: 1.50,
    taxAmount: 150.00,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30123456-7',
    plateNumber: 'MNO345',
    vehicleType: 'TRUCK',
    brand: 'Chevrolet',
    model: 'NPR',
    year: 2017,
    color: 'Blanco',
    assessedValue: 25000.00,
    taxRate: 2.00,
    taxAmount: 500.00,
    status: 'ACTIVE'
  },
  {
    taxpayerTaxId: 'J-30789012-3',
    plateNumber: 'PQR678',
    vehicleType: 'VAN',
    brand: 'Hyundai',
    model: 'H100',
    year: 2019,
    color: 'Gris',
    assessedValue: 18000.00,
    taxRate: 1.80,
    taxAmount: 324.00,
    status: 'ACTIVE'
  }
];

/**
 * Función principal de seed
 */
async function seedTaxModule() {
  console.log('🏛️  Iniciando seed del módulo tributario...');

  try {
    // 1. Crear contribuyentes
    console.log('👥 Creando contribuyentes...');
    const taxpayers = [];
    for (const data of TAXPAYERS_DATA) {
      const taxpayer = await prisma.taxpayer.create({
        data
      });
      taxpayers.push(taxpayer);
      console.log(`   ✓ Contribuyente: ${taxpayer.taxId} - ${taxpayer.firstName || taxpayer.businessName}`);
    }

    // 2. Crear negocios/patentes
    console.log('\n🏪 Creando negocios/patentes...');
    const businesses = [];
    for (const data of BUSINESSES_DATA) {
      const taxpayer = taxpayers.find(t => t.taxId === data.taxpayerTaxId);
      if (taxpayer) {
        const business = await prisma.business.create({
          data: {
            ...data,
            taxpayerId: taxpayer.id
          }
        });
        businesses.push(business);
        console.log(`   ✓ Negocio: ${business.businessName} (${business.ciiu})`);
      }
    }

    // 3. Crear inmuebles
    console.log('\n🏘️  Creando inmuebles...');
    const properties = [];
    for (const data of PROPERTIES_DATA) {
      const taxpayer = taxpayers.find(t => t.taxId === data.taxpayerTaxId);
      if (taxpayer) {
        const property = await prisma.property.create({
          data: {
            ...data,
            taxpayerId: taxpayer.id
          }
        });
        properties.push(property);
        console.log(`   ✓ Inmueble: ${property.cadastralCode} - ${property.address}`);
      }
    }

    // 4. Crear vehículos
    console.log('\n🚗 Creando vehículos...');
    const vehicles = [];
    for (const data of VEHICLES_DATA) {
      const taxpayer = taxpayers.find(t => t.taxId === data.taxpayerTaxId);
      if (taxpayer) {
        const vehicle = await prisma.vehicle.create({
          data: {
            ...data,
            taxpayerId: taxpayer.id
          }
        });
        vehicles.push(vehicle);
        console.log(`   ✓ Vehículo: ${vehicle.plateNumber} - ${vehicle.brand} ${vehicle.model}`);
      }
    }

    // 5. Generar facturas de impuestos
    console.log('\n💰 Generando facturas de impuestos...');
    const bills = [];

    // Facturas de patentes (negocios)
    for (const business of businesses) {
      const bill = await prisma.taxBill.create({
        data: {
          taxpayerId: business.taxpayerId,
          businessId: business.id,
          taxType: 'BUSINESS_TAX',
          billNumber: `FB-2024-${String(bills.length + 1).padStart(6, '0')}`,
          year: 2024,
          period: 'ANUAL',
          amount: business.taxAmount,
          dueDate: new Date('2024-06-30'),
          status: Math.random() > 0.3 ? 'PAID' : 'PENDING'
        }
      });
      bills.push(bill);
      console.log(`   ✓ Factura patente: ${bill.billNumber} - ${bill.amount} (${bill.status})`);
    }

    // Facturas de inmuebles
    for (const property of properties) {
      const bill = await prisma.taxBill.create({
        data: {
          taxpayerId: property.taxpayerId,
          propertyId: property.id,
          taxType: 'PROPERTY_TAX',
          billNumber: `FB-2024-${String(bills.length + 1).padStart(6, '0')}`,
          year: 2024,
          period: 'ANUAL',
          amount: property.taxAmount,
          dueDate: new Date('2024-07-31'),
          status: Math.random() > 0.4 ? 'PAID' : 'PENDING'
        }
      });
      bills.push(bill);
      console.log(`   ✓ Factura inmueble: ${bill.billNumber} - ${bill.amount} (${bill.status})`);
    }

    // Facturas de vehículos
    for (const vehicle of vehicles) {
      const bill = await prisma.taxBill.create({
        data: {
          taxpayerId: vehicle.taxpayerId,
          vehicleId: vehicle.id,
          taxType: 'VEHICLE_TAX',
          billNumber: `FB-2024-${String(bills.length + 1).padStart(6, '0')}`,
          year: 2024,
          period: 'ANUAL',
          amount: vehicle.taxAmount,
          dueDate: new Date('2024-08-31'),
          status: Math.random() > 0.5 ? 'PAID' : 'PENDING'
        }
      });
      bills.push(bill);
      console.log(`   ✓ Factura vehículo: ${bill.billNumber} - ${bill.amount} (${bill.status})`);
    }

    // Facturas de tasas (aseo urbano)
    const propertiesForFees = properties.slice(0, 10);
    for (const property of propertiesForFees) {
      const bill = await prisma.taxBill.create({
        data: {
          taxpayerId: property.taxpayerId,
          propertyId: property.id,
          taxType: 'URBAN_CLEANING',
          billNumber: `FB-2024-${String(bills.length + 1).padStart(6, '0')}`,
          year: 2024,
          period: 'MENSUAL',
          amount: 50.00,
          dueDate: new Date('2024-10-31'),
          status: Math.random() > 0.6 ? 'PAID' : 'PENDING'
        }
      });
      bills.push(bill);
      console.log(`   ✓ Factura aseo urbano: ${bill.billNumber} - ${bill.amount} (${bill.status})`);
    }

    // 6. Generar pagos para facturas pagadas
    console.log('\n💵 Generando pagos...');
    let paymentCount = 0;
    const paidBills = bills.filter(b => b.status === 'PAID');

    for (const bill of paidBills) {
      const paymentMethods = ['CASH', 'TRANSFER', 'MOBILE_PAYMENT', 'POS'];
      const payment = await prisma.taxPayment.create({
        data: {
          taxpayerId: bill.taxpayerId,
          receiptNumber: `REC-2024-${String(paymentCount + 1).padStart(6, '0')}`,
          amount: bill.amount,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          paymentDate: new Date(2024, Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1),
          reference: `REF-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          notes: 'Pago registrado',
          bills: {
            connect: { id: bill.id }
          }
        }
      });
      paymentCount++;
      console.log(`   ✓ Pago: ${payment.receiptNumber} - ${payment.amount} (${payment.paymentMethod})`);
    }

    // 7. Crear casos de cobranza para facturas vencidas
    console.log('\n📢 Creando casos de cobranza...');
    const overdueBills = bills.filter(b => b.status === 'PENDING' && new Date(b.dueDate) < new Date());

    for (const bill of overdueBills.slice(0, 8)) {
      const daysOverdue = Math.floor((new Date() - new Date(bill.dueDate)) / (1000 * 60 * 60 * 24));
      const priority = daysOverdue > 90 ? 'URGENT' : daysOverdue > 60 ? 'HIGH' : 'MEDIUM';
      const stage = daysOverdue > 90 ? 'FORMAL' : daysOverdue > 60 ? 'NOTICE' : 'REMINDER';

      const collection = await prisma.debtCollection.create({
        data: {
          taxpayerId: bill.taxpayerId,
          caseNumber: `COB-2024-${String(overdueBills.indexOf(bill) + 1).padStart(4, '0')}`,
          totalDebt: bill.amount,
          daysOverdue,
          priority,
          stage,
          status: 'ACTIVE',
          lastContactDate: new Date(),
          bills: {
            connect: { id: bill.id }
          }
        }
      });

      // Agregar acciones de cobranza
      await prisma.collectionAction.create({
        data: {
          collectionId: collection.id,
          actionType: 'LETTER',
          actionDate: new Date(),
          description: 'Envío de carta de notificación de deuda',
          performedBy: 'Sistema Automático'
        }
      });

      console.log(`   ✓ Caso cobranza: ${collection.caseNumber} - ${collection.totalDebt} (${collection.priority})`);
    }

    // 8. Generar solvencias para contribuyentes sin deudas
    console.log('\n📄 Generando solvencias...');
    const taxpayersWithoutDebts = [];

    for (const taxpayer of taxpayers) {
      const pendingBills = bills.filter(b => b.taxpayerId === taxpayer.id && b.status === 'PENDING');
      if (pendingBills.length === 0 && Math.random() > 0.5) {
        taxpayersWithoutDebts.push(taxpayer);
      }
    }

    for (let i = 0; i < taxpayersWithoutDebts.length; i++) {
      const taxpayer = taxpayersWithoutDebts[i];
      const types = ['GENERAL', 'BUSINESS', 'PROPERTY', 'VEHICLE'];
      const type = types[Math.floor(Math.random() * types.length)];

      const solvency = await prisma.solvency.create({
        data: {
          taxpayerId: taxpayer.id,
          solvencyNumber: `SOL-2024-${String(i + 1).padStart(6, '0')}`,
          type,
          issueDate: new Date(),
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
          qrCode: `QR-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
          status: 'ACTIVE',
          requestedBy: taxpayer.firstName || taxpayer.businessName
        }
      });
      console.log(`   ✓ Solvencia: ${solvency.solvencyNumber} - ${type} (${taxpayer.taxId})`);
    }

    console.log('\n✅ Seed del módulo tributario completado exitosamente!');
    console.log(`\n📊 Resumen:`);
    console.log(`   - ${taxpayers.length} contribuyentes`);
    console.log(`   - ${businesses.length} negocios/patentes`);
    console.log(`   - ${properties.length} inmuebles`);
    console.log(`   - ${vehicles.length} vehículos`);
    console.log(`   - ${bills.length} facturas`);
    console.log(`   - ${paymentCount} pagos`);
    console.log(`   - ${overdueBills.slice(0, 8).length} casos de cobranza`);
    console.log(`   - ${taxpayersWithoutDebts.length} solvencias`);

  } catch (error) {
    console.error('❌ Error en seed tributario:', error);
    throw error;
  }
}

// Exportar función
export { seedTaxModule };

// Ejecutar si se llama directamente como módulo principal
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
