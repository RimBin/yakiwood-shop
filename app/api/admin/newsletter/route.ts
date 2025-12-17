import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscribers,
  getSubscriberStats,
  unsubscribeUser,
  deleteSubscriber,
  exportSubscribersToCSV,
  searchSubscribers,
} from '@/lib/newsletter/admin';

// Force dynamic rendering (don't prerender at build time)
export const dynamic = 'force-dynamic';

// GET /api/admin/newsletter - Get subscribers or stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const status = searchParams.get('status') || undefined;
    const source = searchParams.get('source') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const query = searchParams.get('query');

    // Get stats
    if (action === 'stats') {
      const stats = await getSubscriberStats();
      return NextResponse.json({ success: true, data: stats });
    }

    // Export to CSV
    if (action === 'export') {
      const csv = await exportSubscribersToCSV(status);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString()}.csv"`,
        },
      });
    }

    // Search subscribers
    if (query) {
      const { data, error } = await searchSubscribers(query);
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, data });
    }

    // Get subscribers with filters
    const { data, error, count } = await getSubscribers({
      status,
      source,
      limit,
      offset,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      count,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('Newsletter admin GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/newsletter - Manage subscribers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'unsubscribe':
        result = await unsubscribeUser(email);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d ${email}`,
    });
  } catch (error: any) {
    console.error('Newsletter admin POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/newsletter - Delete subscriber (GDPR)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await deleteSubscriber(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${email}`,
    });
  } catch (error: any) {
    console.error('Newsletter admin DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
