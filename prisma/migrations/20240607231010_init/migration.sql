-- DropIndex
DROP INDEX `Confirmation_text_idx` ON `Confirmation`;

-- CreateIndex
CREATE FULLTEXT INDEX `Confirmation_text_idx` ON `Confirmation`(`text`);
