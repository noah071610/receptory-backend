/*
  Warnings:

  - You are about to drop the column `name` on the `Confirmation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Confirmation` DROP COLUMN `name`,
    ADD COLUMN `nameInput` VARCHAR(191) NULL;
