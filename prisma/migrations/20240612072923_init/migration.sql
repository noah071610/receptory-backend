-- AlterTable
ALTER TABLE `Page` ADD COLUMN `isTemplate` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Website` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `text` JSON NOT NULL,
    `content` JSON NOT NULL,
    `lang` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
