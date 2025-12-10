import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Stripe checkout disabled during build
  return NextResponse.json({ error: 'Checkout temporarily unavailable' }, { status: 503 });
}
