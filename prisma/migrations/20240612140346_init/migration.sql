/*
  Warnings:

  - You are about to drop the column `templateLang` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `lang` on the `Website` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Template` DROP COLUMN `templateLang`;

-- AlterTable
ALTER TABLE `Website` DROP COLUMN `lang`;
