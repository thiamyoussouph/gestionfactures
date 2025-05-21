/*
  Warnings:

  - Added the required column `changeGiven` to the `InvoicePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedAmount` to the `InvoicePayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `invoicepayment` ADD COLUMN `changeGiven` DOUBLE NOT NULL,
    ADD COLUMN `receivedAmount` DOUBLE NOT NULL;
