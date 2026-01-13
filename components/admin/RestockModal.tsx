'use client';

import { useState } from 'react';

interface RestockModalProps {
  sku: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RestockModal({ sku: initialSku, onClose, onSuccess }: RestockModalProps) {
  const [sku, setSku] = useState(initialSku || '');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sku || quantity <= 0) {
      setError('Please provide a valid SKU and positive quantity');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/inventory/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          quantity,
          reason: reason || 'Inventory restocked',
          location: location || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restock');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#EAEAEA] border border-[#E1E1E1] rounded-[16px] shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-[#E1E1E1]">
          <div className="flex justify-between items-center">
            <h2 className="font-['DM_Sans'] text-[24px] font-light tracking-[-0.96px] text-[#161616]">Restock Inventory</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#E1E1E1] border border-red-200 text-red-800 rounded-[12px] text-sm font-['Outfit']">
              {error}
            </div>
          )}

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              SKU *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              placeholder="e.g., YAKI-001"
              required
              disabled={!!initialSku}
            />
          </div>

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              Quantity to Add *
            </label>
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              placeholder="e.g., 50"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              placeholder="e.g., New shipment received"
            />
          </div>

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              placeholder="e.g., Warehouse A, Shelf 12"
            />
          </div>

          <div>
            <label className="block font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-[12px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[48px] px-4 border border-[#E1E1E1] text-[#161616] bg-[#EAEAEA] rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#E1E1E1] transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-[48px] px-4 bg-[#161616] text-white rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#2a2a2a] transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Restocking...' : 'Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
