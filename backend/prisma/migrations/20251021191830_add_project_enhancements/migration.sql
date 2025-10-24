-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('OBRA_CIVIL', 'SOCIAL', 'TECNOLOGICO', 'INSTITUCIONAL');

-- CreateEnum
CREATE TYPE "ProjectOrigin" AS ENUM ('PLAN_GOBIERNO', 'PRESUPUESTO_PARTICIPATIVO', 'EMERGENCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "ProjectDocumentType" AS ENUM ('PLANO', 'DISENO', 'ESTUDIO', 'ESPECIFICACION', 'PRESUPUESTO', 'CRONOGRAMA', 'OTRO');

-- CreateEnum
CREATE TYPE "ProjectContractType" AS ENUM ('LICITACION_PUBLICA', 'CONTRATACION_DIRECTA', 'ADJUDICACION_DIRECTA');

-- CreateEnum
CREATE TYPE "ProjectContractStatus" AS ENUM ('BORRADOR', 'EN_PROCESO', 'ADJUDICADO', 'FIRMADO', 'EN_EJECUCION', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ProjectInspectionType" AS ENUM ('TECNICA', 'CALIDAD', 'SEGURIDAD', 'PROVISIONAL', 'FINAL');

-- CreateEnum
CREATE TYPE "ProjectInspectionResult" AS ENUM ('APROBADO', 'CON_OBSERVACIONES', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "ProjectInspectionStatus" AS ENUM ('PROGRAMADA', 'REALIZADA', 'CON_SEGUIMIENTO', 'CERRADA');

-- CreateEnum
CREATE TYPE "ChangeOrderStatus" AS ENUM ('SOLICITADO', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'IMPLEMENTADO');

-- CreateEnum
CREATE TYPE "ChangeOrderRequester" AS ENUM ('CLIENTE', 'CONTRATISTA', 'INSPECTOR', 'OTRO');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "actualProgress" INTEGER DEFAULT 0,
ADD COLUMN     "addedToInventory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contractorEvaluation" INTEGER,
ADD COLUMN     "deliveryToCommunityDate" TIMESTAMP(3),
ADD COLUMN     "finalReceptionDate" TIMESTAMP(3),
ADD COLUMN     "fundingSource" TEXT,
ADD COLUMN     "generalObjective" TEXT,
ADD COLUMN     "justification" TEXT,
ADD COLUMN     "lessonsLearned" TEXT,
ADD COLUMN     "origin" "ProjectOrigin" NOT NULL DEFAULT 'PLAN_GOBIERNO',
ADD COLUMN     "plannedProgress" INTEGER DEFAULT 0,
ADD COLUMN     "projectType" "ProjectType" DEFAULT 'OBRA_CIVIL',
ADD COLUMN     "provisionalReceptionDate" TIMESTAMP(3),
ADD COLUMN     "quantifiableGoals" TEXT,
ADD COLUMN     "specificObjectives" TEXT,
ADD COLUMN     "technicalDescription" TEXT,
ADD COLUMN     "technicalSpecifications" TEXT;

-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProjectDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedBy" TEXT NOT NULL,
    "version" TEXT DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" TEXT NOT NULL,
    "rif" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalRepresentative" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "specialty" TEXT,
    "yearsExperience" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "averageRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_contracts" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "type" "ProjectContractType" NOT NULL,
    "status" "ProjectContractStatus" NOT NULL DEFAULT 'BORRADOR',
    "description" TEXT NOT NULL,
    "contractAmount" DECIMAL(15,2) NOT NULL,
    "bidOpeningDate" TIMESTAMP(3),
    "adjudicationDate" TIMESTAMP(3),
    "signedDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "contractorId" TEXT,
    "contractFileUrl" TEXT,
    "insurancePolicyUrl" TEXT,
    "performanceBondUrl" TEXT,
    "advancePayment" DECIMAL(15,2),
    "advancePaymentPercent" INTEGER,
    "retentionPercent" INTEGER,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_inspections" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "type" "ProjectInspectionType" NOT NULL,
    "status" "ProjectInspectionStatus" NOT NULL DEFAULT 'PROGRAMADA',
    "result" "ProjectInspectionResult",
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "location" TEXT,
    "inspectorId" TEXT NOT NULL,
    "observations" TEXT,
    "nonConformities" TEXT,
    "correctiveActions" TEXT,
    "reportFileUrl" TEXT,
    "photosUrls" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_orders" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "requestedBy" "ChangeOrderRequester" NOT NULL,
    "status" "ChangeOrderStatus" NOT NULL DEFAULT 'SOLICITADO',
    "costImpact" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "timeImpact" INTEGER NOT NULL DEFAULT 0,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "implementationDate" TIMESTAMP(3),
    "requestedByUserId" TEXT,
    "reviewedByUserId" TEXT,
    "approvedByUserId" TEXT,
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "change_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_reports" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "physicalProgress" INTEGER NOT NULL,
    "plannedProgress" INTEGER NOT NULL,
    "variance" INTEGER NOT NULL,
    "executedAmount" DECIMAL(15,2) NOT NULL,
    "accumulatedAmount" DECIMAL(15,2) NOT NULL,
    "activitiesCompleted" TEXT,
    "activitiesInProgress" TEXT,
    "plannedActivities" TEXT,
    "observations" TEXT,
    "issues" TEXT,
    "risks" TEXT,
    "weatherConditions" TEXT,
    "workDays" INTEGER,
    "reportedBy" TEXT NOT NULL,
    "photosUrls" TEXT,
    "attachmentUrls" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_documents_projectId_idx" ON "project_documents"("projectId");

-- CreateIndex
CREATE INDEX "project_documents_type_idx" ON "project_documents"("type");

-- CreateIndex
CREATE UNIQUE INDEX "contractors_rif_key" ON "contractors"("rif");

-- CreateIndex
CREATE INDEX "contractors_rif_idx" ON "contractors"("rif");

-- CreateIndex
CREATE INDEX "contractors_isActive_idx" ON "contractors"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "project_contracts_contractNumber_key" ON "project_contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "project_contracts_projectId_idx" ON "project_contracts"("projectId");

-- CreateIndex
CREATE INDEX "project_contracts_contractorId_idx" ON "project_contracts"("contractorId");

-- CreateIndex
CREATE INDEX "project_contracts_status_idx" ON "project_contracts"("status");

-- CreateIndex
CREATE INDEX "project_contracts_type_idx" ON "project_contracts"("type");

-- CreateIndex
CREATE UNIQUE INDEX "project_inspections_inspectionNumber_key" ON "project_inspections"("inspectionNumber");

-- CreateIndex
CREATE INDEX "project_inspections_projectId_idx" ON "project_inspections"("projectId");

-- CreateIndex
CREATE INDEX "project_inspections_inspectorId_idx" ON "project_inspections"("inspectorId");

-- CreateIndex
CREATE INDEX "project_inspections_status_idx" ON "project_inspections"("status");

-- CreateIndex
CREATE INDEX "project_inspections_scheduledDate_idx" ON "project_inspections"("scheduledDate");

-- CreateIndex
CREATE UNIQUE INDEX "change_orders_orderNumber_key" ON "change_orders"("orderNumber");

-- CreateIndex
CREATE INDEX "change_orders_projectId_idx" ON "change_orders"("projectId");

-- CreateIndex
CREATE INDEX "change_orders_status_idx" ON "change_orders"("status");

-- CreateIndex
CREATE INDEX "change_orders_requestDate_idx" ON "change_orders"("requestDate");

-- CreateIndex
CREATE UNIQUE INDEX "progress_reports_reportNumber_key" ON "progress_reports"("reportNumber");

-- CreateIndex
CREATE INDEX "progress_reports_projectId_idx" ON "progress_reports"("projectId");

-- CreateIndex
CREATE INDEX "progress_reports_reportDate_idx" ON "progress_reports"("reportDate");

-- CreateIndex
CREATE INDEX "progress_reports_periodStart_idx" ON "progress_reports"("periodStart");

-- CreateIndex
CREATE INDEX "projects_projectType_idx" ON "projects"("projectType");

-- CreateIndex
CREATE INDEX "projects_origin_idx" ON "projects"("origin");

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_contracts" ADD CONSTRAINT "project_contracts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_contracts" ADD CONSTRAINT "project_contracts_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_inspections" ADD CONSTRAINT "project_inspections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_inspections" ADD CONSTRAINT "project_inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_orders" ADD CONSTRAINT "change_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_orders" ADD CONSTRAINT "change_orders_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_orders" ADD CONSTRAINT "change_orders_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_orders" ADD CONSTRAINT "change_orders_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_reports" ADD CONSTRAINT "progress_reports_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
