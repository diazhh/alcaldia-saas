-- CreateEnum
CREATE TYPE "ProjectionScenario" AS ENUM ('OPTIMISTIC', 'REALISTIC', 'PESSIMISTIC');

-- CreateTable
CREATE TABLE "cash_flow_projections" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekNumber" INTEGER,
    "projectedIncome" DECIMAL(15,2) NOT NULL,
    "projectedExpense" DECIMAL(15,2) NOT NULL,
    "projectedBalance" DECIMAL(15,2) NOT NULL,
    "actualIncome" DECIMAL(15,2),
    "actualExpense" DECIMAL(15,2),
    "actualBalance" DECIMAL(15,2),
    "incomeVariance" DECIMAL(15,2),
    "expenseVariance" DECIMAL(15,2),
    "balanceVariance" DECIMAL(15,2),
    "scenario" "ProjectionScenario" NOT NULL DEFAULT 'REALISTIC',
    "notes" TEXT,
    "assumptions" TEXT,
    "hasDeficit" BOOLEAN NOT NULL DEFAULT false,
    "deficitAmount" DECIMAL(15,2),
    "requiresAction" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_flow_projections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cash_flow_projections_year_month_idx" ON "cash_flow_projections"("year", "month");

-- CreateIndex
CREATE INDEX "cash_flow_projections_scenario_idx" ON "cash_flow_projections"("scenario");

-- CreateIndex
CREATE INDEX "cash_flow_projections_hasDeficit_idx" ON "cash_flow_projections"("hasDeficit");

-- CreateIndex
CREATE UNIQUE INDEX "cash_flow_projections_year_month_scenario_key" ON "cash_flow_projections"("year", "month", "scenario");
