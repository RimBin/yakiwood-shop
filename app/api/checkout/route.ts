import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';
import { applyRoleDiscount, type RoleDiscount } from '@/lib/pricing/roleDiscounts';
import { quoteConfigurationPricing, type UsageType } from '@/lib/pricing/configuration';
import { getOrderById } from '@/lib/supabase-admin';

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-11-17.clover',
  });
}

function createSupabaseRouteClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No-op in route handlers
        },
      },
    }
  );
}

async function getAuthenticatedRoleDiscount(request: NextRequest): Promise<RoleDiscount | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createSupabaseRouteClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = (profile as any)?.role as string | undefined;
  if (!role) return null;

  const { data: discountRow } = await supabase
    .from('role_discounts')
    .select('role,discount_type,discount_value,currency,is_active')
    .eq('role', role)
    .eq('is_active', true)
    .maybeSingle();

  return (discountRow as RoleDiscount | null) ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe konfigūracija nerasta' }, { status: 503 });
    }

    const body = await req.json();
    const {
      orderId,
      items,
      customerEmail: customerEmailRaw,
      customerName: customerNameRaw,
      customerPhone: customerPhoneRaw,
      customerAddress: customerAddressRaw,
      customer,
    } = body as {
      orderId?: string;
      items: Array<{
        id: string;
        name: string;
        slug?: string;
        quantity: number;
        basePrice: number;
        color?: string;
        finish?: string;
        configuration?: {
          usageType?: UsageType;
          sku?: string;
          profileVariantId?: string;
          colorVariantId?: string;
          thicknessOptionId?: string;
          widthMm?: number;
          lengthMm?: number;
        };
      }>;
      customerEmail?: string;
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
      customer?: {
        email?: string;
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        country?: string;
      };
    };

    const customerEmail = customerEmailRaw || customer?.email;
    const customerName = customerNameRaw || customer?.name;
    const customerPhone = customerPhoneRaw || customer?.phone;

    const customerCity = customer?.city || '';
    const customerPostalCode = customer?.postalCode || '';
    const customerCountry = customer?.country || '';
    const customerStreetAddress = customerAddressRaw || customer?.address || '';
    const customerAddress = [
      customerStreetAddress,
      customerCity,
      customerPostalCode,
      customerCountry,
    ]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .join(', ');

    if (!items || items.length === 0) {
      // If orderId is provided, we will load items from DB; otherwise this is an error.
      if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
        return NextResponse.json({ error: 'Tuščias krepšelis' }, { status: 400 });
      }
    }

    // Authoritative path: load order snapshot from DB when orderId is provided.
    let resolvedItems = items;
    if (orderId && typeof orderId === 'string' && orderId.trim().length > 0) {
      const order = await getOrderById(orderId.trim());
      if (!order) {
        return NextResponse.json({ error: 'Užsakymas nerastas' }, { status: 404 });
      }
      if (!Array.isArray(order.items) || order.items.length === 0) {
        return NextResponse.json({ error: 'Užsakymo prekės nerastos' }, { status: 400 });
      }
      resolvedItems = order.items as any;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.NODE_ENV === 'production' && (!siteUrl || !siteUrl.trim())) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_SITE_URL privalomas production aplinkoje' },
        { status: 500 }
      );
    }
    const resolvedSiteUrl = siteUrl || 'http://localhost:3000';

    // Apply role discount only for authenticated users.
    const roleDiscount = await getAuthenticatedRoleDiscount(req);

    const discountedItems = roleDiscount
      ? resolvedItems.map((item) => {
          if (item.id === 'shipping') return item;
          return {
            ...item,
            basePrice: applyRoleDiscount(item.basePrice, roleDiscount),
          };
        })
      : resolvedItems;

    const cartTotalAreaM2 = discountedItems.reduce((sum, item) => {
      if (item.id === 'shipping') return sum;

      const snapArea = (item as any)?.pricingSnapshot?.totalAreaM2;
      if (typeof snapArea === 'number' && Number.isFinite(snapArea) && snapArea > 0) return sum + snapArea;

      const cfg = item.configuration;
      if (
        cfg &&
        typeof cfg.widthMm === 'number' &&
        typeof cfg.lengthMm === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      ) {
        return sum + (cfg.widthMm / 1000) * (cfg.lengthMm / 1000) * item.quantity;
      }

      return sum;
    }, 0);

    // NOTE: Real implementation should map product IDs to Stripe Price IDs.
    // For initial scaffold we convert basePrice EUR to cents direct.
    const lineItemsResolved = await Promise.all(
      discountedItems.map(async (item) => {
        const sku =
          typeof (item as any)?.configuration?.sku === 'string' && (item as any).configuration.sku.trim().length > 0
            ? String((item as any).configuration.sku)
            : null;

        // Shipping and other non-product items must keep provided price.
        if (item.id === 'shipping') {
          return {
            quantity: item.quantity,
            unitAmountCents: Math.round(item.basePrice * 100),
            displayName: item.name,
            sku,
          };
        }

        const cfg = item.configuration;
        const hasConfigPricingInputs =
          cfg &&
          typeof cfg.widthMm === 'number' &&
          typeof cfg.lengthMm === 'number' &&
          typeof item.quantity === 'number' &&
          item.quantity > 0;

        if (!hasConfigPricingInputs) {
          return {
            quantity: item.quantity,
            unitAmountCents: Math.round(item.basePrice * 100),
            displayName: item.name,
            sku,
          };
        }

        // Prefer snapshot pricing if provided by the client/order.
        const snapshotUnitPrice = (item as any)?.pricingSnapshot?.unitPrice;
        if (typeof snapshotUnitPrice === 'number' && Number.isFinite(snapshotUnitPrice) && snapshotUnitPrice > 0) {
          const discountedUnit = roleDiscount ? applyRoleDiscount(snapshotUnitPrice, roleDiscount) : snapshotUnitPrice;
          return {
            quantity: item.quantity,
            unitAmountCents: Math.round(discountedUnit * 100),
            displayName: item.name,
            sku,
          };
        }

        const quote = await quoteConfigurationPricing({
          productId: item.id,
          usageType: cfg.usageType,
          profileVariantId: cfg.profileVariantId,
          colorVariantId: cfg.colorVariantId,
          thicknessOptionId: cfg.thicknessOptionId,
          widthMm: cfg.widthMm as number,
          lengthMm: cfg.lengthMm as number,
          quantityBoards: 1,
          cartTotalAreaM2,
        });

        if (!quote) {
          return {
            quantity: item.quantity,
            unitAmountCents: Math.round(item.basePrice * 100),
            displayName: item.name,
            sku,
          };
        }

        const quotedUnit = quote.unitPricePerBoard;
        const discountedUnit = roleDiscount ? applyRoleDiscount(quotedUnit, roleDiscount) : quotedUnit;
        const unitAmountCents = Math.round(discountedUnit * 100);
        return {
          quantity: item.quantity,
          unitAmountCents,
          displayName: item.name,
          sku,
        };
      })
    );

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = lineItemsResolved.map((i) => ({
      quantity: i.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: i.unitAmountCents,
        product_data: {
          name: i.displayName,
          metadata: i.sku ? { sku: i.sku } : undefined,
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId || '',
        customerName: customerName || '',
        customerPhone: customerPhone || '',
        customerAddress: customerAddress || '',
        customerCity,
        customerPostalCode,
        customerCountry,
        // Avoid storing full cart in metadata when order-first flow is used.
        items: orderId ? '' : JSON.stringify(discountedItems),
      },
      success_url: `${resolvedSiteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${resolvedSiteUrl}/checkout`
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Stripe checkout error', e);
    return NextResponse.json({ error: 'Nepavyko sukurti atsiskaitymo sesijos' }, { status: 500 });
  }
}
