-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "BudgetModificationType" AS ENUM ('CREDITO_ADICIONAL', 'TRASPASO', 'RECTIFICACION', 'REDUCCION');

-- CreateEnum
CREATE TYPE "ModificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('GASTO', 'INGRESO', 'TRANSFERENCIA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('COMPROMISO', 'CAUSADO', 'PAGADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CORRIENTE', 'AHORRO', 'ESPECIAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFERENCIA', 'CHEQUE', 'EFECTIVO', 'DOMICILIACION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSED', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IncomeType" AS ENUM ('SITUADO', 'TRIBUTOS', 'TRANSFERENCIA', 'MULTAS', 'TASAS', 'OTROS');

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
    "estimatedIncome" DECIMAL(15,2) NOT NULL,
    "incomeSource" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "allocatedAmount" DECIMAL(15,2) NOT NULL,
    "committedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "accruedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "availableAmount" DECIMAL(15,2) NOT NULL,
    "departmentId" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_modifications" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "type" "BudgetModificationType" NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "justification" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "status" "ModificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_modifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'COMPROMISO',
    "amount" DECIMAL(15,2) NOT NULL,
    "budgetItemId" TEXT,
    "concept" TEXT NOT NULL,
    "description" TEXT,
    "beneficiary" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "invoiceNumber" TEXT,
    "contractNumber" TEXT,
    "purchaseOrder" TEXT,
    "committedAt" TIMESTAMP(3),
    "accruedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VES',
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "bankAccountId" TEXT,
    "beneficiary" TEXT NOT NULL,
    "beneficiaryAccount" TEXT,
    "beneficiaryBank" TEXT,
    "concept" TEXT NOT NULL,
    "notes" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "IncomeType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "concept" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT NOT NULL,
    "incomeDate" TIMESTAMP(3) NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_entries" (
    "id" TEXT NOT NULL,
    "entryNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "transactionId" TEXT,
    "incomeId" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_entry_details" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_entry_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budgets_year_key" ON "budgets"("year");

-- CreateIndex
CREATE INDEX "budgets_year_idx" ON "budgets"("year");

-- CreateIndex
CREATE INDEX "budgets_status_idx" ON "budgets"("status");

-- CreateIndex
CREATE INDEX "budget_items_budgetId_idx" ON "budget_items"("budgetId");

-- CreateIndex
CREATE INDEX "budget_items_code_idx" ON "budget_items"("code");

-- CreateIndex
CREATE INDEX "budget_items_departmentId_idx" ON "budget_items"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_items_budgetId_code_key" ON "budget_items"("budgetId", "code");

-- CreateIndex
CREATE INDEX "budget_modifications_budgetId_idx" ON "budget_modifications"("budgetId");

-- CreateIndex
CREATE INDEX "budget_modifications_status_idx" ON "budget_modifications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_paymentId_key" ON "transactions"("paymentId");

-- CreateIndex
CREATE INDEX "transactions_reference_idx" ON "transactions"("reference");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_budgetItemId_idx" ON "transactions"("budgetItemId");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_accountNumber_key" ON "bank_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "bank_accounts_accountNumber_idx" ON "bank_accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "bank_accounts_isActive_idx" ON "bank_accounts"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_reference_idx" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "payments_bankAccountId_idx" ON "payments"("bankAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "incomes_reference_key" ON "incomes"("reference");

-- CreateIndex
CREATE INDEX "incomes_reference_idx" ON "incomes"("reference");

-- CreateIndex
CREATE INDEX "incomes_type_idx" ON "incomes"("type");

-- CreateIndex
CREATE INDEX "incomes_incomeDate_idx" ON "incomes"("incomeDate");

-- CreateIndex
CREATE INDEX "incomes_bankAccountId_idx" ON "incomes"("bankAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_entries_entryNumber_key" ON "accounting_entries"("entryNumber");

-- CreateIndex
CREATE INDEX "accounting_entries_entryNumber_idx" ON "accounting_entries"("entryNumber");

-- CreateIndex
CREATE INDEX "accounting_entries_date_idx" ON "accounting_entries"("date");

-- CreateIndex
CREATE INDEX "accounting_entries_transactionId_idx" ON "accounting_entries"("transactionId");

-- CreateIndex
CREATE INDEX "accounting_entries_incomeId_idx" ON "accounting_entries"("incomeId");

-- CreateIndex
CREATE INDEX "accounting_entry_details_entryId_idx" ON "accounting_entry_details"("entryId");

-- CreateIndex
CREATE INDEX "accounting_entry_details_accountCode_idx" ON "accounting_entry_details"("accountCode");

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_modifications" ADD CONSTRAINT "budget_modifications_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_budgetItemId_fkey" FOREIGN KEY ("budgetItemId") REFERENCES "budget_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entries" ADD CONSTRAINT "accounting_entries_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "incomes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_entry_details" ADD CONSTRAINT "accounting_entry_details_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "accounting_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
