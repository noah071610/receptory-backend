/*
  Warnings:

  - You are about to drop the column `choices` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `nameInput` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `select` on the `Confirmation` table. All the data in the column will be lost.
  - Added the required column `text` to the `Confirmation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Confirmation` DROP COLUMN `choices`,
    DROP COLUMN `email`,
    DROP COLUMN `nameInput`,
    DROP COLUMN `phone`,
    DROP COLUMN `select`,
    ADD COLUMN `text` VARCHAR(191) NOT NULL;
