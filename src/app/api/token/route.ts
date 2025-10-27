import { NextResponse } from 'next/server';
import { generateJwt } from '../../../backend/services/jwtService';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { nonce } = await request.json();

    const privateKeyPath = process.env.PRIVATE_KEY_PATH;
    const partnerId = process.env.AIR_PARTNER_ID;
    const keyId = process.env.JWT_KEY_ID;

    if (!privateKeyPath || !partnerId || !keyId) {
      console.error('Missing required environment variables for JWT generation.');
      return NextResponse.json(
        { error: 'Server configuration error. Unable to generate token.' },
        { status: 500 }
      );
    }

    const fullPath = path.resolve(process.cwd(), privateKeyPath);
    const privateKey = fs.readFileSync(fullPath, 'utf-8');

    const jwt = await generateJwt(privateKey, partnerId, keyId, nonce);

    return NextResponse.json({ jwt });

  } catch (error) {
    console.error('JWT Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: `Failed to generate JWT: ${errorMessage}` },
      { status: 500 }
    );
  }
}
