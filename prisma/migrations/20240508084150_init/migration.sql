/*
  Warnings:

  - Added the required column `format` to the `Save` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Save` ADD COLUMN `format` VARCHAR(191) NOT NULL,
    MODIFY `thumbnail` VARCHAR(191) NULL,
    MODIFY `title` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(191) NULL;
