import 'dotenv/config';
import { PrismaClient, AdvisorType, RequestType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const eventId = 'event-test-2025';
const aliceAdvisorId = 'advisor-alice-test';
const bobAdvisorId = 'advisor-bob-test';
const requestId = 'request-test-2025';

async function seedAdvisor(params: {
    id: string;
    email: string;
    givenName: string;
    familyName: string;
    type: AdvisorType;
    resumesPerWeek: number;
    interviewsPerWeek: number;
}) {
    return prisma.advisor.upsert({
        where: { email: params.email },
        update: {
            givenName: params.givenName,
            familyName: params.familyName,
            type: params.type,
            resumesPerWeek: params.resumesPerWeek,
            interviewsPerWeek: params.interviewsPerWeek,
        },
        create: params,
    });
}

async function seedProfile(params: {
    username: string;
    givenName: string;
    familyName: string;
    email: string;
}) {
    return prisma.profile.upsert({
        where: { username: params.username },
        update: {
            givenName: params.givenName,
            familyName: params.familyName,
            email: params.email,
        },
        create: {
            ...params,
            bio: `${params.givenName} test profile`,
            underrepresentedGender: false,
            underrepresentedEthnicity: false,
            searchOpen: true,
            searchInternships: true,
        },
    });
}

async function main(): Promise<void> {
    const [alice, bob] = await Promise.all([
        seedAdvisor({
            id: aliceAdvisorId,
            email: 'alice.mentor@example.com',
            givenName: 'Alice',
            familyName: 'Mentor',
            type: AdvisorType.TECHNICAL,
            resumesPerWeek: 3,
            interviewsPerWeek: 2,
        }),
        seedAdvisor({
            id: bobAdvisorId,
            email: 'bob.mentor@example.com',
            givenName: 'Bob',
            familyName: 'Mentor',
            type: AdvisorType.HR,
            resumesPerWeek: 2,
            interviewsPerWeek: 3,
        }),
    ]);

    const [ava, ben] = await Promise.all([
        seedProfile({
            username: 'ava',
            givenName: 'Ava',
            familyName: 'Student',
            email: 'ava.student@example.com',
        }),
        seedProfile({
            username: 'ben',
            givenName: 'Ben',
            familyName: 'Student',
            email: 'ben.student@example.com',
        }),
    ]);

    await prisma.eventParticipation.deleteMany({ where: { eventId } });
    await prisma.eventParticipation.createMany({
        data: [
            { eventId, profileUsername: ava.username, awardIds: ['mentor-1', 'mentor-2'] },
            { eventId, profileUsername: ben.username, awardIds: ['mentor-1'] },
        ],
    });

    const request = await prisma.request.upsert({
        where: { id: requestId },
        update: {
            username: ava.username,
            givenName: ava.givenName,
            familyName: ava.familyName,
            email: ava.email,
            type: RequestType.INTERVIEW,
            resumeUrl: 'https://example.com/resume.pdf',
        },
        create: {
            id: requestId,
            username: ava.username,
            givenName: ava.givenName,
            familyName: ava.familyName,
            email: ava.email,
            type: RequestType.INTERVIEW,
            resumeUrl: 'https://example.com/resume.pdf',
        },
    });

    await prisma.requestAssignment.upsert({
        where: { advisorId_requestId: { advisorId: alice.id, requestId: request.id } },
        update: {
            response: Prisma.DbNull,
            responseFile: null,
        },
        create: {
            advisorId: alice.id,
            requestId: request.id,
        },
    });

    await prisma.requestAssignment.upsert({
        where: { advisorId_requestId: { advisorId: bob.id, requestId: request.id } },
        update: {
            response: Prisma.DbNull,
            responseFile: null,
        },
        create: {
            advisorId: bob.id,
            requestId: request.id,
        },
    });

    // eslint-disable-next-line no-console
    console.log(`Seeded test data for event ${eventId}`);
}

main()
    .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });