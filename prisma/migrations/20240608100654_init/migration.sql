/*
  Warnings:

  - A unique constraint covering the columns `[customLink]` on the table `Page` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customLink]` on the table `Save` will be added. If there are existing duplicate values, this will fail.
  - Made the column `customLink` on table `Page` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customLink` on table `Save` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Page` MODIFY `customLink` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Save` MODIFY `customLink` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Page_customLink_key` ON `Page`(`customLink`);

-- CreateIndex
CREATE INDEX `Page_customLink_idx` ON `Page`(`customLink`);

-- CreateIndex
CREATE UNIQUE INDEX `Save_customLink_key` ON `Save`(`customLink`);

-- CreateIndex
CREATE INDEX `Save_customLink_idx` ON `Save`(`customLink`);
