-- CreateEnum
CREATE TYPE "FleetVehicleType" AS ENUM ('GARBAGE_TRUCK', 'AMBULANCE', 'PATROL', 'PICKUP', 'CAR', 'DUMP_TRUCK', 'BUS', 'MOTORCYCLE', 'HEAVY_MACHINERY', 'OTHER');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'GAS', 'ELECTRIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "FleetVehicleStatus" AS ENUM ('OPERATIONAL', 'IN_REPAIR', 'OUT_OF_SERVICE', 'TOTALED', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TireStatus" AS ENUM ('INSTALLED', 'IN_STORAGE', 'DISCARDED');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED', 'CLOSED');

-- CreateTable
CREATE TABLE "fleet_vehicles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" "FleetVehicleType" NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "vin" TEXT,
    "engineSerial" TEXT,
    "engineCapacity" TEXT,
    "fuelType" "FuelType" NOT NULL,
    "capacity" TEXT,
    "registrationCert" TEXT,
    "ownershipTitle" TEXT,
    "acquisitionValue" DECIMAL(15,2) NOT NULL,
    "currentValue" DECIMAL(15,2) NOT NULL,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "status" "FleetVehicleStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "assignedTo" TEXT,
    "departmentId" TEXT,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleet_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_logs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverLicense" TEXT,
    "startMileage" INTEGER NOT NULL,
    "endMileage" INTEGER,
    "distance" INTEGER,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "destination" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "observations" TEXT,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_controls" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "voucherNumber" TEXT NOT NULL,
    "authorizedLiters" DECIMAL(10,2) NOT NULL,
    "gasStation" TEXT NOT NULL,
    "loadDate" TIMESTAMP(3) NOT NULL,
    "loadedLiters" DECIMAL(10,2) NOT NULL,
    "cost" DECIMAL(15,2),
    "mileageAtLoad" INTEGER NOT NULL,
    "efficiency" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "description" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "scheduledMileage" INTEGER,
    "actualMileage" INTEGER,
    "workshop" TEXT,
    "mechanic" TEXT,
    "workPerformed" TEXT,
    "partsUsed" TEXT,
    "laborCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "partsCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "nextMileage" INTEGER,
    "nextDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tires" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "installationDate" TIMESTAMP(3) NOT NULL,
    "removalDate" TIMESTAMP(3),
    "status" "TireStatus" NOT NULL DEFAULT 'INSTALLED',
    "expectedLifeKm" INTEGER,
    "actualLifeKm" INTEGER,
    "cost" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_insurances" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "insurer" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "premium" DECIMAL(15,2) NOT NULL,
    "status" "InsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleet_insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fleet_insurance_claims" (
    "id" TEXT NOT NULL,
    "insuranceId" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverLicense" TEXT,
    "materialDamage" TEXT,
    "personalInjury" TEXT,
    "reportedDate" TIMESTAMP(3),
    "status" "ClaimStatus" NOT NULL DEFAULT 'REPORTED',
    "estimatedCost" DECIMAL(15,2),
    "coveredAmount" DECIMAL(15,2),
    "deductible" DECIMAL(15,2),
    "resolvedDate" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fleet_insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fleet_vehicles_code_key" ON "fleet_vehicles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_vehicles_plate_key" ON "fleet_vehicles"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_vehicles_vin_key" ON "fleet_vehicles"("vin");

-- CreateIndex
CREATE INDEX "fleet_vehicles_plate_idx" ON "fleet_vehicles"("plate");

-- CreateIndex
CREATE INDEX "fleet_vehicles_status_idx" ON "fleet_vehicles"("status");

-- CreateIndex
CREATE INDEX "fleet_vehicles_type_idx" ON "fleet_vehicles"("type");

-- CreateIndex
CREATE INDEX "fleet_vehicles_departmentId_idx" ON "fleet_vehicles"("departmentId");

-- CreateIndex
CREATE INDEX "trip_logs_vehicleId_idx" ON "trip_logs"("vehicleId");

-- CreateIndex
CREATE INDEX "trip_logs_departureDate_idx" ON "trip_logs"("departureDate");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_controls_voucherNumber_key" ON "fuel_controls"("voucherNumber");

-- CreateIndex
CREATE INDEX "fuel_controls_vehicleId_idx" ON "fuel_controls"("vehicleId");

-- CreateIndex
CREATE INDEX "fuel_controls_loadDate_idx" ON "fuel_controls"("loadDate");

-- CreateIndex
CREATE INDEX "fuel_controls_voucherNumber_idx" ON "fuel_controls"("voucherNumber");

-- CreateIndex
CREATE INDEX "maintenances_vehicleId_idx" ON "maintenances"("vehicleId");

-- CreateIndex
CREATE INDEX "maintenances_type_idx" ON "maintenances"("type");

-- CreateIndex
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");

-- CreateIndex
CREATE INDEX "maintenances_scheduledDate_idx" ON "maintenances"("scheduledDate");

-- CreateIndex
CREATE INDEX "tires_vehicleId_idx" ON "tires"("vehicleId");

-- CreateIndex
CREATE INDEX "tires_status_idx" ON "tires"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_insurances_policyNumber_key" ON "fleet_insurances"("policyNumber");

-- CreateIndex
CREATE INDEX "fleet_insurances_vehicleId_idx" ON "fleet_insurances"("vehicleId");

-- CreateIndex
CREATE INDEX "fleet_insurances_endDate_idx" ON "fleet_insurances"("endDate");

-- CreateIndex
CREATE INDEX "fleet_insurances_status_idx" ON "fleet_insurances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fleet_insurance_claims_claimNumber_key" ON "fleet_insurance_claims"("claimNumber");

-- CreateIndex
CREATE INDEX "fleet_insurance_claims_insuranceId_idx" ON "fleet_insurance_claims"("insuranceId");

-- CreateIndex
CREATE INDEX "fleet_insurance_claims_incidentDate_idx" ON "fleet_insurance_claims"("incidentDate");

-- CreateIndex
CREATE INDEX "fleet_insurance_claims_status_idx" ON "fleet_insurance_claims"("status");

-- AddForeignKey
ALTER TABLE "trip_logs" ADD CONSTRAINT "trip_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "fleet_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_controls" ADD CONSTRAINT "fuel_controls_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "fleet_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "fleet_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tires" ADD CONSTRAINT "tires_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "fleet_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_insurances" ADD CONSTRAINT "fleet_insurances_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "fleet_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fleet_insurance_claims" ADD CONSTRAINT "fleet_insurance_claims_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "fleet_insurances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
