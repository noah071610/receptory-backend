-- AlterTable
ALTER TABLE `Confirmation` ADD COLUMN `selectedChoices` VARCHAR(191) NULL,
    ADD COLUMN `selectedDate` VARCHAR(191) NULL,
    ADD COLUMN `selectedLists` VARCHAR(191) NULL,
    ADD COLUMN `selectedTime` VARCHAR(191) NULL,
    ADD COLUMN `submittedEmail` VARCHAR(191) NULL,
    ADD COLUMN `submittedName` VARCHAR(191) NULL;
