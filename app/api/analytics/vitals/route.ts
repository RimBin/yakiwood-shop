import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsPayload {
  metric: string;
  value: number;
  rating: string;
  url: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalsPayload = await request.json();
    
    // Log metrics (in production, send to analytics service)
    console.log('[Web Vitals]', {
      metric: data.metric,
      value: data.value,
      rating: data.rating,
      url: data.url,
      timestamp: new Date(data.timestamp).toISOString(),
    });
    
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
