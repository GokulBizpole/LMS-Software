-- CreateTable
CREATE TABLE `partners` (
    `id` VARCHAR(191) NOT NULL,
    `partnerCode` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `email` VARCHAR(150) NULL,
    `address` TEXT NULL,
    `investmentAmount` DECIMAL(15, 2) NOT NULL,
    `currentBalance` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `partners_partnerCode_key`(`partnerCode`),
    UNIQUE INDEX `partners_phone_key`(`phone`),
    UNIQUE INDEX `partners_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` VARCHAR(191) NOT NULL,
    `customerCode` VARCHAR(20) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `alternatePhone` VARCHAR(15) NULL,
    `aadhaarNumber` VARCHAR(20) NULL,
    `panNumber` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `pincode` VARCHAR(10) NULL,
    `guarantorName` VARCHAR(100) NULL,
    `guarantorPhone` VARCHAR(15) NULL,
    `status` ENUM('ACTIVE', 'CLOSED', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_customerCode_key`(`customerCode`),
    UNIQUE INDEX `customers_phone_key`(`phone`),
    UNIQUE INDEX `customers_aadhaarNumber_key`(`aadhaarNumber`),
    UNIQUE INDEX `customers_panNumber_key`(`panNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loans` (
    `id` VARCHAR(191) NOT NULL,
    `loanNumber` VARCHAR(30) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `principalAmount` DECIMAL(15, 2) NOT NULL,
    `interestPercentage` DECIMAL(5, 2) NOT NULL,
    `interestAmount` DECIMAL(15, 2) NOT NULL,
    `totalPayable` DECIMAL(15, 2) NOT NULL,
    `balanceAmount` DECIMAL(15, 2) NOT NULL,
    `paymentFrequency` ENUM('WEEKLY', 'MONTHLY') NOT NULL,
    `duration` INTEGER NOT NULL,
    `installmentAmount` DECIMAL(15, 2) NOT NULL,
    `paidInstallments` INTEGER NOT NULL DEFAULT 0,
    `totalInstallments` INTEGER NOT NULL,
    `penaltyPercentage` DECIMAL(5, 2) NULL,
    `penaltyAmount` DECIMAL(15, 2) NULL,
    `status` ENUM('ACTIVE', 'CLOSED', 'OVERDUE') NOT NULL DEFAULT 'ACTIVE',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `loans_loanNumber_key`(`loanNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `receiptNumber` VARCHAR(30) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `installmentNumber` INTEGER NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `penalty` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `totalReceived` DECIMAL(15, 2) NOT NULL,
    `paymentMethod` ENUM('CASH', 'UPI', 'BANK_TRANSFER') NOT NULL,
    `paymentStatus` ENUM('PAID', 'PENDING', 'LATE') NOT NULL,
    `paidAt` DATETIME(3) NOT NULL,
    `remarks` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payments_receiptNumber_key`(`receiptNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `category` ENUM('OFFICE', 'SALARY', 'PETROL', 'ELECTRICITY', 'RENT', 'OTHER') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `description` TEXT NULL,
    `expenseDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_documents` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(100) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `filePath` TEXT NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(150) NOT NULL,
    `tableName` VARCHAR(100) NOT NULL,
    `recordId` VARCHAR(100) NOT NULL,
    `ipAddress` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_schedule` (
    `id` VARCHAR(191) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `installmentNo` INTEGER NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `penalty` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `paidDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `partners`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_documents` ADD CONSTRAINT `customer_documents_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_schedule` ADD CONSTRAINT `loan_schedule_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
