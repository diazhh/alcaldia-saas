-- AlterTable
ALTER TABLE "budget_modifications" ADD COLUMN     "fromBudgetItemId" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "toBudgetItemId" TEXT;

-- CreateIndex
CREATE INDEX "budget_modifications_fromBudgetItemId_idx" ON "budget_modifications"("fromBudgetItemId");

-- CreateIndex
CREATE INDEX "budget_modifications_toBudgetItemId_idx" ON "budget_modifications"("toBudgetItemId");

-- AddForeignKey
ALTER TABLE "budget_modifications" ADD CONSTRAINT "budget_modifications_fromBudgetItemId_fkey" FOREIGN KEY ("fromBudgetItemId") REFERENCES "budget_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_modifications" ADD CONSTRAINT "budget_modifications_toBudgetItemId_fkey" FOREIGN KEY ("toBudgetItemId") REFERENCES "budget_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
