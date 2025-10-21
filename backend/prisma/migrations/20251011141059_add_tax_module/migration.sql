-- CreateEnum
CREATE TYPE "TaxpayerType" AS ENUM ('NATURAL', 'LEGAL');

-- CreateEnum
CREATE TYPE "TaxpayerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PropertyUse" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED', 'VACANT');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'BUILDING', 'LAND', 'WAREHOUSE', 'OFFICE', 'LOCAL');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'VAN', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('BUSINESS_TAX', 'PROPERTY_TAX', 'VEHICLE_TAX', 'URBAN_CLEANING', 'ADMINISTRATIVE', 'SPACE_USE', 'CEMETERY', 'PUBLIC_EVENTS', 'OTHER');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaxPaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'MOBILE_PAYMENT', 'POS', 'CHECK', 'ONLINE');

-- CreateEnum
CREATE TYPE "SolvencyType" AS ENUM ('GENERAL', 'BUSINESS', 'PROPERTY', 'VEHICLE');

-- CreateEnum
CREATE TYPE "SolvencyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CollectionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "CollectionStage" AS ENUM ('REMINDER', 'NOTICE', 'FORMAL', 'LEGAL');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'PAYMENT_PLAN', 'LEGAL_ACTION', 'CLOSED');

-- CreateEnum
CREATE TYPE "CollectionActionType" AS ENUM ('PHONE_CALL', 'EMAIL', 'SMS', 'LETTER', 'VISIT', 'LEGAL_NOTICE', 'PAYMENT_PLAN', 'OTHER');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('ROUTINE', 'COMPLAINT', 'RENEWAL', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "taxpayers" (
    "id" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "taxpayerType" "TaxpayerType" NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "businessName" TEXT,
    "tradeName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "parish" TEXT,
    "sector" TEXT,
    "status" "TaxpayerStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxpayers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "tradeName" TEXT,
    "activityCode" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "parish" TEXT NOT NULL,
    "sector" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "annualIncome" DECIMAL(15,2),
    "taxRate" DECIMAL(5,4) NOT NULL,
    "openingDate" DATE NOT NULL,
    "licenseDate" DATE NOT NULL,
    "expiryDate" DATE NOT NULL,
    "status" "BusinessStatus" NOT NULL DEFAULT 'ACTIVE',
    "employees" INTEGER,
    "area" DECIMAL(10,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "cadastralCode" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "parish" TEXT NOT NULL,
    "sector" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "landArea" DECIMAL(10,2) NOT NULL,
    "buildingArea" DECIMAL(10,2),
    "floors" INTEGER,
    "rooms" INTEGER,
    "propertyUse" "PropertyUse" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "landValue" DECIMAL(15,2) NOT NULL,
    "buildingValue" DECIMAL(15,2) NOT NULL,
    "totalValue" DECIMAL(15,2) NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL,
    "constructionYear" INTEGER,
    "isExempt" BOOLEAN NOT NULL DEFAULT false,
    "exemptionReason" TEXT,
    "exemptionExpiry" DATE,
    "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "serialNumber" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "vehicleType" "VehicleType" NOT NULL,
    "assessedValue" DECIMAL(15,2) NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_bills" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "taxType" "TaxType" NOT NULL,
    "businessId" TEXT,
    "propertyId" TEXT,
    "vehicleId" TEXT,
    "fiscalYear" INTEGER NOT NULL,
    "fiscalPeriod" TEXT,
    "baseAmount" DECIMAL(15,2) NOT NULL,
    "taxRate" DECIMAL(5,4) NOT NULL,
    "taxAmount" DECIMAL(15,2) NOT NULL,
    "surcharges" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discounts" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "balanceAmount" DECIMAL(15,2) NOT NULL,
    "issueDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'PENDING',
    "paymentCode" TEXT,
    "concept" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payments" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "taxBillId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentMethod" "TaxPaymentMethod" NOT NULL,
    "paymentDate" DATE NOT NULL,
    "bankName" TEXT,
    "referenceNumber" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "registeredBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solvencies" (
    "id" TEXT NOT NULL,
    "solvencyNumber" TEXT NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "solvencyType" "SolvencyType" NOT NULL,
    "issueDate" DATE NOT NULL,
    "expiryDate" DATE NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" "SolvencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solvencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_collections" (
    "id" TEXT NOT NULL,
    "taxpayerId" TEXT NOT NULL,
    "totalDebt" DECIMAL(15,2) NOT NULL,
    "oldestDebtDate" DATE NOT NULL,
    "debtAge" INTEGER NOT NULL,
    "priority" "CollectionPriority" NOT NULL,
    "stage" "CollectionStage" NOT NULL,
    "notificationsSent" INTEGER NOT NULL DEFAULT 0,
    "lastNotificationDate" DATE,
    "assignedTo" TEXT,
    "hasPaymentPlan" BOOLEAN NOT NULL DEFAULT false,
    "paymentPlanDate" DATE,
    "installments" INTEGER,
    "status" "CollectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debt_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_actions" (
    "id" TEXT NOT NULL,
    "debtCollectionId" TEXT NOT NULL,
    "actionType" "CollectionActionType" NOT NULL,
    "actionDate" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "result" TEXT,
    "nextActionDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "inspectionDate" DATE NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "inspectorName" TEXT NOT NULL,
    "findings" TEXT,
    "violations" TEXT,
    "recommendations" TEXT,
    "hasFine" BOOLEAN NOT NULL DEFAULT false,
    "fineAmount" DECIMAL(15,2),
    "status" "InspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taxpayers_taxId_key" ON "taxpayers"("taxId");

-- CreateIndex
CREATE INDEX "taxpayers_taxId_idx" ON "taxpayers"("taxId");

-- CreateIndex
CREATE INDEX "taxpayers_taxpayerType_idx" ON "taxpayers"("taxpayerType");

-- CreateIndex
CREATE INDEX "taxpayers_status_idx" ON "taxpayers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_licenseNumber_key" ON "businesses"("licenseNumber");

-- CreateIndex
CREATE INDEX "businesses_taxpayerId_idx" ON "businesses"("taxpayerId");

-- CreateIndex
CREATE INDEX "businesses_licenseNumber_idx" ON "businesses"("licenseNumber");

-- CreateIndex
CREATE INDEX "businesses_status_idx" ON "businesses"("status");

-- CreateIndex
CREATE INDEX "businesses_activityCode_idx" ON "businesses"("activityCode");

-- CreateIndex
CREATE UNIQUE INDEX "properties_cadastralCode_key" ON "properties"("cadastralCode");

-- CreateIndex
CREATE INDEX "properties_taxpayerId_idx" ON "properties"("taxpayerId");

-- CreateIndex
CREATE INDEX "properties_cadastralCode_idx" ON "properties"("cadastralCode");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_propertyUse_idx" ON "properties"("propertyUse");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_taxpayerId_idx" ON "vehicles"("taxpayerId");

-- CreateIndex
CREATE INDEX "vehicles_plate_idx" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tax_bills_billNumber_key" ON "tax_bills"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tax_bills_paymentCode_key" ON "tax_bills"("paymentCode");

-- CreateIndex
CREATE INDEX "tax_bills_billNumber_idx" ON "tax_bills"("billNumber");

-- CreateIndex
CREATE INDEX "tax_bills_taxpayerId_idx" ON "tax_bills"("taxpayerId");

-- CreateIndex
CREATE INDEX "tax_bills_taxType_idx" ON "tax_bills"("taxType");

-- CreateIndex
CREATE INDEX "tax_bills_status_idx" ON "tax_bills"("status");

-- CreateIndex
CREATE INDEX "tax_bills_fiscalYear_idx" ON "tax_bills"("fiscalYear");

-- CreateIndex
CREATE INDEX "tax_bills_dueDate_idx" ON "tax_bills"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "tax_payments_receiptNumber_key" ON "tax_payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "tax_payments_receiptNumber_idx" ON "tax_payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "tax_payments_taxpayerId_idx" ON "tax_payments"("taxpayerId");

-- CreateIndex
CREATE INDEX "tax_payments_taxBillId_idx" ON "tax_payments"("taxBillId");

-- CreateIndex
CREATE INDEX "tax_payments_paymentDate_idx" ON "tax_payments"("paymentDate");

-- CreateIndex
CREATE INDEX "tax_payments_status_idx" ON "tax_payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "solvencies_solvencyNumber_key" ON "solvencies"("solvencyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "solvencies_qrCode_key" ON "solvencies"("qrCode");

-- CreateIndex
CREATE INDEX "solvencies_solvencyNumber_idx" ON "solvencies"("solvencyNumber");

-- CreateIndex
CREATE INDEX "solvencies_taxpayerId_idx" ON "solvencies"("taxpayerId");

-- CreateIndex
CREATE INDEX "solvencies_qrCode_idx" ON "solvencies"("qrCode");

-- CreateIndex
CREATE INDEX "solvencies_status_idx" ON "solvencies"("status");

-- CreateIndex
CREATE INDEX "solvencies_expiryDate_idx" ON "solvencies"("expiryDate");

-- CreateIndex
CREATE INDEX "debt_collections_taxpayerId_idx" ON "debt_collections"("taxpayerId");

-- CreateIndex
CREATE INDEX "debt_collections_status_idx" ON "debt_collections"("status");

-- CreateIndex
CREATE INDEX "debt_collections_priority_idx" ON "debt_collections"("priority");

-- CreateIndex
CREATE INDEX "debt_collections_stage_idx" ON "debt_collections"("stage");

-- CreateIndex
CREATE INDEX "collection_actions_debtCollectionId_idx" ON "collection_actions"("debtCollectionId");

-- CreateIndex
CREATE INDEX "collection_actions_actionDate_idx" ON "collection_actions"("actionDate");

-- CreateIndex
CREATE UNIQUE INDEX "inspections_inspectionNumber_key" ON "inspections"("inspectionNumber");

-- CreateIndex
CREATE INDEX "inspections_businessId_idx" ON "inspections"("businessId");

-- CreateIndex
CREATE INDEX "inspections_inspectionDate_idx" ON "inspections"("inspectionDate");

-- CreateIndex
CREATE INDEX "inspections_status_idx" ON "inspections"("status");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_taxpayerId_fkey" FOREIGN KEY ("taxpayerId") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_taxpayerId_fkey" FOREIGN KEY ("taxpayerId") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_taxpayerId_fkey" FOREIGN KEY ("taxpayerId") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_bills" ADD CONSTRAINT "tax_bills_taxpayerId_fkey" FOREIGN KEY ("taxpayerId") REFERENCES "taxpayers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_bills" ADD CONSTRAINT "tax_bills_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_bills" ADD CONSTRAINT "tax_bills_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_bills" ADD CONSTRAINT "tax_bills_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_taxpayerId_fkey" FOREIGN KEY ("taxpayerId") REFERENCES "taxpayers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_taxBillId_fkey" FOREIGN KEY ("taxBillId") REFERENCES "tax_bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solvencies" ADD CONSTRAINT "solvencies_taxpayerId_fkey" FOREIGN KEY ("taxpayerId") REFERENCES "taxpayers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt_collections" ADD CONSTRAINT "debt_collections_taxpayerId_fkey" FOREIGN KEY ("taxpayerId") REFERENCES "taxpayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_debtCollectionId_fkey" FOREIGN KEY ("debtCollectionId") REFERENCES "debt_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
