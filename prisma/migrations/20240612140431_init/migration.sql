/*
  Warnings:

  - Added the required column `templateLang` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lang` to the `Website` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Template` ADD COLUMN `templateLang` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Website` ADD COLUMN `lang` VARCHAR(191) NOT NULL;
