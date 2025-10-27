// src/app/api/verify/status/route.ts
import { NextResponse } from 'next/server';
import { AirService } from '@mocanetwork/airkit';

const VERIFIER_PARTNER_ID: string = process.env.AIR_VERIFIER_PARTNER_ID!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { verificationRequestId } = body;
        
        if (!verificationRequestId) {
            return NextResponse.json({ error: 'Missing verificationRequestId' }, { status: 400 });
        }

        // Initialize the Verifier SDK
        const verifier = new AirService({ 
            partnerId: VERIFIER_PARTNER_ID 
        });

        // Check the status of the verification request
        // This method should return the current status and proof if completed
        const status = await verifier.getVerificationStatus(verificationRequestId);

        return NextResponse.json({
            status: status.status, // 'pending', 'completed', 'failed', etc.
            proofResult: status.proofResult || null,
        });

    } catch (error) {
        console.error('Status Check Error:', error);
        
        let errorMessage = 'Failed to check verification status.';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { 
                error: errorMessage,
                status: 'error'
            }, 
            { status: 500 }
        );
    }
}