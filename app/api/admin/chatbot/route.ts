import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin';
import { getSessionEvents, listSessions } from '@/lib/chatbot/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const sp = request.nextUrl.searchParams;
    const action = sp.get('action') || 'sessions';

    if (action === 'sessions') {
      const limit = Math.min(200, Math.max(1, parseInt(sp.get('limit') || '50', 10)));
      const data = await listSessions(limit);
      return NextResponse.json({ success: true, data });
    }

    if (action === 'events') {
      const sessionId = sp.get('sessionId');
      const SessionSchema = z.string().trim().min(8).max(200);
      const parsed = SessionSchema.safeParse(sessionId);

      if (!parsed.success) {
        return NextResponse.json({ success: false, error: 'sessionId is required' }, { status: 400 });
      }

      const limit = Math.min(500, Math.max(1, parseInt(sp.get('limit') || '200', 10)));
      const data = await getSessionEvents(parsed.data, limit);
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
