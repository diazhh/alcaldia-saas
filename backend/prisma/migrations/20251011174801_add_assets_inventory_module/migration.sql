-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('INMUEBLE', 'MUEBLE', 'MAQUINARIA', 'VEHICULO', 'INTANGIBLE');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('OPERATIVO', 'EN_REPARACION', 'FUERA_SERVICIO', 'EN_PRESTAMO', 'DADO_BAJA', 'PERDIDO');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('EXCELENTE', 'BUENO', 'REGULAR', 'MALO', 'OBSOLETO', 'INSERVIBLE');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ASIGNACION_INICIAL', 'TRASPASO', 'PRESTAMO', 'DEVOLUCION', 'REPARACION', 'RETORNO_REPARACION', 'BAJA', 'DONACION');

-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('PENDING', 'APPROVED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssetMaintenanceType" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'CALIBRACION', 'ACTUALIZACION');

-- CreateEnum
CREATE TYPE "AssetMaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EntrySource" AS ENUM ('COMPRA', 'DONACION', 'TRANSFERENCIA', 'DEVOLUCION', 'AJUSTE');

-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('PENDING', 'APPROVED_HEAD', 'APPROVED_BUDGET', 'APPROVED_PURCHASING', 'APPROVED', 'IN_QUOTATION', 'ORDERED', 'RECEIVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "acquisitionValue" DECIMAL(15,2) NOT NULL,
    "currentValue" DECIMAL(15,2) NOT NULL,
    "depreciationMethod" TEXT NOT NULL DEFAULT 'LINEA_RECTA',
    "usefulLife" INTEGER,
    "monthlyDepreciation" DECIMAL(15,2),
    "accumulatedDepreciation" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "acquisitionDate" TIMESTAMP(3) NOT NULL,
    "supplier" TEXT,
    "invoiceNumber" TEXT,
    "purchaseOrder" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'OPERATIVO',
    "condition" "AssetCondition" NOT NULL DEFAULT 'BUENO',
    "departmentId" TEXT,
    "location" TEXT,
    "custodianId" TEXT,
    "custodianName" TEXT,
    "assignedAt" TIMESTAMP(3),
    "warranty" TEXT,
    "warrantyExpiry" TIMESTAMP(3),
    "insurancePolicy" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "photos" TEXT[],
    "notes" TEXT,
    "address" TEXT,
    "area" DECIMAL(10,2),
    "propertyDocument" TEXT,
    "cadastralCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_movements" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "fromDepartmentId" TEXT,
    "fromDepartment" TEXT,
    "fromCustodianId" TEXT,
    "fromCustodian" TEXT,
    "fromLocation" TEXT,
    "toDepartmentId" TEXT,
    "toDepartment" TEXT,
    "toCustodianId" TEXT,
    "toCustodian" TEXT,
    "toLocation" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "expectedReturn" TIMESTAMP(3),
    "actualReturn" TIMESTAMP(3),
    "status" "MovementStatus" NOT NULL DEFAULT 'PENDING',
    "actNumber" TEXT,
    "actDocument" TEXT,
    "requestedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "receivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_maintenances" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "AssetMaintenanceType" NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(15,2) NOT NULL,
    "provider" TEXT,
    "invoiceNumber" TEXT,
    "scheduledDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "status" "AssetMaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "performedBy" TEXT,
    "authorizedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "unit" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "unitCost" DECIMAL(15,2) NOT NULL,
    "totalValue" DECIMAL(15,2) NOT NULL,
    "warehouseLocation" TEXT,
    "preferredSupplier" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_entries" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(15,2) NOT NULL,
    "totalCost" DECIMAL(15,2) NOT NULL,
    "source" "EntrySource" NOT NULL,
    "supplier" TEXT,
    "invoiceNumber" TEXT,
    "purchaseOrder" TEXT,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "receivedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_exits" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(15,2) NOT NULL,
    "totalCost" DECIMAL(15,2) NOT NULL,
    "departmentId" TEXT,
    "department" TEXT,
    "requestedBy" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "exitDate" TIMESTAMP(3) NOT NULL,
    "approvedBy" TEXT,
    "deliveredBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_exits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "departmentId" TEXT,
    "department" TEXT,
    "requestedBy" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "justification" TEXT NOT NULL,
    "estimatedAmount" DECIMAL(15,2) NOT NULL,
    "budgetItemId" TEXT,
    "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiredDate" TIMESTAMP(3),
    "approvedByHead" TEXT,
    "approvedByBudget" TEXT,
    "approvedByPurchasing" TEXT,
    "approvedByDirector" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "quotationReceived" BOOLEAN NOT NULL DEFAULT false,
    "quotationAmount" DECIMAL(15,2),
    "quotationSupplier" TEXT,
    "purchaseOrderNumber" TEXT,
    "purchaseOrderDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "receivedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_request_items" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "estimatedUnitPrice" DECIMAL(15,2) NOT NULL,
    "estimatedTotal" DECIMAL(15,2) NOT NULL,
    "specifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_code_key" ON "assets"("code");

-- CreateIndex
CREATE INDEX "assets_code_idx" ON "assets"("code");

-- CreateIndex
CREATE INDEX "assets_type_idx" ON "assets"("type");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE INDEX "assets_departmentId_idx" ON "assets"("departmentId");

-- CreateIndex
CREATE INDEX "assets_custodianId_idx" ON "assets"("custodianId");

-- CreateIndex
CREATE INDEX "asset_movements_assetId_idx" ON "asset_movements"("assetId");

-- CreateIndex
CREATE INDEX "asset_movements_type_idx" ON "asset_movements"("type");

-- CreateIndex
CREATE INDEX "asset_movements_status_idx" ON "asset_movements"("status");

-- CreateIndex
CREATE INDEX "asset_movements_movementDate_idx" ON "asset_movements"("movementDate");

-- CreateIndex
CREATE INDEX "asset_maintenances_assetId_idx" ON "asset_maintenances"("assetId");

-- CreateIndex
CREATE INDEX "asset_maintenances_type_idx" ON "asset_maintenances"("type");

-- CreateIndex
CREATE INDEX "asset_maintenances_status_idx" ON "asset_maintenances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_code_key" ON "inventory_items"("code");

-- CreateIndex
CREATE INDEX "inventory_items_code_idx" ON "inventory_items"("code");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_items_isActive_idx" ON "inventory_items"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_entries_reference_key" ON "inventory_entries"("reference");

-- CreateIndex
CREATE INDEX "inventory_entries_itemId_idx" ON "inventory_entries"("itemId");

-- CreateIndex
CREATE INDEX "inventory_entries_entryDate_idx" ON "inventory_entries"("entryDate");

-- CreateIndex
CREATE INDEX "inventory_entries_reference_idx" ON "inventory_entries"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_exits_reference_key" ON "inventory_exits"("reference");

-- CreateIndex
CREATE INDEX "inventory_exits_itemId_idx" ON "inventory_exits"("itemId");

-- CreateIndex
CREATE INDEX "inventory_exits_exitDate_idx" ON "inventory_exits"("exitDate");

-- CreateIndex
CREATE INDEX "inventory_exits_reference_idx" ON "inventory_exits"("reference");

-- CreateIndex
CREATE INDEX "inventory_exits_departmentId_idx" ON "inventory_exits"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requests_requestNumber_key" ON "purchase_requests"("requestNumber");

-- CreateIndex
CREATE INDEX "purchase_requests_requestNumber_idx" ON "purchase_requests"("requestNumber");

-- CreateIndex
CREATE INDEX "purchase_requests_status_idx" ON "purchase_requests"("status");

-- CreateIndex
CREATE INDEX "purchase_requests_departmentId_idx" ON "purchase_requests"("departmentId");

-- CreateIndex
CREATE INDEX "purchase_requests_requestDate_idx" ON "purchase_requests"("requestDate");

-- CreateIndex
CREATE INDEX "purchase_request_items_requestId_idx" ON "purchase_request_items"("requestId");

-- AddForeignKey
ALTER TABLE "asset_movements" ADD CONSTRAINT "asset_movements_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_entries" ADD CONSTRAINT "inventory_entries_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_exits" ADD CONSTRAINT "inventory_exits_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_request_items" ADD CONSTRAINT "purchase_request_items_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
