// Invoice types for Yakiwood e-commerce platform

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // e.g., 0.21 for 21% VAT
  total: number;
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
  paymentMethod?: 'bank_transfer' | 'cash' | 'card' | 'stripe';
  paymentReference?: string;
  
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
  notes?: string;
  dueInDays?: number; // defaults to 14

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
