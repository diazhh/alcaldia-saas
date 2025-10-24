-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "category" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "feature" TEXT;

-- CreateTable
CREATE TABLE "custom_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_custom_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_custom_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_roles_name_key" ON "custom_roles"("name");

-- CreateIndex
CREATE INDEX "custom_roles_isSystem_idx" ON "custom_roles"("isSystem");

-- CreateIndex
CREATE INDEX "custom_roles_isActive_idx" ON "custom_roles"("isActive");

-- CreateIndex
CREATE INDEX "custom_role_permissions_roleId_idx" ON "custom_role_permissions"("roleId");

-- CreateIndex
CREATE INDEX "custom_role_permissions_permissionId_idx" ON "custom_role_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_role_permissions_roleId_permissionId_key" ON "custom_role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "user_custom_roles_userId_idx" ON "user_custom_roles"("userId");

-- CreateIndex
CREATE INDEX "user_custom_roles_roleId_idx" ON "user_custom_roles"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_custom_roles_userId_roleId_key" ON "user_custom_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "permissions_feature_idx" ON "permissions"("feature");

-- CreateIndex
CREATE INDEX "permissions_category_idx" ON "permissions"("category");

-- AddForeignKey
ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_role_permissions" ADD CONSTRAINT "custom_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_custom_roles" ADD CONSTRAINT "user_custom_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_custom_roles" ADD CONSTRAINT "user_custom_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "custom_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_custom_roles" ADD CONSTRAINT "user_custom_roles_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
