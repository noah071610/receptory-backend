/*
  Warnings:

  - The primary key for the `Page` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `postId` on the `Page` table. All the data in the column will be lost.
  - The primary key for the `Save` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `postId` on the `Save` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pageId]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pageId]` on the table `Save` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `format` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageId` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pageId` to the `Save` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Page` DROP FOREIGN KEY `Page_postId_fkey`;

-- DropForeignKey
ALTER TABLE `Page` DROP FOREIGN KEY `Page_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Save` DROP FOREIGN KEY `Save_userId_fkey`;

-- DropIndex
DROP INDEX `Save_postId_key` ON `Save`;

-- AlterTable
ALTER TABLE `Page` DROP PRIMARY KEY,
    DROP COLUMN `postId`,
    ADD COLUMN `format` VARCHAR(191) NOT NULL,
    ADD COLUMN `pageId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`pageId`);

-- AlterTable
ALTER TABLE `Save` DROP PRIMARY KEY,
    DROP COLUMN `postId`,
    ADD COLUMN `pageId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`pageId`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `plan` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `userId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Page_pageId_key` ON `Page`(`pageId`);

-- CreateIndex
CREATE UNIQUE INDEX `Save_pageId_key` ON `Save`(`pageId`);

-- AddForeignKey
ALTER TABLE `Save` ADD CONSTRAINT `Save_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Save`(`pageId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
