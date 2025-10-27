export interface JwtHeader {
  alg: string;
  typ: string;
  kid: string;
  [key: string]: any;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  iat: number;
  exp: number;
  nonce?: string;
  [key: string]: any;
}
