-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'COMMON_LAW');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PERMANENT', 'TEMPORARY', 'INTERN', 'SEASONAL');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('EMPLOYEE', 'WORKER', 'HIGH_LEVEL', 'CONTRACT');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE', 'RETIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'TECHNICAL', 'UNIVERSITY', 'POSTGRADUATE', 'MASTER', 'DOCTORATE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'RIF', 'RESUME', 'DIPLOMA', 'CERTIFICATE', 'CONTRACT', 'MEDICAL_EXAM', 'BACKGROUND_CHECK', 'REFERENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "PayrollPeriod" AS ENUM ('BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'CLOSED');

-- CreateEnum
CREATE TYPE "ConceptType" AS ENUM ('ASSIGNMENT', 'DEDUCTION', 'EMPLOYER');

-- CreateEnum
CREATE TYPE "CalculationType" AS ENUM ('FIXED', 'PERCENTAGE', 'FORMULA');

-- CreateEnum
CREATE TYPE "PayrollDetailStatus" AS ENUM ('PENDING', 'CALCULATED', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('REGULAR', 'OVERTIME', 'NIGHT_SHIFT', 'WEEKEND', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'VACATION', 'LEAVE', 'SICK_LEAVE', 'JUSTIFIED');

-- CreateEnum
CREATE TYPE "VacationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('MEDICAL', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'STUDY', 'BEREAVEMENT', 'MARRIAGE', 'UNPAID', 'OTHER');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EvaluationPeriod" AS ENUM ('SEMESTER', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PerformanceRating" AS ENUM ('DEFICIENT', 'REGULAR', 'GOOD', 'VERY_GOOD', 'EXCELLENT');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('DRAFT', 'COMPLETED', 'ACKNOWLEDGED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('INTERNAL', 'EXTERNAL', 'ONLINE', 'WORKSHOP', 'SEMINAR', 'CONFERENCE');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('ENROLLED', 'ATTENDING', 'COMPLETED', 'DROPPED', 'ABSENT');

-- CreateEnum
CREATE TYPE "SeveranceType" AS ENUM ('MONTHLY', 'ADVANCE', 'SETTLEMENT');

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "baseSalary" DECIMAL(15,2) NOT NULL,
    "salaryGrade" TEXT,
    "departmentId" TEXT,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "rif" TEXT,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "birthPlace" TEXT,
    "gender" "Gender" NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL,
    "bloodType" TEXT,
    "phone" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "email" TEXT,
    "personalEmail" TEXT,
    "address" TEXT,
    "photo" TEXT,
    "positionId" TEXT NOT NULL,
    "departmentId" TEXT,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "contractType" "ContractType" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentSalary" DECIMAL(15,2) NOT NULL,
    "bankAccount" TEXT,
    "bankName" TEXT,
    "supervisorId" TEXT,
    "educationLevel" "EducationLevel",
    "degree" TEXT,
    "institution" TEXT,
    "graduationYear" INTEGER,
    "userId" TEXT,
    "terminationDate" TIMESTAMP(3),
    "terminationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "period" "PayrollPeriod" NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "totalGross" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalNet" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalEmployer" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_concepts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ConceptType" NOT NULL,
    "calculationType" "CalculationType" NOT NULL,
    "value" DECIMAL(15,2),
    "formula" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTaxable" BOOLEAN NOT NULL DEFAULT true,
    "affectsSSI" BOOLEAN NOT NULL DEFAULT true,
    "isEmployer" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_details" (
    "id" TEXT NOT NULL,
    "payrollId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "employeeNumber" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "workedDays" INTEGER NOT NULL DEFAULT 0,
    "absentDays" INTEGER NOT NULL DEFAULT 0,
    "vacationDays" INTEGER NOT NULL DEFAULT 0,
    "grossSalary" DECIMAL(15,2) NOT NULL,
    "totalDeductions" DECIMAL(15,2) NOT NULL,
    "netSalary" DECIMAL(15,2) NOT NULL,
    "employerCost" DECIMAL(15,2) NOT NULL,
    "status" "PayrollDetailStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_detail_concepts" (
    "id" TEXT NOT NULL,
    "payrollDetailId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "conceptCode" TEXT NOT NULL,
    "conceptName" TEXT NOT NULL,
    "conceptType" "ConceptType" NOT NULL,
    "baseAmount" DECIMAL(15,2),
    "rate" DECIMAL(10,4),
    "amount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_detail_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "type" "AttendanceType" NOT NULL DEFAULT 'REGULAR',
    "workedHours" DECIMAL(5,2),
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "isJustified" BOOLEAN NOT NULL DEFAULT false,
    "justification" TEXT,
    "justifiedBy" TEXT,
    "justifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_requests" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "requestedDays" INTEGER NOT NULL,
    "status" "VacationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewComments" TEXT,
    "reason" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "days" INTEGER NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "documentUrl" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_evaluations" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "period" "EvaluationPeriod" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "evaluatorName" TEXT NOT NULL,
    "objectivesScore" DECIMAL(3,2) NOT NULL,
    "competenciesScore" DECIMAL(3,2) NOT NULL,
    "attitudeScore" DECIMAL(3,2) NOT NULL,
    "disciplineScore" DECIMAL(3,2) NOT NULL,
    "finalScore" DECIMAL(3,2) NOT NULL,
    "rating" "PerformanceRating" NOT NULL,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "goals" TEXT,
    "employeeComments" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "completedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "institution" TEXT NOT NULL,
    "instructor" TEXT,
    "type" "TrainingType" NOT NULL,
    "category" TEXT,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "hours" INTEGER NOT NULL,
    "location" TEXT,
    "maxParticipants" INTEGER,
    "status" "TrainingStatus" NOT NULL DEFAULT 'PLANNED',
    "cost" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_trainings" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'ENROLLED',
    "grade" DECIMAL(5,2),
    "passed" BOOLEAN,
    "certificateUrl" TEXT,
    "certificateDate" DATE,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "severance_payments" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "baseSalary" DECIMAL(15,2) NOT NULL,
    "daysAccrued" DECIMAL(10,4) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "interest" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "type" "SeveranceType" NOT NULL DEFAULT 'MONTHLY',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "severance_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "positions_code_key" ON "positions"("code");

-- CreateIndex
CREATE INDEX "positions_code_idx" ON "positions"("code");

-- CreateIndex
CREATE INDEX "positions_departmentId_idx" ON "positions"("departmentId");

-- CreateIndex
CREATE INDEX "positions_isActive_idx" ON "positions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employeeNumber_key" ON "employees"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_idNumber_key" ON "employees"("idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId");

-- CreateIndex
CREATE INDEX "employees_employeeNumber_idx" ON "employees"("employeeNumber");

-- CreateIndex
CREATE INDEX "employees_idNumber_idx" ON "employees"("idNumber");

-- CreateIndex
CREATE INDEX "employees_positionId_idx" ON "employees"("positionId");

-- CreateIndex
CREATE INDEX "employees_departmentId_idx" ON "employees"("departmentId");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_hireDate_idx" ON "employees"("hireDate");

-- CreateIndex
CREATE INDEX "employee_documents_employeeId_idx" ON "employee_documents"("employeeId");

-- CreateIndex
CREATE INDEX "employee_documents_type_idx" ON "employee_documents"("type");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_reference_key" ON "payrolls"("reference");

-- CreateIndex
CREATE INDEX "payrolls_reference_idx" ON "payrolls"("reference");

-- CreateIndex
CREATE INDEX "payrolls_status_idx" ON "payrolls"("status");

-- CreateIndex
CREATE INDEX "payrolls_year_month_idx" ON "payrolls"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_year_month_period_periodNumber_key" ON "payrolls"("year", "month", "period", "periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_concepts_code_key" ON "payroll_concepts"("code");

-- CreateIndex
CREATE INDEX "payroll_concepts_code_idx" ON "payroll_concepts"("code");

-- CreateIndex
CREATE INDEX "payroll_concepts_type_idx" ON "payroll_concepts"("type");

-- CreateIndex
CREATE INDEX "payroll_concepts_isActive_idx" ON "payroll_concepts"("isActive");

-- CreateIndex
CREATE INDEX "payroll_details_payrollId_idx" ON "payroll_details"("payrollId");

-- CreateIndex
CREATE INDEX "payroll_details_employeeId_idx" ON "payroll_details"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_details_payrollId_employeeId_key" ON "payroll_details"("payrollId", "employeeId");

-- CreateIndex
CREATE INDEX "payroll_detail_concepts_payrollDetailId_idx" ON "payroll_detail_concepts"("payrollDetailId");

-- CreateIndex
CREATE INDEX "payroll_detail_concepts_conceptId_idx" ON "payroll_detail_concepts"("conceptId");

-- CreateIndex
CREATE INDEX "attendances_employeeId_idx" ON "attendances"("employeeId");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE INDEX "attendances_status_idx" ON "attendances"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_employeeId_date_key" ON "attendances"("employeeId", "date");

-- CreateIndex
CREATE INDEX "vacation_requests_employeeId_idx" ON "vacation_requests"("employeeId");

-- CreateIndex
CREATE INDEX "vacation_requests_status_idx" ON "vacation_requests"("status");

-- CreateIndex
CREATE INDEX "vacation_requests_startDate_idx" ON "vacation_requests"("startDate");

-- CreateIndex
CREATE INDEX "leaves_employeeId_idx" ON "leaves"("employeeId");

-- CreateIndex
CREATE INDEX "leaves_type_idx" ON "leaves"("type");

-- CreateIndex
CREATE INDEX "leaves_status_idx" ON "leaves"("status");

-- CreateIndex
CREATE INDEX "leaves_startDate_idx" ON "leaves"("startDate");

-- CreateIndex
CREATE INDEX "performance_evaluations_employeeId_idx" ON "performance_evaluations"("employeeId");

-- CreateIndex
CREATE INDEX "performance_evaluations_year_idx" ON "performance_evaluations"("year");

-- CreateIndex
CREATE INDEX "performance_evaluations_status_idx" ON "performance_evaluations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "performance_evaluations_employeeId_year_period_key" ON "performance_evaluations"("employeeId", "year", "period");

-- CreateIndex
CREATE INDEX "trainings_startDate_idx" ON "trainings"("startDate");

-- CreateIndex
CREATE INDEX "trainings_status_idx" ON "trainings"("status");

-- CreateIndex
CREATE INDEX "employee_trainings_employeeId_idx" ON "employee_trainings"("employeeId");

-- CreateIndex
CREATE INDEX "employee_trainings_trainingId_idx" ON "employee_trainings"("trainingId");

-- CreateIndex
CREATE UNIQUE INDEX "employee_trainings_employeeId_trainingId_key" ON "employee_trainings"("employeeId", "trainingId");

-- CreateIndex
CREATE INDEX "severance_payments_employeeId_idx" ON "severance_payments"("employeeId");

-- CreateIndex
CREATE INDEX "severance_payments_year_month_idx" ON "severance_payments"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "severance_payments_employeeId_year_month_type_key" ON "severance_payments"("employeeId", "year", "month", "type");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "payrolls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_details" ADD CONSTRAINT "payroll_details_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_detail_concepts" ADD CONSTRAINT "payroll_detail_concepts_payrollDetailId_fkey" FOREIGN KEY ("payrollDetailId") REFERENCES "payroll_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_detail_concepts" ADD CONSTRAINT "payroll_detail_concepts_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "payroll_concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_requests" ADD CONSTRAINT "vacation_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_evaluations" ADD CONSTRAINT "performance_evaluations_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_trainings" ADD CONSTRAINT "employee_trainings_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "severance_payments" ADD CONSTRAINT "severance_payments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
