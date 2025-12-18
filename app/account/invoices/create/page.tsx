'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice, saveInvoice } from '@/lib/invoice/utils';
import { downloadInvoicePDF } from '@/lib/invoice/pdf-generator';
import type { InvoiceGenerateRequest, InvoiceAddress } from '@/types/invoice';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Buyer info
  const [buyerName, setBuyerName] = useState('');
  const [buyerCompanyName, setBuyerCompanyName] = useState('');
  const [buyerCompanyCode, setBuyerCompanyCode] = useState('');
  const [buyerVatCode, setBuyerVatCode] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerCity, setBuyerCity] = useState('');
  const [buyerPostalCode, setBuyerPostalCode] = useState('');
  const [buyerCountry, setBuyerCountry] = useState('Lietuva');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  // Invoice items
  const [items, setItems] = useState([
    { name: '', quantity: 1, unitPrice: 0, vatRate: 0.21 }
  ]);

  // Other
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'card' | 'stripe'>('bank_transfer');
  const [notes, setNotes] = useState('');
  const [dueInDays, setDueInDays] = useState(14);

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, unitPrice: 0, vatRate: 0.21 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * (1 + item.vatRate));
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!buyerName || items.some(item => !item.name || item.unitPrice <= 0)) {
        setError('Prašome užpildyti visus privalomus laukus');
        setLoading(false);
        return;
      }

      const buyer: InvoiceAddress = {
        name: buyerName,
        companyName: buyerCompanyName || undefined,
        companyCode: buyerCompanyCode || undefined,
        vatCode: buyerVatCode || undefined,
        address: buyerAddress,
        city: buyerCity,
        postalCode: buyerPostalCode,
        country: buyerCountry,
        phone: buyerPhone || undefined,
        email: buyerEmail || undefined
      };

      const request: InvoiceGenerateRequest = {
        buyer,
        items: items.map(item => ({
          id: `item-${Date.now()}-${Math.random()}`,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate
        })),
        paymentMethod,
        notes,
        dueInDays
      };

      // Create invoice
      const invoice = createInvoice(request);
      saveInvoice(invoice);

      // Download PDF immediately
      downloadInvoicePDF(invoice);

      // Redirect to invoices list
      router.push('/account/invoices');
    } catch (err) {
      console.error(err);
      setError('Nepavyko sukurti sąskaitos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EAEAEA] py-[40px] px-[20px]">
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-[40px]">
          <h1 className="font-['DM_Sans'] font-light text-[36px] md:text-[48px] leading-none tracking-tight text-[#161616] mb-[16px]">
            Nauja sąskaita faktūra
          </h1>
          <p className="font-['Outfit'] text-[14px] text-[#535353]">
            Užpildykite formą ir sugeneruokite sąskaitą PDF formatu
          </p>
        </div>

        {error && (
          <div className="mb-[24px] p-[16px] bg-red-50 border border-red-200 rounded-[8px]">
            <p className="font-['Outfit'] text-[14px] text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-[32px]">
          {/* Buyer Information */}
          <div className="bg-white p-[32px] rounded-[8px]">
            <h2 className="font-['Outfit'] font-medium text-[18px] text-[#161616] mb-[24px]">
              Pirkėjo informacija
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Vardas / Pavardė <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Įmonės pavadinimas
                </label>
                <input
                  type="text"
                  value={buyerCompanyName}
                  onChange={(e) => setBuyerCompanyName(e.target.value)}
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Įmonės kodas
                </label>
                <input
                  type="text"
                  value={buyerCompanyCode}
                  onChange={(e) => setBuyerCompanyCode(e.target.value)}
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  PVM mokėtojo kodas
                </label>
                <input
                  type="text"
                  value={buyerVatCode}
                  onChange={(e) => setBuyerVatCode(e.target.value)}
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Adresas <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  required
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Miestas <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={buyerCity}
                  onChange={(e) => setBuyerCity(e.target.value)}
                  required
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Pašto kodas <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={buyerPostalCode}
                  onChange={(e) => setBuyerPostalCode(e.target.value)}
                  required
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Telefonas
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  El. paštas
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-[32px] rounded-[8px]">
            <div className="flex justify-between items-center mb-[24px]">
              <h2 className="font-['Outfit'] font-medium text-[18px] text-[#161616]">
                Prekės / Paslaugos
              </h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-[16px] py-[8px] bg-[#161616] text-white rounded-[4px] font-['Outfit'] text-[12px] hover:bg-[#535353]"
              >
                + Pridėti eilutę
              </button>
            </div>

            <div className="space-y-[16px]">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-[8px] items-end">
                  <div className="col-span-12 md:col-span-5">
                    <label className="block font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[4px]">
                      Pavadinimas
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      required
                      className="w-full h-[40px] px-[12px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[13px]"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[4px]">
                      Kiekis
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                      required
                      className="w-full h-[40px] px-[12px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[13px]"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[4px]">
                      Kaina (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                      required
                      className="w-full h-[40px] px-[12px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[13px]"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="block font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#7C7C7C] mb-[4px]">
                      PVM %
                    </label>
                    <select
                      value={item.vatRate}
                      onChange={(e) => handleItemChange(index, 'vatRate', Number(e.target.value))}
                      className="w-full h-[40px] px-[12px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[13px]"
                    >
                      <option value="0">0%</option>
                      <option value="0.09">9%</option>
                      <option value="0.21">21%</option>
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="w-full h-[40px] bg-red-600 text-white rounded-[4px] hover:bg-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[24px] pt-[24px] border-t border-[#E1E1E1] flex justify-end">
              <div className="text-right">
                <div className="font-['Outfit'] text-[14px] text-[#7C7C7C] mb-[4px]">
                  Bendra suma (su PVM):
                </div>
                <div className="font-['DM_Sans'] text-[32px] text-[#161616]">
                  {calculateTotal().toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="bg-white p-[32px] rounded-[8px]">
            <h2 className="font-['Outfit'] font-medium text-[18px] text-[#161616] mb-[24px]">
              Mokėjimas ir pastabos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px] mb-[24px]">
              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Mokėjimo būdas
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                >
                  <option value="bank_transfer">Banko pavedimas</option>
                  <option value="cash">Grynaisiais</option>
                  <option value="card">Mokėjimo kortele</option>
                  <option value="stripe">Elektroninis mokėjimas</option>
                </select>
              </div>

              <div>
                <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                  Apmokėti per (dienų)
                </label>
                <input
                  type="number"
                  min="1"
                  value={dueInDays}
                  onChange={(e) => setDueInDays(Number(e.target.value))}
                  className="w-full h-[48px] px-[16px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-[8px]">
                Pastabos
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-[16px] py-[12px] border border-[#BBBBBB] rounded-[4px] font-['Outfit'] text-[14px] resize-none"
                placeholder="Papildoma informacija arba pastabos..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-[16px] justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-[32px] py-[16px] border border-[#161616] rounded-[100px] font-['Outfit'] text-[14px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-[32px] py-[16px] bg-[#161616] rounded-[100px] font-['Outfit'] text-[14px] uppercase tracking-[0.6px] text-white hover:bg-[#535353] transition-colors disabled:opacity-50"
            >
              {loading ? 'Kuriama...' : 'Sukurti sąskaitą'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
