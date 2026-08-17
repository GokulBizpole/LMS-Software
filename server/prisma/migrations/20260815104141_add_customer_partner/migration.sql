-- AlterTable
ALTER TABLE `customers` ADD COLUMN `partnerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `customers_partnerId_idx` ON `customers`(`partnerId`);

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `customers_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
