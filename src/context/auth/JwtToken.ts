export enum AuthRole {
  ADMIN = 'a',
  RECOMMENDER = 'rec',
  REQUESTER = 'req',
  COMMUNITY_MEMBER = 'com',
  ADVISOR = 'adv',
}

export interface JwtToken {
  typ: AuthRole
  username?: string
  adv?: string
}
