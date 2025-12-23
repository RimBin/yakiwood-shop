// Deprecated: localStorage-backed invoice generation endpoint.
// In production invoices are created via checkout/webhook + DB.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint. Use DB-backed invoice creation flow.',
    },
    { status: 410 }
  );
}
