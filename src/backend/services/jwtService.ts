// src/backend/services/jwtService.ts
import { SignJWT } from 'jose';
import { type JwtHeader, type JwtPayload } from '../types/jwt.d';
import { createPrivateKey } from 'crypto';

// Updated function signature to accept subjectDid as a required parameter
const generateJwt = async (privateKey: string, partnerId: string, keyId: string, subjectDid: string, nonce?: string): Promise<string> => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expirationTime = issuedAt + 3600; // 1 hour from now

  const header: JwtHeader = {
    // FIX: Uses RS256 to match the RSA key type
    alg: 'RS256', 
    typ: 'JWT',
    kid: keyId,
  };

  const payload: JwtPayload = {
    iss: partnerId,
    // FIX: Uses the provided subjectDid for the 'sub' claim
    sub: subjectDid, 
    iat: issuedAt,
    exp: expirationTime,
  };

  if (nonce) {
    payload.nonce = nonce;
  }

  const jwt = await new SignJWT(payload)
    .setProtectedHeader(header)
    .sign(await importPrivateKey(privateKey));

  return jwt;
};

async function importPrivateKey(privateKey: string) {
  const { createPrivateKey } = await import('crypto');
  return createPrivateKey({
    key: privateKey, // Passed as string
    format: 'pem',
  });
}

export { generateJwt };