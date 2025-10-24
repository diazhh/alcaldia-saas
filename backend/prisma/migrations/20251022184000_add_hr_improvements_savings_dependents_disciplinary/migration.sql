-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('PERSONAL', 'EMERGENCY', 'VEHICLE', 'HOUSING', 'EDUCATION', 'MEDICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAID', 'DEFAULTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DependentRelationship" AS ENUM ('SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER');

-- CreateEnum
CREATE TYPE "DisciplinaryType" AS ENUM ('VERBAL_WARNING', 'WRITTEN_WARNING', 'SUSPENSION', 'TERMINATION', 'FINE', 'OTHER');

-- CreateEnum
CREATE TYPE "DisciplinarySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DisciplinaryStatus" AS ENUM ('INITIATED', 'NOTIFIED', 'RESPONSE_RECEIVED', 'UNDER_REVIEW', 'DECIDED', 'APPEALED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LayerType" AS ENUM ('ZONIFICACION', 'VIALIDAD', 'SERVICIOS_PUBLICOS', 'AREA_PROTEGIDA', 'RED_AGUA', 'RED_CLOACAS', 'RED_ELECTRICA', 'RED_GAS', 'LIMITES_PARROQUIALES', 'PARCELAS', 'OTROS');

-- CreateTable
CREATE TABLE "savings_banks" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeRate" DECIMAL(5,2) NOT NULL,
    "employerRate" DECIMAL(5,2) NOT NULL,
    "totalBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "availableBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_contributions" (
    "id" TEXT NOT NULL,
    "savingsBankId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "employeeAmount" DECIMAL(15,2) NOT NULL,
    "employerAmount" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "payrollId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_loans" (
    "id" TEXT NOT NULL,
    "savingsBankId" TEXT NOT NULL,
    "loanNumber" TEXT NOT NULL,
    "type" "LoanType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "installmentAmount" DECIMAL(15,2) NOT NULL,
    "paidInstallments" INTEGER NOT NULL DEFAULT 0,
    "balance" DECIMAL(15,2) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedDate" TIMESTAMP(3),
    "approvedBy" TEXT,
    "firstPaymentDate" TIMESTAMP(3),
    "purpose" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_dependents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "idNumber" TEXT,
    "birthDate" DATE NOT NULL,
    "relationship" "DependentRelationship" NOT NULL,
    "gender" "Gender" NOT NULL,
    "receivesHealthInsurance" BOOLEAN NOT NULL DEFAULT false,
    "receivesSchoolSupplies" BOOLEAN NOT NULL DEFAULT false,
    "receivesToys" BOOLEAN NOT NULL DEFAULT false,
    "receivesChildBonus" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_dependents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disciplinary_actions" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "actionNumber" TEXT NOT NULL,
    "type" "DisciplinaryType" NOT NULL,
    "severity" "DisciplinarySeverity" NOT NULL DEFAULT 'LOW',
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "notificationMethod" TEXT,
    "responseDeadline" TIMESTAMP(3),
    "employeeResponse" TEXT,
    "responseDate" TIMESTAMP(3),
    "decision" TEXT,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "suspensionDays" INTEGER,
    "suspensionStart" DATE,
    "suspensionEnd" DATE,
    "withPay" BOOLEAN,
    "status" "DisciplinaryStatus" NOT NULL DEFAULT 'INITIATED',
    "appealed" BOOLEAN NOT NULL DEFAULT false,
    "appealDate" TIMESTAMP(3),
    "appealResolution" TEXT,
    "witnesses" TEXT,
    "attachments" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disciplinary_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_layers" (
    "id" TEXT NOT NULL,
    "layerName" TEXT NOT NULL,
    "layerType" "LayerType" NOT NULL,
    "geometry" JSONB NOT NULL,
    "properties" JSONB,
    "style" JSONB,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zone_layers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "savings_banks_employeeId_key" ON "savings_banks"("employeeId");

-- CreateIndex
CREATE INDEX "savings_banks_employeeId_idx" ON "savings_banks"("employeeId");

-- CreateIndex
CREATE INDEX "savings_banks_isActive_idx" ON "savings_banks"("isActive");

-- CreateIndex
CREATE INDEX "savings_contributions_savingsBankId_idx" ON "savings_contributions"("savingsBankId");

-- CreateIndex
CREATE INDEX "savings_contributions_year_month_idx" ON "savings_contributions"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "savings_contributions_savingsBankId_year_month_key" ON "savings_contributions"("savingsBankId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "savings_loans_loanNumber_key" ON "savings_loans"("loanNumber");

-- CreateIndex
CREATE INDEX "savings_loans_savingsBankId_idx" ON "savings_loans"("savingsBankId");

-- CreateIndex
CREATE INDEX "savings_loans_loanNumber_idx" ON "savings_loans"("loanNumber");

-- CreateIndex
CREATE INDEX "savings_loans_status_idx" ON "savings_loans"("status");

-- CreateIndex
CREATE INDEX "employee_dependents_employeeId_idx" ON "employee_dependents"("employeeId");

-- CreateIndex
CREATE INDEX "employee_dependents_relationship_idx" ON "employee_dependents"("relationship");

-- CreateIndex
CREATE UNIQUE INDEX "disciplinary_actions_actionNumber_key" ON "disciplinary_actions"("actionNumber");

-- CreateIndex
CREATE INDEX "disciplinary_actions_employeeId_idx" ON "disciplinary_actions"("employeeId");

-- CreateIndex
CREATE INDEX "disciplinary_actions_actionNumber_idx" ON "disciplinary_actions"("actionNumber");

-- CreateIndex
CREATE INDEX "disciplinary_actions_type_idx" ON "disciplinary_actions"("type");

-- CreateIndex
CREATE INDEX "disciplinary_actions_status_idx" ON "disciplinary_actions"("status");

-- CreateIndex
CREATE INDEX "disciplinary_actions_createdAt_idx" ON "disciplinary_actions"("createdAt");

-- CreateIndex
CREATE INDEX "zone_layers_layerType_idx" ON "zone_layers"("layerType");

-- CreateIndex
CREATE INDEX "zone_layers_isVisible_idx" ON "zone_layers"("isVisible");

-- AddForeignKey
ALTER TABLE "savings_banks" ADD CONSTRAINT "savings_banks_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_savingsBankId_fkey" FOREIGN KEY ("savingsBankId") REFERENCES "savings_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_loans" ADD CONSTRAINT "savings_loans_savingsBankId_fkey" FOREIGN KEY ("savingsBankId") REFERENCES "savings_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_dependents" ADD CONSTRAINT "employee_dependents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinary_actions" ADD CONSTRAINT "disciplinary_actions_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
