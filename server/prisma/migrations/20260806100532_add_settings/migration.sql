/*
  Warnings:

  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `settings`;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyPhone` VARCHAR(191) NOT NULL,
    `companyEmail` VARCHAR(191) NULL,
    `companyAddress` VARCHAR(191) NULL,
    `defaultInterestPercentage` DECIMAL(5, 2) NOT NULL,
    `defaultPenaltyPercentage` DECIMAL(5, 2) NOT NULL,
    `receiptPrefix` VARCHAR(191) NOT NULL DEFAULT 'RCP',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
