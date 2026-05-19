import 'dotenv/config';
import { sign } from 'jsonwebtoken';
import { AuthRole, JwtToken } from '../src/context/auth';

type RoleName = 'admin' | 'manager' | 'mentor' | 'student' | 'recommender' | 'community' | 'requester';

const roleMap: Record<RoleName, AuthRole> = {
    admin: AuthRole.ADMIN,
    manager: AuthRole.ADMIN,
    mentor: AuthRole.ADVISOR,
    student: AuthRole.REQUESTER,
    recommender: AuthRole.RECOMMENDER,
    community: AuthRole.COMMUNITY_MEMBER,
    requester: AuthRole.REQUESTER,
};

function usage(): never {
    throw new Error('Usage: yarn generate-token <event-id> <role> [username-or-advisor-id]');
}

function main(): void {
    const [eventId, roleName, identity] = process.argv.slice(2);
    if (!eventId || !roleName) usage();

    const normalizedRole = roleName.toLowerCase() as RoleName;
    const role = roleMap[normalizedRole];
    if (!role) usage();

    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error('AUTH_SECRET is required.');

    const payload: JwtToken = { typ: role };

    if (role === AuthRole.ADVISOR) {
        payload.adv = identity || 'advisor-test';
    }

    if (role === AuthRole.REQUESTER || role === AuthRole.COMMUNITY_MEMBER || role === AuthRole.RECOMMENDER) {
        payload.username = identity || 'student-test';
    }

    const token = sign(payload, secret, { audience: eventId, expiresIn: '31d' });
    // eslint-disable-next-line no-console
    console.log(token);
}

main();