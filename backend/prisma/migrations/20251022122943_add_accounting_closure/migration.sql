-- CreateEnum
CREATE TYPE "ClosureType" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "ClosureStatus" AS ENUM ('CLOSED', 'REOPENED');

-- CreateTable
CREATE TABLE "accounting_closures" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "type" "ClosureType" NOT NULL,
    "status" "ClosureStatus" NOT NULL DEFAULT 'CLOSED',
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedBy" TEXT NOT NULL,
    "reopenedAt" TIMESTAMP(3),
    "reopenedBy" TEXT,
    "reopenReason" TEXT,
    "totalIncome" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalExpense" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "result" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_closures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounting_closures_year_month_idx" ON "accounting_closures"("year", "month");

-- CreateIndex
CREATE INDEX "accounting_closures_status_idx" ON "accounting_closures"("status");

-- CreateIndex
CREATE INDEX "accounting_closures_type_idx" ON "accounting_closures"("type");
