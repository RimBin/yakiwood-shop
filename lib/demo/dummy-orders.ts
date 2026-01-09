import type { DBInvoice, Order as DBOrder } from '@/lib/supabase-admin';

export type DemoOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: DBOrder['status'];
  payment_status: DBOrder['payment_status'];
  created_at: string;
  stripe_session_id?: string | null;
  notes?: string | null;
};

export type DemoInvoice = {
  id: string;
  invoice_number: string;
  order_id?: string;
  buyer_name: string;
  buyer_email?: string;
  total: number;
  status: DBInvoice['status'];
  issued_at: string;
};

export function getDemoOrderAndInvoice(now = new Date()): {
  orders: DemoOrder[];
  invoices: DemoInvoice[];
} {
  const createdAt = now.toISOString();

  const orderId = 'demo-order-001';
  const orderNumber = `DEMO-${now.getFullYear()}-00001`;

  const orders: DemoOrder[] = [
    {
      id: orderId,
      order_number: orderNumber,
      customer_name: 'Demo Klientas',
      customer_email: 'demo@example.com',
      total: 249.0,
      status: 'pending',
      payment_status: 'pending',
      created_at: createdAt,
      stripe_session_id: null,
      notes: 'Mokėjimas: rankinis (demo).\nNuolaidos kodas: DEMO10',
    },
  ];

  const invoices: DemoInvoice[] = [
    {
      id: 'demo-invoice-001',
      invoice_number: `DEMO-INV-${now.getFullYear()}-00001`,
      order_id: orderId,
      buyer_name: 'Demo Klientas',
      buyer_email: 'demo@example.com',
      total: 249.0,
      status: 'issued',
      issued_at: createdAt,
    },
  ];

  return { orders, invoices };
}

export function getDemoDbInvoiceById(id: string, now = new Date()): DBInvoice | null {
  const { invoices } = getDemoOrderAndInvoice(now);
  const match = invoices.find((i) => i.id === id);
  if (!match) return null;

  const createdAt = now.toISOString();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 14);

  const subtotal = 205.79;
  const vat = 43.21;
  const total = 249.0;

  const dbInvoice: DBInvoice = {
    id: match.id,
    invoice_number: match.invoice_number,
    order_id: match.order_id,
    seller_name: 'Yakiwood',
    seller_company_code: '123456789',
    seller_vat_code: 'LT123456789012',
    seller_address: 'Gedimino pr. 1',
    seller_city: 'Vilnius',
    seller_postal_code: '01103',
    seller_country: 'Lietuva',
    seller_phone: '+370 600 00000',
    seller_email: 'info@yakiwood.lt',
    seller_bank_name: 'Swedbank',
    seller_bank_account: 'LT00 0000 0000 0000 0000',
    buyer_name: match.buyer_name,
    buyer_company_name: undefined,
    buyer_company_code: undefined,
    buyer_vat_code: undefined,
    buyer_address: 'Konstitucijos pr. 1',
    buyer_city: 'Vilnius',
    buyer_postal_code: '09308',
    buyer_country: 'Lietuva',
    buyer_phone: undefined,
    buyer_email: match.buyer_email,
    items: [
      { id: 'demo-item-1', name: 'Yakiwood produktas (demo)', quantity: 1, unitPrice: subtotal, vatRate: 0.21, total },
    ],
    subtotal,
    vat_amount: vat,
    total,
    currency: 'EUR',
    status: match.status,
    issued_at: match.issued_at,
    due_date: dueDate.toISOString(),
    paid_at: undefined,
    payment_method: 'bank_transfer',
    notes: 'Demo sąskaita. Nuolaidos kodas: DEMO10',
    pdf_url: undefined,
    created_at: createdAt,
    updated_at: createdAt,
  };

  return dbInvoice;
}
