-- CreateEnum
CREATE TYPE "ReconciliationStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReconciliationItemType" AS ENUM ('BANK_ONLY', 'BOOK_ONLY', 'IN_TRANSIT', 'ADJUSTMENT', 'ERROR', 'MATCHED');

-- CreateTable
CREATE TABLE "bank_reconciliations" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "reconciliationDate" TIMESTAMP(3) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "statementBalance" DECIMAL(15,2) NOT NULL,
    "bookBalance" DECIMAL(15,2) NOT NULL,
    "adjustedBalance" DECIMAL(15,2) NOT NULL,
    "totalDifference" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "itemsInTransit" INTEGER NOT NULL DEFAULT 0,
    "bankOnlyItems" INTEGER NOT NULL DEFAULT 0,
    "bookOnlyItems" INTEGER NOT NULL DEFAULT 0,
    "status" "ReconciliationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "reconciledBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_items" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "transactionId" TEXT,
    "paymentId" TEXT,
    "incomeId" TEXT,
    "type" "ReconciliationItemType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "reconciledAt" TIMESTAMP(3),
    "notes" TEXT,
    "requiresAdjustment" BOOLEAN NOT NULL DEFAULT false,
    "adjustmentReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconciliation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_reconciliations_bankAccountId_idx" ON "bank_reconciliations"("bankAccountId");

-- CreateIndex
CREATE INDEX "bank_reconciliations_reconciliationDate_idx" ON "bank_reconciliations"("reconciliationDate");

-- CreateIndex
CREATE INDEX "bank_reconciliations_status_idx" ON "bank_reconciliations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bank_reconciliations_bankAccountId_reconciliationDate_key" ON "bank_reconciliations"("bankAccountId", "reconciliationDate");

-- CreateIndex
CREATE INDEX "reconciliation_items_reconciliationId_idx" ON "reconciliation_items"("reconciliationId");

-- CreateIndex
CREATE INDEX "reconciliation_items_type_idx" ON "reconciliation_items"("type");

-- CreateIndex
CREATE INDEX "reconciliation_items_isReconciled_idx" ON "reconciliation_items"("isReconciled");

-- AddForeignKey
ALTER TABLE "bank_reconciliations" ADD CONSTRAINT "bank_reconciliations_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "bank_reconciliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
