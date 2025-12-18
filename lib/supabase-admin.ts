import { createClient } from '@supabase/supabase-js';
import type { Invoice, InvoiceGenerateRequest } from '@/types/invoice';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Service role client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface Order {
  id: string;
  order_number: string;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  items: any[];
  subtotal: number;
  vat_amount: number;
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  paid_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface DBInvoice {
  id: string;
  invoice_number: string;
  order_id?: string;
  seller_name: string;
  seller_company_code?: string;
  seller_vat_code?: string;
  seller_address: string;
  seller_city: string;
  seller_postal_code?: string;
  seller_country: string;
  seller_phone?: string;
  seller_email?: string;
  seller_bank_name?: string;
  seller_bank_account?: string;
  buyer_name: string;
  buyer_company_name?: string;
  buyer_company_code?: string;
  buyer_vat_code?: string;
  buyer_address: string;
  buyer_city: string;
  buyer_postal_code?: string;
  buyer_country: string;
  buyer_phone?: string;
  buyer_email?: string;
  items: any[];
  subtotal: number;
  vat_amount: number;
  total: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  issued_at: string;
  due_date: string;
  paid_at?: string;
  payment_method: 'bank_transfer' | 'cash' | 'card' | 'stripe';
  notes?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

// ==================== ORDERS ====================

export async function createOrder(data: {
  orderNumber: string;
  stripeSessionId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: any[];
  subtotal: number;
  vatAmount: number;
  total: number;
  currency?: string;
  notes?: string;
}): Promise<Order | null> {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number: data.orderNumber,
      stripe_session_id: data.stripeSessionId,
      customer_email: data.customerEmail,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_address: data.customerAddress,
      items: data.items,
      subtotal: data.subtotal,
      vat_amount: data.vatAmount,
      total: data.total,
      currency: data.currency || 'EUR',
      status: 'pending',
      payment_status: 'pending',
      notes: data.notes
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    return null;
  }

  return order;
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['payment_status']
): Promise<boolean> {
  const updates: any = { status };
  
  if (paymentStatus) {
    updates.payment_status = paymentStatus;
  }

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  if (paymentStatus === 'paid') {
    updates.paid_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order:', error);
    return false;
  }

  return true;
}

export async function getAllOrders(limit = 100): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

// ==================== INVOICES ====================

export async function saveInvoiceToDatabase(invoice: Invoice, orderId?: string): Promise<DBInvoice | null> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert({
      invoice_number: invoice.invoiceNumber,
      order_id: orderId,
      
      // Seller
      seller_name: invoice.seller.name,
      seller_company_code: invoice.seller.companyCode,
      seller_vat_code: invoice.seller.vatCode,
      seller_address: invoice.seller.address,
      seller_city: invoice.seller.city,
      seller_postal_code: invoice.seller.postalCode,
      seller_country: invoice.seller.country,
      seller_phone: invoice.seller.phone,
      seller_email: invoice.seller.email,
      
      // Buyer
      buyer_name: invoice.buyer.name,
      buyer_company_name: invoice.buyer.companyName,
      buyer_company_code: invoice.buyer.companyCode,
      buyer_vat_code: invoice.buyer.vatCode,
      buyer_address: invoice.buyer.address,
      buyer_city: invoice.buyer.city,
      buyer_postal_code: invoice.buyer.postalCode,
      buyer_country: invoice.buyer.country,
      buyer_phone: invoice.buyer.phone,
      buyer_email: invoice.buyer.email,
      
      // Items and amounts
      items: invoice.items,
      subtotal: invoice.subtotal,
      vat_amount: invoice.totalVat,
      total: invoice.total,
      currency: 'EUR',
      
      // Status and dates
      status: invoice.status,
      issued_at: invoice.issueDate,
      due_date: invoice.dueDate,
      paid_at: invoice.paymentDate,
      payment_method: invoice.paymentMethod,
      notes: invoice.notes
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving invoice:', error);
    return null;
  }

  return data;
}

export async function getInvoiceById(id: string): Promise<DBInvoice | null> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data;
}

export async function getInvoiceByNumber(invoiceNumber: string): Promise<DBInvoice | null> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('invoice_number', invoiceNumber)
    .single();

  if (error) {
    console.error('Error fetching invoice:', error);
    return null;
  }

  return data;
}

export async function getAllInvoices(limit = 100): Promise<DBInvoice[]> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .order('issued_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }

  return data || [];
}

export async function updateInvoiceStatus(
  id: string,
  status: DBInvoice['status']
): Promise<boolean> {
  const updates: any = { status };
  
  if (status === 'paid') {
    updates.paid_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from('invoices')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating invoice:', error);
    return false;
  }

  return true;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }

  return true;
}

// ==================== HELPERS ====================

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `YW-${year}${month}${day}-${random}`;
}

export function convertDBInvoiceToInvoice(dbInvoice: DBInvoice): Invoice {
  return {
    id: dbInvoice.id,
    invoiceNumber: dbInvoice.invoice_number,
    series: dbInvoice.invoice_number.split('-')[0] || 'YW',
    sequenceNumber: parseInt(dbInvoice.invoice_number.split('-').pop() || '0'),
    seller: {
      name: dbInvoice.seller_name,
      companyCode: dbInvoice.seller_company_code,
      vatCode: dbInvoice.seller_vat_code,
      address: dbInvoice.seller_address,
      city: dbInvoice.seller_city,
      postalCode: dbInvoice.seller_postal_code || '',
      country: dbInvoice.seller_country,
      phone: dbInvoice.seller_phone,
      email: dbInvoice.seller_email
    },
    buyer: {
      name: dbInvoice.buyer_name,
      companyName: dbInvoice.buyer_company_name,
      companyCode: dbInvoice.buyer_company_code,
      vatCode: dbInvoice.buyer_vat_code,
      address: dbInvoice.buyer_address,
      city: dbInvoice.buyer_city,
      postalCode: dbInvoice.buyer_postal_code || '',
      country: dbInvoice.buyer_country,
      phone: dbInvoice.buyer_phone,
      email: dbInvoice.buyer_email
    },
    items: dbInvoice.items,
    subtotal: Number(dbInvoice.subtotal),
    totalVat: Number(dbInvoice.vat_amount),
    total: Number(dbInvoice.total),
    status: dbInvoice.status,
    issueDate: dbInvoice.issued_at,
    dueDate: dbInvoice.due_date,
    paymentDate: dbInvoice.paid_at,
    paymentMethod: dbInvoice.payment_method,
    notes: dbInvoice.notes,
    createdAt: dbInvoice.created_at,
    updatedAt: dbInvoice.updated_at
  };
}
