// PDF Invoice Generator for Yakiwood
// Generates professional Lithuanian invoices with company branding

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, InvoiceItem } from '@/types/invoice';

export type InvoiceLocale = 'lt' | 'en';

type InvoiceStrings = {
  invoiceTitle: string;
  seriesAndNumber: string;
  issueDate: string;
  dueDate: string;
  seller: string;
  buyer: string;
  companyCode: string;
  vatCode: string;
  bankDetails: string;
  bank: string;
  account: string;
  swift: string;
  tableHead: [string, string, string, string, string, string];
  subtotalExVat: string;
  vatAmount: string;
  total: string;
  paymentMethodLabel: string;
  paymentMethods: Record<string, string>;
  page: string;
  of: string;
  defaultTerms: string;
};

function getInvoiceStrings(locale: InvoiceLocale): InvoiceStrings {
  if (locale === 'en') {
    return {
      invoiceTitle: 'INVOICE',
      seriesAndNumber: 'Series and number:',
      issueDate: 'Issue date:',
      dueDate: 'Due date:',
      seller: 'SELLER:',
      buyer: 'BUYER:',
      companyCode: 'Company code:',
      vatCode: 'VAT code:',
      bankDetails: 'Bank details:',
      bank: 'Bank:',
      account: 'Account:',
      swift: 'SWIFT:',
      tableHead: ['No.', 'Product / Service', 'Qty', 'Price', 'VAT', 'Amount'],
      subtotalExVat: 'Subtotal (excl. VAT):',
      vatAmount: 'VAT amount:',
      total: 'TOTAL:',
      paymentMethodLabel: 'Payment method:',
      paymentMethods: {
        bank_transfer: 'Bank transfer',
        cash: 'Cash',
        card: 'Card payment',
        stripe: 'Online payment',
      },
      page: 'Page',
      of: 'of',
      defaultTerms:
        'Payment due within 14 days from the invoice date. Late payments may incur 0.05% daily interest on the outstanding amount.',
    };
  }

  return {
    invoiceTitle: 'SĄSKAITA FAKTŪRA',
    seriesAndNumber: 'Serija ir numeris:',
    issueDate: 'Išrašymo data:',
    dueDate: 'Apmokėti iki:',
    seller: 'PARDAVĖJAS:',
    buyer: 'PIRKĖJAS:',
    companyCode: 'Į. k.:',
    vatCode: 'PVM mok. kodas:',
    bankDetails: 'Banko rekvizitai:',
    bank: 'Bankas:',
    account: 'Sąskaita:',
    swift: 'SWIFT:',
    tableHead: ['Nr.', 'Prekė / Paslauga', 'Kiekis', 'Kaina', 'PVM', 'Suma'],
    subtotalExVat: 'Suma be PVM:',
    vatAmount: 'PVM suma:',
    total: 'VISO:',
    paymentMethodLabel: 'Apmokėjimo būdas:',
    paymentMethods: {
      bank_transfer: 'Banko pavedimas',
      cash: 'Grynaisiais',
      card: 'Mokėjimo kortele',
      stripe: 'Elektroninis mokėjimas',
    },
    page: 'Puslapis',
    of: 'iš',
    defaultTerms:
      'Apmokėjimas per 14 dienų nuo sąskaitos išrašymo datos. Vėluojant apmokėti taikomos 0.05% delspinigiai nuo neapmokėtos sumos už kiekvieną uždelstą dieną.',
  };
}

export class InvoicePDFGenerator {
  private doc: jsPDF;
  private invoice: Invoice;
  private locale: InvoiceLocale;
  private strings: InvoiceStrings;
  
  constructor(invoice: Invoice, options?: { locale?: InvoiceLocale }) {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.invoice = invoice;
    this.locale = options?.locale || 'lt';
    this.strings = getInvoiceStrings(this.locale);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const dateLocale = this.locale === 'en' ? 'en-GB' : 'lt-LT';
    return date.toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} €`;
  }

  private addHeader() {
    // Company logo/name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('YAKIWOOD', 20, 20);
    
    // Invoice title
    this.doc.setFontSize(16);
    this.doc.text(this.strings.invoiceTitle, 20, 35);
    
    // Invoice number and date
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${this.strings.seriesAndNumber} ${this.invoice.invoiceNumber}`, 20, 45);
    this.doc.text(`${this.strings.issueDate} ${this.formatDate(this.invoice.issueDate)}`, 20, 50);
    this.doc.text(`${this.strings.dueDate} ${this.formatDate(this.invoice.dueDate)}`, 20, 55);
  }

  private addParties() {
    const startY = 65;
    
    // Seller (left column)
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.strings.seller, 20, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    let y = startY + 5;
    this.doc.text(this.invoice.seller.companyName || this.invoice.seller.name, 20, y);
    y += 4;
    if (this.invoice.seller.companyCode) {
      this.doc.text(`${this.strings.companyCode} ${this.invoice.seller.companyCode}`, 20, y);
      y += 4;
    }
    if (this.invoice.seller.vatCode) {
      this.doc.text(`${this.strings.vatCode} ${this.invoice.seller.vatCode}`, 20, y);
      y += 4;
    }
    this.doc.text(this.invoice.seller.address, 20, y);
    y += 4;
    this.doc.text(`${this.invoice.seller.postalCode} ${this.invoice.seller.city}`, 20, y);
    y += 4;
    this.doc.text(this.invoice.seller.country, 20, y);
    
    // Bank details
    if (this.invoice.bankAccount) {
      y += 6;
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(this.strings.bankDetails, 20, y);
      this.doc.setFont('helvetica', 'normal');
      y += 4;
      if (this.invoice.bankName) {
        this.doc.text(`${this.strings.bank} ${this.invoice.bankName}`, 20, y);
        y += 4;
      }
      this.doc.text(`${this.strings.account} ${this.invoice.bankAccount}`, 20, y);
      y += 4;
      if (this.invoice.swift) {
        this.doc.text(`${this.strings.swift} ${this.invoice.swift}`, 20, y);
      }
    }
    
    // Buyer (right column)
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.strings.buyer, 110, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    y = startY + 5;
    this.doc.text(this.invoice.buyer.companyName || this.invoice.buyer.name, 110, y);
    y += 4;
    if (this.invoice.buyer.companyCode) {
      this.doc.text(`${this.strings.companyCode} ${this.invoice.buyer.companyCode}`, 110, y);
      y += 4;
    }
    if (this.invoice.buyer.vatCode) {
      this.doc.text(`${this.strings.vatCode} ${this.invoice.buyer.vatCode}`, 110, y);
      y += 4;
    }
    this.doc.text(this.invoice.buyer.address, 110, y);
    y += 4;
    this.doc.text(`${this.invoice.buyer.postalCode} ${this.invoice.buyer.city}`, 110, y);
    y += 4;
    this.doc.text(this.invoice.buyer.country, 110, y);
    
    if (this.invoice.buyer.phone) {
      y += 4;
      this.doc.text(`Tel.: ${this.invoice.buyer.phone}`, 110, y);
    }
    if (this.invoice.buyer.email) {
      y += 4;
      this.doc.text(`El. p.: ${this.invoice.buyer.email}`, 110, y);
    }
  }

  private addItemsTable() {
    const tableData = this.invoice.items.map((item, index) => [
      (index + 1).toString(),
      item.name,
      item.quantity.toString(),
      this.formatCurrency(item.unitPrice),
      `${(item.vatRate * 100).toFixed(0)}%`,
      this.formatCurrency(item.total)
    ]);

    autoTable(this.doc, {
      startY: 140,
      head: [this.strings.tableHead],
      body: tableData,
      foot: [
        ['', '', '', '', this.strings.subtotalExVat, this.formatCurrency(this.invoice.subtotal)],
        ['', '', '', '', this.strings.vatAmount, this.formatCurrency(this.invoice.totalVat)],
        ['', '', '', '', this.strings.total, this.formatCurrency(this.invoice.total)]
      ],
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [22, 22, 22], // #161616
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [234, 234, 234], // #EAEAEA
        textColor: [22, 22, 22],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }

  private addFooter() {
    const finalY = (this.doc as any).lastAutoTable.finalY + 15;
    
    // Payment info
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.strings.paymentMethodLabel, 20, finalY);
    this.doc.setFont('helvetica', 'normal');

    const paymentMethod =
      this.strings.paymentMethods[this.invoice.paymentMethod || 'bank_transfer'] ||
      (this.locale === 'en' ? 'Not specified' : 'Nenurodyta');
    this.doc.text(paymentMethod, 55, finalY);
    
    // Notes
    if (this.invoice.notes) {
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'italic');
      const splitNotes = this.doc.splitTextToSize(this.invoice.notes, 170);
      this.doc.text(splitNotes, 20, finalY + 10);
    }
    
    // Terms and conditions
    const terms = this.invoice.termsAndConditions || this.strings.defaultTerms;
    if (terms) {
      const termsY = finalY + (this.invoice.notes ? 20 : 10);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      const splitTerms = this.doc.splitTextToSize(terms, 170);
      this.doc.text(splitTerms, 20, termsY);
    }
    
    // Footer with page number
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(128);
      this.doc.text(
        `${this.strings.page} ${i} ${this.strings.of} ${pageCount}`,
        this.doc.internal.pageSize.getWidth() / 2,
        this.doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  }

  public generate(): Uint8Array {
    this.addHeader();
    this.addParties();
    this.addItemsTable();
    this.addFooter();
    
    return new Uint8Array(this.doc.output('arraybuffer'));
  }

  public generateBuffer(): Uint8Array {
    return this.generate();
  }

  public download(filename?: string): void {
    const name = filename || `saskaita_${this.invoice.invoiceNumber}.pdf`;
    this.doc.save(name);
  }

  public getBlob(): Blob {
    return this.doc.output('blob');
  }
}

// Helper function to generate invoice PDF
export async function generateInvoicePDF(invoice: Invoice): Promise<Uint8Array> {
  const generator = new InvoicePDFGenerator(invoice);
  return generator.generate();
}

// Helper function to download invoice PDF
export function downloadInvoicePDF(invoice: Invoice, filename?: string): void {
  const generator = new InvoicePDFGenerator(invoice);
  generator.download(filename);
}
