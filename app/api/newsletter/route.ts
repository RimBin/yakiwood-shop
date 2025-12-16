import { NextRequest, NextResponse } from 'next/server';
import { getNewsletterProvider, checkRateLimit } from '@/lib/newsletter/providers';
import { z } from 'zod';

// Request validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  consent: z.boolean(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Netinkami duomenys',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, name, consent, source } = validation.data;

    // Check consent (GDPR requirement)
    if (!consent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prašome sutikti gauti naujienas',
        },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Per daug bandymų. Bandykite vėliau.',
        },
        { status: 429 }
      );
    }

    // Get newsletter provider
    let provider;
    try {
      provider = getNewsletterProvider();
    } catch (error) {
      console.error('Failed to initialize newsletter provider:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Naujienų paslauga laikinai nepasiekiama',
        },
        { status: 503 }
      );
    }

    // Subscribe user
    const result = await provider.subscribe(email, {
      name,
      consent,
      source,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message || 'Sėkmingai užsiprenumeravote naujienas!',
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Nepavyko prenumeruoti naujienų',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Įvyko vidinė klaida',
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        error: 'El. paštas yra privalomas',
      },
      { status: 400 }
    );
  }

  // This would require provider-specific implementation
  return NextResponse.json(
    {
      success: true,
      message: 'Use POST method to subscribe',
    },
    { status: 200 }
  );
}
