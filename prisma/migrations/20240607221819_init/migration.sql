/*
  Warnings:

  - Made the column `title` on table `Save` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Save` MODIFY `title` VARCHAR(191) NOT NULL;
