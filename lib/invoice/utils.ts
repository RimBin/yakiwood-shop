// Invoice utilities for Yakiwood
import type { Invoice, InvoiceItem, InvoiceSettings, InvoiceGenerateRequest } from '@/types/invoice';

// Default settings for Yakiwood invoices
export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  series: 'YW',
  nextSequenceNumber: 1,
  seller: {
    name: 'UAB YAKIWOOD',
    companyName: 'UAB YAKIWOOD',
    companyCode: '305636457',
    vatCode: 'LT100013670911',
    address: 'Butrimonių g. 7',
    city: 'Kaunas',
    postalCode: 'LT-50218',
    country: 'Lietuva',
    email: 'sales@yakiwood.eu'
  },
  bankName: 'Swedbank',
  bankAccount: 'LT00 0000 0000 0000 0000',
  swift: 'HABALT22',
  termsAndConditions: 'Apmokėjimas per 14 dienų nuo sąskaitos išrašymo datos. Vėluojant apmokėti taikomos 0.05% delspinigiai nuo neapmokėtos sumos už kiekvieną uždelstą dieną.',
  vatRate: 0.21 // 21% PVM Lietuvoje
};

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function splitGrossToNet(gross: number, vatRate: number): { net: number; vat: number; gross: number } {
  const grossSafe = Number(gross) || 0;
  const rate = Number(vatRate) || 0;
  if (grossSafe <= 0 || rate <= 0) return { net: round2(grossSafe), vat: 0, gross: round2(grossSafe) };
  const net = grossSafe / (1 + rate);
  const vat = grossSafe - net;
  return { net: round2(net), vat: round2(vat), gross: round2(grossSafe) };
}

export function buildInvoiceItem(input: {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  unit?: string;
  pricesIncludeVat?: boolean;
}): InvoiceItem {
  const quantity = Number(input.quantity) || 0;
  const vatRate = Number(input.vatRate) || 0;
  const unit = input.unit;
  const unitPriceRaw = Number(input.unitPrice) || 0;

  const unitNet = input.pricesIncludeVat ? splitGrossToNet(unitPriceRaw, vatRate).net : unitPriceRaw;
  const unitGross = input.pricesIncludeVat ? unitPriceRaw : unitNet * (1 + vatRate);

  const lineNet = quantity * unitNet;
  const lineVat = lineNet * vatRate;
  const lineGross = lineNet + lineVat;

  return {
    id: input.id,
    name: input.name,
    description: input.description,
    quantity: round2(quantity),
    unit,
    unitPrice: round2(unitNet),
    unitPriceInclVat: round2(unitGross),
    vatRate,
    totalExclVat: round2(lineNet),
    vatAmount: round2(lineVat),
    totalInclVat: round2(lineGross),
    total: round2(lineGross),
  };
}

// Calculate invoice totals
export function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotal: number;
  totalVat: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.totalExclVat) || item.quantity * item.unitPrice), 0);
  const totalVat = items.reduce((sum, item) => sum + (Number(item.vatAmount) || item.quantity * item.unitPrice * item.vatRate), 0);
  const total = items.reduce((sum, item) => sum + (Number(item.totalInclVat) || item.total), 0);

  return { subtotal: round2(subtotal), totalVat: round2(totalVat), total: round2(total) };
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
  
  const pricesIncludeVat = request.pricesIncludeVat === true;

  const items: InvoiceItem[] = request.items.map((item) =>
    buildInvoiceItem({
      ...item,
      pricesIncludeVat,
      unit: item.unit || (pricesIncludeVat ? 'vnt' : item.unit),
    })
  );
  
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
    
    orderId: request.orderId,
    orderNumber: request.orderNumber,
    documentTitle: request.documentTitle,
    paymentMethod: request.paymentMethod,
    payments: request.payments,
    bankName: settings.bankName,
    bankAccount: settings.bankAccount,
    swift: settings.swift,
    
    notes: request.notes,
    termsAndConditions: settings.termsAndConditions,
    
    currency: request.currency || settings.currency || 'EUR',
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
