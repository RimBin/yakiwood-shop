'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AccountLayout from '@/components/account/AccountLayout';
import { createClient } from '@/lib/supabase/client';
import type { Invoice } from '@/types/invoice';

type InvoiceView = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  status: string;
  total: number;
};

function formatMoneyEUR(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('lt-LT');
}

export default function InvoicesPage() {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadInvoices = async () => {
      setLoadError(null);
      try {
        const res = await fetch('/api/account/invoices');
        if (res.status === 401) {
          if (!isCancelled) router.push('/login?redirect=/account/invoices');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load invoices');
        }

        const payload = (await res.json()) as { invoices?: Invoice[] };
        const statusLabels: Record<string, string> = {
          draft: t('status.draft'),
          issued: t('status.issued'),
          paid: t('status.paid'),
          cancelled: t('status.cancelled'),
          overdue: t('status.overdue'),
        };

        const nextInvoices: InvoiceView[] = (payload.invoices || []).map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          issueDate: formatDate(invoice.issueDate),
          status: statusLabels[invoice.status] || invoice.status,
          total: Number(invoice.total || 0),
        }));

        if (!isCancelled) {
          setInvoices(nextInvoices);
          setIsLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setLoadError(tCommon('klaida'));
          setIsLoading(false);
        }
      }
    };

    void loadInvoices();

    return () => {
      isCancelled = true;
    };
  }, [router, t, tCommon]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('yakiwood_auth');
    } catch {
      // ignore
    }

    const supabaseClient = supabase;
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch {
        // ignore
      }
    }

    router.push('/login');
  };

  const handleDownload = (invoiceId: string) => {
    window.open(`/api/account/invoices/${invoiceId}/pdf`, '_blank');
  };

  const handleResend = async (invoiceId: string) => {
    setResendMessage(null);
    setResendingId(invoiceId);
    try {
      const res = await fetch(`/api/account/invoices/${invoiceId}/resend`, { method: 'POST' });
      if (!res.ok) {
        throw new Error('Resend failed');
      }
      setResendMessage(t('invoiceMessages.resent'));
    } catch {
      setResendMessage(t('invoiceMessages.resendError'));
    } finally {
      setResendingId(null);
    }
  };

  if (isLoading) return null;

  return (
    <AccountLayout active="invoices" onLogout={handleLogout}>
      {loadError ? (
        <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#F63333]">
          {loadError}
        </div>
      ) : null}

      {resendMessage ? (
        <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616]">
          {resendMessage}
        </div>
      ) : null}

      {invoices.length === 0 ? (
        <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">
          {t('invoicesEmpty')}
        </div>
      ) : null}

      {invoices.length > 0 ? (
        <div className="hidden md:block">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-[#BBBBBB] pb-4">
            <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
              {t('invoicesTable.invoice')}
            </div>
            <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
              {t('invoicesTable.date')}
            </div>
            <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
              {t('invoicesTable.status')}
            </div>
            <div className="text-right font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
              {t('invoicesTable.totalCost')}
            </div>
            <div className="text-right font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
              {t('invoicesTable.actions')}
            </div>
          </div>

          <div className="divide-y divide-[#BBBBBB]">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] items-center gap-4 py-4">
                <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                  {invoice.invoiceNumber}
                </div>
                <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                  {invoice.issueDate}
                </div>
                <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                  {invoice.status}
                </div>
                <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                  {formatMoneyEUR(invoice.total)}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownload(invoice.id)}
                    className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616]"
                  >
                    {t('invoiceActions.download')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResend(invoice.id)}
                    className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616]"
                    disabled={resendingId === invoice.id}
                  >
                    {t('invoiceActions.resend')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {invoices.length > 0 ? (
        <div className="md:hidden">
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[16px] bg-[#EAEAEA] p-4">
                <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                  {invoice.invoiceNumber}
                </div>
                <div className="mt-1 font-['DM_Sans'] text-[14px] font-light text-[#535353]">
                  {invoice.issueDate} · {invoice.status}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                    {t('invoicesTable.totalCost')}
                  </div>
                  <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                    {formatMoneyEUR(invoice.total)}
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownload(invoice.id)}
                    className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616]"
                  >
                    {t('invoiceActions.download')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResend(invoice.id)}
                    className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616]"
                    disabled={resendingId === invoice.id}
                  >
                    {t('invoiceActions.resend')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </AccountLayout>
  );
}
