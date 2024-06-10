/*
  Warnings:

  - You are about to drop the column `selectedChoices` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `selectedDate` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `selectedLists` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `selectedTime` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `submittedEmail` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `submittedName` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `submittedPhone` on the `Confirmation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Confirmation` DROP COLUMN `selectedChoices`,
    DROP COLUMN `selectedDate`,
    DROP COLUMN `selectedLists`,
    DROP COLUMN `selectedTime`,
    DROP COLUMN `submittedEmail`,
    DROP COLUMN `submittedName`,
    DROP COLUMN `submittedPhone`,
    ADD COLUMN `choices` VARCHAR(191) NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `endTime` INTEGER NULL,
    ADD COLUMN `isConfirm` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `selects` VARCHAR(191) NULL,
    ADD COLUMN `startDate` DATETIME(3) NULL,
    ADD COLUMN `startTime` INTEGER NULL;
