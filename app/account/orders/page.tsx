import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import OrdersClient from '@/components/account/OrdersClient';

export const metadata: Metadata = {
  title: 'Mano užsakymai | Yakiwood',
  description: 'Peržiūrėkite savo užsakymų istoriją',
};

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone: string | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    configuration_snapshot: any;
    products: {
      name: string;
      slug: string;
    } | null;
  }>;
}

export default async function OrdersPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/account/orders');
  }

  // Fetch user's orders with items
  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        *,
        products (
          name,
          slug
        )
      )
    `
    )
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  return <OrdersClient orders={(orders as Order[]) || []} />;
}
