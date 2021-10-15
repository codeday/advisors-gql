export enum AuthRole {
  ADMIN = 'a',
  RECOMMENDER = 'rec',
  REQUESTER = 'req',
  COMMUNITY_MEMBER = 'com',
}

export interface JwtToken {
  typ: AuthRole
  username?: string
}
