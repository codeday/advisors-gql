import { sign } from 'jsonwebtoken';
import { JwtToken, AuthRole } from '../context/auth';
import config from '../config';

export function makeAdvisorToken(advisorId: string) {
    const payload: JwtToken = { typ: AuthRole.ADVISOR, adv: advisorId };
    return sign(payload, config.auth.secret, { audience: config.auth.audience, expiresIn: '31d' });
}