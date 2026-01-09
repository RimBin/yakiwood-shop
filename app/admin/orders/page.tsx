'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/ui';
import ModalOverlay from '@/components/modals/ModalOverlay';

type InvoiceLocale = 'lt' | 'en';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  stripe_session_id?: string | null;
  notes?: string | null;
}

interface DBInvoice {
  id: string;
  invoice_number: string;
  order_id?: string;
  buyer_name: string;
  buyer_email?: string;
  total: number;
  status: string;
  issued_at: string;
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<DBInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [invoiceLocale, setInvoiceLocale] = useState<InvoiceLocale>('lt');
  const [previewInvoice, setPreviewInvoice] = useState<{ id: string; invoiceNumber: string } | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } else {
        const res = await fetch('/api/admin/invoices');
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.invoices || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber?: string) => {
    try {
      const res = await fetch(
        `/api/admin/invoices/${invoiceId}/pdf?disposition=attachment&lang=${invoiceLocale}`
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceLocale === 'en' ? 'invoice' : 'saskaita'}_${invoiceNumber || invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleResendInvoice = async (invoiceId: string) => {
    if (!confirm('Ar tikrai norite pakartotinai išsiųsti sąskaitą el. paštu?')) return;

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/resend?lang=${invoiceLocale}`, {
        method: 'POST'
      });

      if (res.ok) {
        alert('Sąskaita sėkmingai išsiųsta!');
      } else {
        alert('Nepavyko išsiųsti sąskaitos');
      }
    } catch (error) {
      console.error('Error resending invoice:', error);
      alert('Nepavyko išsiųsti sąskaitos');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (res.ok) {
        alert('Užsakymo statusas atnaujintas!');
        loadData();
      } else {
        alert('Nepavyko atnaujinti užsakymo statuso');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Nepavyko atnaujinti užsakymo statuso');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      issued: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Laukiama',
      processing: 'Vykdoma',
      completed: 'Įvykdyta',
      cancelled: 'Atšaukta',
      refunded: 'Grąžinta',
      paid: 'Apmokėta',
      failed: 'Nepavyko',
      issued: 'Išrašyta',
      draft: 'Juodraštis',
      overdue: 'Vėluoja'
    };
    return texts[status] || status;
  };

  const getPaymentProvider = (order: Order) => {
    if (order.stripe_session_id) return 'Stripe';
    return 'Rankinis';
  };

  const getCouponCode = (order: Order) => {
    const notes = order.notes || '';
    const match = notes.match(/Nuolaidos kodas:\s*([^\n\r]+)/i);
    return match?.[1]?.trim() || null;
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Pradžia', href: '/' },
          { label: 'Administravimas', href: '/admin' },
          { label: 'Užsakymai' },
        ]}
      />

      <main className="min-h-screen bg-[#EAEAEA] py-[40px] px-[20px]">
        <div className="max-w-[1400px] mx-auto">
        <div className="mb-[40px]">
          <h1 className="font-['DM_Sans'] font-light text-[36px] md:text-[48px] leading-none tracking-tight text-[#161616] mb-[16px]">
            Užsakymai ir sąskaitos
          </h1>
          <p className="font-['Outfit'] text-[14px] text-[#535353]">
            Administruokite užsakymus ir sąskaitas vienoje vietoje
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-[32px] flex gap-[8px] border-b border-[#E1E1E1]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-[24px] py-[12px] font-['Outfit'] text-[14px] uppercase tracking-[0.6px] transition-colors ${
              activeTab === 'orders'
                ? 'border-b-2 border-[#161616] text-[#161616]'
                : 'text-[#7C7C7C] hover:text-[#161616]'
            }`}
          >
            Užsakymai
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-[24px] py-[12px] font-['Outfit'] text-[14px] uppercase tracking-[0.6px] transition-colors ${
              activeTab === 'invoices'
                ? 'border-b-2 border-[#161616] text-[#161616]'
                : 'text-[#7C7C7C] hover:text-[#161616]'
            }`}
          >
            Sąskaitos
          </button>
        </div>

        {loading ? (
          <div className="text-center py-[100px]">
            <div className="font-['Outfit'] text-[16px] text-[#7C7C7C]">
              Kraunama...
            </div>
          </div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-[#EAEAEA] rounded-[8px] overflow-hidden">
                {orders.length === 0 ? (
                  <div className="p-[40px] text-center">
                    <p className="font-['Outfit'] text-[14px] text-[#7C7C7C]">
                      Kol kas užsakymų nėra
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F5F5F5]">
                        <tr>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Nr.
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Klientas
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            El. paštas
                          </th>
                          <th className="px-[16px] py-[12px] text-right font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Suma
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Statusas
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Apmokėjimas
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Mokėjimas
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Nuolaidos kodas
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Data
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Veiksmai
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-t border-[#E1E1E1] hover:bg-[#F9F9F9]">
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] font-medium text-[13px] text-[#161616]">
                                {order.order_number}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] text-[13px] text-[#161616]">
                                {order.customer_name}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] text-[13px] text-[#7C7C7C]">
                                {order.customer_email}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-right">
                              <span className="font-['Outfit'] font-medium text-[13px] text-[#161616]">
                                {order.total.toFixed(2)} €
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-center">
                              <span className={`inline-block px-[12px] py-[4px] rounded-full font-['Outfit'] text-[11px] uppercase tracking-[0.6px] ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-center">
                              <span className={`inline-block px-[12px] py-[4px] rounded-full font-['Outfit'] text-[11px] uppercase tracking-[0.6px] ${getStatusColor(order.payment_status)}`}>
                                {getStatusText(order.payment_status)}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-center">
                              <span className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                                {getPaymentProvider(order)}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] text-[12px] text-[#7C7C7C]">
                                {getCouponCode(order) || '-'}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] text-[12px] text-[#7C7C7C]">
                                {formatDate(order.created_at)}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-center">
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="px-[12px] py-[6px] border border-[#E1E1E1] rounded-[4px] font-['Outfit'] text-[12px] focus:outline-none focus:border-[#161616]"
                              >
                                <option value="pending">Laukiama</option>
                                <option value="processing">Vykdoma</option>
                                <option value="completed">Įvykdyta</option>
                                <option value="cancelled">Atšaukta</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="bg-[#EAEAEA] rounded-[8px] overflow-hidden">
                <div className="flex items-center justify-between gap-[16px] px-[16px] py-[12px] bg-[#F5F5F5] border-b border-[#E1E1E1]">
                  <div className="font-['Outfit'] text-[12px] text-[#7C7C7C] uppercase tracking-[0.6px]">
                    Sąskaitos
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className="font-['Outfit'] text-[12px] text-[#7C7C7C]">Kalba:</span>
                    <select
                      value={invoiceLocale}
                      onChange={(e) => setInvoiceLocale(e.target.value as InvoiceLocale)}
                      className="px-[12px] py-[6px] border border-[#E1E1E1] bg-white rounded-[4px] font-['Outfit'] text-[12px] focus:outline-none focus:border-[#161616]"
                      aria-label="Sąskaitos PDF kalba"
                    >
                      <option value="lt">LT</option>
                      <option value="en">EN</option>
                    </select>
                  </div>
                </div>
                {invoices.length === 0 ? (
                  <div className="p-[40px] text-center">
                    <p className="font-['Outfit'] text-[14px] text-[#7C7C7C]">
                      Kol kas sąskaitų nėra
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F5F5F5]">
                        <tr>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Nr.
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Klientas
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            El. paštas
                          </th>
                          <th className="px-[16px] py-[12px] text-right font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Suma
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Statusas
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Data
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Veiksmai
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-t border-[#E1E1E1] hover:bg-[#F9F9F9]">
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] font-medium text-[13px] text-[#161616]">
                                {invoice.invoice_number}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] text-[13px] text-[#161616]">
                                {invoice.buyer_name}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] text-[13px] text-[#7C7C7C]">
                                {invoice.buyer_email || '-'}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-right">
                              <span className="font-['Outfit'] font-medium text-[13px] text-[#161616]">
                                {invoice.total.toFixed(2)} €
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-center">
                              <span className={`inline-block px-[12px] py-[4px] rounded-full font-['Outfit'] text-[11px] uppercase tracking-[0.6px] ${getStatusColor(invoice.status)}`}>
                                {getStatusText(invoice.status)}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px]">
                              <span className="font-['Outfit'] text-[12px] text-[#7C7C7C]">
                                {formatDate(invoice.issued_at)}
                              </span>
                            </td>
                            <td className="px-[16px] py-[16px] text-center">
                              <div className="flex gap-[8px] justify-center">
                                <button
                                  onClick={() =>
                                    setPreviewInvoice({ id: invoice.id, invoiceNumber: invoice.invoice_number })
                                  }
                                  className="px-[12px] py-[6px] border border-[#161616] text-[#161616] rounded-[4px] font-['Outfit'] text-[11px] uppercase tracking-[0.6px] hover:bg-[#161616] hover:text-white transition-colors"
                                  title="Peržiūrėti PDF"
                                >
                                  Peržiūra
                                </button>
                                <button
                                  onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                                  className="px-[12px] py-[6px] bg-[#161616] text-white rounded-[4px] font-['Outfit'] text-[11px] uppercase tracking-[0.6px] hover:bg-[#535353] transition-colors"
                                  title="Atsisiųsti PDF"
                                >
                                  PDF
                                </button>
                                {invoice.buyer_email && (
                                  <button
                                    onClick={() => handleResendInvoice(invoice.id)}
                                    className="px-[12px] py-[6px] border border-[#161616] text-[#161616] rounded-[4px] font-['Outfit'] text-[11px] uppercase tracking-[0.6px] hover:bg-[#161616] hover:text-white transition-colors"
                                    title="Išsiųsti el. paštu"
                                  >
                                    Siųsti
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </main>

      <ModalOverlay isOpen={!!previewInvoice} onClose={() => setPreviewInvoice(null)}>
        <div className="w-[min(1100px,95vw)] h-[min(85vh,900px)] bg-white rounded-[16px] overflow-hidden border border-[#E1E1E1]">
          <div className="flex items-center justify-between gap-[12px] px-[16px] py-[12px] border-b border-[#E1E1E1] bg-[#F5F5F5]">
            <div className="min-w-0">
              <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                PDF peržiūra
              </div>
              <div className="font-['DM_Sans'] text-[16px] text-[#161616] truncate">
                {previewInvoice ? previewInvoice.invoiceNumber : ''}
              </div>
            </div>
            <div className="flex items-center gap-[8px]">
              <select
                value={invoiceLocale}
                onChange={(e) => setInvoiceLocale(e.target.value as InvoiceLocale)}
                className="px-[12px] py-[6px] border border-[#E1E1E1] bg-white rounded-[4px] font-['Outfit'] text-[12px] focus:outline-none focus:border-[#161616]"
                aria-label="Peržiūros kalba"
              >
                <option value="lt">LT</option>
                <option value="en">EN</option>
              </select>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-[12px] py-[6px] border border-[#161616] text-[#161616] rounded-[4px] font-['Outfit'] text-[11px] uppercase tracking-[0.6px] hover:bg-[#161616] hover:text-white transition-colors"
              >
                Uždaryti
              </button>
            </div>
          </div>
          <div className="w-full h-[calc(100%-50px)] bg-white">
            {previewInvoice && (
              <iframe
                key={`${previewInvoice.id}:${invoiceLocale}`}
                title="Invoice PDF"
                className="w-full h-full"
                src={`/api/admin/invoices/${previewInvoice.id}/pdf?disposition=inline&lang=${invoiceLocale}`}
              />
            )}
          </div>
        </div>
      </ModalOverlay>
    </>
  );
}
