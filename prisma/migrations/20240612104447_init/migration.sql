/*
  Warnings:

  - You are about to drop the column `isTemplate` on the `Page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Page` DROP COLUMN `isTemplate`;

-- CreateTable
CREATE TABLE `Template` (
    `pageId` VARCHAR(191) NOT NULL,
    `customLink` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `lang` VARCHAR(191) NOT NULL,
    `templateLang` VARCHAR(191) NOT NULL,
    `isSecret` INTEGER NOT NULL DEFAULT 0,
    `category` VARCHAR(191) NOT NULL,
    `content` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Template_pageId_key`(`pageId`),
    UNIQUE INDEX `Template_customLink_key`(`customLink`),
    INDEX `Template_customLink_idx`(`customLink`),
    PRIMARY KEY (`pageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
