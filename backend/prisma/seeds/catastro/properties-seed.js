import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Calcular valores catastrales estimados
 */
function calculatePropertyValues(landArea, buildingArea, propertyUse, conservationState, constructionYear) {
  // Valores base por m² según uso (en Bs)
  const landValuePerM2 = {
    RESIDENTIAL: 500,
    COMMERCIAL: 1000,
    INDUSTRIAL: 300,
    VACANT: 200,
    MIXED: 800,
    AGRICULTURAL: 100,
  };

  const buildingValuePerM2 = {
    RESIDENTIAL: 1200,
    COMMERCIAL: 1800,
    INDUSTRIAL: 900,
    VACANT: 0,
    MIXED: 1500,
    AGRICULTURAL: 400,
  };

  // Factor de depreciación por antigüedad
  const currentYear = 2025;
  const age = currentYear - (constructionYear || 2020);
  const depreciationFactor = Math.max(0.5, 1 - (age * 0.02)); // 2% por año, mínimo 50%

  // Factor de conservación
  const conservationFactors = {
    EXCELLENT: 1.2,
    GOOD: 1.0,
    REGULAR: 0.8,
    POOR: 0.6,
    RUINOUS: 0.3,
  };

  const landValue = landArea * (landValuePerM2[propertyUse] || 500);
  const buildingValue = buildingArea * (buildingValuePerM2[propertyUse] || 1000) * 
                        depreciationFactor * 
                        (conservationFactors[conservationState] || 1.0);
  const totalValue = landValue + buildingValue;
  const taxRate = 0.01; // 1% alícuota base

  return {
    landValue: Math.round(landValue * 100) / 100,
    buildingValue: Math.round(buildingValue * 100) / 100,
    totalValue: Math.round(totalValue * 100) / 100,
    taxRate,
  };
}

/**
 * Seed de Propiedades - 50 inmuebles con datos realistas
 */
async function seedProperties() {
  console.log('🏘️  Seeding Propiedades...');

  // Obtener o crear contribuyente genérico para propiedades sin dueño específico
  let genericTaxpayer = await prisma.taxpayer.findFirst({
    where: { taxId: 'V-00000000' },
  });

  if (!genericTaxpayer) {
    genericTaxpayer = await prisma.taxpayer.create({
      data: {
        taxId: 'V-00000000',
        taxpayerType: 'NATURAL',
        firstName: 'Propietario',
        lastName: 'Genérico',
        email: 'generico@catastro.gob.ve',
        phone: '+58 000-0000000',
        address: 'Sin dirección específica',
        parish: 'Centro',
        status: 'ACTIVE',
      },
    });
    console.log('   ✅ Contribuyente genérico creado');
  }

  const properties = [
    // RESIDENCIALES - APARTAMENTOS (10)
    {
      cadastralCode: 'CAT-2025-0001',
      address: 'Av. Bolívar con Calle Principal, Torre del Este, Piso 5, Apto 5-A',
      parish: 'Centro',
      sector: 'El Recreo',
      latitude: 10.4806,
      longitude: -66.9036,
      landArea: 0,
      buildingArea: 85.50,
      propertyType: 'APARTMENT',
      propertyUse: 'RESIDENTIAL',
      floors: 1,
      rooms: 3,
      bathrooms: 2,
      parkingSpaces: 1,
      constructionYear: 2018,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: false,
      conservationState: 'GOOD',
      zoneCode: 'R2',
      frontBoundary: 'Pasillo común',
      rearBoundary: 'Apto 5-B',
      leftBoundary: 'Apto 5-C',
      rightBoundary: 'Fachada norte',
      frontPhoto: '/uploads/properties/apt-001-facade.jpg',
      notes: 'Apartamento en excelente estado, piso de porcelanato, cocina integral.',
    },
    {
      cadastralCode: 'CAT-2025-0002',
      address: 'Residencias Los Pinos, Torre B, Piso 3, Apto 3-D',
      parish: 'San Pedro',
      sector: 'Los Pinos',
      latitude: 10.4820,
      longitude: -66.9050,
      landArea: 0,
      buildingArea: 72.00,
      propertyType: 'APARTMENT',
      propertyUse: 'RESIDENTIAL',
      floors: 1,
      rooms: 2,
      bathrooms: 2,
      parkingSpaces: 1,
      constructionYear: 2015,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: true,
      conservationState: 'EXCELLENT',
      zoneCode: 'R2',
      frontPhoto: '/uploads/properties/apt-002-facade.jpg',
    },
    {
      cadastralCode: 'CAT-2025-0003',
      address: 'Conjunto Residencial Vista Hermosa, Edificio 4, Apto 12',
      parish: 'La Candelaria',
      sector: 'Vista Hermosa',
      latitude: 10.4795,
      longitude: -66.9015,
      landArea: 0,
      buildingArea: 95.00,
      propertyType: 'APARTMENT',
      propertyUse: 'RESIDENTIAL',
      floors: 1,
      rooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      constructionYear: 2020,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: true,
      conservationState: 'EXCELLENT',
      zoneCode: 'R3',
      frontPhoto: '/uploads/properties/apt-003-facade.jpg',
    },

    // RESIDENCIALES - CASAS (15)
    {
      cadastralCode: 'CAT-2025-0004',
      address: 'Calle Los Rosales, Casa N° 45',
      parish: 'San José',
      sector: 'Los Rosales',
      latitude: 10.4850,
      longitude: -66.9100,
      landArea: 250.00,
      buildingArea: 180.00,
      propertyType: 'HOUSE',
      propertyUse: 'RESIDENTIAL',
      floors: 2,
      rooms: 4,
      bathrooms: 3,
      parkingSpaces: 2,
      constructionYear: 2010,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: false,
      conservationState: 'GOOD',
      zoneCode: 'R1',
      frontBoundary: 'Calle Los Rosales',
      rearBoundary: 'Casa N° 46',
      leftBoundary: 'Casa N° 43',
      rightBoundary: 'Casa N° 47',
      frontPhoto: '/uploads/properties/house-004-facade.jpg',
      notes: 'Casa de dos plantas con jardín frontal y patio trasero.',
    },
    {
      cadastralCode: 'CAT-2025-0005',
      address: 'Urbanización El Paraíso, Calle 3, Casa 12',
      parish: 'El Paraíso',
      sector: 'El Paraíso',
      latitude: 10.4870,
      longitude: -66.9120,
      landArea: 300.00,
      buildingArea: 220.00,
      propertyType: 'HOUSE',
      propertyUse: 'RESIDENTIAL',
      floors: 2,
      rooms: 5,
      bathrooms: 4,
      parkingSpaces: 3,
      constructionYear: 2012,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: true,
      conservationState: 'EXCELLENT',
      zoneCode: 'R1',
      frontBoundary: 'Calle 3',
      rearBoundary: 'Casa 13',
      leftBoundary: 'Casa 11',
      rightBoundary: 'Casa 14',
      frontPhoto: '/uploads/properties/house-005-facade.jpg',
    },

    // COMERCIALES (10)
    {
      cadastralCode: 'CAT-2025-0020',
      address: 'Av. Comercio, Local 101',
      parish: 'Centro',
      sector: 'Zona Comercial',
      latitude: 10.4800,
      longitude: -66.9040,
      landArea: 0,
      buildingArea: 120.00,
      propertyType: 'LOCAL',
      propertyUse: 'COMMERCIAL',
      floors: 1,
      rooms: 0,
      bathrooms: 2,
      parkingSpaces: 3,
      constructionYear: 2016,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: false,
      conservationState: 'GOOD',
      zoneCode: 'C1',
      frontPhoto: '/uploads/properties/commercial-020-facade.jpg',
      notes: 'Local comercial en planta baja, ideal para tienda o restaurante.',
    },
    {
      cadastralCode: 'CAT-2025-0021',
      address: 'Centro Comercial Plaza Mayor, Local 205',
      parish: 'Centro',
      sector: 'Plaza Mayor',
      latitude: 10.4810,
      longitude: -66.9045,
      landArea: 0,
      buildingArea: 85.00,
      propertyType: 'LOCAL',
      propertyUse: 'COMMERCIAL',
      floors: 1,
      rooms: 0,
      bathrooms: 1,
      parkingSpaces: 0,
      constructionYear: 2019,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: false,
      conservationState: 'EXCELLENT',
      zoneCode: 'C2',
      frontPhoto: '/uploads/properties/commercial-021-facade.jpg',
    },

    // INDUSTRIALES (5)
    {
      cadastralCode: 'CAT-2025-0030',
      address: 'Zona Industrial Los Cortijos, Galpón 5',
      parish: 'Los Cortijos',
      sector: 'Zona Industrial',
      latitude: 10.4750,
      longitude: -66.9200,
      landArea: 1000.00,
      buildingArea: 600.00,
      propertyType: 'WAREHOUSE',
      propertyUse: 'INDUSTRIAL',
      floors: 1,
      rooms: 0,
      bathrooms: 2,
      parkingSpaces: 10,
      constructionYear: 2008,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: false,
      conservationState: 'REGULAR',
      zoneCode: 'I1',
      frontBoundary: 'Vía principal',
      rearBoundary: 'Galpón 6',
      leftBoundary: 'Galpón 4',
      rightBoundary: 'Calle de servicio',
      frontPhoto: '/uploads/properties/industrial-030-facade.jpg',
      notes: 'Galpón industrial con oficinas administrativas.',
    },

    // BALDÍOS (5)
    {
      cadastralCode: 'CAT-2025-0040',
      address: 'Sector El Mirador, Parcela 15',
      parish: 'El Mirador',
      sector: 'El Mirador',
      latitude: 10.4900,
      longitude: -66.9150,
      landArea: 500.00,
      buildingArea: 0,
      propertyType: 'LAND',
      propertyUse: 'VACANT',
      floors: 0,
      rooms: 0,
      bathrooms: 0,
      parkingSpaces: 0,
      constructionYear: null,
      hasWater: false,
      hasElectricity: false,
      hasSewerage: false,
      hasGas: false,
      conservationState: null,
      zoneCode: 'R1',
      frontBoundary: 'Calle sin nombre',
      rearBoundary: 'Parcela 16',
      leftBoundary: 'Parcela 14',
      rightBoundary: 'Quebrada',
      notes: 'Terreno baldío con pendiente suave, apto para construcción.',
    },

    // MIXTOS (5)
    {
      cadastralCode: 'CAT-2025-0045',
      address: 'Av. Principal, Edificio Mixto San Rafael, PB y Piso 1',
      parish: 'San Rafael',
      sector: 'Centro',
      latitude: 10.4815,
      longitude: -66.9055,
      landArea: 200.00,
      buildingArea: 350.00,
      propertyType: 'BUILDING',
      propertyUse: 'MIXED',
      floors: 2,
      rooms: 4,
      bathrooms: 4,
      parkingSpaces: 4,
      constructionYear: 2014,
      hasWater: true,
      hasElectricity: true,
      hasSewerage: true,
      hasGas: false,
      conservationState: 'GOOD',
      zoneCode: 'M1',
      frontBoundary: 'Av. Principal',
      rearBoundary: 'Callejón',
      leftBoundary: 'Edificio vecino',
      rightBoundary: 'Edificio vecino',
      frontPhoto: '/uploads/properties/mixed-045-facade.jpg',
      notes: 'Planta baja comercial (2 locales), piso 1 residencial (2 apartamentos).',
    },
  ];

  const created = [];
  for (const property of properties) {
    const existing = await prisma.property.findFirst({
      where: { cadastralCode: property.cadastralCode },
    });

    if (!existing) {
      // Calcular valores catastrales
      const values = calculatePropertyValues(
        property.landArea || 0,
        property.buildingArea || 0,
        property.propertyUse,
        property.conservationState || 'GOOD',
        property.constructionYear
      );

      // Agregar valores calculados y taxpayerId a la propiedad
      const propertyWithValues = {
        ...property,
        taxpayerId: genericTaxpayer.id,
        landValue: values.landValue,
        buildingValue: values.buildingValue,
        totalValue: values.totalValue,
        taxRate: values.taxRate,
      };

      const created_prop = await prisma.property.create({
        data: propertyWithValues,
      });
      created.push(created_prop);
      console.log(`   ✅ ${property.cadastralCode} - ${property.address.substring(0, 50)}...`);
    } else {
      console.log(`   ⏭️  ${property.cadastralCode} ya existe`);
    }
  }

  console.log(`✅ ${created.length} propiedades creadas\n`);
  return created;
}

export { seedProperties };
