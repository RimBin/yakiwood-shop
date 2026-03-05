import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsPayload {
  metric: string;
  value: number;
  rating: string;
  url: string;
  timestamp: number;
}

type WebVitalsBatchPayload = {
  reason?: string;
  metrics: WebVitalsPayload[];
};

function isSinglePayload(value: unknown): value is WebVitalsPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<WebVitalsPayload>;
  return (
    typeof v.metric === 'string' &&
    typeof v.value === 'number' &&
    typeof v.rating === 'string' &&
    typeof v.url === 'string' &&
    typeof v.timestamp === 'number'
  );
}

function isBatchPayload(value: unknown): value is WebVitalsBatchPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<WebVitalsBatchPayload>;
  return Array.isArray(v.metrics) && v.metrics.every(isSinglePayload);
}

export async function POST(request: NextRequest) {
  try {
    const data: unknown = await request.json();

    const metrics: WebVitalsPayload[] = isBatchPayload(data)
      ? data.metrics
      : isSinglePayload(data)
        ? [data]
        : [];

    if (metrics.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Log metrics (in production, send to analytics service)
    if (metrics.length === 1) {
      const metric = metrics[0];
      console.log('[Web Vitals]', {
        metric: metric.metric,
        value: metric.value,
        rating: metric.rating,
        url: metric.url,
        timestamp: new Date(metric.timestamp).toISOString(),
      });
    } else {
      console.log('[Web Vitals]', {
        batch: metrics.length,
        reason: isBatchPayload(data) ? data.reason : undefined,
        url: metrics[0]?.url,
        firstTimestamp: new Date(metrics[0]?.timestamp ?? Date.now()).toISOString(),
      });
    }
    
    // TODO: Send to analytics service (Google Analytics, Sentry, etc.)
    // Example:
    // await sendToAnalytics(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process Web Vitals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process metrics' },
      { status: 500 }
    );
  }
}

// Optionally, support GET for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Web Vitals endpoint is ready',
  });
}
