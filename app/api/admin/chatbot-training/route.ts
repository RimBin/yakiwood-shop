import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthError, requireAdmin } from '@/lib/supabase/admin';
import { getFaqEntries } from '@/lib/chatbot/faq';
import { getChatbotSettings } from '@/lib/chatbot/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LocaleSchema = z.enum(['lt', 'en', 'all']);

function getEnvBool(name: string, defaultValue = false): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  if (!v) return defaultValue;
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function makeJsonlLine(obj: unknown): string {
  return `${JSON.stringify(obj)}\n`;
}

async function buildTrainingJsonl(locale: 'lt' | 'en' | 'all'): Promise<{ jsonl: string; filename: string }> {
  const { settings } = await getChatbotSettings();

  const locales: Array<'lt' | 'en'> = locale === 'all' ? ['lt', 'en'] : [locale];

  let jsonl = '';

  for (const loc of locales) {
    const entries = await getFaqEntries(loc);
    const system = loc === 'en' ? settings.systemPromptEn : settings.systemPromptLt;

    for (const e of entries) {
      if (e.id === 'fallback') continue;
      const user = String(e.question || '').trim();
      const assistant = String(e.answer || '').trim();
      if (!user || !assistant) continue;

      jsonl += makeJsonlLine({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
          { role: 'assistant', content: assistant },
        ],
      });
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `yakiwood-chatbot-training-${locale}-${stamp}.jsonl`;
  return { jsonl, filename };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const sp = request.nextUrl.searchParams;
    const action = (sp.get('action') || 'export').toLowerCase();

    if (action === 'export') {
      const localeParsed = LocaleSchema.safeParse(sp.get('locale') || 'all');
      if (!localeParsed.success) {
        return NextResponse.json({ ok: false, error: 'Invalid locale' }, { status: 400 });
      }

      const { jsonl, filename } = await buildTrainingJsonl(localeParsed.data);

      return new NextResponse(jsonl, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    if (action === 'status') {
      if (!getEnvBool('CHATBOT_ENABLE_FINE_TUNE_ADMIN', false)) {
        return NextResponse.json({ ok: false, error: 'ERR_FINE_TUNE_DISABLED' }, { status: 403 });
      }

      const jobId = (sp.get('jobId') || '').trim();
      if (!jobId) {
        return NextResponse.json({ ok: false, error: 'jobId is required' }, { status: 400 });
      }

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ ok: false, error: 'OPENAI_NOT_CONFIGURED' }, { status: 503 });
      }

      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({ apiKey });

      const job = await client.fineTuning.jobs.retrieve(jobId);

      return NextResponse.json({
        ok: true,
        data: {
          id: job.id,
          status: job.status,
          model: job.model,
          fineTunedModel: (job as any).fine_tuned_model ?? null,
          createdAt: (job as any).created_at ?? null,
        },
      });
    }

    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Failed to export training data';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    if (!getEnvBool('CHATBOT_ENABLE_FINE_TUNE_ADMIN', false)) {
      return NextResponse.json({ ok: false, error: 'ERR_FINE_TUNE_DISABLED' }, { status: 403 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'OPENAI_NOT_CONFIGURED' }, { status: 503 });
    }

    const BodySchema = z.object({
      locale: LocaleSchema.default('all'),
      baseModel: z.string().trim().min(1).max(100).default('gpt-4o-mini'),
    });

    let json: unknown;
    try {
      json = await request.json();
    } catch {
      json = null;
    }

    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const { jsonl, filename } = await buildTrainingJsonl(parsed.data.locale);
    if (!jsonl.trim()) {
      return NextResponse.json({ ok: false, error: 'No training data available' }, { status: 400 });
    }

    const OpenAI = (await import('openai')).default;
    const { toFile } = await import('openai/uploads');
    const client = new OpenAI({ apiKey });

    const file = await client.files.create({
      file: await toFile(Buffer.from(jsonl, 'utf-8'), filename),
      purpose: 'fine-tune',
    });

    const job = await client.fineTuning.jobs.create({
      training_file: file.id,
      model: parsed.data.baseModel,
    });

    return NextResponse.json({
      ok: true,
      data: {
        jobId: job.id,
        status: job.status,
        baseModel: job.model,
        trainingFileId: (job as any).training_file ?? file.id,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Failed to start fine-tune job';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
