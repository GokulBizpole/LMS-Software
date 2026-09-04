/*
  Warnings:

  - Added the required column `updatedAt` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `audit_logs` DROP FOREIGN KEY `audit_logs_adminId_fkey`;

-- DropIndex
DROP INDEX `audit_logs_adminId_fkey` ON `audit_logs`;

-- AlterTable
ALTER TABLE `audit_logs` MODIFY `adminId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `loans` ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedBy` VARCHAR(191) NULL,
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'ACTIVE', 'CLOSED', 'OVERDUE', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `endDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `scheduleId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `paymentStatus` ENUM('PAID', 'PENDING', 'LATE') NOT NULL DEFAULT 'PENDING',
    MODIFY `paidAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `customers_phone_idx` ON `customers`(`phone`);

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `loan_schedule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `loans` RENAME INDEX `loans_customerId_fkey` TO `loans_customerId_idx`;

-- RenameIndex
ALTER TABLE `loans` RENAME INDEX `loans_partnerId_fkey` TO `loans_partnerId_idx`;

-- RenameIndex
ALTER TABLE `payments` RENAME INDEX `payments_loanId_fkey` TO `payments_loanId_idx`;
