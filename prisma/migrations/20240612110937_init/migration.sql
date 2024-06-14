/*
  Warnings:

  - You are about to drop the column `category` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `customLink` on the `Template` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Template_customLink_idx` ON `Template`;

-- DropIndex
DROP INDEX `Template_customLink_key` ON `Template`;

-- AlterTable
ALTER TABLE `Template` DROP COLUMN `category`,
    DROP COLUMN `customLink`;
