-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('POTHOLE', 'STREET_LIGHT', 'GARBAGE', 'WATER_LEAK', 'FALLEN_TREE', 'TRAFFIC_LIGHT', 'SEWER', 'PEST', 'NOISE', 'DEAD_ANIMAL', 'ROAD_SIGN', 'SIDEWALK', 'PARK_MAINTENANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReportPhotoType" AS ENUM ('BEFORE', 'AFTER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REPORT_RECEIVED', 'REPORT_ASSIGNED', 'REPORT_IN_PROGRESS', 'REPORT_RESOLVED', 'REPORT_CLOSED', 'REPORT_REOPENED', 'REPORT_COMMENT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_VOTING', 'WINNER', 'IN_EXECUTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProjectExecutionStatus" AS ENUM ('PENDING', 'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransparencyCategory" AS ENUM ('BUDGET', 'BUDGET_EXECUTION', 'PAYROLL', 'CONTRACTS', 'ORDINANCES', 'COUNCIL_MINUTES', 'ASSETS', 'ANNUAL_PLAN', 'FINANCIAL_STATEMENTS', 'DECLARATIONS', 'PROJECTS', 'REPORTS', 'OTHER');

-- CreateTable
CREATE TABLE "citizen_reports" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "customType" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "sector" TEXT,
    "reporterName" TEXT,
    "reporterEmail" TEXT,
    "reporterPhone" TEXT,
    "reporterUserId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'RECEIVED',
    "priority" "ReportPriority" NOT NULL DEFAULT 'MEDIUM',
    "departmentId" TEXT,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "inProgressAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "resolutionPhotos" TEXT,
    "rating" INTEGER,
    "ratingComment" TEXT,
    "ratedAt" TIMESTAMP(3),
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citizen_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_photos" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "type" "ReportPhotoType" NOT NULL DEFAULT 'BEFORE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_comments" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_notifications" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participatory_budgets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalBudget" DECIMAL(15,2) NOT NULL,
    "allocatedBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "proposalStartDate" TIMESTAMP(3) NOT NULL,
    "proposalEndDate" TIMESTAMP(3) NOT NULL,
    "evaluationStartDate" TIMESTAMP(3) NOT NULL,
    "evaluationEndDate" TIMESTAMP(3) NOT NULL,
    "votingStartDate" TIMESTAMP(3) NOT NULL,
    "votingEndDate" TIMESTAMP(3) NOT NULL,
    "resultsDate" TIMESTAMP(3),
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "allowMultipleVotes" BOOLEAN NOT NULL DEFAULT false,
    "maxVotesPerCitizen" INTEGER NOT NULL DEFAULT 1,
    "requiresRegistration" BOOLEAN NOT NULL DEFAULT true,
    "rules" TEXT,
    "sectors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participatory_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_proposals" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "proposalNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "beneficiaries" INTEGER,
    "location" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "estimatedCost" DECIMAL(15,2) NOT NULL,
    "technicalCost" DECIMAL(15,2),
    "proposerName" TEXT NOT NULL,
    "proposerEmail" TEXT NOT NULL,
    "proposerPhone" TEXT NOT NULL,
    "organizationName" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'SUBMITTED',
    "isFeasible" BOOLEAN,
    "technicalNotes" TEXT,
    "evaluatedBy" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "votesCount" INTEGER NOT NULL DEFAULT 0,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "rank" INTEGER,
    "projectId" TEXT,
    "executionStatus" "ProjectExecutionStatus",
    "supportDocuments" TEXT,
    "photos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_votes" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "voterIdNumber" TEXT NOT NULL,
    "voterName" TEXT,
    "voterEmail" TEXT,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "proposal_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transparency_documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TransparencyCategory" NOT NULL,
    "subcategory" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "year" INTEGER,
    "month" INTEGER,
    "quarter" INTEGER,
    "summary" TEXT,
    "tags" TEXT,
    "publishedBy" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transparency_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "citizen_reports_ticketNumber_key" ON "citizen_reports"("ticketNumber");

-- CreateIndex
CREATE INDEX "citizen_reports_ticketNumber_idx" ON "citizen_reports"("ticketNumber");

-- CreateIndex
CREATE INDEX "citizen_reports_type_idx" ON "citizen_reports"("type");

-- CreateIndex
CREATE INDEX "citizen_reports_status_idx" ON "citizen_reports"("status");

-- CreateIndex
CREATE INDEX "citizen_reports_priority_idx" ON "citizen_reports"("priority");

-- CreateIndex
CREATE INDEX "citizen_reports_departmentId_idx" ON "citizen_reports"("departmentId");

-- CreateIndex
CREATE INDEX "citizen_reports_assignedTo_idx" ON "citizen_reports"("assignedTo");

-- CreateIndex
CREATE INDEX "citizen_reports_receivedAt_idx" ON "citizen_reports"("receivedAt");

-- CreateIndex
CREATE INDEX "citizen_reports_sector_idx" ON "citizen_reports"("sector");

-- CreateIndex
CREATE INDEX "report_photos_reportId_idx" ON "report_photos"("reportId");

-- CreateIndex
CREATE INDEX "report_comments_reportId_idx" ON "report_comments"("reportId");

-- CreateIndex
CREATE INDEX "report_comments_authorId_idx" ON "report_comments"("authorId");

-- CreateIndex
CREATE INDEX "report_notifications_reportId_idx" ON "report_notifications"("reportId");

-- CreateIndex
CREATE INDEX "report_notifications_status_idx" ON "report_notifications"("status");

-- CreateIndex
CREATE INDEX "participatory_budgets_year_idx" ON "participatory_budgets"("year");

-- CreateIndex
CREATE INDEX "participatory_budgets_status_idx" ON "participatory_budgets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "budget_proposals_proposalNumber_key" ON "budget_proposals"("proposalNumber");

-- CreateIndex
CREATE INDEX "budget_proposals_budgetId_idx" ON "budget_proposals"("budgetId");

-- CreateIndex
CREATE INDEX "budget_proposals_proposalNumber_idx" ON "budget_proposals"("proposalNumber");

-- CreateIndex
CREATE INDEX "budget_proposals_status_idx" ON "budget_proposals"("status");

-- CreateIndex
CREATE INDEX "budget_proposals_sector_idx" ON "budget_proposals"("sector");

-- CreateIndex
CREATE INDEX "budget_proposals_votesCount_idx" ON "budget_proposals"("votesCount");

-- CreateIndex
CREATE INDEX "proposal_votes_proposalId_idx" ON "proposal_votes"("proposalId");

-- CreateIndex
CREATE INDEX "proposal_votes_voterIdNumber_idx" ON "proposal_votes"("voterIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_votes_proposalId_voterIdNumber_key" ON "proposal_votes"("proposalId", "voterIdNumber");

-- CreateIndex
CREATE INDEX "transparency_documents_category_idx" ON "transparency_documents"("category");

-- CreateIndex
CREATE INDEX "transparency_documents_year_month_idx" ON "transparency_documents"("year", "month");

-- CreateIndex
CREATE INDEX "transparency_documents_publishedAt_idx" ON "transparency_documents"("publishedAt");

-- CreateIndex
CREATE INDEX "transparency_documents_isActive_idx" ON "transparency_documents"("isActive");

-- AddForeignKey
ALTER TABLE "report_photos" ADD CONSTRAINT "report_photos_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "citizen_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "citizen_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_notifications" ADD CONSTRAINT "report_notifications_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "citizen_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_proposals" ADD CONSTRAINT "budget_proposals_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "participatory_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_votes" ADD CONSTRAINT "proposal_votes_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "budget_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
