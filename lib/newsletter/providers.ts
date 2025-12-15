import { createClient } from '@supabase/supabase-js';

// Newsletter provider interface
export interface NewsletterProvider {
  subscribe(email: string, data?: NewsletterData): Promise<SubscribeResult>;
}

export interface NewsletterData {
  name?: string;
  consent?: boolean;
  source?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface SubscribeResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Rate limiting store (in-memory)
const rateLimitStore = new Map<string, { attempts: number; resetAt: number }>();

export function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(email);

  if (!limit || now > limit.resetAt) {
    // Reset or create new limit
    rateLimitStore.set(email, {
      attempts: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (limit.attempts >= 3) {
    return false; // Rate limit exceeded
  }

  limit.attempts++;
  return true;
}

// Mailchimp Provider
export class MailchimpProvider implements NewsletterProvider {
  private apiKey: string;
  private audienceId: string;
  private serverPrefix: string;

  constructor() {
    this.apiKey = process.env.MAILCHIMP_API_KEY || '';
    this.audienceId = process.env.MAILCHIMP_AUDIENCE_ID || '';
    this.serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || 'us19';

    if (!this.apiKey || !this.audienceId) {
      throw new Error('Mailchimp API key and Audience ID are required');
    }
  }

  async subscribe(email: string, data?: NewsletterData): Promise<SubscribeResult> {
    const url = `https://${this.serverPrefix}.api.mailchimp.com/3.0/lists/${this.audienceId}/members`;

    const payload = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        ...(data?.name && { FNAME: data.name }),
      },
      tags: data?.source ? [data.source] : [],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Successfully subscribed to newsletter',
        };
      }

      const error = await response.json();

      // Handle already subscribed case
      if (error.title === 'Member Exists') {
        return {
          success: false,
          error: 'Šis el. paštas jau užsiprenumeravo naujienas',
        };
      }

      return {
        success: false,
        error: error.detail || 'Failed to subscribe to newsletter',
      };
    } catch (error) {
      console.error('Mailchimp subscription error:', error);
      return {
        success: false,
        error: 'Failed to connect to newsletter service',
      };
    }
  }
}

// Database Provider (Supabase fallback)
export class DatabaseProvider implements NewsletterProvider {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required for database provider');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async subscribe(email: string, data?: NewsletterData): Promise<SubscribeResult> {
    try {
      const { error } = await this.supabase.from('newsletter_subscribers').insert({
        email,
        name: data?.name,
        consent: data?.consent || false,
        source: data?.source || 'unknown',
        user_id: data?.userId || null,
        metadata: data?.metadata || {},
        status: 'active',
      });

      if (error) {
        // Handle duplicate email
        if (error.code === '23505') {
          return {
            success: false,
            error: 'Šis el. paštas jau užsiprenumeravo naujienas',
          };
        }

        console.error('Database subscription error:', error);
        return {
          success: false,
          error: 'Failed to save subscription',
        };
      }

      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
      };
    } catch (error) {
      console.error('Database subscription error:', error);
      return {
        success: false,
        error: 'Failed to save subscription',
      };
    }
  }
}

// Resend Provider (Email list)
export class ResendProvider implements NewsletterProvider {
  private apiKey: string;
  private audienceId: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.audienceId = process.env.RESEND_AUDIENCE_ID || '';

    if (!this.apiKey || !this.audienceId) {
      throw new Error('Resend API key and Audience ID are required');
    }
  }

  async subscribe(email: string, data?: NewsletterData): Promise<SubscribeResult> {
    const url = `https://api.resend.com/audiences/${this.audienceId}/contacts`;

    const payload = {
      email,
      ...(data?.name && { first_name: data.name }),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Successfully subscribed to newsletter',
        };
      }

      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Failed to subscribe to newsletter',
      };
    } catch (error) {
      console.error('Resend subscription error:', error);
      return {
        success: false,
        error: 'Failed to connect to newsletter service',
      };
    }
  }
}

// Provider factory
export function getNewsletterProvider(): NewsletterProvider {
  const provider = process.env.NEWSLETTER_PROVIDER || 'database';

  switch (provider) {
    case 'mailchimp':
      return new MailchimpProvider();
    case 'resend':
      return new ResendProvider();
    case 'database':
    default:
      return new DatabaseProvider();
  }
}
