export enum AuthRole {
  ADMIN = 'a',
  REQUESTER = 'req',
}

export interface JwtToken {
  typ: AuthRole
  username?: string
}
