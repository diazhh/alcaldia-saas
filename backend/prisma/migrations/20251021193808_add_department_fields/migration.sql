-- AlterTable
ALTER TABLE "department_permissions" ADD COLUMN     "canDelegate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "budget" DECIMAL(15,2),
ADD COLUMN     "extension" TEXT,
ADD COLUMN     "level" INTEGER,
ADD COLUMN     "shortName" TEXT;

-- AlterTable
ALTER TABLE "user_departments" ADD COLUMN     "assignedBy" TEXT;

-- CreateIndex
CREATE INDEX "departments_level_idx" ON "departments"("level");
