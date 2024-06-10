/*
  Warnings:

  - You are about to drop the column `selects` on the `Confirmation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Confirmation` DROP COLUMN `selects`,
    ADD COLUMN `select` VARCHAR(191) NULL;
