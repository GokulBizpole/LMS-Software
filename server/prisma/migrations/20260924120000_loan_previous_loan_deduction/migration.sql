-- AlterTable
ALTER TABLE "public"."loans" ADD COLUMN     "previousLoanDeduction" DECIMAL(15,2),
ADD COLUMN     "previousLoanId" TEXT,
ADD COLUMN     "requestedAmount" DECIMAL(15,2);

