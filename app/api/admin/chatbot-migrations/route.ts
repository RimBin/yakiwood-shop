import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin';
import path from 'path';
import { readFile } from 'fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIGRATIONS: Record<string, { name: string; file: string }> = {
  chatbot_faq_entries: {
    name: 'chatbot_faq_entries',
    file: 'supabase/migrations/20260111_chatbot_faq_entries.sql',
  },
  chatbot_settings: {
    name: 'chatbot_settings',
    file: 'supabase/migrations/20260113_chatbot_settings.sql',
  },
};

const RELOAD_SCHEMA_SQL = "select pg_notify('pgrst','reload schema');";

async function loadSql(file: string): Promise<string> {
  const abs = path.join(process.cwd(), file);
  return await readFile(abs, 'utf8');
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const sp = request.nextUrl.searchParams;
    const name = (sp.get('name') || '').trim();

    if (name === 'reload-schema') {
      return NextResponse.json({ ok: true, data: { name: 'reload-schema', sql: RELOAD_SCHEMA_SQL } });
    }

    const migration = MIGRATIONS[name];
    if (!migration) {
      return NextResponse.json({ ok: false, error: 'Invalid migration name' }, { status: 400 });
    }

    const sql = await loadSql(migration.file);
    return NextResponse.json({
      ok: true,
      data: {
        name: migration.name,
        file: migration.file,
        sql,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : 'Failed to load migrations';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
