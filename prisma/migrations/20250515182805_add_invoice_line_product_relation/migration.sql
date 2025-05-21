/*
  Warnings:

  - Added the required column `productId` to the `InvoiceLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoiceline` ADD COLUMN `productId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `InvoiceLine` ADD CONSTRAINT `InvoiceLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
