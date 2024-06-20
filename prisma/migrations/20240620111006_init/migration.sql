-- DropIndex
DROP INDEX `Save_customLink_key` ON `Save`;

-- AlterTable
ALTER TABLE `Page` ADD COLUMN `thumbnailType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Save` ADD COLUMN `thumbnailType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Template` ADD COLUMN `thumbnailType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `color` VARCHAR(191) NOT NULL DEFAULT 'rgba(117, 130, 253, 1)';
