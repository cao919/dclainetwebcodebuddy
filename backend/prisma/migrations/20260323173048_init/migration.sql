-- CreateTable
CREATE TABLE `marketing_task` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('draft', 'active', 'paused', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'draft',
    `targetAudience` JSON NULL,
    `budget` DECIMAL(10, 2) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdBy` VARCHAR(100) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `marketing_task_status_idx`(`status`),
    INDEX `marketing_task_createdBy_idx`(`createdBy`),
    INDEX `marketing_task_createdAt_idx`(`createdAt`),
    INDEX `marketing_task_startDate_endDate_idx`(`startDate`, `endDate`),
    INDEX `marketing_task_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_stage_output` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `stage` ENUM('data_collection', 'market_analysis', 'strategy', 'planning', 'creative', 'execution', 'analysis', 'optimization') NOT NULL,
    `output` JSON NOT NULL,
    `status` ENUM('pending', 'processing', 'completed', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `task_stage_output_taskId_idx`(`taskId`),
    INDEX `task_stage_output_stage_idx`(`stage`),
    INDEX `task_stage_output_status_idx`(`status`),
    UNIQUE INDEX `task_stage_output_taskId_stage_key`(`taskId`, `stage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_creative` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `type` ENUM('text', 'image', 'video', 'composite', 'carousel', 'story') NOT NULL,
    `title` VARCHAR(255) NULL,
    `content` JSON NOT NULL,
    `aiGenerated` BOOLEAN NOT NULL DEFAULT true,
    `aiModel` VARCHAR(100) NULL,
    `status` ENUM('draft', 'pending', 'approved', 'rejected', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ad_creative_taskId_idx`(`taskId`),
    INDEX `ad_creative_type_idx`(`type`),
    INDEX `ad_creative_status_idx`(`status`),
    INDEX `ad_creative_aiGenerated_idx`(`aiGenerated`),
    INDEX `ad_creative_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketing_performance` (
    `id` VARCHAR(191) NOT NULL,
    `creativeId` VARCHAR(191) NOT NULL,
    `metrics` JSON NOT NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `source` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `marketing_performance_creativeId_idx`(`creativeId`),
    INDEX `marketing_performance_periodStart_periodEnd_idx`(`periodStart`, `periodEnd`),
    INDEX `marketing_performance_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `auth0Id` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NULL,
    `picture` VARCHAR(500) NULL,
    `role` ENUM('admin', 'manager', 'marketer', 'analyst', 'user', 'guest') NOT NULL DEFAULT 'user',
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_auth0Id_key`(`auth0Id`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_config` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NOT NULL,
    `description` VARCHAR(500) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_config_key_key`(`key`),
    INDEX `system_config_key_idx`(`key`),
    INDEX `system_config_isPublic_idx`(`isPublic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entityType` VARCHAR(100) NULL,
    `entityId` VARCHAR(100) NULL,
    `oldData` JSON NULL,
    `newData` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_userId_idx`(`userId`),
    INDEX `audit_log_action_idx`(`action`),
    INDEX `audit_log_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `marketing_task` ADD CONSTRAINT `marketing_task_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_stage_output` ADD CONSTRAINT `task_stage_output_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `marketing_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ad_creative` ADD CONSTRAINT `ad_creative_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `marketing_task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marketing_performance` ADD CONSTRAINT `marketing_performance_creativeId_fkey` FOREIGN KEY (`creativeId`) REFERENCES `ad_creative`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
