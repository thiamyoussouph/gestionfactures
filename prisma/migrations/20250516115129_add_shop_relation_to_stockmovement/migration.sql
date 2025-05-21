-- AddForeignKey
ALTER TABLE `StockMovement` ADD CONSTRAINT `StockMovement_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
