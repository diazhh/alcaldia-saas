import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Seed de Variables Urbanas - 10 zonas con normativas completas
 */
async function seedUrbanVariables() {
  console.log('🏙️  Seeding Variables Urbanas...');

  const urbanVariables = [
    {
      zoneCode: 'R1',
      zoneName: 'Residencial Baja Densidad',
      zoneType: 'RESIDENTIAL',
      frontSetback: 5.0,
      rearSetback: 3.0,
      leftSetback: 2.0,
      rightSetback: 2.0,
      maxHeight: 7.5,
      maxFloors: 2,
      buildingDensity: 150.0,
      maxCoverage: 60.0,
      allowedUses: JSON.stringify(['RESIDENTIAL']),
      parkingRequired: true,
      parkingRatio: '1 por vivienda',
      regulations: 'Zona destinada exclusivamente a viviendas unifamiliares. Se permite construcción de hasta 2 plantas con retiros mínimos establecidos.',
      isActive: true,
    },
    {
      zoneCode: 'R2',
      zoneName: 'Residencial Media Densidad',
      zoneType: 'RESIDENTIAL',
      frontSetback: 3.0,
      rearSetback: 3.0,
      leftSetback: 0.0,
      rightSetback: 0.0,
      maxHeight: 15.0,
      maxFloors: 5,
      buildingDensity: 300.0,
      maxCoverage: 70.0,
      allowedUses: JSON.stringify(['RESIDENTIAL']),
      parkingRequired: true,
      parkingRatio: '1 por cada 2 viviendas',
      regulations: 'Zona residencial multifamiliar. Permite edificios de hasta 5 plantas. Retiro frontal obligatorio de 3m.',
      isActive: true,
    },
    {
      zoneCode: 'R3',
      zoneName: 'Residencial Alta Densidad',
      zoneType: 'RESIDENTIAL',
      frontSetback: 5.0,
      rearSetback: 5.0,
      leftSetback: 0.0,
      rightSetback: 0.0,
      maxHeight: 45.0,
      maxFloors: 15,
      buildingDensity: 600.0,
      maxCoverage: 80.0,
      allowedUses: JSON.stringify(['RESIDENTIAL']),
      parkingRequired: true,
      parkingRatio: '1.5 por vivienda',
      regulations: 'Zona de alta densidad residencial. Torres de hasta 15 plantas. Requiere áreas verdes mínimas del 20%.',
      isActive: true,
    },
    {
      zoneCode: 'C1',
      zoneName: 'Comercial Local',
      zoneType: 'COMMERCIAL',
      frontSetback: 0.0,
      rearSetback: 3.0,
      leftSetback: 0.0,
      rightSetback: 0.0,
      maxHeight: 12.0,
      maxFloors: 4,
      buildingDensity: 400.0,
      maxCoverage: 90.0,
      allowedUses: JSON.stringify(['COMMERCIAL', 'RESIDENTIAL']),
      parkingRequired: true,
      parkingRatio: '1 por cada 50m² de comercio',
      regulations: 'Comercio de escala vecinal. Planta baja comercial, plantas superiores pueden ser residenciales.',
      isActive: true,
    },
    {
      zoneCode: 'C2',
      zoneName: 'Comercial Zonal',
      zoneType: 'COMMERCIAL',
      frontSetback: 0.0,
      rearSetback: 5.0,
      leftSetback: 0.0,
      rightSetback: 0.0,
      maxHeight: 24.0,
      maxFloors: 8,
      buildingDensity: 600.0,
      maxCoverage: 85.0,
      allowedUses: JSON.stringify(['COMMERCIAL', 'RESIDENTIAL', 'OFFICE']),
      parkingRequired: true,
      parkingRatio: '1 por cada 40m² de comercio',
      regulations: 'Comercio de escala zonal. Permite centros comerciales y oficinas. Uso mixto permitido.',
      isActive: true,
    },
    {
      zoneCode: 'I1',
      zoneName: 'Industrial Liviana',
      zoneType: 'INDUSTRIAL',
      frontSetback: 5.0,
      rearSetback: 5.0,
      leftSetback: 3.0,
      rightSetback: 3.0,
      maxHeight: 12.0,
      maxFloors: 2,
      buildingDensity: 200.0,
      maxCoverage: 70.0,
      allowedUses: JSON.stringify(['INDUSTRIAL']),
      parkingRequired: true,
      parkingRatio: '1 por cada 100m² construidos',
      regulations: 'Industria liviana no contaminante. Talleres, depósitos, manufactura ligera. Requiere estudio de impacto ambiental.',
      isActive: true,
    },
    {
      zoneCode: 'I2',
      zoneName: 'Industrial Pesada',
      zoneType: 'INDUSTRIAL',
      frontSetback: 10.0,
      rearSetback: 10.0,
      leftSetback: 5.0,
      rightSetback: 5.0,
      maxHeight: 18.0,
      maxFloors: 3,
      buildingDensity: 150.0,
      maxCoverage: 60.0,
      allowedUses: JSON.stringify(['INDUSTRIAL']),
      parkingRequired: true,
      parkingRatio: '1 por cada 150m² construidos',
      regulations: 'Industria pesada. Requiere zona de amortiguamiento de 50m. Estudio de impacto ambiental obligatorio.',
      isActive: true,
    },
    {
      zoneCode: 'M1',
      zoneName: 'Mixto Residencial-Comercial',
      zoneType: 'MIXED',
      frontSetback: 2.0,
      rearSetback: 3.0,
      leftSetback: 0.0,
      rightSetback: 0.0,
      maxHeight: 18.0,
      maxFloors: 6,
      buildingDensity: 450.0,
      maxCoverage: 75.0,
      allowedUses: JSON.stringify(['RESIDENTIAL', 'COMMERCIAL', 'OFFICE']),
      parkingRequired: true,
      parkingRatio: '1 por vivienda + 1 por cada 60m² comercio',
      regulations: 'Uso mixto. Comercio en planta baja, residencial u oficinas en plantas superiores.',
      isActive: true,
    },
    {
      zoneCode: 'AP',
      zoneName: 'Área Protegida',
      zoneType: 'PROTECTED',
      frontSetback: 10.0,
      rearSetback: 10.0,
      leftSetback: 5.0,
      rightSetback: 5.0,
      maxHeight: 6.0,
      maxFloors: 1,
      buildingDensity: 50.0,
      maxCoverage: 20.0,
      allowedUses: JSON.stringify(['RECREATIONAL', 'ENVIRONMENTAL']),
      parkingRequired: false,
      parkingRatio: null,
      regulations: 'Área de protección ambiental. Construcciones mínimas. Preservación de vegetación existente obligatoria.',
      isActive: true,
    },
    {
      zoneCode: 'EQ',
      zoneName: 'Equipamiento Urbano',
      zoneType: 'PUBLIC',
      frontSetback: 5.0,
      rearSetback: 5.0,
      leftSetback: 3.0,
      rightSetback: 3.0,
      maxHeight: 15.0,
      maxFloors: 4,
      buildingDensity: 300.0,
      maxCoverage: 60.0,
      allowedUses: JSON.stringify(['INSTITUTIONAL', 'EDUCATIONAL', 'HEALTH']),
      parkingRequired: true,
      parkingRatio: 'Según uso específico',
      regulations: 'Equipamiento público: escuelas, ambulatorios, oficinas gubernamentales, plazas, parques.',
      isActive: true,
    },
  ];

  const created = [];
  for (const variable of urbanVariables) {
    const existing = await prisma.urbanVariable.findFirst({
      where: { zoneCode: variable.zoneCode },
    });

    if (!existing) {
      const created_var = await prisma.urbanVariable.create({
        data: variable,
      });
      created.push(created_var);
      console.log(`   ✅ Zona ${variable.zoneCode} - ${variable.zoneName}`);
    } else {
      console.log(`   ⏭️  Zona ${variable.zoneCode} ya existe`);
    }
  }

  console.log(`✅ ${created.length} variables urbanas creadas\n`);
  return created;
}

export { seedUrbanVariables };
