import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;

  const configId =
    body && typeof body === 'object' && 'configId' in body && typeof (body as any).configId === 'string'
      ? (body as any).configId
      : null;

  return NextResponse.json({ ok: true, received: configId });
}
