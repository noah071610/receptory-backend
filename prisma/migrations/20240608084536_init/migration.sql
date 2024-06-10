/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Confirmation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Confirmation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Confirmation` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Confirmation_userId_key` ON `Confirmation`(`userId`);
