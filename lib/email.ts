/**
 * Universal Email Sender
 * Supports both Resend and SMTP (Gmail, Outlook, etc.)
 * Automatically chooses provider based on environment variables
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import type { EmailLocale } from './email/bilingualTemplates'

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
  }[];
  from?: string;
}

interface EmailProvider {
  send(options: EmailOptions): Promise<{ success: boolean; error?: string }>;
}

/**
 * Resend Email Provider
 */
class ResendProvider implements EmailProvider {
  private client: any;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }
    const { Resend } = require('resend');
    this.client = new Resend(process.env.RESEND_API_KEY);
  }

  async send(options: EmailOptions) {
    try {
      const { data, error } = await this.client.emails.send({
        from:
          options.from ||
          process.env.SYSTEM_EMAIL_FROM ||
          process.env.RESEND_FROM_EMAIL ||
          process.env.FROM_EMAIL ||
          'Yakiwood <noreply@yakiwood.lt>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Resend send error:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * SMTP Email Provider (Gmail, Outlook, etc.)
 */
class SMTPProvider implements EmailProvider {
  private transporter: Transporter;

  constructor() {
    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      throw new Error(`SMTP not configured. Missing: ${missing.join(', ')}`);
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(options: EmailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from:
          options.from ||
          process.env.SMTP_FROM ||
          process.env.SYSTEM_EMAIL_FROM ||
          process.env.FROM_EMAIL ||
          process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      console.log('SMTP email sent:', info.messageId);
      return { success: true };
    } catch (error: any) {
      console.error('SMTP send error:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Get email provider based on environment configuration
 * Priority: Resend > SMTP
 */
export function getEmailProvider(): EmailProvider | null {
  try {
    // Try Resend first
    if (process.env.RESEND_API_KEY) {
      console.log('Using Resend email provider');
      return new ResendProvider();
    }

    // Fall back to SMTP
    if (process.env.SMTP_HOST) {
      console.log('Using SMTP email provider');
      return new SMTPProvider();
    }

    console.warn('No email provider configured (neither Resend nor SMTP)');
    return null;
  } catch (error: any) {
    console.error('Failed to initialize email provider:', error.message);
    return null;
  }
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions) {
  const provider = getEmailProvider();

  if (!provider) {
    return {
      success: false,
      error: 'No email provider configured. Set RESEND_API_KEY or SMTP credentials.',
    };
  }

  return await provider.send(options);
}

/**
 * Send order confirmation email with invoice
 */
export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  invoicePdf: Buffer,
  orderData?: {
    orderDate?: string;
    totalAmount?: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
  },
  locale: EmailLocale = 'lt'
) {
  const resolvedLocale: EmailLocale = locale === 'en' ? 'en' : 'lt'

  // Prefer CMS-edited template, fallback to code defaults
  try {
    const [{ getEmailTemplateDoc }, { getBilingualEmailTemplate, renderTemplateString }] = await Promise.all([
      import('./email/cmsTemplates'),
      import('./email/bilingualTemplates'),
    ])

    const defaults = getBilingualEmailTemplate('order-confirmation')
    if (defaults) {
      const vars = {
        orderNumber,
        orderDate: orderData?.orderDate || new Date().toLocaleDateString(resolvedLocale === 'lt' ? 'lt-LT' : 'en-GB'),
        totalAmount: orderData?.totalAmount || '0.00',
        items: orderData?.items || [],
      }

      const doc = await getEmailTemplateDoc('order-confirmation')

      const subjectTemplate =
        (resolvedLocale === 'lt' ? doc?.subjectLt : doc?.subjectEn) || defaults.subject[resolvedLocale]
      const htmlTemplate =
        (resolvedLocale === 'lt' ? doc?.htmlLt : doc?.htmlEn) || defaults.html[resolvedLocale]

      return await sendEmail({
        to: email,
        subject: renderTemplateString(subjectTemplate, vars),
        html: renderTemplateString(htmlTemplate, vars),
        attachments: [
          {
            filename: `saskaita-${orderNumber}.pdf`,
            content: invoicePdf,
          },
        ],
      })
    }
  } catch {
    console.warn('Email template not available, using fallback')
  }

  // Fallback to basic HTML
  return await sendEmail({
    to: email,
    subject:
      resolvedLocale === 'lt'
        ? `Yakiwood - Užsakymo patvirtinimas #${orderNumber}`
        : `Yakiwood - Order Confirmation #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${
          resolvedLocale === 'lt'
            ? `
        <h1 style="color: #161616;">Dėkojame už jūsų užsakymą!</h1>
        <p>Jūsų užsakymas <strong>#${orderNumber}</strong> buvo sėkmingai apmokėtas.</p>
        <p>Pridedame sąskaitą faktūrą PDF formatu.</p>
        <p>Jei turite klausimų, susisiekite su mumis:</p>
        <ul>
          <li>El. paštas: info@yakiwood.lt</li>
          <li>Tel: +370 XXX XXXXX</li>
        </ul>
        <p style="margin-top: 30px; color: #666;">
          Su pagarba,<br>
          <strong>Yakiwood komanda</strong>
        </p>
        `
            : `
        <h1 style="color: #161616;">Thank you for your order!</h1>
        <p>Your order <strong>#${orderNumber}</strong> has been successfully paid.</p>
        <p>We have attached the invoice in PDF format.</p>
        <p>If you have any questions, contact us:</p>
        <ul>
          <li>Email: info@yakiwood.lt</li>
          <li>Phone: +370 XXX XXXXX</li>
        </ul>
        <p style="margin-top: 30px; color: #666;">
          Best regards,<br>
          <strong>Yakiwood team</strong>
        </p>
        `
        }
      </div>
    `,
    attachments: [
      {
        filename: `saskaita-${orderNumber}.pdf`,
        content: invoicePdf,
      },
    ],
  });
}

/**
 * Export templates for use in other parts of the app
 */
export * from './email/templates';

export {
  BILINGUAL_EMAIL_TEMPLATES,
  getBilingualEmailTemplate,
  getBilingualEmailTemplatesByCategory,
  renderTemplateString,
  type EmailLocale,
  type EmailTemplateDefinition,
} from './email/bilingualTemplates'

export { getSampleData as getBilingualSampleData } from './email/bilingualTemplates'
