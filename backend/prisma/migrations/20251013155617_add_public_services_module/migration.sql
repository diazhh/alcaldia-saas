-- CreateEnum
CREATE TYPE "CollectionType" AS ENUM ('DOMICILIARIA', 'COMERCIAL', 'HOSPITALARIA', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO', 'INCIDENTE');

-- CreateEnum
CREATE TYPE "CollectionPointType" AS ENUM ('CONTENEDOR', 'MERCADO', 'FERIA', 'EVENTO');

-- CreateEnum
CREATE TYPE "StreetlightType" AS ENUM ('LED', 'SODIO', 'MERCURIO', 'FLUORESCENTE', 'HALOGENURO');

-- CreateEnum
CREATE TYPE "PoleType" AS ENUM ('CONCRETO', 'METAL', 'MADERA', 'FIBRA');

-- CreateEnum
CREATE TYPE "StreetlightStatus" AS ENUM ('FUNCIONANDO', 'DANADO', 'FALTANTE', 'MANTENIMIENTO');

-- CreateEnum
CREATE TYPE "FaultType" AS ENUM ('BOMBILLO_FUNDIDO', 'BALASTO_DANADO', 'CABLEADO_CORTADO', 'VANDALISMO', 'POSTE_DANADO', 'OTRO');

-- CreateEnum
CREATE TYPE "FaultStatus" AS ENUM ('REPORTADO', 'ASIGNADO', 'EN_ATENCION', 'RESUELTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "ServiceMaintenanceType" AS ENUM ('LIMPIEZA', 'REPARACION', 'REEMPLAZO', 'INSPECCION', 'PREVENTIVO');

-- CreateEnum
CREATE TYPE "ServiceMaintenanceStatus" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO', 'POSPUESTO');

-- CreateEnum
CREATE TYPE "ParkType" AS ENUM ('PARQUE_RECREATIVO', 'PLAZA_SECA', 'PLAZOLETA', 'CANCHA_DEPORTIVA', 'PARQUE_INFANTIL', 'AREA_VERDE');

-- CreateEnum
CREATE TYPE "ParkStatus" AS ENUM ('EXCELENTE', 'BUENO', 'REGULAR', 'MALO');

-- CreateEnum
CREATE TYPE "ParkMaintenanceType" AS ENUM ('CORTE_GRAMA', 'PODA', 'RIEGO', 'REPARACION_JUEGOS', 'PINTURA', 'LIMPIEZA', 'BACHEO');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SOLICITADO', 'APROBADO', 'RECHAZADO', 'REALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "BurialType" AS ENUM ('INHUMACION', 'EXHUMACION');

-- CreateEnum
CREATE TYPE "SpaceType" AS ENUM ('NICHO', 'BOVEDA', 'CRIPTA', 'FOSA');

-- CreateEnum
CREATE TYPE "CemeteryContractType" AS ENUM ('TEMPORAL', 'PERPETUO');

-- CreateEnum
CREATE TYPE "BurialStatus" AS ENUM ('ACTIVO', 'VENCIDO', 'EXHUMADO', 'RENOVADO');

-- CreateEnum
CREATE TYPE "StallType" AS ENUM ('CARNICERIA', 'PESCADERIA', 'VERDURAS', 'GRANOS', 'ABASTOS', 'COMIDAS', 'OTRO');

-- CreateEnum
CREATE TYPE "StallStatus" AS ENUM ('DISPONIBLE', 'OCUPADO', 'MANTENIMIENTO', 'CLAUSURADO');

-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('INCENDIO', 'INUNDACION', 'DESLIZAMIENTO', 'ACCIDENTE', 'COLAPSO_ESTRUCTURAL', 'RESCATE', 'OTRO');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('REPORTADO', 'EN_ATENCION', 'RESUELTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('AMBULANCIA', 'CARRO_BOMBA', 'UNIDAD_RESCATE', 'EQUIPO', 'PERSONAL');

-- CreateEnum
CREATE TYPE "RiskType" AS ENUM ('INUNDACION', 'DESLIZAMIENTO', 'INCENDIO', 'SISMICO', 'ESTRUCTURAL');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('BAJO', 'MEDIO', 'ALTO', 'CRITICO');

-- CreateEnum
CREATE TYPE "FineStatus" AS ENUM ('PENDIENTE', 'PAGADA', 'IMPUGNADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "FumigationStatus" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PlagueType" AS ENUM ('MOSQUITOS', 'ROEDORES', 'CUCARACHAS', 'TERMITAS', 'OTRO');

-- CreateEnum
CREATE TYPE "PlagueReportStatus" AS ENUM ('PENDIENTE', 'ASIGNADO', 'EN_ATENCION', 'RESUELTO', 'CERRADO');

-- CreateTable
CREATE TABLE "collection_routes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sector" TEXT NOT NULL,
    "streets" TEXT NOT NULL,
    "collectionType" "CollectionType" NOT NULL,
    "schedule" TEXT NOT NULL,
    "startTime" TEXT,
    "routeCoordinates" TEXT,
    "estimatedDuration" INTEGER,
    "distanceKm" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_operations" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "truckId" TEXT,
    "driverId" TEXT,
    "crewMembers" TEXT,
    "status" "OperationStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "vehicleChecked" BOOLEAN NOT NULL DEFAULT false,
    "fuelLevel" TEXT,
    "tonsCollected" DOUBLE PRECISION,
    "disposalSite" TEXT,
    "disposalTime" TIMESTAMP(3),
    "incidents" TEXT,
    "blockedStreets" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_points" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CollectionPointType" NOT NULL,
    "address" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "containerType" TEXT,
    "capacity" DOUBLE PRECISION,
    "collectionFrequency" TEXT,
    "lastCollection" TIMESTAMP(3),
    "nextCollection" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPERATIVO',
    "fillLevel" INTEGER,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cleaning_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sector" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "volunteers" INTEGER,
    "municipalCrew" INTEGER,
    "materialsCollected" DOUBLE PRECISION,
    "areasCleaned" TEXT,
    "photosBefore" TEXT,
    "photosAfter" TEXT,
    "notes" TEXT,
    "organizedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cleaning_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streetlights" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" "StreetlightType" NOT NULL,
    "power" INTEGER,
    "poleHeight" DOUBLE PRECISION,
    "poleType" "PoleType",
    "status" "StreetlightStatus" NOT NULL DEFAULT 'FUNCIONANDO',
    "owner" TEXT NOT NULL DEFAULT 'MUNICIPAL',
    "photo" TEXT,
    "installDate" TIMESTAMP(3),
    "lastMaintenance" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streetlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streetlight_faults" (
    "id" TEXT NOT NULL,
    "streetlightId" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedBy" TEXT,
    "reporterContact" TEXT,
    "faultType" "FaultType" NOT NULL,
    "description" TEXT,
    "diagnosis" TEXT,
    "cause" TEXT,
    "status" "FaultStatus" NOT NULL DEFAULT 'REPORTADO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "actionTaken" TEXT,
    "materialsUsed" TEXT,
    "cost" DECIMAL(15,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streetlight_faults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streetlight_maintenances" (
    "id" TEXT NOT NULL,
    "streetlightId" TEXT NOT NULL,
    "type" "ServiceMaintenanceType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" "ServiceMaintenanceStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "assignedTo" TEXT,
    "workPerformed" TEXT,
    "componentsReplaced" TEXT,
    "cost" DECIMAL(15,2),
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streetlight_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parks" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "type" "ParkType" NOT NULL,
    "area" DOUBLE PRECISION,
    "equipment" TEXT,
    "status" "ParkStatus" NOT NULL DEFAULT 'BUENO',
    "photos" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "park_maintenances" (
    "id" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,
    "type" "ParkMaintenanceType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" "ServiceMaintenanceStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "assignedTo" TEXT,
    "crewMembers" TEXT,
    "workPerformed" TEXT,
    "materialsUsed" TEXT,
    "cost" DECIMAL(15,2),
    "photosBefore" TEXT,
    "photosAfter" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "park_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "park_events" (
    "id" TEXT NOT NULL,
    "parkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "organizerContact" TEXT,
    "permitNumber" TEXT,
    "permitIssued" BOOLEAN NOT NULL DEFAULT false,
    "securityRequired" BOOLEAN NOT NULL DEFAULT false,
    "cleanupRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "EventStatus" NOT NULL DEFAULT 'SOLICITADO',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "park_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cemeteries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "totalNiches" INTEGER NOT NULL,
    "totalVaults" INTEGER,
    "totalCrypts" INTEGER,
    "totalGraves" INTEGER,
    "availableNiches" INTEGER NOT NULL,
    "availableVaults" INTEGER,
    "availableCrypts" INTEGER,
    "availableGraves" INTEGER,
    "sectors" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cemeteries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "burials" (
    "id" TEXT NOT NULL,
    "cemeteryId" TEXT NOT NULL,
    "type" "BurialType" NOT NULL,
    "deceasedName" TEXT NOT NULL,
    "deceasedIdNumber" TEXT,
    "birthDate" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3) NOT NULL,
    "deathCertificate" TEXT,
    "responsibleName" TEXT NOT NULL,
    "responsibleIdNumber" TEXT NOT NULL,
    "responsibleContact" TEXT NOT NULL,
    "relationship" TEXT,
    "spaceType" "SpaceType" NOT NULL,
    "spaceNumber" TEXT NOT NULL,
    "sector" TEXT,
    "burialDate" TIMESTAMP(3) NOT NULL,
    "burialTime" TEXT,
    "exhumationDate" TIMESTAMP(3),
    "serviceCost" DECIMAL(15,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receiptNumber" TEXT,
    "maintenanceFee" DECIMAL(15,2),
    "maintenancePaidUntil" TIMESTAMP(3),
    "contractType" "CemeteryContractType" NOT NULL DEFAULT 'TEMPORAL',
    "contractYears" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "status" "BurialStatus" NOT NULL DEFAULT 'ACTIVO',
    "notes" TEXT,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "burials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "totalStalls" INTEGER NOT NULL,
    "availableStalls" INTEGER NOT NULL,
    "openingHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_stalls" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "stallNumber" TEXT NOT NULL,
    "location" TEXT,
    "type" "StallType" NOT NULL,
    "area" DOUBLE PRECISION,
    "merchantName" TEXT,
    "merchantIdNumber" TEXT,
    "merchantContact" TEXT,
    "contractNumber" TEXT,
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "monthlyRent" DECIMAL(15,2) NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'AL_DIA',
    "lastPayment" TIMESTAMP(3),
    "status" "StallStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_stalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stall_payments" (
    "id" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stall_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_inspections" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "inspectorId" TEXT,
    "overallRating" TEXT NOT NULL,
    "hygiene" TEXT,
    "foodHandling" TEXT,
    "pestControl" TEXT,
    "infrastructure" TEXT,
    "findings" TEXT,
    "violations" TEXT,
    "correctiveActions" TEXT,
    "deadline" TIMESTAMP(3),
    "sanctionApplied" BOOLEAN NOT NULL DEFAULT false,
    "sanctionType" TEXT,
    "sanctionDetails" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "photos" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "EmergencyType" NOT NULL,
    "address" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "peopleAffected" INTEGER,
    "peopleInjured" INTEGER,
    "peopleDead" INTEGER,
    "propertyDamage" TEXT,
    "unitsDispatched" TEXT,
    "personnelInvolved" TEXT,
    "actionsPerformed" TEXT,
    "responseTime" INTEGER,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'REPORTADO',
    "priority" "Priority" NOT NULL DEFAULT 'HIGH',
    "photos" TEXT,
    "videos" TEXT,
    "notes" TEXT,
    "reportedBy" TEXT,
    "attendedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "civil_defense_resources" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "description" TEXT,
    "station" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "capacity" TEXT,
    "specifications" TEXT,
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "civil_defense_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sector" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,
    "riskType" "RiskType" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "estimatedPopulation" INTEGER,
    "vulnerableGroups" TEXT,
    "evacuationPlan" TEXT,
    "shelters" TEXT,
    "evacuationRoutes" TEXT,
    "mitigationMeasures" TEXT,
    "photos" TEXT,
    "documents" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "risk_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_fines" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "vehiclePlate" TEXT NOT NULL,
    "vehicleType" TEXT,
    "driverName" TEXT,
    "driverIdNumber" TEXT,
    "violationType" TEXT NOT NULL,
    "violationCode" TEXT,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "sector" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fineDate" TIMESTAMP(3) NOT NULL,
    "fineTime" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "officerName" TEXT NOT NULL,
    "officerId" TEXT,
    "photo" TEXT,
    "status" "FineStatus" NOT NULL DEFAULT 'PENDIENTE',
    "paymentDate" TIMESTAMP(3),
    "paymentReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traffic_fines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_accidents" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "sector" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "accidentDate" TIMESTAMP(3) NOT NULL,
    "accidentTime" TEXT NOT NULL,
    "vehiclesInvolved" TEXT NOT NULL,
    "peopleInvolved" INTEGER,
    "injured" INTEGER,
    "dead" INTEGER,
    "description" TEXT NOT NULL,
    "sketch" TEXT,
    "photos" TEXT,
    "reportNumber" TEXT,
    "officerName" TEXT NOT NULL,
    "officerId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traffic_accidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patrols" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shift" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "vehicleId" TEXT,
    "officers" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "incidents" TEXT,
    "observations" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patrols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fumigations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" "FumigationStatus" NOT NULL DEFAULT 'PROGRAMADO',
    "plagueType" "PlagueType" NOT NULL,
    "product" TEXT,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "crewMembers" TEXT,
    "route" TEXT,
    "areasCovered" TEXT,
    "photos" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fumigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plague_reports" (
    "id" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedBy" TEXT,
    "reporterContact" TEXT,
    "plagueType" "PlagueType" NOT NULL,
    "location" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIA',
    "status" "PlagueReportStatus" NOT NULL DEFAULT 'PENDIENTE',
    "assignedTo" TEXT,
    "visitDate" TIMESTAMP(3),
    "treatmentApplied" TEXT,
    "resolvedDate" TIMESTAMP(3),
    "photos" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plague_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_routes_code_key" ON "collection_routes"("code");

-- CreateIndex
CREATE INDEX "collection_routes_code_idx" ON "collection_routes"("code");

-- CreateIndex
CREATE INDEX "collection_routes_sector_idx" ON "collection_routes"("sector");

-- CreateIndex
CREATE INDEX "collection_operations_routeId_idx" ON "collection_operations"("routeId");

-- CreateIndex
CREATE INDEX "collection_operations_date_idx" ON "collection_operations"("date");

-- CreateIndex
CREATE UNIQUE INDEX "collection_points_code_key" ON "collection_points"("code");

-- CreateIndex
CREATE INDEX "collection_points_code_idx" ON "collection_points"("code");

-- CreateIndex
CREATE INDEX "collection_points_sector_idx" ON "collection_points"("sector");

-- CreateIndex
CREATE INDEX "cleaning_campaigns_date_idx" ON "cleaning_campaigns"("date");

-- CreateIndex
CREATE UNIQUE INDEX "streetlights_code_key" ON "streetlights"("code");

-- CreateIndex
CREATE INDEX "streetlights_code_idx" ON "streetlights"("code");

-- CreateIndex
CREATE INDEX "streetlights_sector_idx" ON "streetlights"("sector");

-- CreateIndex
CREATE INDEX "streetlights_status_idx" ON "streetlights"("status");

-- CreateIndex
CREATE INDEX "streetlight_faults_streetlightId_idx" ON "streetlight_faults"("streetlightId");

-- CreateIndex
CREATE INDEX "streetlight_faults_status_idx" ON "streetlight_faults"("status");

-- CreateIndex
CREATE INDEX "streetlight_faults_reportDate_idx" ON "streetlight_faults"("reportDate");

-- CreateIndex
CREATE INDEX "streetlight_maintenances_streetlightId_idx" ON "streetlight_maintenances"("streetlightId");

-- CreateIndex
CREATE INDEX "streetlight_maintenances_status_idx" ON "streetlight_maintenances"("status");

-- CreateIndex
CREATE INDEX "streetlight_maintenances_scheduledDate_idx" ON "streetlight_maintenances"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "parks_code_key" ON "parks"("code");

-- CreateIndex
CREATE INDEX "parks_code_idx" ON "parks"("code");

-- CreateIndex
CREATE INDEX "parks_sector_idx" ON "parks"("sector");

-- CreateIndex
CREATE INDEX "parks_type_idx" ON "parks"("type");

-- CreateIndex
CREATE INDEX "park_maintenances_parkId_idx" ON "park_maintenances"("parkId");

-- CreateIndex
CREATE INDEX "park_maintenances_status_idx" ON "park_maintenances"("status");

-- CreateIndex
CREATE INDEX "park_maintenances_scheduledDate_idx" ON "park_maintenances"("scheduledDate");

-- CreateIndex
CREATE INDEX "park_events_parkId_idx" ON "park_events"("parkId");

-- CreateIndex
CREATE INDEX "park_events_eventDate_idx" ON "park_events"("eventDate");

-- CreateIndex
CREATE INDEX "park_events_status_idx" ON "park_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cemeteries_code_key" ON "cemeteries"("code");

-- CreateIndex
CREATE INDEX "cemeteries_code_idx" ON "cemeteries"("code");

-- CreateIndex
CREATE INDEX "burials_cemeteryId_idx" ON "burials"("cemeteryId");

-- CreateIndex
CREATE INDEX "burials_deceasedName_idx" ON "burials"("deceasedName");

-- CreateIndex
CREATE INDEX "burials_spaceNumber_idx" ON "burials"("spaceNumber");

-- CreateIndex
CREATE INDEX "burials_burialDate_idx" ON "burials"("burialDate");

-- CreateIndex
CREATE UNIQUE INDEX "markets_code_key" ON "markets"("code");

-- CreateIndex
CREATE INDEX "markets_code_idx" ON "markets"("code");

-- CreateIndex
CREATE INDEX "markets_sector_idx" ON "markets"("sector");

-- CreateIndex
CREATE INDEX "market_stalls_marketId_idx" ON "market_stalls"("marketId");

-- CreateIndex
CREATE INDEX "market_stalls_status_idx" ON "market_stalls"("status");

-- CreateIndex
CREATE UNIQUE INDEX "market_stalls_marketId_stallNumber_key" ON "market_stalls"("marketId", "stallNumber");

-- CreateIndex
CREATE UNIQUE INDEX "stall_payments_reference_key" ON "stall_payments"("reference");

-- CreateIndex
CREATE INDEX "stall_payments_stallId_idx" ON "stall_payments"("stallId");

-- CreateIndex
CREATE INDEX "stall_payments_year_month_idx" ON "stall_payments"("year", "month");

-- CreateIndex
CREATE INDEX "market_inspections_marketId_idx" ON "market_inspections"("marketId");

-- CreateIndex
CREATE INDEX "market_inspections_inspectionDate_idx" ON "market_inspections"("inspectionDate");

-- CreateIndex
CREATE UNIQUE INDEX "emergencies_code_key" ON "emergencies"("code");

-- CreateIndex
CREATE INDEX "emergencies_code_idx" ON "emergencies"("code");

-- CreateIndex
CREATE INDEX "emergencies_type_idx" ON "emergencies"("type");

-- CreateIndex
CREATE INDEX "emergencies_status_idx" ON "emergencies"("status");

-- CreateIndex
CREATE INDEX "emergencies_reportedAt_idx" ON "emergencies"("reportedAt");

-- CreateIndex
CREATE UNIQUE INDEX "civil_defense_resources_code_key" ON "civil_defense_resources"("code");

-- CreateIndex
CREATE INDEX "civil_defense_resources_code_idx" ON "civil_defense_resources"("code");

-- CreateIndex
CREATE INDEX "civil_defense_resources_type_idx" ON "civil_defense_resources"("type");

-- CreateIndex
CREATE INDEX "civil_defense_resources_status_idx" ON "civil_defense_resources"("status");

-- CreateIndex
CREATE INDEX "risk_zones_sector_idx" ON "risk_zones"("sector");

-- CreateIndex
CREATE INDEX "risk_zones_riskType_idx" ON "risk_zones"("riskType");

-- CreateIndex
CREATE INDEX "risk_zones_riskLevel_idx" ON "risk_zones"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "traffic_fines_reference_key" ON "traffic_fines"("reference");

-- CreateIndex
CREATE INDEX "traffic_fines_reference_idx" ON "traffic_fines"("reference");

-- CreateIndex
CREATE INDEX "traffic_fines_vehiclePlate_idx" ON "traffic_fines"("vehiclePlate");

-- CreateIndex
CREATE INDEX "traffic_fines_status_idx" ON "traffic_fines"("status");

-- CreateIndex
CREATE INDEX "traffic_fines_fineDate_idx" ON "traffic_fines"("fineDate");

-- CreateIndex
CREATE UNIQUE INDEX "traffic_accidents_code_key" ON "traffic_accidents"("code");

-- CreateIndex
CREATE INDEX "traffic_accidents_code_idx" ON "traffic_accidents"("code");

-- CreateIndex
CREATE INDEX "traffic_accidents_accidentDate_idx" ON "traffic_accidents"("accidentDate");

-- CreateIndex
CREATE INDEX "traffic_accidents_sector_idx" ON "traffic_accidents"("sector");

-- CreateIndex
CREATE INDEX "patrols_date_idx" ON "patrols"("date");

-- CreateIndex
CREATE INDEX "patrols_sector_idx" ON "patrols"("sector");

-- CreateIndex
CREATE UNIQUE INDEX "fumigations_code_key" ON "fumigations"("code");

-- CreateIndex
CREATE INDEX "fumigations_code_idx" ON "fumigations"("code");

-- CreateIndex
CREATE INDEX "fumigations_sector_idx" ON "fumigations"("sector");

-- CreateIndex
CREATE INDEX "fumigations_scheduledDate_idx" ON "fumigations"("scheduledDate");

-- CreateIndex
CREATE INDEX "fumigations_status_idx" ON "fumigations"("status");

-- CreateIndex
CREATE INDEX "plague_reports_reportDate_idx" ON "plague_reports"("reportDate");

-- CreateIndex
CREATE INDEX "plague_reports_sector_idx" ON "plague_reports"("sector");

-- CreateIndex
CREATE INDEX "plague_reports_status_idx" ON "plague_reports"("status");

-- AddForeignKey
ALTER TABLE "collection_operations" ADD CONSTRAINT "collection_operations_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "collection_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streetlight_faults" ADD CONSTRAINT "streetlight_faults_streetlightId_fkey" FOREIGN KEY ("streetlightId") REFERENCES "streetlights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streetlight_maintenances" ADD CONSTRAINT "streetlight_maintenances_streetlightId_fkey" FOREIGN KEY ("streetlightId") REFERENCES "streetlights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "park_maintenances" ADD CONSTRAINT "park_maintenances_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "park_events" ADD CONSTRAINT "park_events_parkId_fkey" FOREIGN KEY ("parkId") REFERENCES "parks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "burials" ADD CONSTRAINT "burials_cemeteryId_fkey" FOREIGN KEY ("cemeteryId") REFERENCES "cemeteries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_stalls" ADD CONSTRAINT "market_stalls_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stall_payments" ADD CONSTRAINT "stall_payments_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "market_stalls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_inspections" ADD CONSTRAINT "market_inspections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
