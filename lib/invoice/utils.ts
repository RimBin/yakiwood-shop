// Invoice utilities for Yakiwood
import type { Invoice, InvoiceItem, InvoiceSettings, InvoiceGenerateRequest } from '@/types/invoice';

// Default settings for Yakiwood invoices
export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  series: 'YW',
  nextSequenceNumber: 1,
  seller: {
    name: 'Yakiwood',
    companyName: 'UAB "Yakiwood"',
    companyCode: '123456789',
    vatCode: 'LT123456789012',
    address: 'Gedimino pr. 1',
    city: 'Vilnius',
    postalCode: '01103',
    country: 'Lietuva',
    phone: '+370 600 00000',
    email: 'info@yakiwood.lt'
  },
  bankName: 'Swedbank',
  bankAccount: 'LT00 0000 0000 0000 0000',
  swift: 'HABALT22',
  termsAndConditions: 'Apmokėjimas per 14 dienų nuo sąskaitos išrašymo datos. Vėluojant apmokėti taikomos 0.05% delspinigiai nuo neapmokėtos sumos už kiekvieną uždelstą dieną.',
  vatRate: 0.21 // 21% PVM Lietuvoje
};

// Calculate item total with VAT
export function calculateItemTotal(
  quantity: number,
  unitPrice: number,
  vatRate: number
): number {
  return quantity * unitPrice * (1 + vatRate);
}

// Calculate invoice totals
export function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotal: number;
  totalVat: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
  
  const totalVat = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice * item.vatRate);
  }, 0);
  
  const total = subtotal + totalVat;
  
  return { subtotal, totalVat, total };
}

// Generate invoice number
export function generateInvoiceNumber(series: string, sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedNumber = sequenceNumber.toString().padStart(5, '0');
  return `${series}-${year}-${paddedNumber}`;
}

// Create invoice from cart items
export function createInvoice(
  request: InvoiceGenerateRequest,
  settings: InvoiceSettings = DEFAULT_INVOICE_SETTINGS
): Invoice {
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + (request.dueInDays || 14));
  
  // Calculate totals for items
  const items: InvoiceItem[] = request.items.map(item => {
    const total = calculateItemTotal(item.quantity, item.unitPrice, item.vatRate);
    return { ...item, total };
  });
  
  const totals = calculateInvoiceTotals(items);
  const invoiceNumber = generateInvoiceNumber(settings.series, settings.nextSequenceNumber);
  
  return {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    series: settings.series,
    sequenceNumber: settings.nextSequenceNumber,
    status: 'issued',
    
    issueDate: now.toISOString(),
    dueDate: dueDate.toISOString(),
    
    seller: settings.seller,
    buyer: request.buyer,
    
    items,
    
    subtotal: totals.subtotal,
    totalVat: totals.totalVat,
    total: totals.total,
    
    paymentMethod: request.paymentMethod,
    bankName: settings.bankName,
    bankAccount: settings.bankAccount,
    swift: settings.swift,
    
    notes: request.notes,
    termsAndConditions: settings.termsAndConditions,
    
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

// Get all invoices from localStorage
export function getInvoices(): Invoice[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('invoices');
  return stored ? JSON.parse(stored) : [];
}

// Save invoice to localStorage
export function saveInvoice(invoice: Invoice): void {
  if (typeof window === 'undefined') return;
  
  const invoices = getInvoices();
  const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (existingIndex >= 0) {
    invoices[existingIndex] = { ...invoice, updatedAt: new Date().toISOString() };
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem('invoices', JSON.stringify(invoices));
  
  // Update next sequence number
  const settings = getInvoiceSettings();
  settings.nextSequenceNumber = Math.max(settings.nextSequenceNumber, invoice.sequenceNumber + 1);
  saveInvoiceSettings(settings);
}

// Get invoice by ID
export function getInvoiceById(id: string): Invoice | null {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === id) || null;
}

// Delete invoice
export function deleteInvoice(id: string): void {
  if (typeof window === 'undefined') return;
  
  const invoices = getInvoices();
  const filtered = invoices.filter(inv => inv.id !== id);
  localStorage.setItem('invoices', JSON.stringify(filtered));
}

// Get invoice settings
export function getInvoiceSettings(): InvoiceSettings {
  if (typeof window === 'undefined') return DEFAULT_INVOICE_SETTINGS;
  
  const stored = localStorage.getItem('invoice_settings');
  return stored ? JSON.parse(stored) : DEFAULT_INVOICE_SETTINGS;
}

// Save invoice settings
export function saveInvoiceSettings(settings: InvoiceSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('invoice_settings', JSON.stringify(settings));
}

// Update invoice status
export function updateInvoiceStatus(id: string, status: Invoice['status']): void {
  const invoice = getInvoiceById(id);
  if (invoice) {
    invoice.status = status;
    invoice.updatedAt = new Date().toISOString();
    
    if (status === 'paid') {
      invoice.paymentDate = new Date().toISOString();
    }
    
    saveInvoice(invoice);
  }
}
