import { NextRequest, NextResponse } from 'next/server';
import { unsubscribeUser } from '@/lib/newsletter/admin';
import { z } from 'zod';

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = unsubscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Neteisingas el. pašto adresas',
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Unsubscribe user
    const result = await unsubscribeUser(email);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Sėkmingai atsisakėte prenumeratos',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Nepavyko atsisakyti prenumeratos',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Įvyko vidinė klaida',
      },
      { status: 500 }
    );
  }
}
