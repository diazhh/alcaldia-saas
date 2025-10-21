-- CreateEnum
CREATE TYPE "ConservationState" AS ENUM ('EXCELLENT', 'GOOD', 'REGULAR', 'POOR', 'RUINOUS');

-- CreateEnum
CREATE TYPE "PropertyPhotoType" AS ENUM ('FRONT', 'REAR', 'INTERIOR', 'AERIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED', 'PROTECTED', 'RURAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "PermitType" AS ENUM ('NEW_CONSTRUCTION', 'REMODELING', 'EXPANSION', 'DEMOLITION', 'REGULARIZATION', 'REPAIR', 'OTHER');

-- CreateEnum
CREATE TYPE "PermitStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'CORRECTIONS_REQUIRED', 'APPROVED', 'REJECTED', 'IN_CONSTRUCTION', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConstructionInspectionType" AS ENUM ('FOUNDATION', 'STRUCTURE', 'MASONRY', 'INSTALLATIONS', 'FINISHES', 'FINAL', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "UrbanInspectionType" AS ENUM ('ILLEGAL_CONSTRUCTION', 'LAND_INVASION', 'ZONING_VIOLATION', 'ENVIRONMENTAL', 'SAFETY', 'GENERAL', 'OTHER');

-- CreateEnum
CREATE TYPE "InspectionOrigin" AS ENUM ('COMPLAINT', 'ROUTINE', 'FOLLOW_UP', 'REQUEST');

-- CreateEnum
CREATE TYPE "UrbanInspectionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'NOTIFIED', 'SANCTIONED', 'RESOLVED', 'CANCELLED');

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "conservationState" "ConservationState",
ADD COLUMN     "deedDate" DATE,
ADD COLUMN     "deedNumber" TEXT,
ADD COLUMN     "frontBoundary" TEXT,
ADD COLUMN     "frontPhoto" TEXT,
ADD COLUMN     "hasElectricity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasGas" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasSewerage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasWater" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leftBoundary" TEXT,
ADD COLUMN     "parkingSpaces" INTEGER,
ADD COLUMN     "rearBoundary" TEXT,
ADD COLUMN     "registryOffice" TEXT,
ADD COLUMN     "rightBoundary" TEXT,
ADD COLUMN     "zoneCode" TEXT;

-- CreateTable
CREATE TABLE "property_owners" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "ownerIdNumber" TEXT NOT NULL,
    "ownerType" "TaxpayerType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "deedNumber" TEXT,
    "deedDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_photos" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "photoType" "PropertyPhotoType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urban_variables" (
    "id" TEXT NOT NULL,
    "zoneCode" TEXT NOT NULL,
    "zoneName" TEXT NOT NULL,
    "zoneType" "ZoneType" NOT NULL,
    "frontSetback" DECIMAL(5,2),
    "rearSetback" DECIMAL(5,2),
    "leftSetback" DECIMAL(5,2),
    "rightSetback" DECIMAL(5,2),
    "maxHeight" DECIMAL(5,2),
    "maxFloors" INTEGER,
    "buildingDensity" DECIMAL(5,2),
    "maxCoverage" DECIMAL(5,2),
    "parkingRequired" BOOLEAN NOT NULL DEFAULT false,
    "parkingRatio" TEXT,
    "allowedUses" TEXT NOT NULL,
    "regulations" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urban_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "construction_permits" (
    "id" TEXT NOT NULL,
    "permitNumber" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "applicantPhone" TEXT,
    "applicantEmail" TEXT,
    "permitType" "PermitType" NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "constructionArea" DECIMAL(10,2) NOT NULL,
    "estimatedCost" DECIMAL(15,2),
    "architecturalPlans" TEXT,
    "structuralPlans" TEXT,
    "electricalPlans" TEXT,
    "plumbingPlans" TEXT,
    "propertyDeed" TEXT,
    "otherDocuments" TEXT,
    "reviewerId" TEXT,
    "reviewDate" DATE,
    "reviewNotes" TEXT,
    "complianceCheck" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvalDate" DATE,
    "approvalNotes" TEXT,
    "reviewFee" DECIMAL(15,2),
    "permitFee" DECIMAL(15,2) NOT NULL,
    "totalFee" DECIMAL(15,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" DATE,
    "paymentReference" TEXT,
    "applicationDate" DATE NOT NULL,
    "expiryDate" DATE,
    "status" "PermitStatus" NOT NULL DEFAULT 'SUBMITTED',
    "constructionStartDate" DATE,
    "constructionEndDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "construction_permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permit_inspections" (
    "id" TEXT NOT NULL,
    "permitId" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "inspectionDate" DATE NOT NULL,
    "inspectionType" "ConstructionInspectionType" NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "findings" TEXT,
    "compliance" BOOLEAN NOT NULL DEFAULT true,
    "violations" TEXT,
    "recommendations" TEXT,
    "photos" TEXT,
    "requiresAction" BOOLEAN NOT NULL DEFAULT false,
    "actionRequired" TEXT,
    "actionDeadline" DATE,
    "status" "InspectionStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permit_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urban_inspections" (
    "id" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "propertyId" TEXT,
    "address" TEXT NOT NULL,
    "inspectionType" "UrbanInspectionType" NOT NULL,
    "origin" "InspectionOrigin" NOT NULL,
    "complaintId" TEXT,
    "complainantName" TEXT,
    "complainantPhone" TEXT,
    "complainantEmail" TEXT,
    "scheduledDate" DATE,
    "inspectionDate" DATE,
    "inspectorId" TEXT,
    "inspectorName" TEXT,
    "description" TEXT NOT NULL,
    "hasViolation" BOOLEAN NOT NULL DEFAULT false,
    "violationType" TEXT,
    "violationDetails" TEXT,
    "photos" TEXT,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationDate" DATE,
    "notificationMethod" TEXT,
    "hasSanction" BOOLEAN NOT NULL DEFAULT false,
    "sanctionType" TEXT,
    "sanctionAmount" DECIMAL(15,2),
    "sanctionDetails" TEXT,
    "requiresFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" DATE,
    "followUpNotes" TEXT,
    "resolutionDate" DATE,
    "resolutionNotes" TEXT,
    "status" "UrbanInspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urban_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_owners_propertyId_idx" ON "property_owners"("propertyId");

-- CreateIndex
CREATE INDEX "property_owners_ownerIdNumber_idx" ON "property_owners"("ownerIdNumber");

-- CreateIndex
CREATE INDEX "property_owners_isCurrent_idx" ON "property_owners"("isCurrent");

-- CreateIndex
CREATE INDEX "property_photos_propertyId_idx" ON "property_photos"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "urban_variables_zoneCode_key" ON "urban_variables"("zoneCode");

-- CreateIndex
CREATE INDEX "urban_variables_zoneCode_idx" ON "urban_variables"("zoneCode");

-- CreateIndex
CREATE INDEX "urban_variables_zoneType_idx" ON "urban_variables"("zoneType");

-- CreateIndex
CREATE INDEX "urban_variables_isActive_idx" ON "urban_variables"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "construction_permits_permitNumber_key" ON "construction_permits"("permitNumber");

-- CreateIndex
CREATE INDEX "construction_permits_permitNumber_idx" ON "construction_permits"("permitNumber");

-- CreateIndex
CREATE INDEX "construction_permits_propertyId_idx" ON "construction_permits"("propertyId");

-- CreateIndex
CREATE INDEX "construction_permits_status_idx" ON "construction_permits"("status");

-- CreateIndex
CREATE INDEX "construction_permits_applicationDate_idx" ON "construction_permits"("applicationDate");

-- CreateIndex
CREATE UNIQUE INDEX "permit_inspections_inspectionNumber_key" ON "permit_inspections"("inspectionNumber");

-- CreateIndex
CREATE INDEX "permit_inspections_permitId_idx" ON "permit_inspections"("permitId");

-- CreateIndex
CREATE INDEX "permit_inspections_inspectionDate_idx" ON "permit_inspections"("inspectionDate");

-- CreateIndex
CREATE INDEX "permit_inspections_status_idx" ON "permit_inspections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "urban_inspections_inspectionNumber_key" ON "urban_inspections"("inspectionNumber");

-- CreateIndex
CREATE INDEX "urban_inspections_inspectionNumber_idx" ON "urban_inspections"("inspectionNumber");

-- CreateIndex
CREATE INDEX "urban_inspections_propertyId_idx" ON "urban_inspections"("propertyId");

-- CreateIndex
CREATE INDEX "urban_inspections_status_idx" ON "urban_inspections"("status");

-- CreateIndex
CREATE INDEX "urban_inspections_inspectionDate_idx" ON "urban_inspections"("inspectionDate");

-- CreateIndex
CREATE INDEX "properties_zoneCode_idx" ON "properties"("zoneCode");

-- AddForeignKey
ALTER TABLE "property_owners" ADD CONSTRAINT "property_owners_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_photos" ADD CONSTRAINT "property_photos_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "construction_permits" ADD CONSTRAINT "construction_permits_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permit_inspections" ADD CONSTRAINT "permit_inspections_permitId_fkey" FOREIGN KEY ("permitId") REFERENCES "construction_permits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urban_inspections" ADD CONSTRAINT "urban_inspections_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
