/**
 * Universal Email Sender
 * Supports both Resend and SMTP (Gmail, Outlook, etc.)
 * Automatically chooses provider based on environment variables
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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
        from: options.from || process.env.SYSTEM_EMAIL_FROM || 'Yakiwood <noreply@yakiwood.lt>',
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
        from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
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
  }
) {
  // Try to use template if available
  try {
    const { getEmailTemplate } = await import('./email/templates');
    const template = getEmailTemplate('order-confirmation');
    
    if (template) {
      return await sendEmail({
        to: email,
        subject: template.subject({ orderNumber }),
        html: template.html({
          orderNumber,
          orderDate: orderData?.orderDate || new Date().toLocaleDateString('lt-LT'),
          totalAmount: orderData?.totalAmount || '0.00',
          items: orderData?.items || [],
        }),
        attachments: [
          {
            filename: `saskaita-${orderNumber}.pdf`,
            content: invoicePdf,
          },
        ],
      });
    }
  } catch (error) {
    console.warn('Email template not available, using fallback');
  }

  // Fallback to basic HTML
  return await sendEmail({
    to: email,
    subject: `Yakiwood - Užsakymo patvirtinimas #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
