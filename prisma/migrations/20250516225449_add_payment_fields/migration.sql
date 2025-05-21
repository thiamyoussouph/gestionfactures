-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `changeGiven` DOUBLE NULL,
    ADD COLUMN `paidAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `receivedAmount` DOUBLE NULL;
