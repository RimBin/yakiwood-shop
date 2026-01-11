// Invoice types for Yakiwood e-commerce platform

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  /** Unit of measure (e.g. m², vnt). Optional for legacy invoices. */
  unit?: string;

  /** Unit price excluding VAT (NET). */
  unitPrice: number;
  /** Unit price including VAT (GROSS). Optional for legacy invoices. */
  unitPriceInclVat?: number;

  vatRate: number; // e.g., 0.21 for 21% VAT

  /** Line total excluding VAT (NET). Optional for legacy invoices. */
  totalExclVat?: number;
  /** VAT amount for this line. Optional for legacy invoices. */
  vatAmount?: number;
  /** Line total including VAT (GROSS). Optional for legacy invoices. */
  totalInclVat?: number;

  /**
   * Back-compat: historically used as the line total.
   * Going forward, we store it as line total INCLUDING VAT.
   */
  total: number;
}

export type InvoicePaymentMethod = 'bank_transfer' | 'cash' | 'card' | 'stripe' | 'paypal' | 'manual';

export type InvoicePaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface InvoicePayment {
  id: string;
  method: InvoicePaymentMethod;
  amount: number;
  currency: string; // usually EUR
  date: string; // ISO timestamp
  status: InvoicePaymentStatus;
  reference?: string;
  provider?: {
    kind: 'stripe' | 'paypal';
    stripeSessionId?: string;
    stripePaymentIntent?: string;
    paypalOrderId?: string;
  };
  note?: string;
}

export interface InvoiceAddress {
  name: string;
  companyName?: string;
  companyCode?: string;
  vatCode?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  series: string; // e.g., "YW" for Yakiwood
  sequenceNumber: number;
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';

  // DB linkage / exports
  orderId?: string;
  /** Human-friendly order number for rendering PDFs. */
  orderNumber?: string;
  /** Optional title displayed in the PDF header bar. */
  documentTitle?: string;
  pdfUrl?: string;
  currency?: string; // defaults to EUR when omitted
  
  // Dates
  issueDate: string; // ISO date
  dueDate: string; // ISO date
  paymentDate?: string; // ISO date
  
  // Parties
  seller: InvoiceAddress;
  buyer: InvoiceAddress;
  
  // Items
  items: InvoiceItem[];
  
  // Amounts
  subtotal: number;
  totalVat: number;
  total: number;
  
  // Payment
  paymentMethod?: InvoicePaymentMethod;
  paymentReference?: string;

  /** Optional payments list (supports multiple/partial payments). */
  payments?: InvoicePayment[];
  
  // Bank details
  bankName?: string;
  bankAccount?: string;
  swift?: string;
  
  // Notes
  notes?: string;
  termsAndConditions?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface InvoiceGenerateRequest {
  buyer: InvoiceAddress;
  items: Omit<InvoiceItem, 'total'>[];
  paymentMethod?: Invoice['paymentMethod'];
  /** Optional payments list (supports multiple/partial payments). */
  payments?: InvoicePayment[];
  notes?: string;
  dueInDays?: number; // defaults to 14

  /** If true, input item unitPrice is treated as GROSS (incl. VAT). Default: false (NET). */
  pricesIncludeVat?: boolean;

  orderNumber?: string;
  documentTitle?: string;

  // Optional metadata (useful for DB-backed flows)
  orderId?: string;
  currency?: string; // defaults to EUR when omitted
}

export interface InvoiceSettings {
  series: string;
  nextSequenceNumber: number;
  seller: InvoiceAddress;
  bankName: string;
  bankAccount: string;
  swift: string;
  termsAndConditions: string;
  vatRate: number; // default VAT rate

  currency?: string; // defaults to EUR when omitted
}
