-- CreateEnum
CREATE TYPE "DocumentTypeEnum" AS ENUM ('CORRESPONDENCIA', 'OFICIO', 'MEMORANDO', 'CIRCULAR', 'PROVIDENCIA', 'RESOLUCION', 'CONTRATO', 'ACTA', 'ORDENANZA', 'CERTIFICADO', 'CONSTANCIA', 'INFORME', 'OTRO');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PENDING_SIGNATURE', 'SIGNED', 'APPROVED', 'REJECTED', 'ARCHIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "CorrespondenceType" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "CorrespondencePriority" AS ENUM ('NORMAL', 'URGENTE', 'MUY_URGENTE');

-- CreateEnum
CREATE TYPE "CorrespondenceStatus" AS ENUM ('RECEIVED', 'IN_DISTRIBUTION', 'DELIVERED', 'IN_PROCESS', 'RESPONDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('PERSONAL', 'CORREO_CERTIFICADO', 'EMAIL', 'COURIER', 'INTERNO');

-- CreateEnum
CREATE TYPE "InternalMemoType" AS ENUM ('MEMORANDO', 'OFICIO', 'CIRCULAR', 'PROVIDENCIA');

-- CreateEnum
CREATE TYPE "InternalMemoStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'DISTRIBUTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrdinanceStatus" AS ENUM ('VIGENTE', 'REFORMADA', 'DEROGADA', 'SUSPENDIDA');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('ORDINARIA', 'EXTRAORDINARIA');

-- CreateEnum
CREATE TYPE "ActStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PERMISO_CONSTRUCCION', 'LICITACION', 'RECLAMO', 'EXPROPIACION', 'SOLICITUD_SERVICIO', 'INVESTIGACION', 'RECURSO_JERARQUICO', 'OTRO');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('EN_TRAMITE', 'PARALIZADO', 'RESUELTO', 'ARCHIVADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "SignatureType" AS ENUM ('SIMPLE', 'DIGITAL');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'SIGNED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "WorkflowAction" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CHANGES', 'DELEGATE', 'COMMENT');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'REJECTED');

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentTypeEnum" NOT NULL,
    "category" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "keywords" TEXT,
    "tags" TEXT,
    "documentDate" TIMESTAMP(3) NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departmentId" TEXT,
    "folderId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'INTERNAL',
    "ocrText" TEXT,
    "searchVector" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correspondences" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "CorrespondenceType" NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderIdNumber" TEXT,
    "senderPhone" TEXT,
    "senderEmail" TEXT,
    "senderAddress" TEXT,
    "recipientName" TEXT,
    "recipientAddress" TEXT,
    "subject" TEXT NOT NULL,
    "summary" TEXT,
    "documentType" TEXT NOT NULL,
    "destinationDept" TEXT,
    "folios" INTEGER NOT NULL DEFAULT 1,
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "attachmentsList" TEXT,
    "priority" "CorrespondencePriority" NOT NULL DEFAULT 'NORMAL',
    "receivedDate" TIMESTAMP(3),
    "sentDate" TIMESTAMP(3),
    "responseDeadline" TIMESTAMP(3),
    "deliveryMethod" "DeliveryMethod",
    "trackingNumber" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "receivedBy" TEXT,
    "qrCode" TEXT,
    "scannedFileUrl" TEXT,
    "envelopePhotoUrl" TEXT,
    "responseToRef" TEXT,
    "responseDocId" TEXT,
    "status" "CorrespondenceStatus" NOT NULL DEFAULT 'RECEIVED',
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "correspondences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_memos" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "InternalMemoType" NOT NULL,
    "fromDepartment" TEXT NOT NULL,
    "toDepartment" TEXT,
    "toDepartments" TEXT,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "documentUrl" TEXT,
    "workflowId" TEXT,
    "status" "InternalMemoStatus" NOT NULL DEFAULT 'DRAFT',
    "issuedDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_memos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordinances" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "summary" TEXT,
    "fullText" TEXT NOT NULL,
    "publicationDate" DATE NOT NULL,
    "gazetteName" TEXT,
    "gazetteNumber" TEXT,
    "gazetteDate" DATE,
    "status" "OrdinanceStatus" NOT NULL DEFAULT 'VIGENTE',
    "reformsId" TEXT,
    "reformedById" TEXT,
    "derogatedById" TEXT,
    "relatedOrdinances" TEXT,
    "regulations" TEXT,
    "pdfUrl" TEXT,
    "councilPeriod" TEXT,
    "approvedBy" TEXT,
    "keywords" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordinances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "council_acts" (
    "id" TEXT NOT NULL,
    "actNumber" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "location" TEXT NOT NULL,
    "presentCouncilors" TEXT NOT NULL,
    "absentCouncilors" TEXT,
    "totalPresent" INTEGER NOT NULL,
    "totalAbsent" INTEGER NOT NULL DEFAULT 0,
    "agenda" TEXT NOT NULL,
    "pointsDiscussed" TEXT NOT NULL,
    "motions" TEXT,
    "votations" TEXT,
    "agreements" TEXT,
    "resolutions" TEXT,
    "interventions" TEXT,
    "signedActUrl" TEXT,
    "status" "ActStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "registeredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "council_acts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_files" (
    "id" TEXT NOT NULL,
    "fileNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "subject" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantId" TEXT,
    "applicantContact" TEXT,
    "departmentId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "status" "FileStatus" NOT NULL DEFAULT 'EN_TRAMITE',
    "documentIndex" TEXT,
    "notes" TEXT,
    "movements" TEXT,
    "nextStep" TEXT,
    "nextStepDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "changeLog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "electronic_signatures" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "signerName" TEXT NOT NULL,
    "signerPosition" TEXT,
    "signatureType" "SignatureType" NOT NULL,
    "signatureData" TEXT,
    "certificateId" TEXT,
    "documentHash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'SHA-256',
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestampToken" TEXT,
    "signOrder" INTEGER,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "electronic_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "documentType" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertDays" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "workflowDefId" TEXT NOT NULL,
    "documentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "initiatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "action" "WorkflowAction",
    "comments" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "delegatedTo" TEXT,
    "delegatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT,
    "templateUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documents_documentNumber_key" ON "documents"("documentNumber");

-- CreateIndex
CREATE INDEX "documents_documentNumber_idx" ON "documents"("documentNumber");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_departmentId_idx" ON "documents"("departmentId");

-- CreateIndex
CREATE INDEX "documents_folderId_idx" ON "documents"("folderId");

-- CreateIndex
CREATE INDEX "documents_documentDate_idx" ON "documents"("documentDate");

-- CreateIndex
CREATE INDEX "documents_isArchived_idx" ON "documents"("isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "correspondences_reference_key" ON "correspondences"("reference");

-- CreateIndex
CREATE INDEX "correspondences_reference_idx" ON "correspondences"("reference");

-- CreateIndex
CREATE INDEX "correspondences_type_idx" ON "correspondences"("type");

-- CreateIndex
CREATE INDEX "correspondences_status_idx" ON "correspondences"("status");

-- CreateIndex
CREATE INDEX "correspondences_destinationDept_idx" ON "correspondences"("destinationDept");

-- CreateIndex
CREATE INDEX "correspondences_receivedDate_idx" ON "correspondences"("receivedDate");

-- CreateIndex
CREATE INDEX "correspondences_sentDate_idx" ON "correspondences"("sentDate");

-- CreateIndex
CREATE UNIQUE INDEX "internal_memos_reference_key" ON "internal_memos"("reference");

-- CreateIndex
CREATE INDEX "internal_memos_reference_idx" ON "internal_memos"("reference");

-- CreateIndex
CREATE INDEX "internal_memos_type_idx" ON "internal_memos"("type");

-- CreateIndex
CREATE INDEX "internal_memos_status_idx" ON "internal_memos"("status");

-- CreateIndex
CREATE INDEX "internal_memos_fromDepartment_idx" ON "internal_memos"("fromDepartment");

-- CreateIndex
CREATE INDEX "internal_memos_issuedDate_idx" ON "internal_memos"("issuedDate");

-- CreateIndex
CREATE UNIQUE INDEX "ordinances_number_key" ON "ordinances"("number");

-- CreateIndex
CREATE INDEX "ordinances_number_idx" ON "ordinances"("number");

-- CreateIndex
CREATE INDEX "ordinances_year_idx" ON "ordinances"("year");

-- CreateIndex
CREATE INDEX "ordinances_status_idx" ON "ordinances"("status");

-- CreateIndex
CREATE INDEX "ordinances_subject_idx" ON "ordinances"("subject");

-- CreateIndex
CREATE INDEX "ordinances_publicationDate_idx" ON "ordinances"("publicationDate");

-- CreateIndex
CREATE UNIQUE INDEX "council_acts_actNumber_key" ON "council_acts"("actNumber");

-- CreateIndex
CREATE INDEX "council_acts_actNumber_idx" ON "council_acts"("actNumber");

-- CreateIndex
CREATE INDEX "council_acts_sessionType_idx" ON "council_acts"("sessionType");

-- CreateIndex
CREATE INDEX "council_acts_sessionDate_idx" ON "council_acts"("sessionDate");

-- CreateIndex
CREATE INDEX "council_acts_status_idx" ON "council_acts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "digital_files_fileNumber_key" ON "digital_files"("fileNumber");

-- CreateIndex
CREATE INDEX "digital_files_fileNumber_idx" ON "digital_files"("fileNumber");

-- CreateIndex
CREATE INDEX "digital_files_type_idx" ON "digital_files"("type");

-- CreateIndex
CREATE INDEX "digital_files_status_idx" ON "digital_files"("status");

-- CreateIndex
CREATE INDEX "digital_files_departmentId_idx" ON "digital_files"("departmentId");

-- CreateIndex
CREATE INDEX "digital_files_openedAt_idx" ON "digital_files"("openedAt");

-- CreateIndex
CREATE INDEX "document_versions_documentId_idx" ON "document_versions"("documentId");

-- CreateIndex
CREATE INDEX "document_versions_createdAt_idx" ON "document_versions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_documentId_versionNumber_key" ON "document_versions"("documentId", "versionNumber");

-- CreateIndex
CREATE INDEX "electronic_signatures_documentId_idx" ON "electronic_signatures"("documentId");

-- CreateIndex
CREATE INDEX "electronic_signatures_signerId_idx" ON "electronic_signatures"("signerId");

-- CreateIndex
CREATE INDEX "electronic_signatures_status_idx" ON "electronic_signatures"("status");

-- CreateIndex
CREATE INDEX "electronic_signatures_signedAt_idx" ON "electronic_signatures"("signedAt");

-- CreateIndex
CREATE INDEX "workflow_definitions_documentType_idx" ON "workflow_definitions"("documentType");

-- CreateIndex
CREATE INDEX "workflow_definitions_isActive_idx" ON "workflow_definitions"("isActive");

-- CreateIndex
CREATE INDEX "workflow_instances_workflowDefId_idx" ON "workflow_instances"("workflowDefId");

-- CreateIndex
CREATE INDEX "workflow_instances_documentId_idx" ON "workflow_instances"("documentId");

-- CreateIndex
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");

-- CreateIndex
CREATE INDEX "workflow_instances_startedAt_idx" ON "workflow_instances"("startedAt");

-- CreateIndex
CREATE INDEX "workflow_steps_instanceId_idx" ON "workflow_steps"("instanceId");

-- CreateIndex
CREATE INDEX "workflow_steps_assignedTo_idx" ON "workflow_steps"("assignedTo");

-- CreateIndex
CREATE INDEX "workflow_steps_status_idx" ON "workflow_steps"("status");

-- CreateIndex
CREATE INDEX "workflow_steps_dueDate_idx" ON "workflow_steps"("dueDate");

-- CreateIndex
CREATE INDEX "document_templates_type_idx" ON "document_templates"("type");

-- CreateIndex
CREATE INDEX "document_templates_isActive_idx" ON "document_templates"("isActive");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "digital_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electronic_signatures" ADD CONSTRAINT "electronic_signatures_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_workflowDefId_fkey" FOREIGN KEY ("workflowDefId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
