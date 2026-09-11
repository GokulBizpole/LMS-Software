-- AlterTable
ALTER TABLE "public"."partners" ADD COLUMN     "customerCodePrefix" VARCHAR(10),
ADD COLUMN     "nextCustomerSeq" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "partners_customerCodePrefix_key" ON "public"."partners"("customerCodePrefix");
