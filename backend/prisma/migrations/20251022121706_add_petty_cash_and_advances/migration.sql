-- CreateEnum
CREATE TYPE "PettyCashStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PettyCashTransactionType" AS ENUM ('EXPENSE', 'REIMBURSEMENT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ReimbursementStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdvanceStatus" AS ENUM ('PENDING', 'APPROVED', 'DISBURSED', 'IN_PAYMENT', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "petty_cashes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "custodianId" TEXT NOT NULL,
    "departmentId" TEXT,
    "maxAmount" DECIMAL(15,2) NOT NULL,
    "currentBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "PettyCashStatus" NOT NULL DEFAULT 'ACTIVE',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petty_cashes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petty_cash_transactions" (
    "id" TEXT NOT NULL,
    "pettyCashId" TEXT NOT NULL,
    "type" "PettyCashTransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "concept" TEXT NOT NULL,
    "description" TEXT,
    "receipt" TEXT,
    "attachmentUrl" TEXT,
    "beneficiary" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petty_cash_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petty_cash_reimbursements" (
    "id" TEXT NOT NULL,
    "pettyCashId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "status" "ReimbursementStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "paidBy" TEXT,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petty_cash_reimbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_advances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "remainingAmount" DECIMAL(15,2) NOT NULL,
    "concept" TEXT NOT NULL,
    "description" TEXT,
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedDate" TIMESTAMP(3),
    "disbursedDate" TIMESTAMP(3),
    "status" "AdvanceStatus" NOT NULL DEFAULT 'PENDING',
    "installments" INTEGER NOT NULL DEFAULT 1,
    "installmentsPaid" INTEGER NOT NULL DEFAULT 0,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_advances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "petty_cashes_code_key" ON "petty_cashes"("code");

-- CreateIndex
CREATE INDEX "petty_cashes_custodianId_idx" ON "petty_cashes"("custodianId");

-- CreateIndex
CREATE INDEX "petty_cashes_departmentId_idx" ON "petty_cashes"("departmentId");

-- CreateIndex
CREATE INDEX "petty_cashes_status_idx" ON "petty_cashes"("status");

-- CreateIndex
CREATE INDEX "petty_cash_transactions_pettyCashId_idx" ON "petty_cash_transactions"("pettyCashId");

-- CreateIndex
CREATE INDEX "petty_cash_transactions_type_idx" ON "petty_cash_transactions"("type");

-- CreateIndex
CREATE INDEX "petty_cash_transactions_date_idx" ON "petty_cash_transactions"("date");

-- CreateIndex
CREATE INDEX "petty_cash_reimbursements_pettyCashId_idx" ON "petty_cash_reimbursements"("pettyCashId");

-- CreateIndex
CREATE INDEX "petty_cash_reimbursements_status_idx" ON "petty_cash_reimbursements"("status");

-- CreateIndex
CREATE INDEX "petty_cash_reimbursements_requestDate_idx" ON "petty_cash_reimbursements"("requestDate");

-- CreateIndex
CREATE INDEX "employee_advances_employeeId_idx" ON "employee_advances"("employeeId");

-- CreateIndex
CREATE INDEX "employee_advances_status_idx" ON "employee_advances"("status");

-- CreateIndex
CREATE INDEX "employee_advances_requestDate_idx" ON "employee_advances"("requestDate");

-- AddForeignKey
ALTER TABLE "petty_cash_transactions" ADD CONSTRAINT "petty_cash_transactions_pettyCashId_fkey" FOREIGN KEY ("pettyCashId") REFERENCES "petty_cashes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cash_reimbursements" ADD CONSTRAINT "petty_cash_reimbursements_pettyCashId_fkey" FOREIGN KEY ("pettyCashId") REFERENCES "petty_cashes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
