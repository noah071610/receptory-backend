-- AlterTable
ALTER TABLE `Page` ADD COLUMN `customLink` VARCHAR(191) NULL,
    MODIFY `thumbnail` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Save` ADD COLUMN `customLink` VARCHAR(191) NULL;
