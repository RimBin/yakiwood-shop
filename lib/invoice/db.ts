import type { Invoice } from '@/types/invoice';

export interface DBInvoiceRow {
  id: string;
  invoice_number: string;
  order_id?: string | null;

  seller_name: string;
  seller_company_code?: string | null;
  seller_vat_code?: string | null;
  seller_address: string;
  seller_city: string;
  seller_postal_code?: string | null;
  seller_country: string;
  seller_phone?: string | null;
  seller_email?: string | null;
  seller_bank_name?: string | null;
  seller_bank_account?: string | null;

  buyer_name: string;
  buyer_company_name?: string | null;
  buyer_company_code?: string | null;
  buyer_vat_code?: string | null;
  buyer_address: string;
  buyer_city: string;
  buyer_postal_code?: string | null;
  buyer_country: string;
  buyer_phone?: string | null;
  buyer_email?: string | null;

  items: any[];
  subtotal: number | string;
  vat_amount: number | string;
  total: number | string;
  currency: string;

  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';

  issued_at: string;
  due_date: string;
  paid_at?: string | null;

  payment_method: 'bank_transfer' | 'cash' | 'card' | 'stripe' | 'paypal' | 'manual';

  notes?: string | null;
  pdf_url?: string | null;

  created_at: string;
  updated_at: string;
}

export function convertDBInvoiceToInvoice(dbInvoice: DBInvoiceRow): Invoice {
  return {
    id: dbInvoice.id,
    invoiceNumber: dbInvoice.invoice_number,
    series: dbInvoice.invoice_number.split('-')[0] || 'YW',
    sequenceNumber: parseInt(dbInvoice.invoice_number.split('-').pop() || '0'),
    seller: {
      name: dbInvoice.seller_name,
      companyCode: dbInvoice.seller_company_code || undefined,
      vatCode: dbInvoice.seller_vat_code || undefined,
      address: dbInvoice.seller_address,
      city: dbInvoice.seller_city,
      postalCode: dbInvoice.seller_postal_code || '',
      country: dbInvoice.seller_country,
      phone: dbInvoice.seller_phone || undefined,
      email: dbInvoice.seller_email || undefined,
    },
    buyer: {
      name: dbInvoice.buyer_name,
      companyName: dbInvoice.buyer_company_name || undefined,
      companyCode: dbInvoice.buyer_company_code || undefined,
      vatCode: dbInvoice.buyer_vat_code || undefined,
      address: dbInvoice.buyer_address,
      city: dbInvoice.buyer_city,
      postalCode: dbInvoice.buyer_postal_code || '',
      country: dbInvoice.buyer_country,
      phone: dbInvoice.buyer_phone || undefined,
      email: dbInvoice.buyer_email || undefined,
    },
    items: (dbInvoice.items || []) as any,
    subtotal: Number(dbInvoice.subtotal),
    totalVat: Number(dbInvoice.vat_amount),
    total: Number(dbInvoice.total),
    status: dbInvoice.status,
    issueDate: dbInvoice.issued_at,
    dueDate: dbInvoice.due_date,
    paymentDate: dbInvoice.paid_at || undefined,
    paymentMethod: dbInvoice.payment_method,
    bankName: dbInvoice.seller_bank_name || undefined,
    bankAccount: dbInvoice.seller_bank_account || undefined,
    notes: dbInvoice.notes || undefined,
    createdAt: dbInvoice.created_at,
    updatedAt: dbInvoice.updated_at,
  };
}
