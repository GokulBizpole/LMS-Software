-- CreateEnum
CREATE TYPE "public"."EodStatus" AS ENUM ('PENDING', 'REJECTED', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."eod_reports" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "totalCollection" DECIMAL(15,2) NOT NULL,
    "totalExpenses" DECIMAL(15,2) NOT NULL,
    "netRemittance" DECIMAL(15,2) NOT NULL,
    "status" "public"."EodStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eod_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."eod_expenses" (
    "id" TEXT NOT NULL,
    "eodReportId" TEXT NOT NULL,
    "category" "public"."ExpenseCategory" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eod_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eod_reports_partnerId_idx" ON "public"."eod_reports"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "eod_reports_partnerId_reportDate_key" ON "public"."eod_reports"("partnerId", "reportDate");

-- CreateIndex
CREATE INDEX "eod_expenses_eodReportId_idx" ON "public"."eod_expenses"("eodReportId");

-- AddForeignKey
ALTER TABLE "public"."eod_reports" ADD CONSTRAINT "eod_reports_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eod_expenses" ADD CONSTRAINT "eod_expenses_eodReportId_fkey" FOREIGN KEY ("eodReportId") REFERENCES "public"."eod_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
