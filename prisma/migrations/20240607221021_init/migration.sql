/*
  Warnings:

  - You are about to drop the column `choices` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `select` on the `Confirmation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Confirmation` DROP COLUMN `choices`,
    DROP COLUMN `select`;
