'use client';

import React, { useState, useEffect } from 'react';
import { downloadInvoicePDF } from '@/lib/invoice/pdf-generator';
import { getInvoices, updateInvoiceStatus, deleteInvoice } from '@/lib/invoice/utils';
import type { Invoice } from '@/types/invoice';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const allInvoices = getInvoices();
    setInvoices(allInvoices.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setLoading(false);
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    downloadInvoicePDF(invoice);
  };

  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    updateInvoiceStatus(invoiceId, newStatus);
    loadInvoices();
  };

  const handleDelete = (invoiceId: string) => {
    if (confirm('Ar tikrai norite ištrinti šią sąskaitą?')) {
      deleteInvoice(invoiceId);
      loadInvoices();
      setSelectedInvoice(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('lt-LT');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} €`;
  };

  const getStatusColor = (status: Invoice['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-500'
    };
    return colors[status] || colors.draft;
  };

  const getStatusText = (status: Invoice['status']) => {
    const texts = {
      draft: 'Juodraštis',
      issued: 'Išrašyta',
      paid: 'Apmokėta',
      overdue: 'Vėluoja',
      cancelled: 'Atšaukta'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAEAEA] flex items-center justify-center">
        <div className="font-['Outfit'] text-[16px] text-[#161616]">Kraunama...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#EAEAEA] py-[40px] px-[20px]">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-[40px] flex justify-between items-start">
          <div>
            <h1 className="font-['DM_Sans'] font-light text-[36px] md:text-[48px] leading-none tracking-tight text-[#161616] mb-[16px]">
              Sąskaitos faktūros
            </h1>
            <p className="font-['Outfit'] text-[14px] text-[#535353]">
              Visos išrašytos sąskaitos ir jų būsenos
            </p>
          </div>
          <a
            href="/account/invoices/create"
            className="px-[24px] py-[12px] bg-[#161616] rounded-[100px] font-['Outfit'] text-[14px] uppercase tracking-[0.6px] text-white hover:bg-[#535353] transition-colors"
          >
            + Nauja sąskaita
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[16px] mb-[40px]">
          <div className="bg-white p-[24px] rounded-[8px]">
            <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[8px]">
              Viso sąskaitų
            </div>
            <div className="font-['DM_Sans'] text-[32px] text-[#161616]">
              {invoices.length}
            </div>
          </div>
          <div className="bg-white p-[24px] rounded-[8px]">
            <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[8px]">
              Apmokėta
            </div>
            <div className="font-['DM_Sans'] text-[32px] text-green-600">
              {invoices.filter(inv => inv.status === 'paid').length}
            </div>
          </div>
          <div className="bg-white p-[24px] rounded-[8px]">
            <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[8px]">
              Laukiama
            </div>
            <div className="font-['DM_Sans'] text-[32px] text-blue-600">
              {invoices.filter(inv => inv.status === 'issued').length}
            </div>
          </div>
          <div className="bg-white p-[24px] rounded-[8px]">
            <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[8px]">
              Suma (viso)
            </div>
            <div className="font-['DM_Sans'] text-[24px] text-[#161616]">
              {formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}
            </div>
          </div>
        </div>

        {/* Invoices List */}
        {invoices.length === 0 ? (
          <div className="bg-white p-[40px] rounded-[8px] text-center">
            <p className="font-['Outfit'] text-[16px] text-[#7C7C7C]">
              Nėra išrašytų sąskaitų
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[8px] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#161616] text-white">
                <tr>
                  <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[12px] uppercase tracking-[0.6px]">
                    Numeris
                  </th>
                  <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[12px] uppercase tracking-[0.6px]">
                    Pirkėjas
                  </th>
                  <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[12px] uppercase tracking-[0.6px]">
                    Data
                  </th>
                  <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[12px] uppercase tracking-[0.6px]">
                    Suma
                  </th>
                  <th className="px-[16px] py-[12px] text-left font-['Outfit'] text-[12px] uppercase tracking-[0.6px]">
                    Būsena
                  </th>
                  <th className="px-[16px] py-[12px] text-right font-['Outfit'] text-[12px] uppercase tracking-[0.6px]">
                    Veiksmai
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    className="border-b border-[#E1E1E1] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616]">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616]">
                      {invoice.buyer.companyName || invoice.buyer.name}
                    </td>
                    <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#535353]">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] font-medium text-[#161616]">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-[16px] py-[16px]">
                      <span className={`inline-block px-[12px] py-[4px] rounded-full font-['Outfit'] text-[12px] ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-[16px] py-[16px] text-right">
                      <div className="flex gap-[8px] justify-end">
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          className="px-[16px] py-[8px] bg-[#161616] text-white rounded-[4px] font-['Outfit'] text-[12px] hover:bg-[#535353] transition-colors"
                        >
                          Atsisiųsti PDF
                        </button>
                        {invoice.status === 'issued' && (
                          <button
                            onClick={() => handleStatusChange(invoice.id, 'paid')}
                            className="px-[16px] py-[8px] bg-green-600 text-white rounded-[4px] font-['Outfit'] text-[12px] hover:bg-green-700 transition-colors"
                          >
                            Žymėti apmokėta
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="px-[16px] py-[8px] bg-red-600 text-white rounded-[4px] font-['Outfit'] text-[12px] hover:bg-red-700 transition-colors"
                        >
                          Ištrinti
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
