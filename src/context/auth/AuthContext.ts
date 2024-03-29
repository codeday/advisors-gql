import { verify } from 'jsonwebtoken';
import config from '../../config';
import { JwtToken, AuthRole } from './JwtToken';

export class AuthContext {
  private token?: JwtToken;

  private tokenString?: string;

  constructor(token?: string) {
    if (!token) return;
    this.tokenString = token;

    this.token = <JwtToken> verify(token, config.auth.secret, { audience: config.auth.audience });
    this.validate();
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  validate(): void {
    if (this.isCommunityMember && !this.username) throw Error('Student applicant tokens require username.');
    if (this.isAdvisor && !this.advisorId) throw Error('Request responder token must have an advisor id.');
  }

  get isAdvisor(): boolean {
    return this.token?.typ === AuthRole.ADVISOR;
  }

  get isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  get type(): AuthRole | undefined {
    return this.token?.typ;
  }

  get isAdmin(): boolean {
    return this.type === AuthRole.ADMIN;
  }

  get isRequester(): boolean {
    return this.type === AuthRole.REQUESTER;
  }

  get isCommunityMember(): boolean {
    return this.type === AuthRole.COMMUNITY_MEMBER || this.type === AuthRole.REQUESTER;
  }

  get isRecommender(): boolean {
    return this.type === AuthRole.RECOMMENDER;
  }

  get username(): string | undefined {
    return this.token?.username;
  }

  get advisorId(): string | undefined {
    return this.token?.adv;
  }

  toWhere(): { username: string } {
    const { username } = this;
    if (username) return { username };
    throw new Error('Token did not include username.');
  }
}
