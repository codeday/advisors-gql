-- CreateTable
CREATE TABLE `Advisor` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `username` VARCHAR(191),
    `givenName` VARCHAR(191) NOT NULL,
    `familyName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `type` ENUM('TECHNICAL', 'HR') NOT NULL,
    `resumesPerWeek` DOUBLE NOT NULL,
    `interviewsPerWeek` DOUBLE NOT NULL,

    UNIQUE INDEX `Advisor.username_unique`(`username`),
    UNIQUE INDEX `Advisor.email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Request` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `givenName` VARCHAR(191) NOT NULL,
    `familyName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `type` ENUM('RESUME', 'INTERVIEW') NOT NULL,
    `resumeUrl` VARCHAR(191),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestAssignment` (
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `advisorId` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`advisorId`, `requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RequestAssignment` ADD FOREIGN KEY (`advisorId`) REFERENCES `Advisor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestAssignment` ADD FOREIGN KEY (`requestId`) REFERENCES `Request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
