-- CreateTable
CREATE TABLE `User` (
    `userId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `userImage` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `plan` INTEGER NOT NULL DEFAULT 0,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_userId_key`(`userId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isRead` INTEGER NOT NULL DEFAULT 0,
    `text` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Template` (
    `pageId` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `lang` VARCHAR(191) NOT NULL,
    `templateLang` VARCHAR(191) NOT NULL,
    `isSecret` INTEGER NOT NULL DEFAULT 0,
    `content` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Template_pageId_key`(`pageId`),
    PRIMARY KEY (`pageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Save` (
    `pageId` VARCHAR(191) NOT NULL,
    `customLink` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `format` VARCHAR(191) NOT NULL,
    `lang` VARCHAR(191) NOT NULL,
    `content` JSON NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Save_pageId_key`(`pageId`),
    UNIQUE INDEX `Save_customLink_key`(`customLink`),
    INDEX `Save_customLink_idx`(`customLink`),
    PRIMARY KEY (`pageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `pageId` VARCHAR(191) NOT NULL,
    `customLink` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `format` VARCHAR(191) NOT NULL,
    `lang` VARCHAR(191) NOT NULL,
    `analyser` JSON NOT NULL,
    `content` JSON NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Page_pageId_key`(`pageId`),
    UNIQUE INDEX `Page_customLink_key`(`customLink`),
    INDEX `Page_customLink_idx`(`customLink`),
    PRIMARY KEY (`pageId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Confirmation` (
    `confirmId` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isConfirm` INTEGER NOT NULL DEFAULT 0,
    `userId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `startTime` INTEGER NULL,
    `endTime` INTEGER NULL,
    `content` JSON NOT NULL,
    `pageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Confirmation_confirmId_key`(`confirmId`),
    FULLTEXT INDEX `Confirmation_text_idx`(`text`),
    PRIMARY KEY (`confirmId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Website` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `text` JSON NOT NULL,
    `content` JSON NOT NULL,
    `lang` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Save` ADD CONSTRAINT `Save_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Save`(`pageId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Page` ADD CONSTRAINT `Page_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Confirmation` ADD CONSTRAINT `Confirmation_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `Page`(`pageId`) ON DELETE CASCADE ON UPDATE CASCADE;
