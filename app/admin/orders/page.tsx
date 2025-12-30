'use client';

import React, { useState, useEffect } from 'react';
import { downloadInvoicePDF } from '@/lib/invoice/pdf-generator';
import type { Invoice } from '@/types/invoice';
import { Breadcrumbs } from '@/components/ui';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
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

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/pdf`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `saskaita_${invoiceId}.pdf`;
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
    if (!confirm('Are you sure you want to resend the invoice via email?')) return;

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/resend`, {
        method: 'POST'
      });

      if (res.ok) {
        alert('Invoice sent successfully!');
      } else {
        alert('Error sending invoice');
      }
    } catch (error) {
      console.error('Error resending invoice:', error);
      alert('Error sending invoice');
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
        alert('Order status updated successfully!');
        loadData();
      } else {
        alert('Error updating order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status');
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
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      cancelled: 'Cancelled',
      paid: 'Paid',
      issued: 'Issued',
      draft: 'Draft'
    };
    return texts[status] || status;
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Homepage', href: '/' },
          { label: 'Admin', href: '/admin' },
          { label: 'Orders' },
        ]}
      />

      <main className="min-h-screen bg-[#EAEAEA] py-[40px] px-[20px]">
        <div className="max-w-[1400px] mx-auto">
        <div className="mb-[40px]">
          <h1 className="font-['DM_Sans'] font-light text-[36px] md:text-[48px] leading-none tracking-tight text-[#161616] mb-[16px]">
            Orders & Invoices
          </h1>
          <p className="font-['Outfit'] text-[14px] text-[#535353]">
            Manage all orders and invoices in one place
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
            Orders
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-[24px] py-[12px] font-['Outfit'] text-[14px] uppercase tracking-[0.6px] transition-colors ${
              activeTab === 'invoices'
                ? 'border-b-2 border-[#161616] text-[#161616]'
                : 'text-[#7C7C7C] hover:text-[#161616]'
            }`}
          >
            Invoices
          </button>
        </div>

        {loading ? (
          <div className="text-center py-[100px]">
            <div className="font-['Outfit'] text-[16px] text-[#7C7C7C]">
              Loading...
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
                      No orders yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F5F5F5]">
                        <tr>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Number
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Customer
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Email
                          </th>
                          <th className="px-[16px] py-[12px] text-right font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Total
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Status
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Payment
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Date
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Actions
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
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
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
                {invoices.length === 0 ? (
                  <div className="p-[40px] text-center">
                    <p className="font-['Outfit'] text-[14px] text-[#7C7C7C]">
                      No invoices yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F5F5F5]">
                        <tr>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Number
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Customer
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Email
                          </th>
                          <th className="px-[16px] py-[12px] text-right font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Total
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Status
                          </th>
                          <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Date
                          </th>
                          <th className="px-[16px] py-[12px] text-center font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                            Actions
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
                                  onClick={() => handleDownloadInvoice(invoice.id)}
                                  className="px-[12px] py-[6px] bg-[#161616] text-white rounded-[4px] font-['Outfit'] text-[11px] uppercase tracking-[0.6px] hover:bg-[#535353] transition-colors"
                                  title="Download PDF"
                                >
                                  PDF
                                </button>
                                {invoice.buyer_email && (
                                  <button
                                    onClick={() => handleResendInvoice(invoice.id)}
                                    className="px-[12px] py-[6px] border border-[#161616] text-[#161616] rounded-[4px] font-['Outfit'] text-[11px] uppercase tracking-[0.6px] hover:bg-[#161616] hover:text-white transition-colors"
                                    title="Send via email"
                                  >
                                    Send
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
    </>
  );
}
