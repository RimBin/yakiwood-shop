/**
 * Configuration PDF Generator (client-side)
 *
 * Generates a visual PDF quote/summary that includes:
 * - YAKIWOOD branding header
 * - 3D configurator screenshot
 * - Configuration details table
 * - Pricing breakdown
 * - Footer with date, validity, contact info, and shareable URL
 *
 * Uses jsPDF + jspdf-autotable (already installed in the project).
 * Runs entirely on the client — no server required.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConfigPDFLocale = 'lt' | 'en';

export interface ConfigurationPDFData {
  /** Product name (localised). */
  productName: string;
  /** Color name (localised). */
  colorName: string;
  /** Color hex for visual swatch. */
  colorHex?: string;
  /** Profile/finish name (localised). */
  profileName: string;
  /** Width in mm. */
  widthMm?: number;
  /** Length in mm. */
  lengthMm?: number;
  /** Thickness in mm. */
  thicknessMm?: number;
  /** Wood type (e.g. "spruce", "larch"). */
  woodType?: string;
  /** Usage type (e.g. "facade", "terrace"). */
  usageType?: string;

  // Pricing
  /** Price per m² (after modifiers). */
  pricePerM2?: number;
  /** Price per single board. */
  pricePerBoard?: number;
  /** Quantity in boards. */
  quantityBoards?: number;
  /** Total area in m². */
  totalAreaM2?: number;
  /** Line total. */
  lineTotal?: number;
  /** Volume discount percentage, if applied. */
  volumeDiscountPercent?: number;

  // Visuals
  /** 3D canvas screenshot as data-URL (image/png). */
  screenshotDataUrl?: string | null;

  // URL for QR / sharing
  /** Full URL of the configurator with current config params. */
  configUrl?: string;
}

// ---------------------------------------------------------------------------
// Locale strings
// ---------------------------------------------------------------------------

interface PDFStrings {
  title: string;
  subtitle: string;
  product: string;
  color: string;
  profile: string;
  width: string;
  length: string;
  thickness: string;
  woodType: string;
  usageType: string;
  pricePerM2: string;
  pricePerBoard: string;
  quantity: string;
  totalArea: string;
  lineTotal: string;
  volumeDiscount: string;
  dateLabel: string;
  validityNote: string;
  contactTitle: string;
  contactInfo: string;
  configLinkLabel: string;
  disclaimer: string;
  woodTypes: Record<string, string>;
  usageTypes: Record<string, string>;
}

function getStrings(locale: ConfigPDFLocale): PDFStrings {
  if (locale === 'en') {
    return {
      title: 'Configuration Quote',
      subtitle: 'Product configuration summary',
      product: 'Product',
      color: 'Color',
      profile: 'Profile',
      width: 'Width',
      length: 'Length',
      thickness: 'Thickness',
      woodType: 'Wood type',
      usageType: 'Usage',
      pricePerM2: 'Price per m²',
      pricePerBoard: 'Price per board',
      quantity: 'Quantity (boards)',
      totalArea: 'Total area',
      lineTotal: 'Total',
      volumeDiscount: 'Volume discount',
      dateLabel: 'Date',
      validityNote: 'This quote is valid for 14 days from the date above.',
      contactTitle: 'Contact us',
      contactInfo: 'info@yakiwood.lt  |  +370 600 00000  |  yakiwood.lt',
      configLinkLabel: 'Open this configuration online',
      disclaimer: 'Actual color and texture may differ slightly from the preview. Each board is unique due to the natural properties of wood and the Shou Sugi Ban burning process.',
      woodTypes: { spruce: 'Spruce', larch: 'Larch', accoya: 'Accoya' },
      usageTypes: { facade: 'Facade cladding', terrace: 'Terrace decking', interior: 'Interior', fence: 'Fence' },
    };
  }

  return {
    title: 'Konfigūracijos pasiūlymas',
    subtitle: 'Produkto konfigūracijos santrauka',
    product: 'Produktas',
    color: 'Spalva',
    profile: 'Profilis',
    width: 'Plotis',
    length: 'Ilgis',
    thickness: 'Storis',
    woodType: 'Medienos rūšis',
    usageType: 'Paskirtis',
    pricePerM2: 'Kaina už m²',
    pricePerBoard: 'Kaina už lentą',
    quantity: 'Kiekis (lentos)',
    totalArea: 'Bendras plotas',
    lineTotal: 'Viso',
    volumeDiscount: 'Tūrio nuolaida',
    dateLabel: 'Data',
    validityNote: 'Šis pasiūlymas galioja 14 dienų nuo aukščiau nurodytos datos.',
    contactTitle: 'Susisiekite',
    contactInfo: 'info@yakiwood.lt  |  +370 600 00000  |  yakiwood.lt',
    configLinkLabel: 'Atidaryti šią konfigūraciją internete',
    disclaimer: 'Tikroji spalva ir tekstūra gali šiek tiek skirtis nuo čia rodomos. Kiekviena lenta yra unikali dėl natūralios medienos savybių ir Shou Sugi Ban deginimo proceso.',
    woodTypes: { spruce: 'Eglė', larch: 'Maumedis', accoya: 'Accoya' },
    usageTypes: { facade: 'Fasado dailylentė', terrace: 'Terasinė lenta', interior: 'Interjeras', fence: 'Tvora' },
  };
}

// ---------------------------------------------------------------------------
// Font loading (client-side — fetches from /public/fonts/)
// ---------------------------------------------------------------------------

let _fontCache: { regular: string; bold: string } | null = null;

async function loadFontsBase64(): Promise<{ regular: string; bold: string } | null> {
  if (_fontCache) return _fontCache;

  try {
    const [regularBuf, boldBuf] = await Promise.all([
      fetch('/fonts/NotoSans-Regular.ttf').then((r) => r.arrayBuffer()),
      fetch('/fonts/NotoSans-Bold.ttf').then((r) => r.arrayBuffer()),
    ]);

    const toBase64 = (buf: ArrayBuffer) => {
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    _fontCache = { regular: toBase64(regularBuf), bold: toBase64(boldBuf) };
    return _fontCache;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Currency / number formatting
// ---------------------------------------------------------------------------

function fmtCurrency(value: number | undefined, locale: ConfigPDFLocale): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(locale === 'lt' ? 'lt-LT' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

function fmtNumber(value: number | undefined, decimals = 2): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return value.toFixed(decimals);
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

export async function generateConfigurationPDF(
  data: ConfigurationPDFData,
  locale: ConfigPDFLocale = 'lt',
): Promise<jsPDF> {
  const s = getStrings(locale);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // -- Register fonts -------------------------------------------------------
  const fonts = await loadFontsBase64();
  let baseFont = 'helvetica';
  if (fonts) {
    doc.addFileToVFS('NotoSans-Regular.ttf', fonts.regular);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFileToVFS('NotoSans-Bold.ttf', fonts.bold);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
    baseFont = 'NotoSans';
  }

  let y = 0;

  // -- Header bar -----------------------------------------------------------
  doc.setFillColor(22, 22, 22);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont(baseFont, 'normal');
  doc.setFontSize(22);
  doc.text('YAKIWOOD', 15, 17);

  doc.setFontSize(9);
  doc.text(s.subtitle, pageWidth - 15, 17, { align: 'right' });

  // -- Title ----------------------------------------------------------------
  doc.setTextColor(22, 22, 22);
  doc.setFont(baseFont, 'bold');
  doc.setFontSize(18);
  y = 40;
  doc.text(s.title, 15, y);

  // -- Date -----------------------------------------------------------------
  doc.setFont(baseFont, 'normal');
  doc.setFontSize(9);
  y += 8;
  const dateStr = new Date().toLocaleDateString(locale === 'lt' ? 'lt-LT' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`${s.dateLabel}: ${dateStr}`, 15, y);

  y += 10;

  // -- Screenshot -----------------------------------------------------------
  if (data.screenshotDataUrl) {
    try {
      const imgWidth = pageWidth - 30; // 15mm margins
      const imgHeight = imgWidth * 0.56; // ~16:9 ratio

      // Rounded rectangle background
      doc.setFillColor(234, 234, 234);
      doc.roundedRect(15, y, imgWidth, imgHeight, 4, 4, 'F');

      doc.addImage(data.screenshotDataUrl, 'PNG', 15, y, imgWidth, imgHeight);
      y += imgHeight + 8;
    } catch {
      // Image failed — skip
      y += 4;
    }
  }

  // -- Color swatch ---------------------------------------------------------
  if (data.colorHex) {
    try {
      const hex = data.colorHex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      doc.setFillColor(r, g, b);
      doc.roundedRect(15, y, 8, 8, 1, 1, 'F');

      doc.setDrawColor(187, 187, 187);
      doc.roundedRect(15, y, 8, 8, 1, 1, 'S');

      doc.setFont(baseFont, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(22, 22, 22);
      doc.text(`${data.colorName}  (${data.colorHex})`, 26, y + 6);
      y += 14;
    } catch {
      // Skip swatch on error
    }
  }

  // -- Configuration table --------------------------------------------------
  const tableBody: [string, string][] = [];

  tableBody.push([s.product, data.productName]);
  tableBody.push([s.color, data.colorName]);
  tableBody.push([s.profile, data.profileName]);

  if (data.woodType) {
    tableBody.push([s.woodType, s.woodTypes[data.woodType] ?? data.woodType]);
  }
  if (data.usageType) {
    tableBody.push([s.usageType, s.usageTypes[data.usageType] ?? data.usageType]);
  }
  if (data.widthMm) {
    tableBody.push([s.width, `${data.widthMm} mm`]);
  }
  if (data.lengthMm) {
    tableBody.push([s.length, `${data.lengthMm} mm`]);
  }
  if (data.thicknessMm) {
    tableBody.push([s.thickness, `${data.thicknessMm} mm`]);
  }

  autoTable(doc, {
    startY: y,
    head: [],
    body: tableBody,
    theme: 'plain',
    margin: { left: 15, right: 15 },
    styles: {
      font: baseFont,
      fontSize: 10,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      textColor: [22, 22, 22],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 'auto' },
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  y = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y + 40;
  y += 6;

  // -- Pricing table --------------------------------------------------------
  const priceBody: [string, string][] = [];

  if (data.pricePerM2) {
    priceBody.push([s.pricePerM2, fmtCurrency(data.pricePerM2, locale)]);
  }
  if (data.pricePerBoard) {
    priceBody.push([s.pricePerBoard, fmtCurrency(data.pricePerBoard, locale)]);
  }
  if (data.quantityBoards) {
    priceBody.push([s.quantity, String(data.quantityBoards)]);
  }
  if (data.totalAreaM2) {
    priceBody.push([s.totalArea, `${fmtNumber(data.totalAreaM2)} m²`]);
  }
  if (data.volumeDiscountPercent) {
    priceBody.push([s.volumeDiscount, `-${fmtNumber(data.volumeDiscountPercent, 1)}%`]);
  }
  if (data.lineTotal) {
    priceBody.push([s.lineTotal, fmtCurrency(data.lineTotal, locale)]);
  }

  if (priceBody.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [],
      body: priceBody,
      theme: 'plain',
      margin: { left: 15, right: 15 },
      styles: {
        font: baseFont,
        fontSize: 10,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        textColor: [22, 22, 22],
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 55 },
        1: { cellWidth: 'auto', halign: 'right' },
      },
      didParseCell(hookData) {
        // Highlight the total row
        const lastRowIdx = priceBody.length - 1;
        if (hookData.row.index === lastRowIdx) {
          hookData.cell.styles.fillColor = [22, 22, 22];
          hookData.cell.styles.textColor = [255, 255, 255];
          hookData.cell.styles.fontStyle = 'bold';
          hookData.cell.styles.fontSize = 12;
        }
      },
    });

    y = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y + 24;
    y += 8;
  }

  // -- Validity note --------------------------------------------------------
  doc.setFont(baseFont, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(s.validityNote, 15, y);
  y += 6;

  // -- Disclaimer -----------------------------------------------------------
  const disclaimerLines = doc.splitTextToSize(s.disclaimer, pageWidth - 30);
  doc.text(disclaimerLines, 15, y);
  y += disclaimerLines.length * 4 + 6;

  // -- Configuration URL link -----------------------------------------------
  if (data.configUrl) {
    doc.setFont(baseFont, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(22, 22, 22);
    doc.text(`${s.configLinkLabel}:`, 15, y);
    y += 4;
    doc.setTextColor(0, 102, 204);
    doc.textWithLink(data.configUrl, 15, y, { url: data.configUrl });
    y += 8;
  }

  // -- Footer bar -----------------------------------------------------------
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setFillColor(22, 22, 22);
  doc.rect(0, footerY, pageWidth, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont(baseFont, 'normal');
  doc.setFontSize(8);
  doc.text(s.contactInfo, pageWidth / 2, footerY + 8, { align: 'center' });
  doc.setFontSize(7);
  doc.text('yakiwood.lt', pageWidth / 2, footerY + 13, { align: 'center' });

  return doc;
}

// ---------------------------------------------------------------------------
// Convenience: generate + download
// ---------------------------------------------------------------------------

export async function downloadConfigurationPDF(
  data: ConfigurationPDFData,
  locale: ConfigPDFLocale = 'lt',
  filename?: string,
): Promise<void> {
  const doc = await generateConfigurationPDF(data, locale);
  const safeName =
    filename ??
    `yakiwood-konfig-${data.productName.replace(/[^a-zA-Z0-9ąčęėįšųūžĄČĘĖĮŠŲŪŽ-]/g, '_').substring(0, 40)}-${Date.now()}.pdf`;
  doc.save(safeName);
}
