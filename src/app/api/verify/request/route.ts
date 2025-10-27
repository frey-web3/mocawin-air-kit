// src/app/api/verify/request/route.ts
import { NextResponse } from 'next/server';
import { AirService } from '@mocanetwork/airkit'; 
import { generateJwt } from '@/backend/services/jwtService';
import fs from 'fs';
import path from 'path';

// --- ENVIRONMENT VARIABLES ---
const PROGRAM_ID: string = process.env.AIR_PROGRAM_ID!;
const VERIFIER_PARTNER_ID: string = process.env.AIR_VERIFIER_PARTNER_ID!;
const JWT_KEY_ID: string = process.env.JWT_KEY_ID!; 

// Validate environment variables at module load
if (!PROGRAM_ID || !VERIFIER_PARTNER_ID || !JWT_KEY_ID) {
    throw new Error('Missing required environment variables. Check AIR_PROGRAM_ID, AIR_VERIFIER_PARTNER_ID, and JWT_KEY_ID');
}

// Key reading is safe outside POST as it's static file I/O
const privateKeyPath = path.resolve(process.cwd(), 'src/backend/keys/private.key');
const publicKeyPath = path.resolve(process.cwd(), 'src/backend/keys/public.key');

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    throw new Error('Missing private.key or public.key in src/backend/keys/');
}

const privateKey = fs.readFileSync(privateKeyPath).toString();

export async function POST(request: Request) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const { userAddress } = body;
        
        if (!userAddress) {
            return NextResponse.json({ error: 'Missing userAddress' }, { status: 400 });
        }
        
        // Initialize the Verifier SDK inside the request handler
        const verifier = new AirService({ 
            partnerId: VERIFIER_PARTNER_ID 
        });

        // Create the subject DID from the user's address
        const subjectDid = `did:ethr:${userAddress}`;

        // Generate JWT on the server with the subject DID
        const jwt = await generateJwt(
            privateKey, 
            VERIFIER_PARTNER_ID, 
            JWT_KEY_ID, 
            subjectDid
        );

        // Define the redirect URL (where user returns after verification)
        const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        // Call verifyCredential as per AirKit documentation
        const result = await verifier.verifyCredential({
            authToken: jwt,
            programId: PROGRAM_ID,
            redirectUrl: `${redirectUrl}/profile?verification_complete=true`
        });

        // The result should contain verificationUrl and verificationRequestId
        // Return these to the frontend
        return NextResponse.json({
            verificationUrl: result.verificationUrl,
            verificationRequestId: result.verificationRequestId,
            status: result.status || 'pending'
        });

    } catch (error) {
        // Enhanced error logging
        console.error('API Verification Error:', error);
        
        // Extract meaningful error message
        let errorMessage = 'Failed to initiate verification session.';
        
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
            if ('message' in error) {
                errorMessage = (error as { message: string }).message;
            } else if ('error' in error) {
                errorMessage = (error as { error: string }).error;
            }
        }

        // Return detailed error to frontend for debugging
        return NextResponse.json(
            { 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            }, 
            { status: 500 }
        );
    }
}