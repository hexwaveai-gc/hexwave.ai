// app/api/cloudinary-signature/route.ts
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { retryOperation, DEFAULT_RETRY_CONFIG } from '@/utils/retry-operation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paramsToSign } = body as { paramsToSign: Record<string, string> };

    // ✅ Optionally: validate/whitelist paramsToSign keys here

    const apiSecret = cloudinary.config().api_secret;
    const apiKey = cloudinary.config().api_key;
    const cloudName = cloudinary.config().cloud_name;

    if (!apiSecret || !apiKey || !cloudName) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not configured' },
        { status: 500 }
      );
    }

    const generateSignatureOperation = async () => {
      const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
      return {
        signature,
        apiKey,
        cloudName,
      };
    };

    const result = await retryOperation(generateSignatureOperation, {
      ...DEFAULT_RETRY_CONFIG,
      onRetry: (attempt, error) => {
        console.warn(`Signature generation attempt ${attempt} failed:`, error.message);
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
