import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint. Use POST /api/account/invoices/[id]/resend (requires auth).',
    },
    { status: 410 }
  );
}
