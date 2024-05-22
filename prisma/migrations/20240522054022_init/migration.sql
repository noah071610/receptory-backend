-- CreateTable
CREATE TABLE `Confirmation` (
    `confirmId` VARCHAR(191) NOT NULL,
    `content` JSON NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Confirmation_confirmId_key`(`confirmId`),
    PRIMARY KEY (`confirmId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Confirmation` ADD CONSTRAINT `Confirmation_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`pageId`) ON DELETE CASCADE ON UPDATE CASCADE;
