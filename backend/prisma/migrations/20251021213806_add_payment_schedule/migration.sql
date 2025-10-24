-- CreateEnum
CREATE TYPE "PaymentPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "payment_schedules" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "priority" "PaymentPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "processedAt" TIMESTAMP(3),
    "notes" TEXT,
    "rejectionReason" TEXT,
    "batchId" TEXT,
    "batchNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_schedules_transactionId_idx" ON "payment_schedules"("transactionId");

-- CreateIndex
CREATE INDEX "payment_schedules_scheduledDate_idx" ON "payment_schedules"("scheduledDate");

-- CreateIndex
CREATE INDEX "payment_schedules_status_idx" ON "payment_schedules"("status");

-- CreateIndex
CREATE INDEX "payment_schedules_priority_idx" ON "payment_schedules"("priority");

-- CreateIndex
CREATE INDEX "payment_schedules_batchId_idx" ON "payment_schedules"("batchId");

-- AddForeignKey
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
