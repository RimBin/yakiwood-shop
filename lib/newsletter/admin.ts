import { createClient } from '@supabase/supabase-js';

// Admin utilities for managing newsletter subscribers
// Use these functions in admin dashboard or API routes

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribed_at: string;
  consent: boolean;
  status: 'active' | 'unsubscribed' | 'bounced' | 'pending';
  source?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  unsubscribed_at?: string;
}

export interface SubscriberStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  pending: number;
  bySource: Record<string, number>;
  recentSignups: number; // Last 30 days
}

/**
 * Get all newsletter subscribers with optional filters
 */
export async function getSubscribers(filters?: {
  status?: string;
  source?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Subscriber[]; error: any; count: number }> {
  let query = supabaseAdmin
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('subscribed_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.source) {
    query = query.eq('source', filters.source);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  return { data: data || [], error, count: count || 0 };
}

/**
 * Get subscriber statistics
 */
export async function getSubscriberStats(): Promise<SubscriberStats> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: allSubscribers } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*');

  const subscribers = allSubscribers || [];

  const stats: SubscriberStats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    bounced: subscribers.filter(s => s.status === 'bounced').length,
    pending: subscribers.filter(s => s.status === 'pending').length,
    bySource: {},
    recentSignups: subscribers.filter(
      s => new Date(s.subscribed_at) > thirtyDaysAgo
    ).length,
  };

  // Count by source
  subscribers.forEach(subscriber => {
    const source = subscriber.source || 'unknown';
    stats.bySource[source] = (stats.bySource[source] || 0) + 1;
  });

  return stats;
}

/**
 * Unsubscribe a user by email
 */
export async function unsubscribeUser(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', email)
    .eq('status', 'active');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Resubscribe a user by email
 */
export async function resubscribeUser(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .update({
      status: 'active',
      subscribed_at: new Date().toISOString(),
      unsubscribed_at: null,
    })
    .eq('email', email)
    .eq('status', 'unsubscribed');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a subscriber by email (GDPR right to be forgotten)
 */
export async function deleteSubscriber(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .delete()
    .eq('email', email);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Export subscribers to CSV format
 */
export async function exportSubscribersToCSV(status?: string): Promise<string> {
  const { data: subscribers } = await getSubscribers({ status });

  if (!subscribers || subscribers.length === 0) {
    return 'email,name,subscribed_at,status,source\n';
  }

  const headers = ['email', 'name', 'subscribed_at', 'status', 'source'];
  const csv = [
    headers.join(','),
    ...subscribers.map(sub =>
      [
        sub.email,
        sub.name || '',
        sub.subscribed_at,
        sub.status,
        sub.source || '',
      ].join(',')
    ),
  ].join('\n');

  return csv;
}

/**
 * Bulk import subscribers from CSV
 * CSV format: email,name,source
 */
export async function importSubscribersFromCSV(
  csvContent: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  const emailIndex = headers.indexOf('email');
  const nameIndex = headers.indexOf('name');
  const sourceIndex = headers.indexOf('source');

  if (emailIndex === -1) {
    throw new Error('CSV must contain email column');
  }

  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const email = values[emailIndex]?.trim();

    if (!email) {
      results.failed++;
      results.errors.push(`Row ${i + 1}: Missing email`);
      continue;
    }

    const subscriber = {
      email,
      name: nameIndex !== -1 ? values[nameIndex]?.trim() : undefined,
      source: sourceIndex !== -1 ? values[sourceIndex]?.trim() : 'import',
      consent: true,
      status: 'active',
    };

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert(subscriber);

    if (error) {
      results.failed++;
      results.errors.push(`Row ${i + 1}: ${error.message}`);
    } else {
      results.success++;
    }
  }

  return results;
}

/**
 * Search subscribers by email or name
 */
export async function searchSubscribers(
  query: string
): Promise<{ data: Subscriber[]; error: any }> {
  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
    .order('subscribed_at', { ascending: false })
    .limit(50);

  return { data: data || [], error };
}

/**
 * Update subscriber metadata
 */
export async function updateSubscriberMetadata(
  email: string,
  metadata: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ metadata })
    .eq('email', email);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Mark email as bounced
 */
export async function markAsBounced(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .update({ status: 'bounced' })
    .eq('email', email);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
