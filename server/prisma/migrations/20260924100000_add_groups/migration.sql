-- CreateEnum
CREATE TYPE "public"."GroupCreatorType" AS ENUM ('ADMIN', 'PARTNER');

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" TEXT NOT NULL,
    "groupCode" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "groupHeadId" TEXT NOT NULL,
    "partnerId" TEXT,
    "createdByType" "public"."GroupCreatorType" NOT NULL,
    "createdById" VARCHAR(100) NOT NULL,
    "createdByName" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."code_sequences" (
    "key" VARCHAR(50) NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "code_sequences_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_groupCode_key" ON "public"."groups"("groupCode");

-- CreateIndex
CREATE INDEX "groups_partnerId_idx" ON "public"."groups"("partnerId");

-- CreateIndex
CREATE INDEX "groups_groupHeadId_idx" ON "public"."groups"("groupHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_customerId_key" ON "public"."group_members"("customerId");

-- CreateIndex
CREATE INDEX "group_members_groupId_idx" ON "public"."group_members"("groupId");

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_groupHeadId_fkey" FOREIGN KEY ("groupHeadId") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."groups" ADD CONSTRAINT "groups_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_members" ADD CONSTRAINT "group_members_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

