-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `type` ENUM('INTEREST', 'TECHNOLOGY') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `username` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `givenName` VARCHAR(191) NOT NULL,
    `familyName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191),
    `underrepresentedGender` BOOLEAN NOT NULL,
    `underrepresentedEthnicity` BOOLEAN NOT NULL,
    `urlResume` VARCHAR(191),
    `urlLinkedIn` VARCHAR(191),
    `urlGithub` VARCHAR(191),
    `urlWebsite` VARCHAR(191),
    `gradHighSchoolAt` DATETIME(3),
    `gradUniversityAt` DATETIME(3),
    `workInternAt` DATETIME(3),
    `workFteAt` DATETIME(3),
    `searchOpen` BOOLEAN NOT NULL,
    `searchInternships` BOOLEAN NOT NULL,
    `searchFullTimeAt` DATETIME(3),

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventParticipation` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `profileUsername` VARCHAR(191) NOT NULL,
    `awardIds` JSON,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Recommendation` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `username` VARCHAR(191),
    `givenName` VARCHAR(191) NOT NULL,
    `familyName` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `employer` VARCHAR(191) NOT NULL,
    `relation` VARCHAR(191) NOT NULL,
    `skillEngineering` ENUM('INTERN_BELOW', 'INTERN_MEETS', 'INTERN_EXCEEDS', 'NEW_GRAD', 'NEW_GRAD_EXCEEDS'),
    `skillTechnical` ENUM('INTERN_BELOW', 'INTERN_MEETS', 'INTERN_EXCEEDS', 'NEW_GRAD', 'NEW_GRAD_EXCEEDS'),
    `skillInterpersonal` ENUM('INTERN_BELOW', 'INTERN_MEETS', 'INTERN_EXCEEDS', 'NEW_GRAD', 'NEW_GRAD_EXCEEDS'),
    `recommendation` VARCHAR(191),
    `profileUsername` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProfileToTag` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ProfileToTag_AB_unique`(`A`, `B`),
    INDEX `_ProfileToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventParticipation` ADD FOREIGN KEY (`profileUsername`) REFERENCES `Profile`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recommendation` ADD FOREIGN KEY (`profileUsername`) REFERENCES `Profile`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProfileToTag` ADD FOREIGN KEY (`A`) REFERENCES `Profile`(`username`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProfileToTag` ADD FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
