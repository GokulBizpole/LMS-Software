-- DropIndex
DROP INDEX "public"."customers_aadhaarNumber_key";

-- DropIndex
DROP INDEX "public"."customers_customerCode_key";

-- DropIndex
DROP INDEX "public"."customers_panNumber_key";

-- DropIndex
DROP INDEX "public"."customers_phone_key";

-- CreateIndex
CREATE INDEX "customers_customerCode_idx" ON "public"."customers"("customerCode");

-- CreateIndex
CREATE INDEX "customers_aadhaarNumber_idx" ON "public"."customers"("aadhaarNumber");

-- CreateIndex
CREATE INDEX "customers_panNumber_idx" ON "public"."customers"("panNumber");

-- Partial unique indexes: uniqueness for these identity fields is enforced
-- only among ACTIVE customers, so a BLOCKED/CLOSED customer's customerCode,
-- phone, aadhaarNumber or panNumber becomes available for reuse by a new
-- customer, while still preventing two ACTIVE customers from colliding.
CREATE UNIQUE INDEX "customers_customerCode_active_key" ON "public"."customers"("customerCode") WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX "customers_phone_active_key" ON "public"."customers"("phone") WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX "customers_aadhaarNumber_active_key" ON "public"."customers"("aadhaarNumber") WHERE "status" = 'ACTIVE';

CREATE UNIQUE INDEX "customers_panNumber_active_key" ON "public"."customers"("panNumber") WHERE "status" = 'ACTIVE';
