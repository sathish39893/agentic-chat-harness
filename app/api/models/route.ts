import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID } from '@/lib/agent/models';

export async function GET() {
  const status = {
    hasGateway: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_ENV),
    hasSandbox: Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL_TOKEN || process.env.VERCEL),
    hasNeon: Boolean(process.env.DATABASE_URL),
    hasBlob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  };

  return NextResponse.json({
    models: AVAILABLE_MODELS,
    defaultModelId: DEFAULT_MODEL_ID,
    status,
  });
}
