// PDF Invoice Generator for Yakiwood
// Generates professional Lithuanian invoices with company branding

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, InvoiceItem } from '@/types/invoice';

export type InvoiceLocale = 'lt' | 'en';

type InvoiceStrings = {
  invoiceTitle: string;
  headerTitleFallback: string;
  seriesAndNumber: string;
  issueDate: string;
  orderNumber: string;
  dueDate: string;
  seller: string;
  buyer: string;
  document: string;
  companyCode: string;
  vatCode: string;
  tableHead: [string, string, string, string, string];
  subtotalExVat: string;
  totalInclVat: string;
  advancePaid: string;
  remainingDue: string;
  vatAmount: string;
  total: string;
};

function getInvoiceStrings(locale: InvoiceLocale): InvoiceStrings {
  if (locale === 'en') {
    return {
      invoiceTitle: 'VAT INVOICE',
      headerTitleFallback: 'Production - Shou sugi ban',
      seriesAndNumber: 'Series / No:',
      issueDate: 'Date:',
      orderNumber: 'Order No:',
      dueDate: 'Due date:',
      seller: 'SELLER',
      buyer: 'BUYER',
      document: 'DOCUMENT',
      companyCode: 'Company code:',
      vatCode: 'VAT code:',
      tableHead: ['Item', 'Quantity', 'Unit', 'Unit price', 'Total excl. VAT'],
      subtotalExVat: 'Subtotal (excl. VAT):',
      vatAmount: 'VAT amount:',
      totalInclVat: 'Total incl. VAT:',
      advancePaid: 'Advance paid:',
      remainingDue: 'Remaining due:',
      total: 'TOTAL:',
    };
  }

  return {
    invoiceTitle: 'PVM SĄSKAITA FAKTŪRA',
    headerTitleFallback: 'Production - Shou sugi ban',
    seriesAndNumber: 'Serija / Nr.:',
    issueDate: 'Data:',
    orderNumber: 'Užsakymo Nr.:',
    dueDate: 'Apmokėti iki:',
    seller: 'PARDAVĖJAS',
    buyer: 'PIRKĖJAS',
    document: 'DOKUMENTAS',
    companyCode: 'Į. k.:',
    vatCode: 'PVM mok. kodas:',
    tableHead: ['Prekė / Paslauga', 'Kiekis', 'Vnt.', 'Vnt. kaina', 'Suma be PVM'],
    subtotalExVat: 'Suma be PVM:',
    vatAmount: 'PVM suma:',
    totalInclVat: 'Suma su PVM:',
    advancePaid: 'Avansas apmokėtas:',
    remainingDue: 'Mokėtina suma:',
    total: 'VISO:',
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
    // Default to EN to match the provided invoice template/screenshot.
    this.locale = options?.locale || 'en';
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
    const currency = this.invoice.currency || 'EUR';
    return `${amount.toFixed(2)} ${currency}`;
  }

  private formatQty(value: number): string {
    return `${(Number(value) || 0).toFixed(2)}`;
  }

  private computeAdvancePaid(): number {
    const payments = Array.isArray(this.invoice.payments) ? this.invoice.payments : [];
    const paid = payments
      .filter((p) => p && p.status === 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    if (paid > 0) return paid;
    if (this.invoice.status === 'paid' || !!this.invoice.paymentDate) return this.invoice.total;
    return 0;
  }

  private computeRemainingDue(): number {
    const remaining = this.invoice.total - this.computeAdvancePaid();
    return remaining < 0 ? 0 : remaining;
  }

  private addHeader() {
    const pageWidth = this.doc.internal.pageSize.getWidth();

    // Top black bar
    this.doc.setFillColor(22, 22, 22);
    this.doc.rect(0, 0, pageWidth, 28, 'F');

    // Brand (left)
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(26);
    this.doc.text('YAKIWOOD', 20, 18);

    // Header title (center)
    const headerTitle = this.invoice.documentTitle || this.strings.headerTitleFallback;
    this.doc.setFontSize(11);
    this.doc.text(headerTitle, pageWidth / 2, 16, { align: 'center' });

    // Reset text color
    this.doc.setTextColor(0, 0, 0);

    // Title
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(16);
    this.doc.text(this.strings.invoiceTitle, 20, 45);
  }

  private addParties() {
    const startY = 55;

    const colSellerX = 20;
    const colBuyerX = 90;
    const colDocX = 150;

    const headingY = startY;
    const contentY = startY + 7;
    const lineH = 4;

    // Headings
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.text(this.strings.seller, colSellerX, headingY);
    this.doc.text(this.strings.buyer, colBuyerX, headingY);
    this.doc.text(this.strings.document, colDocX, headingY);

    // Content
    this.doc.setFontSize(8.5);

    let yLeft = contentY;
    this.doc.text(this.invoice.seller.companyName || this.invoice.seller.name, colSellerX, yLeft);
    yLeft += lineH;
    if (this.invoice.seller.companyCode) {
      this.doc.text(`${this.strings.companyCode} ${this.invoice.seller.companyCode}`, colSellerX, yLeft);
      yLeft += lineH;
    }
    if (this.invoice.seller.vatCode) {
      this.doc.text(`${this.strings.vatCode} ${this.invoice.seller.vatCode}`, colSellerX, yLeft);
      yLeft += lineH;
    }
    this.doc.text(`Address: ${this.invoice.seller.address}`, colSellerX, yLeft);
    yLeft += lineH;
    this.doc.text(`${this.invoice.seller.postalCode} ${this.invoice.seller.city}`, colSellerX, yLeft);
    yLeft += lineH;
    this.doc.text(this.invoice.seller.country, colSellerX, yLeft);
    yLeft += lineH;
    if (this.invoice.seller.email) {
      this.doc.text(`Email: ${this.invoice.seller.email}`, colSellerX, yLeft);
    }

    let yMid = contentY;
    this.doc.text(this.invoice.buyer.companyName || this.invoice.buyer.name, colBuyerX, yMid);
    yMid += lineH;
    if (this.invoice.buyer.companyCode) {
      this.doc.text(`${this.strings.companyCode} ${this.invoice.buyer.companyCode}`, colBuyerX, yMid);
      yMid += lineH;
    }
    if (this.invoice.buyer.vatCode) {
      this.doc.text(`${this.strings.vatCode} ${this.invoice.buyer.vatCode}`, colBuyerX, yMid);
      yMid += lineH;
    }
    this.doc.text(this.invoice.buyer.address, colBuyerX, yMid);
    yMid += lineH;
    this.doc.text(`${this.invoice.buyer.postalCode} ${this.invoice.buyer.city}`, colBuyerX, yMid);
    yMid += lineH;
    this.doc.text(this.invoice.buyer.country, colBuyerX, yMid);

    const orderNo = this.invoice.orderNumber || this.invoice.invoiceNumber;
    let yDoc = contentY;
    this.doc.text(`${this.strings.seriesAndNumber} ${this.invoice.invoiceNumber}`, colDocX, yDoc);
    yDoc += lineH;
    this.doc.text(`${this.strings.issueDate} ${this.formatDate(this.invoice.issueDate)}`, colDocX, yDoc);
    yDoc += lineH;
    this.doc.text(`${this.strings.orderNumber} ${orderNo}`, colDocX, yDoc);
  }

  private addItemsTable() {
    const tableData = this.invoice.items.map((item) => {
      const unit = item.unit || 'vnt';
      const lineNet = typeof item.totalExclVat === 'number' ? item.totalExclVat : item.quantity * item.unitPrice;
      return [
        item.name,
        this.formatQty(item.quantity),
        unit,
        this.formatCurrency(item.unitPrice),
        this.formatCurrency(lineNet),
      ];
    });

    autoTable(this.doc, {
      startY: 95,
      head: [this.strings.tableHead],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontStyle: 'normal'
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: 'right' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 20, right: 20 }
    });
  }

  private addFooter() {
    const finalY = (this.doc as any).lastAutoTable.finalY + 20;
    const rightX = this.doc.internal.pageSize.getWidth() - 20;

    const subtotal = this.invoice.subtotal;
    const vat = this.invoice.totalVat;
    const total = this.invoice.total;
    const paid = this.computeAdvancePaid();
    const remaining = this.computeRemainingDue();

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    const labelX = rightX - 55;
    const valueX = rightX;
    const lineH = 6;
    let y = finalY;

    const drawLine = (label: string, value: string, bold = false) => {
      this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
      this.doc.text(label, labelX, y, { align: 'right' });
      this.doc.text(value, valueX, y, { align: 'right' });
      y += lineH;
    };

    drawLine(this.strings.subtotalExVat, this.formatCurrency(subtotal));
    drawLine(this.strings.vatAmount, this.formatCurrency(vat));
    drawLine(this.strings.totalInclVat, this.formatCurrency(total), true);
    y += 4;
    drawLine(this.strings.advancePaid, this.formatCurrency(paid));
    drawLine(this.strings.remainingDue, this.formatCurrency(remaining), true);
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
