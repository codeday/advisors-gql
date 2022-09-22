-- CreateEnum
CREATE TYPE "AdvisorType" AS ENUM ('TECHNICAL', 'HR');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('RESUME', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('INTEREST', 'TECHNOLOGY');

-- CreateEnum
CREATE TYPE "RecommendationRating" AS ENUM ('INTERN_BELOW', 'INTERN_MEETS', 'INTERN_EXCEEDS', 'NEW_GRAD', 'NEW_GRAD_EXCEEDS');

-- CreateTable
CREATE TABLE "Advisor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" "AdvisorType" NOT NULL,
    "resumesPerWeek" DOUBLE PRECISION NOT NULL,
    "interviewsPerWeek" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Advisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "resumeUrl" TEXT,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestAssignment" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "advisorId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "RequestAssignment_pkey" PRIMARY KEY ("advisorId","requestId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "type" "TagType" NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "underrepresentedGender" BOOLEAN NOT NULL,
    "underrepresentedEthnicity" BOOLEAN NOT NULL,
    "urlResume" TEXT,
    "urlLinkedIn" TEXT,
    "urlGithub" TEXT,
    "urlWebsite" TEXT,
    "gradHighSchoolAt" TIMESTAMP(3),
    "gradUniversityAt" TIMESTAMP(3),
    "workInternAt" TIMESTAMP(3),
    "workFteAt" TIMESTAMP(3),
    "searchOpen" BOOLEAN NOT NULL,
    "searchInternships" BOOLEAN NOT NULL,
    "searchFullTimeAt" TIMESTAMP(3),

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "EventParticipation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "profileUsername" TEXT NOT NULL,
    "awardIds" JSONB,

    CONSTRAINT "EventParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "employer" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "skillEngineering" "RecommendationRating",
    "skillTechnical" "RecommendationRating",
    "skillInterpersonal" "RecommendationRating",
    "recommendation" TEXT,
    "profileUsername" TEXT NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfileToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Advisor_username_key" ON "Advisor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Advisor_email_key" ON "Advisor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_ProfileToTag_AB_unique" ON "_ProfileToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfileToTag_B_index" ON "_ProfileToTag"("B");

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "Advisor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestAssignment" ADD CONSTRAINT "RequestAssignment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_profileUsername_fkey" FOREIGN KEY ("profileUsername") REFERENCES "Profile"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_profileUsername_fkey" FOREIGN KEY ("profileUsername") REFERENCES "Profile"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToTag" ADD CONSTRAINT "_ProfileToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("username") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToTag" ADD CONSTRAINT "_ProfileToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
