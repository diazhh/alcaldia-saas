-- DropIndex
DROP INDEX "permissions_module_action_key";

-- CreateIndex
CREATE INDEX "permissions_name_idx" ON "permissions"("name");
